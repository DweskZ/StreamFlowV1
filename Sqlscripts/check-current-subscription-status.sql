-- Script para verificar el estado actual de la suscripción
-- Ejecutar para ver el estado actual del usuario profile1@gmail.com

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
  us.updated_at,
  CASE 
    WHEN us.status = 'active' THEN '✅ ACTIVO'
    WHEN us.status = 'incomplete' THEN '⚠️ INCOMPLETO'
    WHEN us.status = 'canceled' THEN '❌ CANCELADO'
    ELSE '❓ DESCONOCIDO'
  END as status_display
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b';

-- 2. Verificar si hay múltiples suscripciones
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
  COUNT(CASE WHEN status = 'incomplete' THEN 1 END) as incomplete_subscriptions,
  COUNT(CASE WHEN status = 'canceled' THEN 1 END) as canceled_subscriptions
FROM user_subscriptions
WHERE user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b';

-- 3. Verificar pagos recientes (últimas 24 horas)
SELECT 
  id,
  user_id,
  amount,
  currency,
  status,
  stripe_payment_intent_id,
  stripe_invoice_id,
  created_at,
  CASE 
    WHEN created_at > NOW() - INTERVAL '1 hour' THEN '🕐 MUY RECIENTE'
    WHEN created_at > NOW() - INTERVAL '24 hours' THEN '📅 HOY'
    ELSE '📅 ANTIGUO'
  END as time_ago
FROM payment_history 
WHERE user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verificar el email del usuario
SELECT 
  'Verificar que el email del usuario coincida con el de Stripe' as instruction,
  'El email debe ser: profile1@gmail.com' as expected_email,
  'Si no coincide, los pagos no se procesarán correctamente' as warning; 