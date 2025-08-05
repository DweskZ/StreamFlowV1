// hooks/usePlaylistPlayback.ts
import { useCallback, useState } from 'react';
import { Track } from '@/types/music';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { useToast } from '@/hooks/use-toast';
import { searchTracks } from '@/hooks/useDeezerAPI';

export const usePlaylistPlayback = () => {
  const { playTrack: playerPlayTrack, playFromContext } = usePlayer();
  const { addToRecentlyPlayed } = useLibrary();
  const { toast } = useToast();

  // Cache para evitar búsquedas repetidas (se resetea cada 30 minutos)
  const [enrichmentCache, setEnrichmentCache] = useState<Map<string, { track: Track, timestamp: number }>>(new Map());
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

  // Función para enriquecer un track con datos completos desde la API
  const enrichTrackData = useCallback(async (track: Track): Promise<Track> => {
    try {
      const cacheKey = `${track.name}-${track.artist_name}`;
      const now = Date.now();
      
      // Verificar cache
      const cached = enrichmentCache.get(cacheKey);
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        console.log('📦 Usando track en cache:', track.name, '-', track.artist_name);
        return cached.track;
      }

      console.log('🔄 Enriqueciendo track:', track.name, '-', track.artist_name);
      
      // Buscar en la API para obtener URLs frescas
      const searchResults = await searchTracks(`${track.name} ${track.artist_name}`);
      
      // Encontrar el track más similar
      const bestMatch = searchResults.find(result => 
        result.id === track.id || 
        (result.name.toLowerCase() === track.name.toLowerCase() && 
         result.artist_name.toLowerCase() === track.artist_name.toLowerCase())
      );

      if (bestMatch) {
        console.log('✅ Match encontrado, actualizando track con URL fresca');
        // Combinar los datos existentes con los nuevos datos de la API
        const enrichedTrack = {
          ...track,
          audio: bestMatch.audio || track.audio || '',
          audiodownload: bestMatch.audiodownload || track.audiodownload || '',
          proaudio: bestMatch.proaudio || track.proaudio || '',
          audiodlallowed: bestMatch.audiodlallowed || track.audiodlallowed || false,
          album_image: bestMatch.album_image || track.album_image || track.image || '',
          image: bestMatch.image || track.image || track.album_image || '',
          tags: bestMatch.tags || track.tags || { genres: [], instruments: [], vartags: [] }
        };
        
        // Guardar en cache
        setEnrichmentCache(prev => new Map(prev).set(cacheKey, { track: enrichedTrack, timestamp: now }));
        
        return enrichedTrack;
      }

      console.log('❌ No se encontró match para el track, manteniendo datos originales');
      return track;
    } catch (error) {
      console.error('❌ Error enriqueciendo track data:', error);
      return track;
    }
  }, [enrichmentCache]);

  // Función para reproducir una canción individual desde una playlist
  const playTrackFromPlaylist = useCallback(async (track: Track, index?: number, playlistTracks?: Track[]) => {
    try {
      // Enriquecer el track si no tiene audio
      const enrichedTrack = await enrichTrackData(track);
      
      // Agregar al historial de reproducción
      addToRecentlyPlayed(enrichedTrack);
      
      // Si se proporciona un índice y tracks de playlist, reproducir desde el contexto
      if (typeof index === 'number' && playlistTracks && playlistTracks.length > 0) {
        // Enriquecer todos los tracks de la playlist
        const enrichedPlaylistTracks = await Promise.all(
          playlistTracks.map(async (t) => await enrichTrackData(t))
        );
        
        // Encontrar el índice del track enriquecido
        const enrichedIndex = enrichedPlaylistTracks.findIndex(t => t.id === enrichedTrack.id);
        const actualIndex = enrichedIndex !== -1 ? enrichedIndex : index;
        
        playFromContext(enrichedTrack, enrichedPlaylistTracks, actualIndex);
      } else {
        // Reproducción individual
        playerPlayTrack(enrichedTrack);
      }
    } catch (error) {
      console.error('Error reproduciendo track desde playlist:', error);
      toast({
        title: 'Error de reproducción',
        description: 'No se pudo reproducir esta canción. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    }
  }, [enrichTrackData, addToRecentlyPlayed, playFromContext, playerPlayTrack, toast]);

  // Función para reproducir toda una playlist
  const playPlaylist = useCallback(async (playlistTracks: Track[], startIndex: number = 0) => {
    try {
      if (playlistTracks.length === 0) {
        toast({
          title: 'Playlist vacía',
          description: 'Esta playlist no tiene canciones.',
          variant: 'destructive'
        });
        return;
      }

      // Enriquecer todos los tracks de la playlist
      const enrichedTracks = await Promise.all(
        playlistTracks.map(async (track) => await enrichTrackData(track))
      );

      // Filtrar tracks que no tengan audio válido
      const validTracks = enrichedTracks.filter(track => track.audio && track.audio.trim() !== '');
      
      if (validTracks.length === 0) {
        toast({
          title: 'Error de reproducción',
          description: 'No hay canciones reproducibles en esta playlist.',
          variant: 'destructive'
        });
        return;
      }

      // Encontrar el índice correcto en la lista filtrada
      const startTrack = playlistTracks[startIndex];
      const validTrackIndex = validTracks.findIndex(t => t.id === startTrack.id);
      const actualStartIndex = validTrackIndex !== -1 ? validTrackIndex : 0;

      // Reproducir desde el contexto
      playFromContext(validTracks[actualStartIndex], validTracks, actualStartIndex);

      // Agregar la primera canción al historial
      addToRecentlyPlayed(validTracks[actualStartIndex]);

    } catch (error) {
      console.error('Error reproduciendo playlist:', error);
      toast({
        title: 'Error de reproducción',
        description: 'No se pudo reproducir la playlist. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    }
  }, [enrichTrackData, playFromContext, addToRecentlyPlayed, toast]);

  // Función para mezclar y reproducir una playlist
  const shufflePlayPlaylist = useCallback(async (playlistTracks: Track[]) => {
    try {
      if (playlistTracks.length === 0) {
        toast({
          title: 'Playlist vacía',
          description: 'Esta playlist no tiene canciones.',
          variant: 'destructive'
        });
        return;
      }

      // Enriquecer todos los tracks de la playlist
      const enrichedTracks = await Promise.all(
        playlistTracks.map(async (track) => await enrichTrackData(track))
      );

      // Filtrar tracks que no tengan audio válido
      const validTracks = enrichedTracks.filter(track => track.audio && track.audio.trim() !== '');
      
      if (validTracks.length === 0) {
        toast({
          title: 'Error de reproducción',
          description: 'No hay canciones reproducibles en esta playlist.',
          variant: 'destructive'
        });
        return;
      }

      // Mezclar los tracks válidos
      const shuffledTracks = [...validTracks].sort(() => Math.random() - 0.5);

      // Reproducir desde el contexto mezclado
      playFromContext(shuffledTracks[0], shuffledTracks, 0);

      // Agregar la primera canción al historial
      addToRecentlyPlayed(shuffledTracks[0]);

    } catch (error) {
      console.error('Error reproduciendo playlist mezclada:', error);
      toast({
        title: 'Error de reproducción',
        description: 'No se pudo reproducir la playlist. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    }
  }, [enrichTrackData, playFromContext, addToRecentlyPlayed, toast]);

  return {
    playTrackFromPlaylist,
    playPlaylist,
    shufflePlayPlaylist,
    enrichTrackData
  };
}; 