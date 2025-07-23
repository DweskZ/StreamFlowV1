import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useJamendoAPI, searchTracks } from '@/hooks/useJamendoAPI';
import { JamendoTrack, PlaylistTrack } from '@/types/jamendo';
import Header from '@/components/Header';
import TrackCard from '@/components/TrackCard';
import PlayQueue from '@/components/PlayQueue';
import MusicPlayer from '@/components/AudioPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, TrendingUp, Shuffle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function StreamFlow() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchGenre, setSearchGenre] = useState('');
  const [searchResults, setSearchResults] = useState<JamendoTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Popular tracks (initial load)
  const { tracks: popularTracks, loading: popularLoading, error: popularError } = useJamendoAPI({
    order: 'popularity_total',
    limit: 20
  });
  
  // Playlist state
  const [queue, setQueue] = useState<PlaylistTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<PlaylistTrack | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Display tracks (either search results or popular tracks)
  const displayTracks = searchResults.length > 0 ? searchResults : popularTracks;
  const isShowingSearchResults = searchResults.length > 0;

  const handleSearch = useCallback(async (query: string, genre?: string) => {
    if (!query.trim() && !genre) {
      setSearchResults([]);
      setSearchQuery('');
      setSearchGenre('');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchQuery(query);
    setSearchGenre(genre || '');

    try {
      const results = await searchTracks({
        name: query.trim() || undefined,
        tags: genre || undefined,
        limit: 30
      });

      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "Sin resultados",
          description: "No se encontraron canciones que coincidan con tu búsqueda.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Búsqueda completada",
          description: `Se encontraron ${results.length} canciones.`
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setSearchError(errorMessage);
      toast({
        title: "Error en la búsqueda",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  const handlePlay = useCallback((track: JamendoTrack) => {
    const playlistTrack: PlaylistTrack = {
      ...track,
      addedAt: new Date()
    };

    // If track is not in queue, add it
    const existingIndex = queue.findIndex(t => t.id === track.id);
    if (existingIndex === -1) {
      setQueue(prev => [playlistTrack, ...prev]);
      setCurrentTrack(playlistTrack);
      setCurrentIndex(0);
    } else {
      setCurrentTrack(queue[existingIndex]);
      setCurrentIndex(existingIndex);
    }

    toast({
      title: "Reproduciendo",
      description: `${track.name} - ${track.artist_name}`
    });
  }, [queue, toast]);

  const handleAddToQueue = useCallback((track: JamendoTrack) => {
    const existingTrack = queue.find(t => t.id === track.id);
    if (existingTrack) {
      toast({
        title: "Ya en la cola",
        description: "Esta canción ya está en tu cola de reproducción.",
        variant: "destructive"
      });
      return;
    }

    const playlistTrack: PlaylistTrack = {
      ...track,
      addedAt: new Date()
    };

    setQueue(prev => [...prev, playlistTrack]);
    toast({
      title: "Agregado a la cola",
      description: `${track.name} - ${track.artist_name}`
    });
  }, [queue, toast]);

  const handleRemoveFromQueue = useCallback((trackId: string) => {
    setQueue(prev => {
      const newQueue = prev.filter(t => t.id !== trackId);
      
      // If current track was removed, play next or stop
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

  const handleSelectTrack = useCallback((track: PlaylistTrack) => {
    const index = queue.findIndex(t => t.id === track.id);
    if (index !== -1) {
      setCurrentTrack(track);
      setCurrentIndex(index);
    }
  }, [queue]);

  const handleTrackEnded = useCallback(() => {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentTrack(queue[nextIndex]);
      setCurrentIndex(nextIndex);
    } else {
      setCurrentTrack(null);
      setCurrentIndex(0);
    }
  }, [queue, currentIndex]);

  const clearSearch = () => {
    setSearchResults([]);
    setSearchQuery('');
    setSearchGenre('');
    setSearchError(null);
  };

  const shuffleQueue = () => {
    if (queue.length <= 1) return;
    
    const shuffled = [...queue].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    
    if (currentTrack) {
      const newIndex = shuffled.findIndex(t => t.id === currentTrack.id);
      setCurrentIndex(newIndex);
    }
    
    toast({
      title: "Cola mezclada",
      description: "Se reorganizó la cola de reproducción aleatoriamente."
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <Header onSearch={handleSearch} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search Results or Popular Tracks Header */}
            <div className="mb-6">
              {isShowingSearchResults ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      Resultados de búsqueda
                    </h2>
                    <p className="text-muted-foreground">
                      {searchQuery && `"${searchQuery}"`}
                      {searchQuery && searchGenre && ' en '}
                      {searchGenre && `género: ${searchGenre}`}
                    </p>
                  </div>
                  <Button variant="outline" onClick={clearSearch}>
                    Ver música popular
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Música Popular
                  </h2>
                  {queue.length > 1 && (
                    <Button variant="outline" onClick={shuffleQueue}>
                      <Shuffle className="h-4 w-4 mr-2" />
                      Mezclar cola
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Error States */}
            {(popularError || searchError) && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {popularError || searchError}
                </AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {(popularLoading || isSearching) && (
              <Card className="mb-6">
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                  <span className="text-lg">
                    {isSearching ? 'Buscando canciones...' : 'Cargando música popular...'}
                  </span>
                </CardContent>
              </Card>
            )}

            {/* Tracks List */}
            {!popularLoading && !isSearching && displayTracks.length > 0 && (
              <div className="space-y-3">
                {displayTracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    onPlay={handlePlay}
                    onAddToQueue={handleAddToQueue}
                    isPlaying={currentTrack?.id === track.id}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {!popularLoading && !isSearching && displayTracks.length === 0 && !popularError && !searchError && (
              <Card>
                <CardContent className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No hay canciones disponibles</h3>
                  <p className="text-muted-foreground">
                    {isShowingSearchResults 
                      ? 'Intenta con otros términos de búsqueda.'
                      : 'No se pudieron cargar las canciones populares.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Queue Sidebar */}
          <div className="w-80 flex-shrink-0">
            <PlayQueue
              queue={queue}
              currentTrack={currentTrack}
              onRemoveFromQueue={handleRemoveFromQueue}
              onSelectTrack={handleSelectTrack}
            />
          </div>
        </div>
      </div>

      {/* Music Player */}
      <MusicPlayer
        currentTrack={currentTrack}
        onEnded={handleTrackEnded}
      />
    </div>
  );
}