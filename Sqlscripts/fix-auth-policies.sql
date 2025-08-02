-- Este script corrige los problemas de autenticación en Supabase
-- Ejecutar en el SQL Editor de Supabase

-- PASO 1: Crear tabla profiles (REQUERIDO para el registro de usuarios)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 2: Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- PASO 3: Crear políticas básicas para profiles
-- Política para permitir que los usuarios vean su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Política para permitir que los usuarios actualicen su propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Política para permitir insertar perfil al registrarse (MUY IMPORTANTE)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- PASO 4: Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log del error pero no fallar el registro
        RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 5: Trigger para ejecutar la función cuando se crea un nuevo usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PASO 6: Verificar que las tablas de suscripción tienen RLS habilitado
ALTER TABLE IF EXISTS public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- PASO 7: Políticas para subscription_plans (lectura pública)
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view subscription plans" 
ON public.subscription_plans FOR SELECT 
TO public
USING (true);

-- PASO 8: Políticas para user_subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscriptions" 
ON public.user_subscriptions FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can insert own subscriptions" 
ON public.user_subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can update own subscriptions" 
ON public.user_subscriptions FOR UPDATE 
USING (auth.uid() = user_id);

-- PASO 9: Función para crear suscripción gratuita por defecto
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar suscripción gratuita por defecto
    INSERT INTO public.user_subscriptions (
        user_id, 
        subscription_plan_id, 
        status, 
        current_period_start, 
        current_period_end,
        cancel_at_period_end
    )
    SELECT 
        NEW.id,
        sp.id,
        'active',
        NOW(),
        NOW() + INTERVAL '1 year',
        false
    FROM public.subscription_plans sp 
    WHERE sp.name = 'free'
    LIMIT 1
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log del error pero no fallar
        RAISE WARNING 'Error creating default subscription for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 10: Trigger para crear suscripción por defecto
DROP TRIGGER IF EXISTS on_user_created_subscription ON public.profiles;
CREATE TRIGGER on_user_created_subscription
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.create_default_subscription();

-- PASO 11: Verificación final
SELECT 
    'profiles' as table_name,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') as exists,
    COUNT(*) as row_count
FROM public.profiles
UNION ALL
SELECT 
    'subscription_plans' as table_name,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans' AND table_schema = 'public') as exists,
    COUNT(*) as row_count
FROM public.subscription_plans
UNION ALL
SELECT 
    'user_subscriptions' as table_name,
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions' AND table_schema = 'public') as exists,
    COUNT(*) as row_count
FROM public.user_subscriptions;
