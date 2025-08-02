-- =====================================================
-- CONFIGURACIÓN DEL NUEVO USUARIO ADMIN
-- =====================================================

-- 1. Verificar que el usuario existe en auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'adminflow@gmail.com';

-- 2. Verificar el perfil actual
SELECT id, email, full_name, is_admin, created_at 
FROM profiles 
WHERE email = 'adminflow@gmail.com';

-- 3. Actualizar el perfil para hacerlo admin
UPDATE profiles 
SET is_admin = TRUE,
    full_name = 'Administrador StreamFlow',
    updated_at = NOW()
WHERE id = '1e4a4605-0a57-4d1c-8107-6572cce15059';

-- 4. Verificar que se actualizó correctamente
SELECT id, email, full_name, is_admin, created_at, updated_at
FROM profiles 
WHERE email = 'adminflow@gmail.com';

-- 5. Verificar que la función is_admin funciona
SELECT is_admin('1e4a4605-0a57-4d1c-8107-6572cce15059');

-- 6. Verificar que las políticas RLS están funcionando
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.is_admin,
  p.created_at,
  COALESCE(plays.count, 0) as total_plays,
  COALESCE(playlists.count, 0) as total_playlists,
  COALESCE(favorites.count, 0) as total_liked_songs
FROM profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) as count 
  FROM user_listening_history 
  GROUP BY user_id
) plays ON p.id = plays.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count 
  FROM user_playlists 
  GROUP BY user_id
) playlists ON p.id = playlists.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count 
  FROM user_favorites 
  GROUP BY user_id
) favorites ON p.id = favorites.user_id
WHERE p.email = 'adminflow@gmail.com';

-- =====================================================
-- INSTRUCCIONES PASO A PASO
-- =====================================================

/*
PASOS:

1. Ve a Supabase Dashboard > Authentication > Users
2. Crea usuario: adminflow@gmail.com / 123456
3. Copia el ID del usuario creado
4. Ejecuta el SELECT para verificar que existe
5. Ejecuta el INSERT reemplazando TU_USER_ID_AQUI con el ID real
6. Ejecuta el SELECT final para verificar que is_admin = true
7. Prueba el login en la aplicación
*/ 
*/ 