-- Script para simular manualmente lo que debería hacer el webhook
-- Ejecutar en SQL Editor de Supabase

-- 1. Actualizar la suscripción de la nueva cuenta (simulando webhook)
UPDATE user_subscriptions 
SET 
  status = 'active',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '1 month',
  updated_at = NOW()
WHERE user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b';

-- 2. Insertar registro de pago (simulando webhook)
INSERT INTO payment_history (
  user_id,
  subscription_id,
  amount,
  currency,
  status,
  payment_method,
  description
) VALUES (
  'e9e38985-3479-4b6c-9d24-013e6f0e9f5b',
  'f9420199-7df1-45b0-8bcd-b3345fb4fb67',
  9.99,
  'USD',
  'succeeded',
  'card',
  'Payment for Premium Monthly plan - Webhook Simulation'
);

-- 3. Verificar el resultado
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
WHERE us.user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b';

-- 4. Verificar el historial de pagos
SELECT 
  id,
  user_id,
  amount,
  currency,
  status,
  description,
  created_at
FROM payment_history 
WHERE user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b'
ORDER BY created_at DESC; 