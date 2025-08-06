-- Script para debuggear el problema de detección de planes
-- Ejecutar en Supabase SQL Editor
-- Este script funciona para cualquier usuario

-- 1. Verificar la estructura de payment_history
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'payment_history' 
ORDER BY ordinal_position;

-- 2. Verificar TODOS los pagos recientes (últimas 24 horas)
SELECT 
  ph.id,
  ph.user_id,
  ph.subscription_id,
  ph.stripe_payment_intent_id,
  ph.stripe_invoice_id,
  ph.amount,
  ph.currency,
  ph.status,
  ph.created_at,
  au.email as user_email
FROM payment_history ph
LEFT JOIN auth.users au ON ph.user_id = au.id
WHERE ph.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY ph.created_at DESC 
LIMIT 20;

-- 3. Verificar TODAS las suscripciones activas
SELECT 
  us.id,
  us.user_id,
  us.subscription_plan_id,
  us.stripe_subscription_id,
  us.stripe_customer_id,
  us.status,
  us.created_at,
  us.updated_at,
  sp.name as plan_name,
  sp.price as plan_price,
  au.email as user_email
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
LEFT JOIN auth.users au ON us.user_id = au.id
WHERE us.status = 'active'
ORDER BY us.updated_at DESC;

-- 4. Verificar si hay coincidencias entre payment_history y user_subscriptions
SELECT 
  ph.id as payment_id,
  ph.subscription_id as payment_subscription_id,
  ph.amount as payment_amount,
  ph.created_at as payment_date,
  us.id as subscription_id,
  us.stripe_subscription_id,
  sp.name as plan_name,
  sp.price as plan_price,
  au.email as user_email
FROM payment_history ph
LEFT JOIN user_subscriptions us ON ph.subscription_id::text = us.stripe_subscription_id
LEFT JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
LEFT JOIN auth.users au ON ph.user_id = au.id
WHERE ph.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY ph.created_at DESC;

-- 5. Verificar usuarios con suscripciones incompletas
SELECT 
  us.id,
  us.user_id,
  us.subscription_plan_id,
  us.status,
  us.created_at,
  us.updated_at,
  sp.name as plan_name,
  au.email as user_email
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
LEFT JOIN auth.users au ON us.user_id = au.id
WHERE us.status = 'incomplete'
ORDER BY us.updated_at DESC; 