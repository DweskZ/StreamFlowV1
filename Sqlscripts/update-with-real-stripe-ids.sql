-- Script para actualizar con los Price IDs reales de Stripe
-- Price IDs reales de la cuenta de Stripe

-- 1. Actualizar el plan premium mensual
UPDATE subscription_plans 
SET stripe_price_id = 'price_1RrR7YQnqQD67bKrYv3Yh5Qm'
WHERE name = 'premium_monthly';

-- 2. Actualizar el plan premium anual  
UPDATE subscription_plans 
SET stripe_price_id = 'price_1RrR9BQnqQD67bKr0fLjj8UI'
WHERE name = 'premium_annual';

-- 3. Verificar que se actualizaron correctamente
SELECT 
  name,
  display_name,
  price,
  stripe_price_id,
  CASE 
    WHEN stripe_price_id IS NULL THEN '❌ SIN CONFIGURAR'
    WHEN stripe_price_id = 'price_1RrR7YQnqQD67bKrYv3Yh5Qm' THEN '✅ MENSUAL CONFIGURADO'
    WHEN stripe_price_id = 'price_1RrR9BQnqQD67bKr0fLjj8UI' THEN '✅ ANUAL CONFIGURADO'
    ELSE '⚠️ ID DESCONOCIDO'
  END as status
FROM subscription_plans 
WHERE name IN ('premium_monthly', 'premium_annual')
ORDER BY sort_order; 