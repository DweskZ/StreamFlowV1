-- ==========================================
-- ROW LEVEL SECURITY PARA SUSCRIPCIONES
-- Ejecutar DESPUÉS de crear las tablas principales
-- ==========================================

-- 1. HABILITAR RLS en todas las tablas
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS para subscription_plans (tabla pública de lectura)
CREATE POLICY "subscription_plans_read" ON subscription_plans
    FOR SELECT USING (is_active = true);

-- 3. POLÍTICAS para user_subscriptions (usuarios solo ven su info)
CREATE POLICY "user_subscriptions_read_own" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_insert_own" ON user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_update_own" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. POLÍTICAS para payment_history (usuarios solo ven su historial)
CREATE POLICY "payment_history_read_own" ON payment_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payment_history_insert_own" ON payment_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. VERIFICAR políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('subscription_plans', 'user_subscriptions', 'payment_history');
