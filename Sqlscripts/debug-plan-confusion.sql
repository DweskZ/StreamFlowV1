-- Script para investigar la confusión de planes
-- Ejecutar en SQL Editor de Supabase

-- 1. Verificar TODAS las suscripciones de la nueva cuenta
SELECT 
  us.id,
  us.user_id,
  us.subscription_plan_id,
  us.status,
  us.stripe_customer_id,
  us.stripe_subscription_id,
  us.created_at,
  sp.name as plan_name,
  sp.display_name,
  sp.price,
  sp.stripe_price_id
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b'
ORDER BY us.created_at DESC;

-- 2. Verificar qué planes existen
SELECT 
  id,
  name,
  display_name,
  price,
  stripe_price_id,
  is_active
FROM subscription_plans
ORDER BY sort_order;

-- 3. Verificar TODOS los pagos de la nueva cuenta
SELECT 
  id,
  user_id,
  subscription_id,
  amount,
  currency,
  status,
  description,
  created_at
FROM payment_history 
WHERE user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b'
ORDER BY created_at DESC;

-- 4. Verificar si hay múltiples suscripciones activas (no debería)
SELECT 
  user_id,
  COUNT(*) as subscription_count,
  STRING_AGG(status, ', ') as statuses,
  STRING_AGG(sp.name, ', ') as plan_names
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b'
GROUP BY user_id; 