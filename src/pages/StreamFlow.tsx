import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useJamendoAPI, searchTracks } from '@/hooks/useJamendoAPI';
import { JamendoTrack, PlaylistTrack } from '@/types/jamendo';
import Header from '@/components/Header';
import TrackCard from '@/components/TrackCard';
import PlayQueue from '@/components/PlayQueue';
import { usePlayer } from '@/contexts/PlayerContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, TrendingUp, Shuffle, Radio, Zap, Search, Activity } from 'lucide-react';
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
  
  const {
    queue,
    currentTrack,
    currentIndex,
    playTrack,
    addToQueue,
    removeFromQueue,
    selectTrack,
    nextTrack,
    shuffleQueue
  } = usePlayer();
  
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
          title: "Señal no encontrada",
          description: "No se detectaron frecuencias que coincidan con tu búsqueda.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Transmisión completada",
          description: `Se sincronizaron ${results.length} frecuencias.`
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión neural';
      setSearchError(errorMessage);
      toast({
        title: "Fallo en el escaneo",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  const handlePlay = useCallback((track: JamendoTrack) => {
    playTrack(track);
  }, [playTrack]);

  const handleAddToQueue = useCallback((track: JamendoTrack) => {
    addToQueue(track);
  }, [addToQueue]);

  const handleRemoveFromQueue = useCallback((trackId: string) => {
    removeFromQueue(trackId);
  }, [removeFromQueue]);

  const handleSelectTrack = useCallback((track: PlaylistTrack) => {
    selectTrack(track);
  }, [selectTrack]);

  const clearSearch = () => {
    setSearchResults([]);
    setSearchQuery('');
    setSearchGenre('');
    setSearchError(null);
  };

  const handleShuffleQueue = () => {
    shuffleQueue();
  };

  return (
    <div className="min-h-screen bg-cyber-gradient text-foreground pb-24 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-2xl animate-ping" />
        </div>
      </div>

      <div className="relative z-10">
        <Header onSearch={handleSearch} />
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Search Results or Popular Tracks Header */}
              <div className="mb-8">
                {isShowingSearchResults ? (
                  <div className="cyber-card p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-bold flex items-center gap-3 text-white mb-2">
                          <Search className="w-8 h-8 text-cyan-400" />
                          Resultados del escaneo
                        </h2>
                        <p className="text-gray-300">
                          {searchQuery && (
                            <span className="bg-purple-600/20 border border-purple-500/30 px-2 py-1 rounded-full text-sm">
                              "{searchQuery}"
                            </span>
                          )}
                          {searchQuery && searchGenre && ' en '}
                          {searchGenre && (
                            <span className="bg-cyan-600/20 border border-cyan-500/30 px-2 py-1 rounded-full text-sm ml-2">
                              {searchGenre}
                            </span>
                          )}
                        </p>
                      </div>
                      <Button 
                        onClick={clearSearch}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold shadow-glow-cyan/50"
                      >
                        <Radio className="w-4 h-4 mr-2" />
                        Ver transmisiones virales
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="cyber-card p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-bold flex items-center gap-3 text-white mb-2">
                          <TrendingUp className="w-8 h-8 text-purple-400 animate-pulse" />
                          Transmisiones Virales
                        </h2>
                        <p className="text-gray-300">Las frecuencias más populares del metaverso</p>
                      </div>
                      {queue.length > 1 && (
                        <Button 
                          onClick={handleShuffleQueue}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold shadow-glow-purple/50"
                        >
                          <Shuffle className="w-4 h-4 mr-2" />
                          Aleatorizar matriz
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Error States */}
              {(popularError || searchError) && (
                <Alert className="mb-6 cyber-card border-red-500/30 bg-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <AlertDescription className="text-red-300">
                    <strong>Error de conexión neural:</strong> {popularError || searchError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Loading State */}
              {(popularLoading || isSearching) && (
                <Card className="mb-6 cyber-card border-purple-500/30">
                  <CardContent className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
                        <div className="absolute inset-0 h-12 w-12 border-2 border-cyan-400/30 rounded-full animate-ping" />
                      </div>
                      <span className="text-xl text-white">
                        {isSearching ? (
                          <span className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                            Escaneando dimensiones sonoras...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Radio className="w-5 h-5 text-purple-400 animate-pulse" />
                            Sincronizando frecuencias populares...
                          </span>
                        )}
                      </span>
                      <div className="w-64 h-1 bg-black/30 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tracks List */}
              {!popularLoading && !isSearching && displayTracks.length > 0 && (
                <div className="space-y-4">
                  {displayTracks.map((track, index) => (
                    <div 
                      key={track.id}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className="animate-fade-in"
                    >
                      <TrackCard
                        track={track}
                        onPlay={handlePlay}
                        onAddToQueue={handleAddToQueue}
                        isPlaying={currentTrack?.id === track.id}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {!popularLoading && !isSearching && displayTracks.length === 0 && !popularError && !searchError && (
                <Card className="cyber-card border-purple-500/30">
                  <CardContent className="text-center py-16">
                    <div className="mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="h-12 w-12 text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-white">
                      {isShowingSearchResults ? 'Señal no detectada' : 'Red neural desconectada'}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      {isShowingSearchResults 
                        ? 'Intenta ajustar los parámetros de búsqueda para encontrar frecuencias compatibles.'
                        : 'No se pueden sincronizar las transmisiones populares. Verifica tu conexión neural.'
                      }
                    </p>
                    {isShowingSearchResults && (
                      <Button 
                        onClick={clearSearch}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Restablecer búsqueda
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Queue Sidebar */}
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-24">
                <PlayQueue
                  queue={queue}
                  currentTrack={currentTrack}
                  onRemoveFromQueue={handleRemoveFromQueue}
                  onSelectTrack={handleSelectTrack}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}