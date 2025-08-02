// hooks/useFavorites.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Track } from '@/types/music';
import { useAuth } from '@/contexts/AuthContext';

interface FavoriteTrack {
  id: string;
  track_id: string;
  track_data: Track;
  created_at: string;
  user_id: string;
}

export const useFavorites = () => {
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Cargar favoritos desde Supabase
  const loadFavorites = useCallback(async () => {
    if (!user) {
      setLikedSongs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      const tracks = data?.map((fav: FavoriteTrack) => fav.track_data) || [];
      setLikedSongs(tracks);
    } catch (err: any) {
      console.error('Error loading favorites:', err);
      setError(err.message);
      
      // Fallback: cargar desde localStorage si hay error
      const savedLocal = localStorage.getItem('sf_liked_songs');
      if (savedLocal) {
        setLikedSongs(JSON.parse(savedLocal));
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Migrar datos desde localStorage a Supabase (solo una vez)
  const migrateFromLocalStorage = useCallback(async () => {
    if (!user) return;

    try {
      const savedLocal = localStorage.getItem('sf_liked_songs');
      if (!savedLocal) return;

      const localTracks: Track[] = JSON.parse(savedLocal);
      if (localTracks.length === 0) return;

      // Verificar si ya hay datos en Supabase
      const { data: existingData } = await supabase
        .from('user_favorites')
        .select('track_id')
        .eq('user_id', user.id);

      if (existingData && existingData.length > 0) {
        // Ya hay datos en Supabase, no migrar
        return;
      }

      // Migrar datos de localStorage a Supabase
      const favoritesToInsert = localTracks.map(track => ({
        user_id: user.id,
        track_id: track.id,
        track_data: track
      }));

      const { error: insertError } = await supabase
        .from('user_favorites')
        .insert(favoritesToInsert);

      if (insertError) {
        throw insertError;
      }

      console.log(`✅ Migrados ${localTracks.length} favoritos desde localStorage`);
      
      // Limpiar localStorage después de migración exitosa
      localStorage.removeItem('sf_liked_songs');
      console.log('🧹 localStorage de favoritos limpiado');
      
    } catch (err: any) {
      console.error('Error migrando favoritos:', err);
    }
  }, [user]);

  // Agregar canción a favoritos
  const addToLiked = useCallback(async (track: Track) => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para guardar favoritos',
        variant: 'destructive'
      });
      return;
    }

    // Verificar si ya está en favoritos
    if (likedSongs.some(t => t.id === track.id)) {
      toast({
        title: 'Ya está en Me gusta',
        description: 'Esta canción ya está en tus canciones favoritas.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Agregar a Supabase
      const { error: supabaseError } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          track_id: track.id,
          track_data: track
        });

      if (supabaseError) {
        throw supabaseError;
      }

      // Actualizar estado local
      setLikedSongs(prev => [track, ...prev]);
      
      toast({
        title: 'Agregado a Me gusta',
        description: `${track.name} - ${track.artist_name}`
      });

    } catch (err: any) {
      console.error('Error adding to favorites:', err);
      setError(err.message);
      
      toast({
        title: 'Error',
        description: 'No se pudo agregar a favoritos. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    }
  }, [user, likedSongs, toast]);

  // Quitar canción de favoritos
  const removeFromLiked = useCallback(async (trackId: string) => {
    if (!user) return;

    try {
      // Quitar de Supabase
      const { error: supabaseError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('track_id', trackId);

      if (supabaseError) {
        throw supabaseError;
      }

      // Actualizar estado local
      const removedTrack = likedSongs.find(t => t.id === trackId);
      setLikedSongs(prev => prev.filter(t => t.id !== trackId));
      
      if (removedTrack) {
        toast({
          title: 'Eliminado de Me gusta',
          description: `${removedTrack.name} - ${removedTrack.artist_name}`
        });
      }

    } catch (err: any) {
      console.error('Error removing from favorites:', err);
      setError(err.message);
      
      toast({
        title: 'Error',
        description: 'No se pudo quitar de favoritos. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    }
  }, [user, likedSongs, toast]);

  // Verificar si una canción está en favoritos
  const isLiked = useCallback((trackId: string) => {
    return likedSongs.some(track => track.id === trackId);
  }, [likedSongs]);

  // Cargar datos cuando el usuario cambie
  useEffect(() => {
    if (user) {
      migrateFromLocalStorage().then(() => {
        loadFavorites();
      });
    } else {
      setLikedSongs([]);
      setLoading(false);
    }
  }, [user, loadFavorites, migrateFromLocalStorage]);

  return {
    likedSongs,
    loading,
    error,
    addToLiked,
    removeFromLiked,
    isLiked,
    refetch: loadFavorites
  };
};
