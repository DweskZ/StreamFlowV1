import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFavorites } from '@/hooks/useFavorites';
import { Track } from '@/types/music';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
  isPublic: boolean;
}

interface LibraryContextValue {
  likedSongs: Track[];
  playlists: Playlist[];
  recentlyPlayed: Track[];
  addToLiked: (track: Track) => void;
  removeFromLiked: (trackId: string) => void;
  isLiked: (trackId: string) => boolean;
  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) => void;
  addToRecentlyPlayed: (track: Track) => void;
}

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

// Solo mantenemos las claves para playlists y recently played por ahora
const PLAYLISTS_KEY = 'sf_playlists';
const RECENTLY_PLAYED_KEY = 'sf_recently_played';

export const LibraryProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  
  // 🚀 USAR HOOK DE SUPABASE PARA FAVORITOS
  const { 
    likedSongs, 
    addToLiked, 
    removeFromLiked, 
    isLiked,
    loading: favoritesLoading 
  } = useFavorites();

  // Mantener localStorage para playlists y recently played (por ahora)
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem(PLAYLISTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>(() => {
    const saved = localStorage.getItem(RECENTLY_PLAYED_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Solo guardar playlists y recently played en localStorage (favoritos ya van a Supabase)
  useEffect(() => {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  // Las funciones de favoritos ya están en el hook useFavorites
  // addToLiked, removeFromLiked, isLiked vienen del hook

  const createPlaylist = useCallback((name: string, description?: string) => {
    const newPlaylist: Playlist = {
      id: `playlist_${Date.now()}`,
      name,
      description,
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false
    };

    setPlaylists(prev => [newPlaylist, ...prev]);
    toast({
      title: 'Playlist creada',
      description: `Se creó la playlist "${name}"`
    });

    return newPlaylist;
  }, [toast]);

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists(prev => {
      const playlist = prev.find(p => p.id === playlistId);
      if (playlist) {
        toast({
          title: 'Playlist eliminada',
          description: `Se eliminó la playlist "${playlist.name}"`
        });
      }
      return prev.filter(p => p.id !== playlistId);
    });
  }, [toast]);

  const addTrackToPlaylist = useCallback((playlistId: string, track: Track) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        if (playlist.tracks.some(t => t.id === track.id)) {
          toast({
            title: 'Ya está en la playlist',
            description: 'Esta canción ya está en la playlist.',
            variant: 'destructive'
          });
          return playlist;
        }
        toast({
          title: 'Añadido a playlist',
          description: `${track.name} añadido a "${playlist.name}"`
        });
        return {
          ...playlist,
          tracks: [...playlist.tracks, track],
          updatedAt: new Date()
        };
      }
      return playlist;
    }));
  }, [toast]);

  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        const track = playlist.tracks.find(t => t.id === trackId);
        if (track) {
          toast({
            title: 'Eliminado de playlist',
            description: `${track.name} eliminado de "${playlist.name}"`
          });
        }
        return {
          ...playlist,
          tracks: playlist.tracks.filter(t => t.id !== trackId),
          updatedAt: new Date()
        };
      }
      return playlist;
    }));
  }, [toast]);

  const updatePlaylist = useCallback((playlistId: string, updates: Partial<Playlist>) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          ...updates,
          updatedAt: new Date()
        };
      }
      return playlist;
    }));
  }, []);

  const addToRecentlyPlayed = useCallback((track: Track) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      const newList = [track, ...filtered].slice(0, 50); // Mantener solo las últimas 50
      return newList;
    });
  }, []);

  const value: LibraryContextValue = useMemo(() => ({
    likedSongs,
    playlists,
    recentlyPlayed,
    addToLiked,
    removeFromLiked,
    isLiked,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    updatePlaylist,
    addToRecentlyPlayed
  }), [
    likedSongs,
    playlists,
    recentlyPlayed,
    addToLiked,
    removeFromLiked,
    isLiked,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    updatePlaylist,
    addToRecentlyPlayed
  ]);

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
