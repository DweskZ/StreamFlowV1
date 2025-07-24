import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { JamendoTrack, PlaylistTrack } from '@/types/jamendo';

interface PlayerContextValue {
  queue: PlaylistTrack[];
  currentTrack: PlaylistTrack | null;
  currentIndex: number;
  playTrack: (track: JamendoTrack) => void;
  addToQueue: (track: JamendoTrack) => void;
  removeFromQueue: (id: string) => void;
  selectTrack: (track: PlaylistTrack) => void;
  nextTrack: () => void;
  shuffleQueue: () => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

const STORAGE_KEY = 'sf_queue_v1';

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [queue, setQueue] = useState<PlaylistTrack[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: PlaylistTrack[] = JSON.parse(stored);
        return parsed.map(t => ({ ...t, addedAt: new Date(t.addedAt) }));
      } catch {
        return [];
      }
    }
    return [];
  });
  const [currentTrack, setCurrentTrack] = useState<PlaylistTrack | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  }, [queue]);

  const playTrack = useCallback((track: JamendoTrack) => {
    const playlistTrack: PlaylistTrack = { ...track, addedAt: new Date() };
    const existingIndex = queue.findIndex(t => t.id === track.id);
    if (existingIndex === -1) {
      setQueue(prev => [playlistTrack, ...prev]);
      setCurrentTrack(playlistTrack);
      setCurrentIndex(0);
    } else {
      setCurrentTrack(queue[existingIndex]);
      setCurrentIndex(existingIndex);
    }
    toast({ title: 'Reproduciendo', description: `${track.name} - ${track.artist_name}` });
  }, [queue, toast]);

  const addToQueue = useCallback((track: JamendoTrack) => {
    if (queue.find(t => t.id === track.id)) {
      toast({ title: 'Ya en la cola', description: 'Esta canción ya está en tu cola de reproducción.', variant: 'destructive' });
      return;
    }
    const playlistTrack: PlaylistTrack = { ...track, addedAt: new Date() };
    setQueue(prev => [...prev, playlistTrack]);
    toast({ title: 'Agregado a la cola', description: `${track.name} - ${track.artist_name}` });
  }, [queue, toast]);

  const removeFromQueue = useCallback((trackId: string) => {
    setQueue(prev => {
      const newQueue = prev.filter(t => t.id !== trackId);
      if (currentTrack?.id === trackId) {
        const currentIdx = prev.findIndex(t => t.id === trackId);
        if (newQueue.length > 0) {
          const nextIdx = currentIdx < newQueue.length ? currentIdx : 0;
          setCurrentTrack(newQueue[nextIdx]);
          setCurrentIndex(nextIdx);
        } else {
          setCurrentTrack(null);
          setCurrentIndex(0);
        }
      }
      return newQueue;
    });
  }, [currentTrack]);

  const selectTrack = useCallback((track: PlaylistTrack) => {
    const index = queue.findIndex(t => t.id === track.id);
    if (index !== -1) {
      setCurrentTrack(track);
      setCurrentIndex(index);
    }
  }, [queue]);

  const nextTrack = useCallback(() => {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentTrack(queue[nextIndex]);
      setCurrentIndex(nextIndex);
    } else {
      setCurrentTrack(null);
      setCurrentIndex(0);
    }
  }, [queue, currentIndex]);

  const shuffleQueue = useCallback(() => {
    if (queue.length <= 1) return;
    const shuffled = [...queue].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    if (currentTrack) {
      const newIndex = shuffled.findIndex(t => t.id === currentTrack.id);
      setCurrentIndex(newIndex);
    }
    toast({ title: 'Cola mezclada', description: 'Se reorganizó la cola de reproducción aleatoriamente.' });
  }, [queue, currentTrack, toast]);

  return (
    <PlayerContext.Provider value={{ queue, currentTrack, currentIndex, playTrack, addToQueue, removeFromQueue, selectTrack, nextTrack, shuffleQueue }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
