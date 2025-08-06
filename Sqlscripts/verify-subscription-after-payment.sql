-- Script para verificar que la suscripción se creó después del pago
-- Ejecutar después de completar un pago de prueba

-- 1. Verificar suscripciones de usuarios
SELECT 
  us.id,
  us.user_id,
  us.status,
  sp.name as plan_name,
  sp.display_name,
  us.stripe_subscription_id,
  us.stripe_customer_id,
  us.current_period_start,
  us.current_period_end,
  us.created_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
ORDER BY us.created_at DESC
LIMIT 10;

-- 2. Verificar historial de pagos
SELECT 
  id,
  user_id,
  amount,
  currency,
  status,
  stripe_payment_intent_id,
  created_at
FROM payment_history
ORDER BY created_at DESC
LIMIT 10;

-- 3. Contar suscripciones por estado
SELECT 
  status,
  COUNT(*) as count
FROM user_subscriptions
GROUP BY status;

-- 4. Verificar que el usuario tenga la suscripción correcta
-- Reemplaza 'TU_USER_ID' con el ID real del usuario que hizo la prueba
SELECT 
  u.email,
  us.status,
  sp.display_name as plan,
  us.stripe_subscription_id,
  us.created_at
FROM auth.users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE u.email = 'test@example.com'  -- Reemplaza con el email que usaste
ORDER BY us.created_at DESC; 