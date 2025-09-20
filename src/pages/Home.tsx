import { useCallback } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Play, Zap, Headphones, Crown, Star, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PLANS } from '@/types/subscription';

export default function Home() {
  // Si en el futuro quieres redirigir a /search:
  // const handleSearch = useCallback((q: string) => {
  //   if (q.trim()) window.location.href = `/search?q=${encodeURIComponent(q.trim())}`;
  // }, []);
  const handleSearch = useCallback((_q: string) => {}, []);

  const getPeriodLabel = (planId: string) => (planId.includes('annual') ? '/año' : '/mes');

  return (
    <div className="min-h-screen bg-cyber-gradient text-foreground pb-20 sm:pb-24 relative overflow-hidden">
      {/* BG animado suave */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-32 sm:w-64 lg:w-96 h-32 sm:h-64 lg:h-96 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-32 sm:w-64 lg:w-96 h-32 sm:h-64 lg:h-96 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 sm:w-48 lg:w-64 h-24 sm:h-48 lg:h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-ping" />
        </div>
      </div>

      <div className="relative z-10">
        <Header onSearch={handleSearch} />

        {/* HERO full-page */}
        <section
          className="
            relative
            flex items-center justify-center
            min-h-[calc(100vh-72px)]  /* ajusta 72px a la altura real de tu header */
            bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-cyan-900/40
            border-b border-purple-500/20 backdrop-blur-sm
          "
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative">
                <Music className="w-14 h-14 sm:w-20 sm:h-20 text-purple-300 drop-shadow animate-neon-pulse" />
                <div className="absolute inset-0 w-14 h-14 sm:w-20 sm:h-20 bg-purple-500/20 rounded-full blur-xl" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent animate-gradient">
              Bienvenido a StreamFlow
            </h1>

            <p className="text-gray-300 mx-auto max-w-3xl text-sm sm:text-lg lg:text-xl mb-6 sm:mb-8">
              Sumérgete en el futuro de la música. Descubre beats cyberpunk, melodías sintéticas
              y ritmos que trascienden dimensiones.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button
                asChild
                className="neon-button text-white font-semibold px-6 sm:px-8 py-3 text-sm sm:text-base lg:text-lg group shadow-lg shadow-pink-500/20"
              >
                <a href="/login" className="flex items-center gap-2">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
                  Iniciar Transmisión
                </a>
              </Button>

              <Button
                variant="outline"
                asChild
                className="bg-transparent border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 hover:shadow-glow-cyan
                           px-6 sm:px-8 py-3 text-sm sm:text-base lg:text-lg"
              >
                <a href="#plans" className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
                  Explorar
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* CONTENIDO inferior (scroll) */}
        <div className="container mx-auto px-4 py-10 sm:py-14 lg:py-16 space-y-12 sm:space-y-16" id="plans">
          {/* Elige tu Plan */}
          <div>
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Elige tu Plan</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {PLANS.map((plan, index) => (
                <div
                  key={plan.id}
                  className={`
                    cyber-card p-4 sm:p-6 text-center hover-glow transition-all duration-300
                    ${plan.id === 'premium_monthly' ? 'ring-2 ring-yellow-500/50 relative' : ''}
                  `}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  {plan.id === 'premium_monthly' && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      POPULAR
                    </Badge>
                  )}

                  <div className="mb-4">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-full flex items-center justify-center ${
                        plan.id === 'free'
                          ? 'bg-gradient-to-br from-gray-600 to-gray-800'
                          : 'bg-gradient-to-br from-yellow-500 to-orange-600'
                      }`}
                    >
                      {plan.id === 'free' ? (
                        <Zap className="w-6 h-6 text-white" />
                      ) : (
                        <Crown className="w-6 h-6 text-white" />
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <div>
                      <span className="text-2xl sm:text-3xl font-bold text-white">${plan.price}</span>
                      <span className="text-gray-400 text-xs sm:text-sm ml-1">
                        {plan.id === 'free' ? '' : getPeriodLabel(plan.id)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {plan.features.slice(0, 3).map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-xs sm:text-sm">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 3 && (
                      <div className="text-xs text-gray-500">+{plan.features.length - 3} más</div>
                    )}
                  </div>

                  <Button
                    asChild
                    size="sm"
                    className={`w-full ${
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
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="cyber-card p-5 text-center hover-glow">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Music className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Audio Neural</h4>
              <p className="text-gray-400 text-sm sm:text-base">
                Calidad de sonido mejorada con IA para una experiencia inmersiva total.
              </p>
            </div>

            <div className="cyber-card p-5 text-center hover-glow">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Streaming Cuántico</h4>
              <p className="text-gray-400 text-sm sm:text-base">
                Transmisión instantánea sin lag, conectada a servidores del futuro.
              </p>
            </div>

            <div className="cyber-card p-5 text-center hover-glow">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Play className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Playlists Sintéticas</h4>
              <p className="text-gray-400 text-sm sm:text-base">
                Crea y personaliza tus listas con algoritmos de nueva generación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
