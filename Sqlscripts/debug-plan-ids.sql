-- Script para verificar los IDs exactos de los planes
-- Ejecutar en SQL Editor de Supabase

-- 1. Verificar todos los planes con sus IDs exactos
SELECT 
  id,
  name,
  display_name,
  price,
  stripe_price_id,
  interval_type,
  is_active,
  sort_order
FROM subscription_plans
ORDER BY sort_order;

-- 2. Verificar qué plan se seleccionó realmente en la nueva cuenta
SELECT 
  us.id as subscription_id,
  us.user_id,
  us.subscription_plan_id,
  us.status,
  us.created_at,
  sp.id as plan_id,
  sp.name as plan_name,
  sp.display_name,
  sp.price,
  sp.stripe_price_id
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b';

-- 3. Comparar con los logs del stripe-checkout
-- Busca en los logs: "Plan found: { id: ..., name: ..., price: ... }" 