import { useState, useEffect } from 'react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { Track } from '@/types/music';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import TrackCard from '@/components/TrackCard';
import { 
  Target, 
  RefreshCw, 
  TrendingUp, 
  Heart, 
  Music, 
  Sparkles,
  Clock,
  Headphones
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Estilos CSS para line-clamp
const lineClampStyles = `
  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
`;

const RecommendationsPage = () => {
  const { recommendations, userStats, loading, refreshRecommendations, updateRecommendationsFromHistory } = useRecommendations();
  const { playTrack: playerPlayTrack, addToQueue } = usePlayer();
  const { addToRecentlyPlayed } = useLibrary();
  const [greeting, setGreeting] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Integrar playTrack con recently played
  const playTrack = (track: Track) => {
    addToRecentlyPlayed(track);
    playerPlayTrack(track);
    // No actualizar recomendaciones automáticamente
  };

  // Función para actualizar recomendaciones con indicador de carga
  const handleUpdateWithHistory = async () => {
    setIsUpdating(true);
    try {
      await updateRecommendationsFromHistory();
    } finally {
      setIsUpdating(false);
    }
  };

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Buenos días');
    } else if (hour < 18) {
      setGreeting('Buenas tardes');
    } else {
      setGreeting('Buenas noches');
    }
  }, []);

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'based-on-history':
        return <Heart className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'trending-for-you':
        return <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'popular-genres':
        return <Music className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'featured-artists':
        return <Heart className="h-4 w-4 sm:h-5 sm:w-5" />;
      default:
        return <Target className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  const getSectionGradient = (sectionId: string) => {
    switch (sectionId) {
      case 'based-on-history':
        return 'from-purple-600 to-pink-600';
      case 'trending-for-you':
        return 'from-orange-600 to-red-600';
      case 'popular-genres':
        return 'from-blue-600 to-indigo-600';
      case 'featured-artists':
        return 'from-pink-600 to-rose-600';
      default:
        return 'from-purple-600 to-pink-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-black">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 sm:gap-3">
              <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 animate-spin" />
              <span className="text-white text-base sm:text-lg">Analizando tus gustos...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

     return (
     <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-black">
       <style>{lineClampStyles}</style>
       <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header Section - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{greeting}</h1>
            </div>
            <p className="text-gray-400 text-sm sm:text-lg">Recomendaciones personalizadas para ti</p>
            <p className="text-xs text-gray-500">
              Las recomendaciones se mantienen estables. Usa "Actualizar con historial" para considerar tu actividad reciente.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleUpdateWithHistory}
              variant="outline"
              disabled={isUpdating}
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-50 text-xs sm:text-sm"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'Actualizando...' : 'Actualizar con historial'}
            </Button>
            <Button
              onClick={refreshRecommendations}
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-xs sm:text-sm"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* User Stats Card - Mobile Optimized */}
        {userStats && (
          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
                <Headphones className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                Tus Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-400">{userStats.totalPlays}</div>
                  <div className="text-xs sm:text-sm text-gray-400">Canciones reproducidas</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-cyan-400">
                    {Math.round(userStats.totalTimeListened / 60)} min
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">Tiempo escuchado</div>
                </div>
                                 <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-pink-400">
                     {userStats.favoriteArtists.length}
                   </div>
                  <div className="text-xs sm:text-sm text-gray-400">Artistas favoritos</div>
                 </div>
              </div>
              
                             {userStats.favoriteArtists.length > 0 && (
                <div className="mt-3 sm:mt-4">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-300 mb-2">Artistas favoritos:</h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                     {userStats.favoriteArtists.slice(0, 5).map((artist, index) => (
                       <span
                         key={artist}
                         className="text-xs bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-300 px-2 py-1 rounded-full"
                       >
                         {artist}
                       </span>
                     ))}
                   </div>
                 </div>
               )}
            </CardContent>
          </Card>
        )}

        {/* Recommendations Sections - Mobile Optimized */}
        <div className="space-y-6 sm:space-y-8">
          {recommendations.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Target className="h-12 w-12 sm:h-16 sm:w-16 text-purple-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                No hay suficientes datos para recomendaciones
              </h3>
              <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                Reproduce más música para obtener recomendaciones personalizadas
              </p>
              <Button
                onClick={() => window.location.href = '/app/search'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm sm:text-base"
              >
                Explorar música
              </Button>
            </div>
          ) : (
            recommendations.map((section) => (
              <div key={section.id} className="space-y-4 sm:space-y-6">
                 <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-4">
                     <div className={cn(
                      "w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                       getSectionGradient(section.id)
                     )}>
                       {getSectionIcon(section.id)}
                     </div>
                     <div>
                      <h2 className="text-lg sm:text-2xl font-bold text-white">{section.title}</h2>
                      <p className="text-xs sm:text-sm text-gray-400">{section.description}</p>
                     </div>
                   </div>
                 </div>

                {/* Mobile: Use TrackCard for better mobile experience */}
                <div className="space-y-2 sm:space-y-3">
                   {section.tracks.map((track) => (
                    <div key={track.id}>
                      <TrackCard
                        track={track}
                        onPlay={playTrack}
                        onAddToQueue={addToQueue}
                      />
                     </div>
                   ))}
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage; 