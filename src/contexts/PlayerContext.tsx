import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Track, PlaylistTrack } from '@/types/music';
import { QueueStorage } from '@/lib/QueueStorage';

interface PlayerContextValue {
  queue: PlaylistTrack[];
  currentTrack: PlaylistTrack | null;
  currentIndex: number;
  playTrack: (track: Track) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (id: string) => void;
  selectTrack: (track: PlaylistTrack) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  shuffleQueue: () => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

const STORAGE_KEY = 'sf_queue_v1';

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [queue, setQueue] = useState<PlaylistTrack[]>(() => QueueStorage.load());
  const [currentTrack, setCurrentTrack] = useState<PlaylistTrack | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
  QueueStorage.save(queue);
  }, [queue]);

  const playTrack = useCallback((track: Track) => {
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

  const addToQueue = useCallback((track: Track) => {
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

  const prevTrack = useCallback(() => {
    if (queue.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentTrack(queue[prevIndex]);
      setCurrentIndex(prevIndex);
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
    <PlayerContext.Provider value={{ queue, currentTrack, currentIndex, playTrack, addToQueue, removeFromQueue, selectTrack, nextTrack, prevTrack, shuffleQueue }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
