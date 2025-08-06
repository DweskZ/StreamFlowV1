-- Script para verificar eventos de webhook y diagnosticar el problema
-- Ejecutar para entender por qué no se actualiza la base de datos

-- 1. Verificar si hay suscripciones recientes en Stripe (por el webhook)
SELECT 
  us.id,
  us.user_id,
  us.status,
  sp.name as plan_name,
  us.stripe_subscription_id,
  us.stripe_customer_id,
  us.created_at,
  us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.created_at >= NOW() - INTERVAL '1 hour'
ORDER BY us.created_at DESC;

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
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 3. Verificar si hay usuarios sin suscripción
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  COUNT(us.id) as subscription_count
FROM auth.users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE u.email = 'profile1@gmail.com'
GROUP BY u.id, u.email, u.created_at;

-- 4. Verificar la estructura de la tabla user_subscriptions
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- 5. Verificar si hay algún trigger o constraint que pueda estar fallando
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'user_subscriptions'; 