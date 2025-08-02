-- Script para debuggear el problema del webhook
-- Ejecutar en SQL Editor de Supabase

-- 1. Verificar qué plan se seleccionó realmente (según los logs)
-- Los logs muestran: Plan found: { id: "03c65846-b324-4df9-8d3a-4771d350f508", name: "premium_annual", price: 99.99 }
-- Esto significa que se seleccionó el plan anual

-- 2. Verificar qué plan está en la base de datos
SELECT 
  sp.id as plan_id,
  sp.name as plan_name,
  sp.display_name,
  sp.price,
  sp.stripe_price_id
FROM subscription_plans sp
WHERE sp.id IN (
  '03c65846-b324-4df9-8d3a-4771d350f508',  -- Plan que se seleccionó (según logs)
  'd8df5956-0cdf-4997-90ee-2e649f82bcf4'   -- Plan que está en la BD (premium_monthly)
);

-- 3. Verificar la suscripción actual
SELECT 
  us.id,
  us.user_id,
  us.subscription_plan_id,
  us.status,
  us.stripe_customer_id,
  us.stripe_subscription_id,
  sp.name as actual_plan_name,
  sp.display_name as actual_plan_display,
  sp.price as actual_plan_price
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b';

-- 4. Verificar si hay alguna suscripción con el plan anual
SELECT 
  us.id,
  us.user_id,
  us.subscription_plan_id,
  us.status,
  sp.name as plan_name,
  sp.display_name
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b'
  AND sp.name = 'premium_annual'; 