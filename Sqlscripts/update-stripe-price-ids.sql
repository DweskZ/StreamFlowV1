-- Script para actualizar los stripe_price_id con los IDs reales de Stripe
-- IMPORTANTE: Reemplaza los IDs de ejemplo con los reales de tu cuenta de Stripe

-- 1. Actualizar el plan premium mensual
-- Reemplaza 'price_TU_ID_MENSUAL_AQUI' con tu Price ID real del plan mensual
UPDATE subscription_plans 
SET stripe_price_id = 'price_TU_ID_MENSUAL_AQUI'
WHERE name = 'premium_monthly';

-- 2. Actualizar el plan premium anual  
-- Reemplaza 'price_TU_ID_ANUAL_AQUI' con tu Price ID real del plan anual
UPDATE subscription_plans 
SET stripe_price_id = 'price_TU_ID_ANUAL_AQUI'
WHERE name = 'premium_annual';

-- 3. Verificar que se actualizaron correctamente
SELECT 
  name,
  display_name,
  price,
  stripe_price_id,
  CASE 
    WHEN stripe_price_id IS NULL THEN '❌ SIN CONFIGURAR'
    WHEN stripe_price_id LIKE 'price_TU_ID_%' THEN '⚠️ USANDO PLACEHOLDER'
    ELSE '✅ CONFIGURADO'
  END as status
FROM subscription_plans 
WHERE name IN ('premium_monthly', 'premium_annual')
ORDER BY sort_order;

-- 4. Verificar que todos los planes premium tienen stripe_price_id
SELECT 
  COUNT(*) as total_plans_premium,
  COUNT(stripe_price_id) as planes_con_stripe,
  COUNT(*) - COUNT(stripe_price_id) as planes_sin_stripe
FROM subscription_plans 
WHERE name IN ('premium_monthly', 'premium_annual'); 