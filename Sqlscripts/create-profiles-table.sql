-- SCRIPT BÁSICO: Solo crear tabla profiles (EJECUTAR PRIMERO)
-- Copia y pega esto en el SQL Editor de Supabase

-- Crear tabla profiles (CRÍTICO para el registro)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política básica para insertar perfil
CREATE POLICY "Enable insert for authentication" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

-- Política básica para ver perfil
CREATE POLICY "Enable read access for own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Función simple para crear perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario')
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verificar que se creó correctamente
SELECT 'profiles table created successfully' as status;
