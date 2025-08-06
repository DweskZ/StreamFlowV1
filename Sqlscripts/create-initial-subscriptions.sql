-- Script para crear suscripciones iniciales para usuarios que no las tienen
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar usuarios sin suscripciones
SELECT 
  au.id as user_id,
  au.email,
  au.created_at as user_created
FROM auth.users au
LEFT JOIN user_subscriptions us ON au.id = us.user_id
WHERE us.id IS NULL
ORDER BY au.created_at DESC;

-- 2. Crear suscripciones iniciales para usuarios sin suscripción
-- Obtener el ID del plan gratuito
WITH free_plan AS (
  SELECT id FROM subscription_plans WHERE name = 'free' LIMIT 1
)
INSERT INTO user_subscriptions (
  user_id,
  subscription_plan_id,
  status,
  created_at,
  updated_at
)
SELECT 
  au.id as user_id,
  fp.id as subscription_plan_id,
  'active' as status,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
CROSS JOIN free_plan fp
LEFT JOIN user_subscriptions us ON au.id = us.user_id
WHERE us.id IS NULL;

-- 3. Verificar que se crearon las suscripciones
SELECT 
  au.email,
  us.status as subscription_status,
  sp.name as plan_name,
  us.created_at as subscription_created
FROM auth.users au
LEFT JOIN user_subscriptions us ON au.id = us.user_id
LEFT JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
ORDER BY au.created_at DESC; 