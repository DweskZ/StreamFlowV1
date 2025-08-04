-- Script para verificar y crear perfiles de usuario faltantes
-- Ejecutar esto en Supabase SQL Editor

-- 1. Verificar usuarios sin perfil
SELECT 
  au.id as auth_user_id,
  au.email,
  au.created_at as auth_created_at,
  p.id as profile_id,
  p.is_admin,
  p.created_at as profile_created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 2. Crear perfiles faltantes para usuarios autenticados
INSERT INTO profiles (id, email, is_admin, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  false, -- Por defecto no es admin
  au.created_at,
  au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar que todos los usuarios tengan perfil
SELECT 
  COUNT(*) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  COUNT(*) - (SELECT COUNT(*) FROM profiles) as missing_profiles
FROM auth.users;

-- 4. Mostrar usuarios admin (si los hay)
SELECT 
  p.id,
  p.email,
  p.is_admin,
  p.created_at
FROM profiles p
WHERE p.is_admin = true
ORDER BY p.created_at DESC; 