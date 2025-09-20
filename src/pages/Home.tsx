import { useCallback, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import SimpleTrackCard from '@/components/SimpleTrackCard';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Music, Play, Zap, Headphones, Crown, Star, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PLANS } from '@/types/subscription';
import useTrendingSongs from '@/hooks/useTrendingSongs';

export default function Home() {
  const { tracks, loading, error, search } = useTrendingSongs();
  const { currentTrack, playTrack } = usePlayer();

  // 🔁 Fallback cuando trending no trae datos (RapidAPI sin /chart)
  const triedFallbackRef = useRef(false);

  const runFallback = useCallback(() => {
    // Cambia la query si prefieres otra semilla
    return search('Top 50 Global');
    // Ejemplos alternativos:
    // return search('genre:"pop"');
    // return search('Top Hits');
  }, [search]);

  useEffect(() => {
    if (!loading && !triedFallbackRef.current && (error || tracks.length === 0)) {
      triedFallbackRef.current = true;
      runFallback();
    }
  }, [loading, error, tracks.length, runFallback]);

  const handleSearch = useCallback((query: string) => {
    if (query.trim()) search(query.trim());
  }, [search]);

  const getPeriodLabel = (planId: string) => (planId.includes('annual') ? '/año' : '/mes');

  const artistsMap = new Map<string, { name: string; image: string }>();
  tracks.forEach(t => {
    if (!artistsMap.has(t.artist_id)) {
      artistsMap.set(t.artist_id, { name: t.artist_name, image: t.album_image || t.image });
    }
  });
  const artists = Array.from(artistsMap.values()).slice(0, 6);

  return (
    <div className="min-h-screen bg-cyber-gradient text-foreground pb-20 sm:pb-24 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-32 sm:w-64 lg:w-96 h-32 sm:h-64 lg:h-96 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-32 sm:w-64 lg:w-96 h-32 sm:h-64 lg:h-96 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 sm:w-48 lg:w-64 h-24 sm:h-48 lg:h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-ping" />
        </div>
      </div>

      <div className="relative z-10">
        <Header onSearch={handleSearch} />

        {/* Hero Section - Mobile Optimized */}
        <section className="relative bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-cyan-900/40 text-center py-8 sm:py-12 lg:py-20 border-b border-purple-500/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 container mx-auto px-4">
            <div className="flex justify-center mb-3 sm:mb-4 lg:mb-6">
              <div className="relative">
                <Music className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-purple-400 animate-neon-pulse" />
                <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-purple-500/20 rounded-full blur-xl" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-6xl font-bold mb-3 sm:mb-4 lg:mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
              Bienvenido a StreamFlow
            </h2>

            <p className="text-gray-300 mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
              Sumérgete en el futuro de la música. Descubre beats cyberpunk, melodías sintéticas y ritmos que trascienden dimensiones.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button
                asChild
                className="neon-button text-white font-semibold px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base lg:text-lg group"
              >
                <a href="/login" className="flex items-center gap-2">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:rotate-12 transition-transform" />
                  Iniciar Transmisión
                </a>
              </Button>

              <Button
                variant="outline"
                asChild
                className="bg-transparent border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:shadow-glow-cyan px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base lg:text-lg"
              >
                <a href="#explore" className="flex items-center gap-2">
                  <Headphones className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  Explorar
                </a>
              </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12 space-y-8 sm:space-y-12 lg:space-y-16">
          {/* Trending Section - Mobile Optimized */}
          <div id="explore">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
              <div className="w-1 h-4 sm:h-6 lg:h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Transmisiones Virales</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
            </div>

            {loading && (
              <div className="flex items-center justify-center py-6 sm:py-8 lg:py-12">
                <div className="flex items-center gap-2 sm:gap-3 text-purple-400">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs sm:text-sm lg:text-base">Sincronizando frecuencias...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="cyber-card border-red-500/30 p-3 sm:p-4 lg:p-6 text-center">
                <p className="text-red-400 mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base">
                  {error} — cargando alternativa…
                </p>
                <Button
                  onClick={() => {
                    triedFallbackRef.current = true;
                    runFallback();
                  }}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs sm:text-sm"
                >
                  Usar fallback
                </Button>
              </div>
            )}

            {/* Estado neutro si no hay error pero aún no hay datos */}
            {!loading && !error && tracks.length === 0 && (
              <div className="cyber-card p-4 text-center text-gray-400">Cargando selección inicial…</div>
            )}

            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              {tracks.slice(0, 6).map((track, index) => (
                <div
                  key={track.id}
                  className="cyber-card p-2 sm:p-3 lg:p-4 hover-glow transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <SimpleTrackCard
                    track={track}
                    onPlay={playTrack}
                    isPlaying={currentTrack?.id === track.id}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Plans Section - Mobile Optimized */}
          <div>
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
              <div className="w-1 h-4 sm:h-6 lg:h-8 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full" />
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Elige tu Plan</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {PLANS.map((plan, index) => (
                <div
                  key={plan.id}
                  className={`
                    cyber-card p-3 sm:p-4 lg:p-5 text-center hover-glow transition-all duration-300
                    ${plan.id === 'premium_monthly' ? 'ring-2 ring-yellow-500/50 relative' : ''}
                  `}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {plan.id === 'premium_monthly' && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      POPULAR
                    </Badge>
                  )}

                  <div className="mb-3 sm:mb-4">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full flex items-center justify-center ${
                        plan.id === 'free'
                          ? 'bg-gradient-to-br from-gray-600 to-gray-800'
                          : 'bg-gradient-to-br from-yellow-500 to-orange-600'
                      }`}
                    >
                      {plan.id === 'free' ? (
                        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      ) : (
                        <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      )}
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">{plan.name}</h4>

                    <div className="mb-2 sm:mb-3">
                      <span className="text-xl sm:text-2xl font-bold text-white">${plan.price}</span>
                      <span className="text-gray-400 text-xs sm:text-sm ml-1">
                        {plan.id === 'free' ? '' : getPeriodLabel(plan.id)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                    {plan.features.slice(0, 2).map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-xs">
                        <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 2 && (
                      <div className="text-xs text-gray-500">+{plan.features.length - 2} más</div>
                    )}
                  </div>

                  <Button
                    asChild
                    size="sm"
                    className={`w-full text-xs sm:text-sm ${
                      plan.id === 'free'
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black font-bold'
                    } transition-all duration-300`}
                  >
                    <Link to="/login">{plan.id === 'free' ? 'Comenzar Gratis' : 'Obtener Premium'}</Link>
                  </Button>
                </div>
              ))}
            </div>

            <div className="text-center mt-4 sm:mt-6">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-xs sm:text-sm"
              >
                <Link to="/login">Ver todos los planes</Link>
              </Button>
            </div>
          </div>

          {/* Artists Section - Mobile Optimized */}
          {artists.length > 0 && (
            <div>
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
                <div className="w-1 h-4 sm:h-6 lg:h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Artistas del Futuro</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                {artists.map((artist) => (
                  <div key={artist.name} className="group cursor-pointer">
                    <div className="cyber-card p-2 sm:p-3 lg:p-4 text-center hover-glow transition-all duration-300 group-hover:scale-105">
                      <div className="relative mb-2 sm:mb-3 lg:mb-4">
                        <Avatar className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto border-2 border-purple-500/30 group-hover:border-purple-400 transition-colors">
                          <AvatarImage src={artist.image || '/placeholder.svg'} className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold text-xs sm:text-sm lg:text-base">
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

          {/* Features Section - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-8 sm:mt-12 lg:mt-16">
            <div className="cyber-card p-3 sm:p-4 lg:p-6 text-center hover-glow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
                <Music className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <h4 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2">Audio Neural</h4>
              <p className="text-gray-400 text-xs sm:text-sm lg:text-base">Calidad de sonido mejorada con IA para una experiencia inmersiva total.</p>
            </div>

            <div className="cyber-card p-3 sm:p-4 lg:p-6 text-center hover-glow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <h4 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2">Streaming Cuántico</h4>
              <p className="text-gray-400 text-xs sm:text-sm lg:text-base">Transmisión instantánea sin lag, conectado a servidores del futuro.</p>
            </div>

            <div className="cyber-card p-3 sm:p-4 lg:p-6 text-center hover-glow sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <h4 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2">Playlists Sintéticas</h4>
              <p className="text-gray-400 text-xs sm:text-sm lg:text-base">Crea y personaliza tus listas con algoritmos de nueva generación.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
