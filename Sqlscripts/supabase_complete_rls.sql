-- ==========================================
-- ROW LEVEL SECURITY PARA TODAS LAS TABLAS
-- Ejecutar DESPUÉS del esquema completo
-- ==========================================

-- ==========================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- ==========================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_play_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_artist_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. POLÍTICAS PARA USER_PROFILES
-- ==========================================

-- Los usuarios pueden ver y editar su propio perfil
CREATE POLICY "user_profiles_own" ON user_profiles
    FOR ALL USING (auth.uid() = id);

-- Los perfiles públicos pueden ser vistos por usuarios autenticados
CREATE POLICY "user_profiles_public_read" ON user_profiles
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        public_playlists = true
    );

-- ==========================================
-- 3. POLÍTICAS PARA TRACKS_CACHE
-- ==========================================

-- Cache es accesible para todos los usuarios autenticados (solo lectura)
CREATE POLICY "tracks_cache_read" ON tracks_cache
    FOR SELECT USING (auth.role() = 'authenticated');

-- Solo el sistema puede insertar/actualizar cache (via service_role)
-- Los inserts/updates se harán desde el backend con permisos especiales

-- ==========================================
-- 4. POLÍTICAS PARA PLAYLISTS
-- ==========================================

-- Los usuarios pueden gestionar sus propias playlists
CREATE POLICY "user_playlists_own" ON user_playlists
    FOR ALL USING (auth.uid() = user_id);

-- Las playlists públicas pueden ser leídas por usuarios autenticados
CREATE POLICY "user_playlists_public_read" ON user_playlists
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        is_public = true
    );

-- ==========================================
-- 5. POLÍTICAS PARA PLAYLIST_TRACKS
-- ==========================================

-- Los usuarios pueden gestionar tracks de sus propias playlists
CREATE POLICY "playlist_tracks_owner" ON playlist_tracks
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM user_playlists 
            WHERE id = playlist_tracks.playlist_id
        )
    );

-- Los tracks de playlists públicas pueden ser leídos
CREATE POLICY "playlist_tracks_public_read" ON playlist_tracks
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        playlist_id IN (
            SELECT id FROM user_playlists 
            WHERE is_public = true
        )
    );

-- En playlists colaborativas, usuarios autorizados pueden añadir tracks
CREATE POLICY "playlist_tracks_collaborative" ON playlist_tracks
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        playlist_id IN (
            SELECT id FROM user_playlists 
            WHERE is_collaborative = true AND is_public = true
        )
    );

-- ==========================================
-- 6. POLÍTICAS PARA FAVORITOS
-- ==========================================

-- Los usuarios solo pueden gestionar sus propios favoritos
CREATE POLICY "user_favorites_own" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 7. POLÍTICAS PARA HISTORIAL
-- ==========================================

-- Los usuarios solo pueden ver/gestionar su propio historial
CREATE POLICY "user_listening_history_own" ON user_listening_history
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 8. POLÍTICAS PARA COLA DE REPRODUCCIÓN
-- ==========================================

-- Los usuarios solo pueden gestionar su propia cola
CREATE POLICY "user_play_queue_own" ON user_play_queue
    FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 9. POLÍTICAS PARA ESTADÍSTICAS
-- ==========================================

-- Los usuarios pueden ver sus propias estadísticas
CREATE POLICY "user_stats_own_read" ON user_stats
    FOR SELECT USING (auth.uid() = user_id);

-- Solo el sistema puede actualizar stats (via triggers/functions)
CREATE POLICY "user_stats_system_write" ON user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_stats_system_update" ON user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas similares para artist stats
CREATE POLICY "user_artist_stats_own_read" ON user_artist_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_artist_stats_system_write" ON user_artist_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_artist_stats_system_update" ON user_artist_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- 10. POLÍTICAS PARA FOLLOWS/SOCIAL
-- ==========================================

-- Los usuarios pueden gestionar a quién siguen
CREATE POLICY "user_follows_own_following" ON user_follows
    FOR ALL USING (auth.uid() = follower_id);

-- Los usuarios pueden ver quién los sigue
CREATE POLICY "user_follows_own_followers" ON user_follows
    FOR SELECT USING (auth.uid() = followed_id);

-- ==========================================
-- 11. VERIFICAR POLÍTICAS CREADAS
-- ==========================================

SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename IN (
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
ORDER BY tablename, policyname;
