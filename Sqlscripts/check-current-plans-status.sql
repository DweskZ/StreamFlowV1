-- Verificar el estado actual de los planes de suscripción
-- Ejecutar en el SQL Editor de Supabase

-- 1. Ver todos los planes y su configuración de Stripe
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

-- 2. Verificar específicamente los planes premium
SELECT 
  name,
  display_name,
  price,
  stripe_price_id,
  CASE 
    WHEN stripe_price_id IS NULL THEN '❌ FALTA CONFIGURAR'
    WHEN stripe_price_id = 'price_1RrR7YQnqQD67bKrYv3Yh5Qm' THEN '⚠️ USANDO ID DE PRUEBA'
    ELSE '✅ CONFIGURADO'
  END as status
FROM subscription_plans 
WHERE name IN ('premium_monthly', 'premium_annual')
ORDER BY sort_order;

-- 3. Contar cuántos planes tienen stripe_price_id configurado
SELECT 
  COUNT(*) as total_plans,
  COUNT(stripe_price_id) as planes_con_stripe,
  COUNT(*) - COUNT(stripe_price_id) as planes_sin_stripe
FROM subscription_plans 
WHERE name IN ('premium_monthly', 'premium_annual'); 