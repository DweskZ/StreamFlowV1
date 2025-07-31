import { useCallback } from 'react';
import Header from '@/components/Header';
import TrackCard from '@/components/TrackCard';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Music, Play, Zap, Headphones } from 'lucide-react';
import useTrendingSongs from '@/hooks/useTrendingSongs';

export default function Home() {
  const { tracks, loading, error, search } = useTrendingSongs();
  const { currentTrack, playTrack, addToQueue } = usePlayer();

  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      search(query.trim());
    }
  }, [search]);

  const artistsMap = new Map<string, { name: string; image: string }>();
  tracks.forEach(t => {
    if (!artistsMap.has(t.artist_id)) {
      artistsMap.set(t.artist_id, { name: t.artist_name, image: t.album_image || t.image });
    }
  });
  const artists = Array.from(artistsMap.values()).slice(0, 6);

  return (
    <div className="min-h-screen bg-cyber-gradient text-foreground pb-24 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-ping" />
        </div>
      </div>

      <div className="relative z-10">
        <Header onSearch={handleSearch} />
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-cyan-900/40 text-center py-12 sm:py-20 border-b border-purple-500/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 container mx-auto px-4">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="relative">
                <Music className="w-16 h-16 sm:w-20 sm:h-20 text-purple-400 animate-neon-pulse" />
                <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 bg-purple-500/20 rounded-full blur-xl" />
              </div>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
              Bienvenido a StreamFlow
            </h2>
            
            <p className="text-gray-300 mb-6 sm:mb-8 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Sumérgete en el futuro de la música. Descubre beats cyberpunk, melodías sintéticas y ritmos que trascienden dimensiones.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button 
                asChild 
                className="neon-button text-white font-semibold px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg group"
              >
                <a href="/login" className="flex items-center gap-2">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
                  Iniciar Transmisión
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                asChild
                className="bg-transparent border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:shadow-glow-cyan px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg"
              >
                <a href="#explore" className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
                  Explorar
                </a>
              </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 sm:py-12 space-y-12 sm:space-y-16">
          {/* Trending Section */}
          <div id="explore">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                Transmisiones Virales
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
            </div>
            
            {loading && (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="flex items-center gap-3 text-purple-400">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">Sincronizando frecuencias...</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="cyber-card border-red-500/30 p-4 sm:p-6 text-center">
                <p className="text-red-400 mb-4 text-sm sm:text-base">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Reconectar
                </Button>
              </div>
            )}
            
            <div className="space-y-3 sm:space-y-4">
              {tracks.map((track, index) => (
                <div 
                  key={track.id}
                  className="cyber-card p-3 sm:p-4 hover-glow transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TrackCard
                    track={track}
                    onPlay={playTrack}
                    onAddToQueue={addToQueue}
                    isPlaying={currentTrack?.id === track.id}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Artists Section */}
          {artists.length > 0 && (
            <div>
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Artistas del Futuro
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                {artists.map((artist, idx) => (
                  <div 
                    key={idx} 
                    className="group cursor-pointer"
                  >
                    <div className="cyber-card p-3 sm:p-4 text-center hover-glow transition-all duration-300 group-hover:scale-105">
                      <div className="relative mb-3 sm:mb-4">
                        <Avatar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto border-2 border-purple-500/30 group-hover:border-purple-400 transition-colors">
                          <AvatarImage src={artist.image || '/placeholder.svg'} className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold text-sm sm:text-base">
                            {artist.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate">
                        {artist.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16">
            <div className="cyber-card p-4 sm:p-6 text-center hover-glow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Music className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Audio Neural</h4>
              <p className="text-gray-400 text-sm sm:text-base">Calidad de sonido mejorada con IA para una experiencia inmersiva total.</p>
            </div>
            
            <div className="cyber-card p-4 sm:p-6 text-center hover-glow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Streaming Cuántico</h4>
              <p className="text-gray-400 text-sm sm:text-base">Transmisión instantánea sin lag, conectado a servidores del futuro.</p>
            </div>
            
            <div className="cyber-card p-4 sm:p-6 text-center hover-glow sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Playlists Sintéticas</h4>
              <p className="text-gray-400 text-sm sm:text-base">Crea y personaliza tus listas con algoritmos de nueva generación.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
