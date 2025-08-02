-- ==========================================
-- ESQUEMA COMPLETO DE BASE DE DATOS
-- StreamFlow - Todas las tablas necesarias
-- ==========================================

-- ⚠️ IMPORTANTE: Ejecutar las secciones de SUSCRIPCIONES primero si aún no las has ejecutado
-- Luego ejecutar este archivo para las tablas adicionales

-- ==========================================
-- 1. TABLAS DE USUARIOS Y PERFILES
-- ==========================================

-- Perfiles de usuario extendidos (complementa auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  country VARCHAR(2), -- Código de país ISO
  preferred_language VARCHAR(5) DEFAULT 'es',
  theme_preference VARCHAR(20) DEFAULT 'dark',
  audio_quality VARCHAR(20) DEFAULT 'standard', -- standard, high, premium
  autoplay_enabled BOOLEAN DEFAULT TRUE,
  shuffle_enabled BOOLEAN DEFAULT FALSE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  public_playlists BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. TABLAS DE MÚSICA Y CATÁLOGO
-- ==========================================

-- Cache de tracks de Deezer (para mejorar rendimiento)
CREATE TABLE IF NOT EXISTS tracks_cache (
  id VARCHAR(50) PRIMARY KEY, -- ID de Deezer
  deezer_data JSONB NOT NULL, -- Datos completos del track
  name VARCHAR(500) NOT NULL,
  artist_name VARCHAR(300) NOT NULL,
  album_name VARCHAR(300),
  duration INTEGER, -- en segundos
  preview_url TEXT,
  album_image_url TEXT,
  explicit BOOLEAN DEFAULT FALSE,
  popularity_score INTEGER DEFAULT 0,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. TABLAS DE PLAYLISTS
-- ==========================================

-- Playlists de usuarios
CREATE TABLE IF NOT EXISTS user_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_collaborative BOOLEAN DEFAULT FALSE,
  cover_image_url TEXT,
  total_tracks INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0, -- en segundos
  followers_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracks en playlists (tabla de relación)
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES user_playlists(id) ON DELETE CASCADE,
  track_id VARCHAR(50) NOT NULL, -- ID de Deezer
  track_data JSONB NOT NULL, -- Datos del track para evitar joins
  position INTEGER NOT NULL DEFAULT 0, -- orden en la playlist
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. TABLAS DE FAVORITOS Y "ME GUSTA"
-- ==========================================

-- Canciones favoritas de usuarios
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id VARCHAR(50) NOT NULL, -- ID de Deezer
  track_data JSONB NOT NULL, -- Datos del track
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un usuario no puede tener la misma canción como favorita dos veces
  UNIQUE(user_id, track_id)
);

-- ==========================================
-- 5. TABLAS DE HISTORIAL Y ACTIVIDAD
-- ==========================================

-- Historial de reproducción
CREATE TABLE IF NOT EXISTS user_listening_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id VARCHAR(50) NOT NULL, -- ID de Deezer
  track_data JSONB NOT NULL, -- Datos del track
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  play_duration INTEGER, -- cuántos segundos reprodujo
  completed BOOLEAN DEFAULT FALSE, -- si completó la canción
  device_type VARCHAR(50), -- mobile, desktop, web
  source_type VARCHAR(50), -- playlist, album, search, radio
  source_id VARCHAR(100) -- ID de la playlist/album/etc si aplica
);

-- ==========================================
-- 6. TABLA DE COLA DE REPRODUCCIÓN (opcional)
-- ==========================================

-- Cola de reproducción persistente por usuario
CREATE TABLE IF NOT EXISTS user_play_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id VARCHAR(50) NOT NULL, -- ID de Deezer
  track_data JSONB NOT NULL, -- Datos del track
  position INTEGER NOT NULL DEFAULT 0, -- posición en la cola
  is_current BOOLEAN DEFAULT FALSE, -- track actual
  session_id VARCHAR(100), -- para manejar múltiples sesiones
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 7. TABLAS DE ESTADÍSTICAS Y ANALYTICS
-- ==========================================

-- Estadísticas de usuario (para dashboard y recomendaciones)
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_plays INTEGER DEFAULT 0,
  total_time_listened INTEGER DEFAULT 0, -- en segundos
  favorite_genre VARCHAR(100),
  favorite_artist VARCHAR(200),
  total_playlists INTEGER DEFAULT 0,
  total_favorites INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un registro por usuario
  UNIQUE(user_id)
);

-- Stats por artista para recomendaciones
CREATE TABLE IF NOT EXISTS user_artist_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_name VARCHAR(200) NOT NULL,
  artist_id VARCHAR(50), -- ID de Deezer si está disponible
  play_count INTEGER DEFAULT 1,
  total_time INTEGER DEFAULT 0, -- tiempo total escuchado en segundos
  last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, artist_name)
);

-- ==========================================
-- 8. TABLAS DE SOCIAL/SEGUIMIENTO (futuro)
-- ==========================================

-- Seguidores entre usuarios
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un usuario no puede seguir al mismo usuario dos veces
  UNIQUE(follower_id, followed_id),
  -- Un usuario no puede seguirse a sí mismo
  CHECK(follower_id != followed_id)
);

-- ==========================================
-- 9. ÍNDICES PARA RENDIMIENTO
-- ==========================================

-- Índices para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);

-- Índices para tracks_cache
CREATE INDEX IF NOT EXISTS idx_tracks_cache_name ON tracks_cache(name);
CREATE INDEX IF NOT EXISTS idx_tracks_cache_artist ON tracks_cache(artist_name);
CREATE INDEX IF NOT EXISTS idx_tracks_cache_last_accessed ON tracks_cache(last_accessed);

-- Índices para playlists
CREATE INDEX IF NOT EXISTS idx_user_playlists_user_id ON user_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_playlists_public ON user_playlists(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_user_playlists_name ON user_playlists(name);

-- Índices para playlist_tracks
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_position ON playlist_tracks(playlist_id, position);

-- Índices para favoritos
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at);

-- Índices para historial
CREATE INDEX IF NOT EXISTS idx_listening_history_user_id ON user_listening_history(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_history_played_at ON user_listening_history(played_at);
CREATE INDEX IF NOT EXISTS idx_listening_history_track_id ON user_listening_history(track_id);

-- Índices para cola de reproducción
CREATE INDEX IF NOT EXISTS idx_play_queue_user_id ON user_play_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_play_queue_position ON user_play_queue(user_id, position);
CREATE INDEX IF NOT EXISTS idx_play_queue_current ON user_play_queue(user_id, is_current) WHERE is_current = true;

-- Índices para stats
CREATE INDEX IF NOT EXISTS idx_user_artist_stats_user_id ON user_artist_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_artist_stats_play_count ON user_artist_stats(play_count);

-- ==========================================
-- 10. TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- ==========================================

-- Trigger para user_profiles
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para user_playlists
CREATE TRIGGER update_user_playlists_updated_at 
    BEFORE UPDATE ON user_playlists 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para user_stats
CREATE TRIGGER update_user_stats_updated_at 
    BEFORE UPDATE ON user_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 11. FUNCIONES ÚTILES
-- ==========================================

-- Función para actualizar estadísticas de usuario
CREATE OR REPLACE FUNCTION update_user_stats_on_play(
  p_user_id UUID,
  p_track_id VARCHAR(50),
  p_artist_name VARCHAR(200),
  p_duration INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  -- Actualizar stats generales
  INSERT INTO user_stats (user_id, total_plays, total_time_listened)
  VALUES (p_user_id, 1, p_duration)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_plays = user_stats.total_plays + 1,
    total_time_listened = user_stats.total_time_listened + p_duration,
    last_activity = NOW(),
    updated_at = NOW();
    
  -- Actualizar stats por artista
  INSERT INTO user_artist_stats (user_id, artist_name, play_count, total_time, last_played)
  VALUES (p_user_id, p_artist_name, 1, p_duration, NOW())
  ON CONFLICT (user_id, artist_name)
  DO UPDATE SET
    play_count = user_artist_stats.play_count + 1,
    total_time = user_artist_stats.total_time + p_duration,
    last_played = NOW();
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar historial antiguo (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION cleanup_old_history()
RETURNS VOID AS $$
BEGIN
  -- Mantener solo los últimos 6 meses de historial
  DELETE FROM user_listening_history 
  WHERE played_at < NOW() - INTERVAL '6 months';
  
  -- Limpiar cache de tracks no usados en 30 días
  DELETE FROM tracks_cache 
  WHERE last_accessed < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 12. CREAR PERFIL AUTOMÁTICAMENTE PARA NUEVOS USUARIOS
-- ==========================================

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- ==========================================
-- 13. VERIFICAR ESTRUCTURA COMPLETA
-- ==========================================

-- Query para verificar todas las tablas creadas
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'subscription_plans', 
    'user_subscriptions', 
    'payment_history',
    'user_profiles',
    'tracks_cache',
    'user_playlists',
    'playlist_tracks',
    'user_favorites',
    'user_listening_history',
    'user_play_queue',
    'user_stats',
    'user_artist_stats',
    'user_follows'
  )
ORDER BY tablename;
