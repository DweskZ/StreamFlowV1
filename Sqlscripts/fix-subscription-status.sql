-- Script para actualizar manualmente el estado de la suscripción
-- Ejecutar en SQL Editor de Supabase

-- 1. Actualizar el estado de la suscripción existente
UPDATE user_subscriptions 
SET 
  status = 'active',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '1 month',
  updated_at = NOW()
WHERE user_id = '8fe4799f-7f26-43e9-abb3-d0e8155e0dc8';

-- 2. Insertar registro de pago (simulación)
INSERT INTO payment_history (
  user_id,
  subscription_id,
  amount,
  currency,
  status,
  payment_method,
  description
) VALUES (
  '8fe4799f-7f26-43e9-abb3-d0e8155e0dc8',
  '8d814c78-2f80-4a4b-8877-96c0e177f11f',
  9.99,
  'USD',
  'succeeded',
  'card',
  'Payment for Premium Monthly plan'
);

-- 3. Verificar el estado actualizado
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
WHERE us.user_id = '8fe4799f-7f26-43e9-abb3-d0e8155e0dc8';

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
WHERE user_id = '8fe4799f-7f26-43e9-abb3-d0e8155e0dc8'
ORDER BY created_at DESC; 