# Solución para Reproducción de Playlists Guardadas

## Problema Identificado

La aplicación funcionaba correctamente cuando se buscaban canciones y se creaban playlists, pero al salir del perfil y volver a entrar, las playlists guardadas no se reproducían correctamente.

### Causa Raíz

El problema principal era que las canciones guardadas en las playlists no tenían la información completa necesaria para la reproducción, específicamente:

1. **Falta de URL de audio**: Las canciones guardadas no tenían el campo `audio` con la URL necesaria para la reproducción
2. **Inconsistencia en datos**: Los datos guardados en Supabase no incluían toda la información necesaria que se obtiene al buscar canciones
3. **No se recuperaba información completa**: Al cargar las playlists desde la base de datos, no se obtenía la información completa de las canciones desde la API

## Solución Implementada

### 1. Hook `usePlaylistPlayback` (Nuevo)

Se creó un hook especializado para manejar la reproducción de playlists guardadas:

```typescript
// src/hooks/usePlaylistPlayback.ts
export const usePlaylistPlayback = () => {
  // Función para enriquecer tracks con datos completos desde la API
  const enrichTrackData = useCallback(async (track: Track): Promise<Track> => {
    // Si el track ya tiene audio, no necesitamos enriquecerlo
    if (track.audio && track.audio.trim() !== '') {
      return track;
    }

    // Buscar el track en la API para obtener datos completos
    const searchResults = await searchTracks(`${track.name} ${track.artist_name}`);
    
    // Encontrar el track más similar y combinar datos
    const bestMatch = searchResults.find(result => 
      result.id === track.id || 
      (result.name.toLowerCase() === track.name.toLowerCase() && 
       result.artist_name.toLowerCase() === track.artist_name.toLowerCase())
    );

    if (bestMatch) {
      return {
        ...track,
        audio: bestMatch.audio || track.audio || '',
        audiodownload: bestMatch.audiodownload || track.audiodownload || '',
        proaudio: bestMatch.proaudio || track.proaudio || '',
        audiodlallowed: bestMatch.audiodlallowed || track.audiodlallowed || false,
        album_image: bestMatch.album_image || track.album_image || track.image || '',
        image: bestMatch.image || track.image || track.album_image || '',
        tags: bestMatch.tags || track.tags || { genres: [], instruments: [], vartags: [] }
      };
    }

    return track;
  }, []);

  // Funciones de reproducción mejoradas
  const playTrackFromPlaylist = useCallback(async (track: Track, index?: number, playlistTracks?: Track[]) => {
    // Enriquecer el track si no tiene audio
    const enrichedTrack = await enrichTrackData(track);
    
    // Reproducir con contexto completo
    if (typeof index === 'number' && playlistTracks && playlistTracks.length > 0) {
      const enrichedPlaylistTracks = await Promise.all(
        playlistTracks.map(async (t) => await enrichTrackData(t))
      );
      
      playFromContext(enrichedTrack, enrichedPlaylistTracks, index);
    } else {
      playerPlayTrack(enrichedTrack);
    }
  }, [enrichTrackData, playFromContext, playerPlayTrack]);

  const playPlaylist = useCallback(async (playlistTracks: Track[], startIndex: number = 0) => {
    // Enriquecer todos los tracks y filtrar los válidos
    const enrichedTracks = await Promise.all(
      playlistTracks.map(async (track) => await enrichTrackData(track))
    );

    const validTracks = enrichedTracks.filter(track => track.audio && track.audio.trim() !== '');
    
    if (validTracks.length === 0) {
      toast({
        title: 'Error de reproducción',
        description: 'No hay canciones reproducibles en esta playlist.',
        variant: 'destructive'
      });
      return;
    }

    // Reproducir desde el contexto
    playFromContext(validTracks[startIndex], validTracks, startIndex);
  }, [enrichTrackData, playFromContext, toast]);

  return {
    playTrackFromPlaylist,
    playPlaylist,
    shufflePlayPlaylist,
    enrichTrackData
  };
};
```

### 2. Mejora en `usePlaylists` Hook

Se mejoró el hook existente para enriquecer automáticamente los tracks al cargarlos:

```typescript
// src/hooks/usePlaylists.ts
// Función para enriquecer tracks con datos completos desde la API
const enrichTrackData = async (track: Track): Promise<Track> => {
  // Lógica de enriquecimiento similar a usePlaylistPlayback
};

// En la función loadPlaylists, se enriquecen los tracks automáticamente
const enrichedTracks = await Promise.all(
  (tracksData || []).map(async (pt: any) => {
    const track = pt.track_data as Track;
    return await enrichTrackData(track);
  })
);
```

### 3. Validación en PlayerContext

Se agregó validación en el PlayerContext para verificar que las canciones tengan la información de audio necesaria:

```typescript
// src/contexts/PlayerContext.tsx
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
  // ... resto de la lógica
}, [queue, toast, onTrackPlay, recordPlayStart]);

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

  // ... resto de la lógica
}, [onTrackPlay, toast]);
```

### 4. Actualización de Componentes

Se actualizaron los componentes principales para usar el nuevo sistema:

- **PlaylistPage**: Ahora usa `usePlaylistPlayback` para reproducción robusta
- **LikedSongsPage**: También actualizada para usar el nuevo sistema
- **Componente de prueba**: Se creó `PlaylistPlaybackTest` para verificar el funcionamiento

## Beneficios de la Solución

### 1. **Reproducción Confiable**
- Las canciones guardadas ahora se enriquecen automáticamente con datos completos
- Validación de audio antes de intentar reproducir
- Manejo de errores robusto

### 2. **Experiencia de Usuario Mejorada**
- Mensajes de error claros cuando no se puede reproducir
- Reproducción automática desde el contexto correcto
- Filtrado de canciones no reproducibles

### 3. **Mantenibilidad**
- Código centralizado en hooks especializados
- Lógica de enriquecimiento reutilizable
- Fácil de extender y modificar

### 4. **Consistencia**
- Misma lógica de reproducción en toda la aplicación
- Datos consistentes entre búsqueda y playlists guardadas
- Manejo uniforme de errores

## Cómo Usar la Solución

### Para Desarrolladores

1. **Usar el hook `usePlaylistPlayback`** en lugar de llamar directamente a `playTrack` o `playFromContext`
2. **Importar el hook** en los componentes que manejan reproducción de playlists:

```typescript
import { usePlaylistPlayback } from '@/hooks/usePlaylistPlayback';

const { playTrackFromPlaylist, playPlaylist, shufflePlayPlaylist } = usePlaylistPlayback();
```

3. **Usar las funciones del hook** para reproducción:

```typescript
// Reproducir una canción individual desde playlist
playTrackFromPlaylist(track, index, playlistTracks);

// Reproducir toda una playlist
playPlaylist(playlistTracks, startIndex);

// Reproducir playlist mezclada
shufflePlayPlaylist(playlistTracks);
```

### Para Usuarios

La solución es transparente para los usuarios. Ahora pueden:

1. **Crear playlists** normalmente
2. **Salir y volver** al perfil sin problemas
3. **Reproducir playlists guardadas** sin errores
4. **Ver mensajes claros** si hay problemas de reproducción

## Pruebas

Se incluye un componente de prueba (`PlaylistPlaybackTest`) que permite:

- Verificar que todas las playlists tengan canciones reproducibles
- Probar la reproducción de playlists individuales
- Identificar problemas específicos en playlists

## Consideraciones Futuras

1. **Cache de datos enriquecidos**: Considerar cachear los datos enriquecidos para evitar llamadas repetidas a la API
2. **Enriquecimiento en background**: Realizar el enriquecimiento de datos en background para mejorar la experiencia
3. **Métricas de reproducción**: Agregar métricas para monitorear el éxito de la reproducción
4. **Fallback strategies**: Implementar estrategias de fallback más sofisticadas

## Conclusión

Esta solución resuelve completamente el problema de reproducción de playlists guardadas, proporcionando una experiencia de usuario consistente y confiable. La implementación es robusta, mantenible y extensible para futuras mejoras. 