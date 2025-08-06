-- Script para verificar la configuración del webhook
-- Ejecutar para diagnosticar por qué no funciona

-- 1. Verificar si hay suscripciones recientes (última hora)
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

-- 2. Verificar pagos recientes (última hora)
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

-- 3. Verificar el usuario específico
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  us.status,
  sp.display_name as plan_name,
  us.stripe_subscription_id,
  us.created_at as subscription_created
FROM auth.users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE u.email = 'profile1@gmail.com'
ORDER BY us.created_at DESC;

-- 4. Verificar si hay errores en la tabla de logs (si existe)
-- Esta consulta puede fallar si no existe la tabla, pero es útil si existe
SELECT 
  table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%log%' OR table_name LIKE '%error%';

-- 5. Verificar las últimas suscripciones creadas (sin importar cuándo)
SELECT 
  us.id,
  us.user_id,
  us.status,
  sp.name as plan_name,
  us.stripe_subscription_id,
  us.created_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
ORDER BY us.created_at DESC
LIMIT 5;

-- 6. Verificar los últimos pagos (sin importar cuándo)
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
LIMIT 5; 