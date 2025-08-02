// hooks/usePlaylists.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Track } from '@/types/music';
import { useAuth } from '@/contexts/AuthContext';

// Función helper para generar UUID
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback para entornos donde crypto.randomUUID no está disponible
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
  isPublic: boolean;
  // Campos adicionales de Supabase
  coverImageUrl?: string;
  isCollaborative?: boolean;
  totalTracks?: number;
  totalDuration?: number;
  sortOrder?: number;
}

interface PlaylistFromDB {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  is_public: boolean | null;
  is_collaborative: boolean | null;
  total_tracks: number | null;
  total_duration: number | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
}

interface PlaylistTrackFromDB {
  id: string;
  playlist_id: string;
  track_data: Track;
  added_at: string | null;
  added_by: string;
  position: number | null;
}

export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Cargar playlists desde Supabase
  const loadPlaylists = useCallback(async () => {
    if (!user) {
      console.log('🚫 usePlaylists: No hay usuario autenticado');
      setPlaylists([]);
      setLoading(false);
      return;
    }

    console.log('🔄 usePlaylists: Iniciando carga de playlists para usuario:', user.id);

    try {
      setLoading(true);
      setError(null);

      // Cargar playlists del usuario
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('user_playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      console.log('📊 usePlaylists: Datos de playlists obtenidos:', playlistsData);
      console.log('❌ usePlaylists: Error de playlists:', playlistsError);

      if (playlistsError) {
        throw playlistsError;
      }

      console.log('✅ usePlaylists: Playlists cargadas exitosamente:', playlistsData?.length || 0);

      // Para cada playlist, cargar sus tracks
      const playlistsWithTracks = await Promise.all(
        (playlistsData || []).map(async (playlistDB: PlaylistFromDB) => {
          console.log('🎵 usePlaylists: Cargando tracks para playlist:', playlistDB.name, playlistDB.id);
          
          const { data: tracksData, error: tracksError } = await supabase
            .from('playlist_tracks')
            .select('*')
            .eq('playlist_id', playlistDB.id)
            .order('position', { ascending: true });

          console.log('🎵 usePlaylists: Tracks obtenidos para', playlistDB.name, ':', tracksData?.length || 0);
          console.log('❌ usePlaylists: Error de tracks para', playlistDB.name, ':', tracksError);

          if (tracksError) {
            console.error(`Error loading tracks for playlist ${playlistDB.id}:`, tracksError);
          }

          const tracks = (tracksData || []).map((pt: any) => pt.track_data as Track);

          return {
            id: playlistDB.id,
            name: playlistDB.name,
            description: playlistDB.description || undefined,
            tracks,
            createdAt: new Date(playlistDB.created_at || Date.now()),
            updatedAt: new Date(playlistDB.updated_at || Date.now()),
            imageUrl: playlistDB.cover_image_url || undefined,
            isPublic: playlistDB.is_public || false,
            coverImageUrl: playlistDB.cover_image_url || undefined,
            isCollaborative: playlistDB.is_collaborative || false,
            totalTracks: tracks.length,
            totalDuration: playlistDB.total_duration || 0,
            sortOrder: playlistDB.sort_order || 0
          } as Playlist;
        })
      );

      console.log('🎉 usePlaylists: Playlists finales con tracks:', playlistsWithTracks.map(p => ({ name: p.name, tracksCount: p.tracks.length })));
      setPlaylists(playlistsWithTracks);
    } catch (err: any) {
      console.error('💥 usePlaylists: Error loading playlists:', err);
      setError(err.message);
      
      // Fallback: cargar desde localStorage si hay error
      const savedLocal = localStorage.getItem('sf_playlists');
      if (savedLocal) {
        try {
          const localPlaylists = JSON.parse(savedLocal);
          console.log('🔄 usePlaylists: Cargando desde localStorage como fallback:', localPlaylists.length);
          setPlaylists(localPlaylists.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt)
          })));
        } catch (parseErr) {
          console.error('Error parsing local playlists:', parseErr);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Migrar datos desde localStorage a Supabase (solo una vez)
  const migrateFromLocalStorage = useCallback(async () => {
    if (!user) return;

    try {
      const savedLocal = localStorage.getItem('sf_playlists');
      if (!savedLocal) return;

      const localPlaylists: Playlist[] = JSON.parse(savedLocal);
      if (localPlaylists.length === 0) return;

      // Verificar si ya hay datos en Supabase
      const { data: existingData } = await supabase
        .from('user_playlists')
        .select('id')
        .eq('user_id', user.id);

      if (existingData && existingData.length > 0) {
        // Ya hay datos en Supabase, no migrar
        return;
      }

      // Migrar cada playlist
      for (const playlist of localPlaylists) {
        // Generar nuevo UUID válido para la migración
        const newPlaylistId = generateUUID();
        
        // Insertar playlist
        const { data: newPlaylist, error: playlistError } = await supabase
          .from('user_playlists')
          .insert({
            id: newPlaylistId,
            user_id: user.id,
            name: playlist.name,
            description: playlist.description,
            is_public: playlist.isPublic,
            is_collaborative: false,
            sort_order: playlists.length
          })
          .select()
          .single();

        if (playlistError) {
          console.error(`Error inserting playlist ${playlist.name}:`, playlistError);
          continue;
        }

        // Insertar tracks de la playlist
        if (playlist.tracks && playlist.tracks.length > 0) {
          const playlistTracks = playlist.tracks.map((track, index) => ({
            playlist_id: newPlaylistId, // Usar el nuevo UUID generado
            track_id: track.id,
            track_data: track as any, // Cast para evitar error de tipos
            added_by: user.id,
            position: index
          }));

          const { error: tracksError } = await supabase
            .from('playlist_tracks')
            .insert(playlistTracks);

          if (tracksError) {
            console.error(`Error inserting tracks for playlist ${playlist.name}:`, tracksError);
          }
        }
      }

      console.log(`✅ Migradas ${localPlaylists.length} playlists desde localStorage`);
      
      // Limpiar localStorage después de migración exitosa
      localStorage.removeItem('sf_playlists');
      console.log('🧹 localStorage de playlists limpiado');
      
    } catch (err: any) {
      console.error('Error migrando playlists:', err);
    }
  }, [user, playlists.length]);

  // Crear nueva playlist
  const createPlaylist = useCallback(async (name: string, description?: string): Promise<Playlist | null> => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para crear playlists',
        variant: 'destructive'
      });
      return null;
    }

    try {
      // Generar UUID válido en lugar de string personalizado
      const newPlaylistId = generateUUID();
      
      const { data: newPlaylist, error: supabaseError } = await supabase
        .from('user_playlists')
        .insert({
          id: newPlaylistId,
          user_id: user.id,
          name,
          description,
          is_public: false,
          is_collaborative: false,
          sort_order: playlists.length
        })
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      const playlist: Playlist = {
        id: newPlaylistId,
        name,
        description,
        tracks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        isCollaborative: false,
        totalTracks: 0,
        totalDuration: 0,
        sortOrder: playlists.length
      };

      setPlaylists(prev => [playlist, ...prev]);
      
      toast({
        title: 'Playlist creada',
        description: `"${name}" se ha creado correctamente`
      });

      return playlist;

    } catch (err: any) {
      console.error('Error creating playlist:', err);
      setError(err.message);
      
      toast({
        title: 'Error',
        description: 'No se pudo crear la playlist. Inténtalo de nuevo.',
        variant: 'destructive'
      });

      return null;
    }
  }, [user, playlists, toast]);

  // Eliminar playlist
  const deletePlaylist = useCallback(async (playlistId: string) => {
    if (!user) return;

    try {
      // Eliminar tracks de la playlist primero
      const { error: tracksError } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', playlistId);

      if (tracksError) {
        throw tracksError;
      }

      // Eliminar la playlist
      const { error: playlistError } = await supabase
        .from('user_playlists')
        .delete()
        .eq('id', playlistId)
        .eq('user_id', user.id);

      if (playlistError) {
        throw playlistError;
      }

      const deletedPlaylist = playlists.find(p => p.id === playlistId);
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      
      if (deletedPlaylist) {
        toast({
          title: 'Playlist eliminada',
          description: `"${deletedPlaylist.name}" ha sido eliminada`
        });
      }

    } catch (err: any) {
      console.error('Error deleting playlist:', err);
      setError(err.message);
      
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la playlist. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    }
  }, [user, playlists, toast]);

  // Agregar track a playlist
  const addTrackToPlaylist = useCallback(async (playlistId: string, track: Track) => {
    if (!user) return;

    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    // Verificar si ya existe la canción
    if (playlist.tracks.some(t => t.id === track.id)) {
      toast({
        title: 'Ya está en la playlist',
        description: `${track.name} ya está en "${playlist.name}"`,
        variant: 'destructive'
      });
      return;
    }

    try {
      // Agregar a Supabase
      const { error: supabaseError } = await supabase
        .from('playlist_tracks')
        .insert({
          playlist_id: playlistId,
          track_id: track.id,
          track_data: track as any, // Cast para evitar error de tipos
          added_by: user.id,
          position: playlist.tracks.length
        });

      if (supabaseError) {
        throw supabaseError;
      }

      // Actualizar estado local
      setPlaylists(prev => prev.map(p => {
        if (p.id === playlistId) {
          return {
            ...p,
            tracks: [...p.tracks, track],
            updatedAt: new Date(),
            totalTracks: (p.totalTracks || 0) + 1
          };
        }
        return p;
      }));
      
      toast({
        title: 'Añadido a playlist',
        description: `${track.name} añadido a "${playlist.name}"`
      });

    } catch (err: any) {
      console.error('Error adding track to playlist:', err);
      setError(err.message);
      
      toast({
        title: 'Error',
        description: 'No se pudo agregar la canción. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    }
  }, [user, playlists, toast]);

  // Remover track de playlist
  const removeTrackFromPlaylist = useCallback(async (playlistId: string, trackId: string) => {
    if (!user) return;

    try {
      // Remover de Supabase
      const { error: supabaseError } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('track_data->>id', trackId);

      if (supabaseError) {
        throw supabaseError;
      }

      // Actualizar estado local
      const playlist = playlists.find(p => p.id === playlistId);
      const track = playlist?.tracks.find(t => t.id === trackId);
      
      setPlaylists(prev => prev.map(p => {
        if (p.id === playlistId) {
          return {
            ...p,
            tracks: p.tracks.filter(t => t.id !== trackId),
            updatedAt: new Date(),
            totalTracks: Math.max((p.totalTracks || 1) - 1, 0)
          };
        }
        return p;
      }));
      
      if (track && playlist) {
        toast({
          title: 'Eliminado de playlist',
          description: `${track.name} eliminado de "${playlist.name}"`
        });
      }

    } catch (err: any) {
      console.error('Error removing track from playlist:', err);
      setError(err.message);
      
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la canción. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    }
  }, [user, playlists, toast]);

  // Actualizar playlist
  const updatePlaylist = useCallback(async (playlistId: string, updates: Partial<Playlist>) => {
    if (!user) return;

    try {
      const { error: supabaseError } = await supabase
        .from('user_playlists')
        .update({
          name: updates.name,
          description: updates.description,
          is_public: updates.isPublic,
          cover_image_url: updates.coverImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', playlistId)
        .eq('user_id', user.id);

      if (supabaseError) {
        throw supabaseError;
      }

      setPlaylists(prev => prev.map(p => {
        if (p.id === playlistId) {
          return {
            ...p,
            ...updates,
            updatedAt: new Date()
          };
        }
        return p;
      }));

    } catch (err: any) {
      console.error('Error updating playlist:', err);
      setError(err.message);
      
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la playlist. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    }
  }, [user, toast]);

  // Cargar datos cuando el usuario cambie
  useEffect(() => {
    if (user) {
      migrateFromLocalStorage().then(() => {
        loadPlaylists();
      });
    } else {
      setPlaylists([]);
      setLoading(false);
    }
  }, [user, loadPlaylists, migrateFromLocalStorage]);

  return {
    playlists,
    loading,
    error,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    updatePlaylist,
    refetch: loadPlaylists
  };
};
