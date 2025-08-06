-- Script para verificar la configuración completa de Stripe
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar que las tablas existen
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('subscription_plans', 'user_subscriptions', 'payment_history') 
    THEN '✅ EXISTE'
    ELSE '❌ NO EXISTE'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('subscription_plans', 'user_subscriptions', 'payment_history');

-- 2. Verificar la estructura de subscription_plans
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'subscription_plans'
ORDER BY ordinal_position;

-- 3. Verificar los planes configurados
SELECT 
  id,
  name,
  display_name,
  price,
  currency,
  interval_type,
  stripe_price_id,
  stripe_product_id,
  is_active,
  CASE 
    WHEN stripe_price_id IS NOT NULL THEN '✅ CONFIGURADO'
    ELSE '❌ SIN CONFIGURAR'
  END as stripe_status
FROM subscription_plans 
ORDER BY sort_order;

-- 4. Verificar suscripciones de usuarios
SELECT 
  us.id,
  us.user_id,
  us.status,
  sp.name as plan_name,
  sp.stripe_price_id,
  us.stripe_subscription_id,
  us.stripe_customer_id,
  us.created_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
ORDER BY us.created_at DESC
LIMIT 10;

-- 5. Verificar historial de pagos
SELECT 
  id,
  user_id,
  amount,
  currency,
  status,
  created_at
FROM payment_history
ORDER BY created_at DESC
LIMIT 10;

-- 6. Contar registros por tabla
SELECT 
  'subscription_plans' as table_name,
  COUNT(*) as record_count
FROM subscription_plans
UNION ALL
SELECT 
  'user_subscriptions' as table_name,
  COUNT(*) as record_count
FROM user_subscriptions
UNION ALL
SELECT 
  'payment_history' as table_name,
  COUNT(*) as record_count
FROM payment_history;

-- 7. Verificar planes premium sin stripe_price_id
SELECT 
  name,
  display_name,
  price,
  CASE 
    WHEN stripe_price_id IS NULL THEN '❌ FALTA CONFIGURAR'
    ELSE '✅ CONFIGURADO'
  END as status
FROM subscription_plans 
WHERE name IN ('premium_monthly', 'premium_annual')
  AND stripe_price_id IS NULL;

-- 8. Verificar índices
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('subscription_plans', 'user_subscriptions', 'payment_history')
ORDER BY tablename, indexname; 