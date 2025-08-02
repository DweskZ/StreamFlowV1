-- Script para actualizar la suscripción de la nueva cuenta
-- Ejecutar en SQL Editor de Supabase

-- 1. Verificar todas las suscripciones recientes
SELECT 
  us.id,
  us.user_id,
  us.status,
  us.stripe_customer_id,
  us.stripe_subscription_id,
  sp.name as plan_name,
  sp.display_name,
  us.created_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
ORDER BY us.created_at DESC;

-- 2. Actualizar la suscripción más reciente (nueva cuenta) a active
-- Reemplaza USER_ID con el ID de la nueva cuenta
UPDATE user_subscriptions 
SET 
  status = 'active',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '1 month',
  updated_at = NOW()
WHERE user_id = 'REEMPLAZAR_CON_USER_ID_DE_NUEVA_CUENTA';

-- 3. Insertar registro de pago para la nueva cuenta
INSERT INTO payment_history (
  user_id,
  subscription_id,
  amount,
  currency,
  status,
  payment_method,
  description
) VALUES (
  'REEMPLAZAR_CON_USER_ID_DE_NUEVA_CUENTA',
  'REEMPLAZAR_CON_SUBSCRIPTION_ID_DE_NUEVA_CUENTA',
  9.99,
  'USD',
  'succeeded',
  'card',
  'Payment for Premium Monthly plan - New Account'
);

-- 4. Verificar el estado actualizado
SELECT 
  us.id,
  us.user_id,
  us.status,
  us.stripe_customer_id,
  us.stripe_subscription_id,
  us.current_period_start,
  us.current_period_end,
  sp.name as plan_name,
  sp.display_name
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.user_id = 'REEMPLAZAR_CON_USER_ID_DE_NUEVA_CUENTA'; 