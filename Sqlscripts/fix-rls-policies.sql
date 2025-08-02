-- Script para verificar y corregir políticas RLS
-- Ejecutar en SQL Editor de Supabase

-- 1. Verificar si RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('subscription_plans', 'user_subscriptions', 'payment_history');

-- 2. Verificar políticas existentes
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('subscription_plans', 'user_subscriptions', 'payment_history')
ORDER BY tablename, policyname;

-- 3. Si no hay políticas, crearlas
-- HABILITAR RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS para subscription_plans (lectura pública)
DROP POLICY IF EXISTS "subscription_plans_read" ON subscription_plans;
CREATE POLICY "subscription_plans_read" ON subscription_plans
    FOR SELECT USING (is_active = true);

-- POLÍTICAS para user_subscriptions
DROP POLICY IF EXISTS "user_subscriptions_read_own" ON user_subscriptions;
CREATE POLICY "user_subscriptions_read_own" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_subscriptions_insert_own" ON user_subscriptions;
CREATE POLICY "user_subscriptions_insert_own" ON user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_subscriptions_update_own" ON user_subscriptions;
CREATE POLICY "user_subscriptions_update_own" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- POLÍTICAS para payment_history
DROP POLICY IF EXISTS "payment_history_read_own" ON payment_history;
CREATE POLICY "payment_history_read_own" ON payment_history
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "payment_history_insert_own" ON payment_history;
CREATE POLICY "payment_history_insert_own" ON payment_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Verificar que las políticas se crearon correctamente
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd
FROM pg_policies 
WHERE tablename IN ('subscription_plans', 'user_subscriptions', 'payment_history')
ORDER BY tablename, policyname; 