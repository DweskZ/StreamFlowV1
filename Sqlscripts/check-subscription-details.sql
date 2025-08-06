-- Script para verificar el estado detallado de las suscripciones
-- Ejecutar para entender por qué no se actualiza en el perfil

-- 1. Ver todas las suscripciones con detalles
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
  us.created_at,
  us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
ORDER BY us.created_at DESC;

-- 2. Verificar si hay usuarios sin suscripción activa
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  us.status,
  sp.display_name as plan_name,
  us.created_at as subscription_created
FROM auth.users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE u.email = 'test@example.com'  -- Reemplaza con tu email
ORDER BY us.created_at DESC;

-- 3. Verificar el historial de pagos reciente
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
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verificar si hay suscripciones duplicadas o conflictivas
SELECT 
  user_id,
  COUNT(*) as subscription_count,
  STRING_AGG(status, ', ') as statuses,
  STRING_AGG(sp.name, ', ') as plan_names
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY subscription_count DESC; 