import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Track, PlaylistTrack } from '@/types/music';
import { QueueStorage } from '@/lib/QueueStorage';
import { secureRandom } from '@/lib/utils';
import { useListeningHistory } from '@/hooks/useListeningHistory';
import { useAuth } from '@/contexts/AuthContext';

interface PlayerContextValue {
  queue: PlaylistTrack[];
  currentTrack: PlaylistTrack | null;
  currentIndex: number;
  isRepeatMode: boolean;
  isShuffleMode: boolean;
  autoPlayEnabled: boolean;
  playTrack: (track: Track) => void;
  playFromContext: (track: Track, contextTracks: Track[], startIndex: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (id: string) => void;
  selectTrack: (track: PlaylistTrack) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  toggleAutoPlay: () => void;
  clearQueue: () => void;
  onTrackPlay?: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { recordPlayStart } = useListeningHistory();
  
  // Cargar estado inicial específico del usuario
  const initialQueue = QueueStorage.load(user?.id);
  const initialState = QueueStorage.loadState(user?.id);
  
  const [queue, setQueue] = useState<PlaylistTrack[]>(initialQueue);
  const [currentIndex, setCurrentIndex] = useState(initialState.currentIndex);
  const [isRepeatMode, setIsRepeatMode] = useState(initialState.isRepeatMode);
  const [isShuffleMode, setIsShuffleMode] = useState(initialState.isShuffleMode);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(initialState.autoPlayEnabled);
  const [originalQueue, setOriginalQueue] = useState<PlaylistTrack[]>([]);
  const [onTrackPlay] = useState<((track: Track) => void) | undefined>();
  
  // Restaurar canción actual si existe
  const [currentTrack, setCurrentTrack] = useState<PlaylistTrack | null>(() => {
    if (initialQueue.length > 0 && initialState.currentTrackId) {
      const track = initialQueue.find(t => t.id === initialState.currentTrackId);
      return track || (initialQueue[initialState.currentIndex] || null);
    }
    return null;
  });

  // Persistir cola automáticamente
  useEffect(() => {
    QueueStorage.save(queue, user?.id);
  }, [queue, user?.id]);

  // Persistir estado automáticamente
  useEffect(() => {
    QueueStorage.saveState({
      currentIndex,
      isRepeatMode,
      isShuffleMode,
      currentTrackId: currentTrack?.id,
      autoPlayEnabled
    }, user?.id);
  }, [currentIndex, isRepeatMode, isShuffleMode, currentTrack, autoPlayEnabled, user?.id]);

  const playTrack = useCallback((track: Track) => {
    // Verificar que el track tenga la información de audio necesaria
    if (!track.audio || track.audio.trim() === '') {
      toast({ 
        title: 'Error de reproducción', 
        description: 'No se puede reproducir esta canción. Falta información de audio.',
        variant: 'destructive'
      });
      return;
    }

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
    
    // Registrar en historial de reproducción
    recordPlayStart(track);
    
    // Notify library context about track play
    if (onTrackPlay) {
      onTrackPlay(track);
    }
    
    toast({ title: 'Reproduciendo', description: `${track.name} - ${track.artist_name}` });
  }, [queue, toast, onTrackPlay, recordPlayStart]);

  // Nueva función para reproducir desde un contexto específico (playlist, favoritos, etc.)
  const playFromContext = useCallback((track: Track, contextTracks: Track[], startIndex: number) => {
    // Verificar que el track tenga la información de audio necesaria
    if (!track.audio || track.audio.trim() === '') {
      toast({ 
        title: 'Error de reproducción', 
        description: 'No se puede reproducir esta canción. Falta información de audio.',
        variant: 'destructive'
      });
      return;
    }

    // Filtrar tracks que no tengan audio válido
    const validTracks = contextTracks.filter(t => t.audio && t.audio.trim() !== '');
    
    if (validTracks.length === 0) {
      toast({ 
        title: 'Error de reproducción', 
        description: 'No hay canciones reproducibles en esta lista.',
        variant: 'destructive'
      });
      return;
    }

    // Convertir todas las canciones del contexto a PlaylistTrack
    const playlistTracks: PlaylistTrack[] = validTracks.map(t => ({ ...t, addedAt: new Date() }));
    
    // Reemplazar toda la cola con las canciones del contexto
    setQueue(playlistTracks);
    
    // Encontrar el índice correcto en la lista filtrada
    const validTrackIndex = validTracks.findIndex(t => t.id === track.id);
    const actualStartIndex = validTrackIndex !== -1 ? validTrackIndex : 0;
    
    // Establecer la canción actual y su índice
    const currentPlaylistTrack = playlistTracks[actualStartIndex];
    setCurrentTrack(currentPlaylistTrack);
    setCurrentIndex(actualStartIndex);
    
    // Notify library context about track play
    if (onTrackPlay) {
      onTrackPlay(track);
    }
    
    toast({ 
      title: 'Reproduciendo desde contexto', 
      description: `${track.name} - ${track.artist_name} (${actualStartIndex + 1}/${validTracks.length})` 
    });
  }, [onTrackPlay, toast]);

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
      const trackIndex = prev.findIndex(t => t.id === trackId);
      if (trackIndex === -1) return prev; // Track not found
      
      const newQueue = prev.filter(t => t.id !== trackId);
      
      // Si se eliminó la canción actual
      if (currentTrack?.id === trackId) {
        if (newQueue.length > 0) {
          // Si había canciones después de la eliminada, tomar la siguiente
          // Si era la última, tomar la anterior
          const nextIdx = trackIndex < newQueue.length ? trackIndex : Math.max(0, trackIndex - 1);
          setCurrentTrack(newQueue[nextIdx]);
          setCurrentIndex(nextIdx);
        } else {
          // Cola vacía
          setCurrentTrack(null);
          setCurrentIndex(0);
        }
      } else if (trackIndex < currentIndex) {
        // Si se eliminó otra canción antes de la actual, ajustar el índice
        setCurrentIndex(prev => prev - 1);
      }
      
      return newQueue;
    });
    
    toast({ 
      title: 'Eliminado de la cola', 
      description: 'Canción removida de la cola de reproducción.' 
    });
  }, [currentTrack, currentIndex, toast]);

  const selectTrack = useCallback((track: PlaylistTrack) => {
    const index = queue.findIndex(t => t.id === track.id);
    if (index !== -1) {
      setCurrentTrack(track);
      setCurrentIndex(index);
    }
  }, [queue]);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    
    let nextIndex: number;
    
    if (currentIndex < queue.length - 1) {
      // Hay una siguiente canción en la cola
      nextIndex = currentIndex + 1;
    } else if (isRepeatMode) {
      // Si el modo repetición está activado, volver al inicio
      nextIndex = 0;
    } else {
      // Si no hay repetición, notificar y mantener posición
      toast({ 
        title: 'Final de la cola', 
        description: 'Has llegado al final de la cola de reproducción.' 
      });
      return;
    }
    
    setCurrentTrack(queue[nextIndex]);
    setCurrentIndex(nextIndex);
  }, [queue, currentIndex, isRepeatMode, toast]);

  const prevTrack = useCallback(() => {
    if (queue.length === 0) return;
    
    let prevIndex: number;
    
    if (currentIndex > 0) {
      // Hay una canción anterior en la cola
      prevIndex = currentIndex - 1;
    } else if (isRepeatMode) {
      // Si el modo repetición está activado, ir al final
      prevIndex = queue.length - 1;
    } else {
      // Si no hay repetición, mantenerse en la primera canción
      prevIndex = 0;
    }
    
    setCurrentTrack(queue[prevIndex]);
    setCurrentIndex(prevIndex);
  }, [queue, currentIndex, isRepeatMode]);

  const toggleRepeat = useCallback(() => {
    setIsRepeatMode(prev => !prev);
    toast({ 
      title: isRepeatMode ? 'Repetición desactivada' : 'Repetición activada',
      description: isRepeatMode ? 'La cola no se repetirá' : 'La cola se repetirá al finalizar'
    });
  }, [isRepeatMode, toast]);

  const toggleShuffle = useCallback(() => {
    setIsShuffleMode(prev => {
      const newShuffleMode = !prev;
      
      if (newShuffleMode) {
        // Activar shuffle: guardar la cola original y mezclar
        setOriginalQueue([...queue]);
        const shuffled = [...queue];
        // Mantener la canción actual en su posición si existe
        if (currentTrack) {
          // Remover la canción actual del shuffle
          const filteredQueue = shuffled.filter(t => t.id !== currentTrack.id);
          // Mezclar el resto de forma segura
          const shuffledRest = secureRandom.shuffle(filteredQueue);
          // Crear nueva cola con canción actual al inicio
          const newQueue = [currentTrack, ...shuffledRest];
          setQueue(newQueue);
          setCurrentIndex(0);
        } else {
          // No hay canción actual, simplemente mezclar de forma segura
          const shuffledQueue = secureRandom.shuffle(shuffled);
          setQueue(shuffledQueue);
        }
      } else if (originalQueue.length > 0) {
        // Desactivar shuffle: restaurar la cola original
        setQueue(originalQueue);
        // Encontrar el nuevo índice de la canción actual en la cola original
        if (currentTrack) {
          const newIndex = originalQueue.findIndex(t => t.id === currentTrack.id);
          setCurrentIndex(newIndex !== -1 ? newIndex : 0);
        }
        setOriginalQueue([]);
      }
      
      return newShuffleMode;
    });
    
    toast({ 
      title: isShuffleMode ? 'Aleatorio desactivado' : 'Aleatorio activado',
      description: isShuffleMode ? 'Reproducción en orden normal' : 'Reproducción aleatoria activada'
    });
  }, [isShuffleMode, queue, currentTrack, originalQueue, toast]);

  const toggleAutoPlay = useCallback(() => {
    setAutoPlayEnabled(prev => {
      const newValue = !prev;
      toast({ 
        title: newValue ? 'Reproducción automática activada' : 'Reproducción automática desactivada',
        description: newValue ? 'Las canciones se reproducirán automáticamente al cambiar' : 'Las canciones no se reproducirán automáticamente'
      });
      return newValue;
    });
  }, [toast]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentTrack(null);
    setCurrentIndex(0);
    setIsRepeatMode(false);
    setIsShuffleMode(false);
    setOriginalQueue([]);
    QueueStorage.clear(user?.id);
    toast({ title: 'Cola limpiada', description: 'Se eliminaron todas las canciones y se reinició el estado.' });
  }, [toast, user?.id]);

  const contextValue = useMemo(() => ({
    queue, 
    currentTrack, 
    currentIndex,
    isRepeatMode,
    isShuffleMode,
    autoPlayEnabled,
    playTrack,
    playFromContext, 
    addToQueue, 
    removeFromQueue, 
    selectTrack, 
    nextTrack, 
    prevTrack, 
    toggleRepeat,
    toggleShuffle,
    toggleAutoPlay,
    clearQueue,
    onTrackPlay
  }), [
    queue, 
    currentTrack, 
    currentIndex,
    isRepeatMode,
    isShuffleMode,
    autoPlayEnabled,
    playTrack,
    playFromContext, 
    addToQueue, 
    removeFromQueue, 
    selectTrack, 
    nextTrack, 
    prevTrack, 
    toggleRepeat,
    toggleShuffle,
    toggleAutoPlay,
    clearQueue,
    onTrackPlay
  ]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
