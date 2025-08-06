-- Script para verificar las suscripciones específicas
-- Ejecutar para entender por qué una sigue incomplete

-- 1. Ver todas las suscripciones con detalles
SELECT 
  us.id,
  us.user_id,
  us.status,
  sp.name as plan_name,
  sp.display_name,
  us.stripe_subscription_id,
  us.stripe_customer_id,
  us.created_at,
  us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
ORDER BY us.created_at DESC;

-- 2. Verificar específicamente la suscripción incomplete
SELECT 
  us.id,
  us.user_id,
  us.status,
  sp.name as plan_name,
  us.stripe_subscription_id,
  us.created_at,
  us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.status = 'incomplete';

-- 3. Verificar si hay pagos para la suscripción incomplete
SELECT 
  ph.id,
  ph.user_id,
  ph.amount,
  ph.status,
  ph.created_at
FROM payment_history ph
WHERE ph.user_id IN (
  SELECT us.user_id 
  FROM user_subscriptions us 
  WHERE us.status = 'incomplete'
)
ORDER BY ph.created_at DESC;

-- 4. Verificar la suscripción del usuario profile1@gmail.com
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
WHERE u.email = 'profile1@gmail.com'
ORDER BY us.created_at DESC; 