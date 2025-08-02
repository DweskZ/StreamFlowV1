-- Script para depurar problemas de suscripción
-- Ejecutar en SQL Editor de Supabase

-- 1. Verificar que los planes existen y tienen stripe_price_id
SELECT 
  id,
  name,
  display_name,
  price,
  stripe_price_id,
  stripe_product_id,
  is_active
FROM subscription_plans 
ORDER BY sort_order;

-- 2. Verificar si el usuario tiene suscripción existente
-- (Reemplaza USER_ID con el ID real del usuario)
SELECT 
  id,
  user_id,
  subscription_plan_id,
  stripe_customer_id,
  stripe_subscription_id,
  status
FROM user_subscriptions 
WHERE user_id = '8fe4799f-7f26-43e9-abb3-d0e8155e0dc8';

-- 3. Verificar las políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('subscription_plans', 'user_subscriptions')
ORDER BY tablename, policyname;

-- 4. Verificar si RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('subscription_plans', 'user_subscriptions'); 