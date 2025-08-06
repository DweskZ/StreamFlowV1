-- Script para arreglar suscripciones incompletas (Versión 2)
-- Ejecutar después de desplegar el webhook corregido

-- 1. Ver el estado actual de las suscripciones
SELECT 
  us.id,
  us.user_id,
  us.status,
  sp.name as plan_name,
  sp.display_name,
  us.stripe_subscription_id,
  us.stripe_customer_id,
  us.created_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.status = 'incomplete'
ORDER BY us.created_at DESC;

-- 2. Actualizar suscripciones incompletas a activas
-- (Basado en que hay pagos exitosos para el mismo usuario)
UPDATE user_subscriptions 
SET 
  status = 'active',
  updated_at = NOW()
WHERE id IN (
  SELECT us.id
  FROM user_subscriptions us
  JOIN payment_history ph ON us.user_id = ph.user_id 
  WHERE us.status = 'incomplete' 
    AND ph.status = 'succeeded'
    AND ph.created_at >= us.created_at - INTERVAL '10 minutes'
    AND ph.created_at <= us.created_at + INTERVAL '10 minutes'
);

-- 3. Verificar el resultado
SELECT 
  us.id,
  us.user_id,
  us.status,
  sp.name as plan_name,
  us.stripe_subscription_id,
  us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
ORDER BY us.updated_at DESC
LIMIT 10;

-- 4. Verificar que el usuario tenga la suscripción correcta
-- Reemplaza 'test@example.com' con tu email real
SELECT 
  u.email,
  us.status,
  sp.display_name as plan,
  us.stripe_subscription_id,
  us.created_at,
  us.updated_at
FROM auth.users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE u.email = 'test@example.com'  -- Reemplaza con tu email
ORDER BY us.created_at DESC;

-- 5. Contar suscripciones por estado después del arreglo
SELECT 
  status,
  COUNT(*) as count
FROM user_subscriptions
GROUP BY status
ORDER BY count DESC; 