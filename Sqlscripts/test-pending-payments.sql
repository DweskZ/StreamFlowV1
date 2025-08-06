-- Script para probar la función de procesamiento de pagos pendientes
-- Ejecutar después de hacer un checkout para verificar que funciona

-- 1. Verificar el estado actual de la suscripción
SELECT 
  us.id,
  us.user_id,
  us.status,
  us.stripe_subscription_id,
  us.stripe_customer_id,
  sp.name as plan_name,
  sp.display_name,
  us.current_period_start,
  us.current_period_end,
  us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b';

-- 2. Verificar pagos recientes
SELECT 
  id,
  user_id,
  amount,
  currency,
  status,
  stripe_payment_intent_id,
  stripe_invoice_id,
  created_at
FROM payment_history 
WHERE user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b'
ORDER BY created_at DESC
LIMIT 5;

-- 3. Verificar si hay suscripciones incompletas
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
  COUNT(CASE WHEN status = 'incomplete' THEN 1 END) as incomplete_subscriptions,
  COUNT(CASE WHEN status = 'canceled' THEN 1 END) as canceled_subscriptions
FROM user_subscriptions
WHERE user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b;

-- 4. Verificar el email del usuario para debugging
SELECT 
  'Verificar que el email del usuario coincida con el de Stripe' as instruction,
  'El email debe ser: profile1@gmail.com' as expected_email; 