-- Script para verificar y corregir los datos de suscripción
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar el estado actual de los planes
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

-- 2. Verificar si hay suscripciones de usuarios
SELECT 
  us.id,
  us.user_id,
  us.status,
  sp.name as plan_name,
  sp.stripe_price_id,
  us.stripe_subscription_id
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
LIMIT 10;

-- 3. Actualizar los stripe_price_id con valores de prueba (reemplazar con los reales)
-- IMPORTANTE: Reemplaza estos IDs con los reales de tu cuenta de Stripe

UPDATE subscription_plans 
SET stripe_price_id = 'price_1RrR7YQnqQD67bKrYv3Yh5Qm' -- Reemplazar con tu price ID mensual real
WHERE name = 'premium_monthly';

UPDATE subscription_plans 
SET stripe_price_id = 'price_1RrR7YQnqQD67bKrYv3Yh5Qm' -- Reemplazar con tu price ID anual real
WHERE name = 'premium_annual';

-- 4. Verificar que los planes tengan stripe_price_id configurados
SELECT 
  name,
  display_name,
  price,
  stripe_price_id,
  CASE 
    WHEN stripe_price_id IS NULL THEN '❌ FALTA CONFIGURAR'
    ELSE '✅ CONFIGURADO'
  END as status
FROM subscription_plans 
WHERE name IN ('premium_monthly', 'premium_annual')
ORDER BY sort_order;

-- 5. Verificar la estructura de las tablas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('subscription_plans', 'user_subscriptions', 'payment_history')
  AND column_name LIKE '%stripe%'
ORDER BY table_name, ordinal_position; 