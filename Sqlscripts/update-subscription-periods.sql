-- Script para actualizar fechas de período de suscripciones existentes
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar suscripciones sin fechas de período
SELECT 
  us.id,
  us.user_id,
  us.created_at,
  us.current_period_start,
  us.current_period_end,
  sp.name as plan_name,
  sp.interval_type,
  au.email
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
JOIN auth.users au ON us.user_id = au.id
WHERE us.current_period_start IS NULL OR us.current_period_end IS NULL
ORDER BY us.created_at DESC;

-- 2. Actualizar suscripciones con fechas de período calculadas
UPDATE user_subscriptions 
SET 
  current_period_start = created_at,
  current_period_end = CASE 
    WHEN sp.interval_type = 'month' THEN created_at + INTERVAL '1 month'
    WHEN sp.interval_type = 'year' THEN created_at + INTERVAL '1 year'
    ELSE created_at + INTERVAL '30 days'  -- Para planes gratuitos o de un solo pago
  END,
  updated_at = NOW()
FROM subscription_plans sp
WHERE user_subscriptions.subscription_plan_id = sp.id
  AND (user_subscriptions.current_period_start IS NULL OR user_subscriptions.current_period_end IS NULL);

-- 3. Verificar que se actualizaron correctamente
SELECT 
  us.id,
  us.user_id,
  us.created_at,
  us.current_period_start,
  us.current_period_end,
  sp.name as plan_name,
  sp.interval_type,
  au.email
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
JOIN auth.users au ON us.user_id = au.id
ORDER BY us.updated_at DESC; 