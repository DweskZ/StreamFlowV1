-- Script para ver el estado de todos los usuarios
-- Ejecutar en Supabase SQL Editor

-- 1. Resumen de todos los usuarios y sus suscripciones
SELECT 
  au.email,
  au.created_at as user_created,
  us.status as subscription_status,
  sp.name as plan_name,
  sp.price as plan_price,
  us.created_at as subscription_created,
  us.updated_at as subscription_updated,
  COUNT(ph.id) as total_payments
FROM auth.users au
LEFT JOIN user_subscriptions us ON au.id = us.user_id
LEFT JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
LEFT JOIN payment_history ph ON au.id = ph.user_id
GROUP BY au.id, au.email, au.created_at, us.status, sp.name, sp.price, us.created_at, us.updated_at
ORDER BY au.created_at DESC;

-- 2. Usuarios con pagos recientes (últimas 24 horas)
SELECT 
  au.email,
  ph.amount,
  ph.currency,
  ph.status as payment_status,
  ph.created_at as payment_date,
  sp.name as plan_name
FROM payment_history ph
JOIN auth.users au ON ph.user_id = au.id
LEFT JOIN user_subscriptions us ON ph.subscription_id::text = us.stripe_subscription_id
LEFT JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE ph.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY ph.created_at DESC;

-- 3. Usuarios con suscripciones incompletas
SELECT 
  au.email,
  us.status,
  sp.name as plan_name,
  us.created_at,
  us.updated_at
FROM user_subscriptions us
JOIN auth.users au ON us.user_id = au.id
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.status = 'incomplete'
ORDER BY us.updated_at DESC;

-- 4. Usuarios sin suscripciones
SELECT 
  au.email,
  au.created_at
FROM auth.users au
LEFT JOIN user_subscriptions us ON au.id = us.user_id
WHERE us.id IS NULL
ORDER BY au.created_at DESC; 