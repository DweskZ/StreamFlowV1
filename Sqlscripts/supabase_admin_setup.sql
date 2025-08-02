-- =====================================================
-- CONFIGURACIÓN DEL SISTEMA DE ROLES DE ADMINISTRADOR
-- =====================================================

-- 1. Agregar columna is_admin a la tabla profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Crear un usuario administrador (reemplaza con tu email)
-- Primero necesitas crear el usuario en auth.users manualmente
-- Luego ejecutar este comando para hacerlo admin:

-- INSERT INTO profiles (id, email, full_name, is_admin, created_at, updated_at)
-- VALUES (
--   'TU_USER_ID_AQUI', -- Reemplaza con el ID del usuario que creaste
--   'admin@streamflow.com',
--   'Administrador',
--   TRUE,
--   NOW(),
--   NOW()
-- );

-- 3. Crear función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear políticas RLS para el dashboard de admin
-- Solo los administradores pueden ver todas las estadísticas

-- Política para ver todos los perfiles (solo admins)
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (is_admin(auth.uid()));

-- Política para ver todas las playlists (solo admins)
CREATE POLICY "Admins can view all playlists" ON user_playlists
FOR SELECT USING (is_admin(auth.uid()));

-- Política para ver todo el historial de reproducción (solo admins)
CREATE POLICY "Admins can view all listening history" ON user_listening_history
FOR SELECT USING (is_admin(auth.uid()));

-- Política para ver todas las canciones favoritas (solo admins)
CREATE POLICY "Admins can view all favorites" ON user_favorites
FOR SELECT USING (is_admin(auth.uid()));

-- 5. Función para obtener estadísticas de admin
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Verificar que el usuario es admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  SELECT json_build_object(
    'totalUsers', (SELECT COUNT(*) FROM profiles),
    'totalPlays', (SELECT COUNT(*) FROM user_listening_history),
    'totalPlaylists', (SELECT COUNT(*) FROM user_playlists),
    'totalLikedSongs', (SELECT COUNT(*) FROM user_favorites),
    'activeUsersToday', (
      SELECT COUNT(DISTINCT user_id) 
      FROM user_listening_history 
      WHERE played_at >= CURRENT_DATE
    ),
    'premiumUsers', (
      SELECT COUNT(*) 
      FROM profiles 
      WHERE subscription_status = 'premium'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Función para obtener lista de usuarios (solo admins)
CREATE OR REPLACE FUNCTION get_users_for_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ,
  subscription_status TEXT,
  last_sign_in_at TIMESTAMPTZ,
  total_plays BIGINT,
  total_playlists BIGINT,
  total_liked_songs BIGINT
) AS $$
BEGIN
  -- Verificar que el usuario es admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.created_at,
    p.subscription_status,
    p.last_sign_in_at,
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
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INSTRUCCIONES PARA CREAR UN USUARIO ADMINISTRADOR
-- =====================================================

/*
PASOS PARA CREAR UN ADMINISTRADOR:

1. Ve a tu dashboard de Supabase
2. Ve a Authentication > Users
3. Crea un nuevo usuario con tu email
4. Copia el ID del usuario creado
5. Ejecuta este comando reemplazando TU_USER_ID_AQUI:

UPDATE profiles 
SET is_admin = TRUE 
WHERE id = 'TU_USER_ID_AQUI';

O si el perfil no existe:

INSERT INTO profiles (id, email, full_name, is_admin, created_at, updated_at)
VALUES (
  'TU_USER_ID_AQUI',
  'tu-email@ejemplo.com',
  'Tu Nombre',
  TRUE,
  NOW(),
  NOW()
);
*/ 