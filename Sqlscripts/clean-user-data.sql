-- Script para limpiar datos de un usuario específico (para testing)
-- Reemplaza 'email_del_usuario@ejemplo.com' con el email del usuario que quieres limpiar

-- 1. Verificar qué datos tiene el usuario
SELECT 
  'user_subscriptions' as table_name,
  COUNT(*) as record_count
FROM user_subscriptions us
JOIN auth.users au ON us.user_id = au.id
WHERE au.email = 'email_del_usuario@ejemplo.com'  -- CAMBIAR AQUÍ

UNION ALL

SELECT 
  'payment_history' as table_name,
  COUNT(*) as record_count
FROM payment_history ph
JOIN auth.users au ON ph.user_id = au.id
WHERE au.email = 'email_del_usuario@ejemplo.com';  -- CAMBIAR AQUÍ

-- 2. Limpiar suscripciones del usuario (DESCOMENTAR PARA EJECUTAR)
/*
DELETE FROM user_subscriptions 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'email_del_usuario@ejemplo.com'  -- CAMBIAR AQUÍ
);
*/

-- 3. Limpiar historial de pagos del usuario (DESCOMENTAR PARA EJECUTAR)
/*
DELETE FROM payment_history 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'email_del_usuario@ejemplo.com'  -- CAMBIAR AQUÍ
);
*/

-- 4. Verificar que se limpiaron los datos
SELECT 
  'user_subscriptions' as table_name,
  COUNT(*) as record_count
FROM user_subscriptions us
JOIN auth.users au ON us.user_id = au.id
WHERE au.email = 'email_del_usuario@ejemplo.com'  -- CAMBIAR AQUÍ

UNION ALL

SELECT 
  'payment_history' as table_name,
  COUNT(*) as record_count
FROM payment_history ph
JOIN auth.users au ON ph.user_id = au.id
WHERE au.email = 'email_del_usuario@ejemplo.com';  -- CAMBIAR AQUÍ 