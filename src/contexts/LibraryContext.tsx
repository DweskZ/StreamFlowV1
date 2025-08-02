import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { usePlaylists } from '@/hooks/usePlaylists';
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
  addToLiked: (track: Track) => Promise<void>;
  removeFromLiked: (trackId: string) => Promise<void>;
  isLiked: (trackId: string) => boolean;
  createPlaylist: (name: string, description?: string) => Promise<Playlist | null>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) => Promise<void>;
  addToRecentlyPlayed: (track: Track) => void;
}

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

// Solo mantenemos las claves para recently played
const RECENTLY_PLAYED_KEY = 'sf_recently_played';

export const LibraryProvider = ({ children }: { children: React.ReactNode }) => {
  // 🚀 USAR HOOKS DE SUPABASE PARA FAVORITOS Y PLAYLISTS
  const { 
    likedSongs, 
    addToLiked, 
    removeFromLiked, 
    isLiked
  } = useFavorites();

  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    updatePlaylist
  } = usePlaylists();

  // Solo mantener localStorage para recently played (por ahora)
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>(() => {
    const saved = localStorage.getItem(RECENTLY_PLAYED_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Solo guardar recently played en localStorage (favoritos y playlists ya van a Supabase)
  useEffect(() => {
    localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  // Las funciones de favoritos y playlists vienen de los hooks de Supabase
  // addToLiked, removeFromLiked, isLiked vienen del hook useFavorites
  // createPlaylist, deletePlaylist, addTrackToPlaylist, etc. vienen del hook usePlaylists

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
