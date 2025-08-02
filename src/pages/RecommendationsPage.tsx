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
        return <Heart className="h-5 w-5" />;
      case 'trending-for-you':
        return <TrendingUp className="h-5 w-5" />;
      case 'popular-genres':
        return <Music className="h-5 w-5" />;
      case 'featured-artists':
        return <Heart className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
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
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 text-purple-400 animate-spin" />
              <span className="text-white text-lg">Analizando tus gustos...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

     return (
     <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-black">
       <style>{lineClampStyles}</style>
       <div className="p-6 lg:p-8 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">{greeting}</h1>
            </div>
            <p className="text-gray-400 text-lg">Recomendaciones personalizadas para ti</p>
            <p className="text-xs text-gray-500">
              Las recomendaciones se mantienen estables. Usa "Actualizar con historial" para considerar tu actividad reciente.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleUpdateWithHistory}
              variant="outline"
              disabled={isUpdating}
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'Actualizando...' : 'Actualizar con historial'}
            </Button>
            <Button
              onClick={refreshRecommendations}
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* User Stats Card */}
        {userStats && (
          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Headphones className="h-5 w-5 text-purple-400" />
                Tus Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{userStats.totalPlays}</div>
                  <div className="text-sm text-gray-400">Canciones reproducidas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {Math.round(userStats.totalTimeListened / 60)} min
                  </div>
                  <div className="text-sm text-gray-400">Tiempo escuchado</div>
                </div>
                                 <div className="text-center">
                   <div className="text-2xl font-bold text-pink-400">
                     {userStats.favoriteArtists.length}
                   </div>
                   <div className="text-sm text-gray-400">Artistas favoritos</div>
                 </div>
              </div>
              
                             {userStats.favoriteArtists.length > 0 && (
                 <div className="mt-4">
                   <h4 className="text-sm font-medium text-gray-300 mb-2">Artistas favoritos:</h4>
                   <div className="flex flex-wrap gap-2">
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

        {/* Recommendations Sections */}
        <div className="space-y-8">
          {recommendations.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No hay suficientes datos para recomendaciones
              </h3>
              <p className="text-gray-400 mb-4">
                Reproduce más música para obtener recomendaciones personalizadas
              </p>
              <Button
                onClick={() => window.location.href = '/app/search'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
              >
                Explorar música
              </Button>
            </div>
          ) : (
            recommendations.map((section) => (
                             <div key={section.id} className="space-y-6">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className={cn(
                       "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                       getSectionGradient(section.id)
                     )}>
                       {getSectionIcon(section.id)}
                     </div>
                     <div>
                       <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                       <p className="text-sm text-gray-400">{section.description}</p>
                     </div>
                   </div>
                 </div>

                                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                   {section.tracks.map((track) => (
                     <div key={track.id} className="group relative">
                       <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 hover:bg-black/30 transition-all duration-300 border border-white/5 hover:border-purple-500/30">
                         {/* Imagen del álbum */}
                         <div className="relative mb-3">
                           <img
                             src={track.album_image || track.image}
                             alt={track.album_name}
                             className="w-full aspect-square object-cover rounded-md shadow-lg"
                             onError={(e) => {
                               const target = e.target as HTMLImageElement;
                               target.src = '/placeholder.svg';
                             }}
                           />
                           {/* Overlay con botón de play */}
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md flex items-center justify-center">
                             <button
                               onClick={() => playTrack(track)}
                               className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300"
                             >
                               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                               </svg>
                             </button>
                           </div>
                         </div>
                         
                         {/* Información de la canción */}
                         <div className="space-y-1">
                           <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-purple-300 transition-colors">
                             {track.name}
                           </h3>
                           <p className="text-gray-400 text-xs line-clamp-1">
                             {track.artist_name}
                           </p>
                           <p className="text-gray-500 text-xs line-clamp-1">
                             {track.album_name}
                           </p>
                         </div>
                         
                         {/* Botones de acción */}
                         <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                           <button
                             onClick={() => addToQueue(track)}
                             className="text-gray-400 hover:text-purple-400 transition-colors p-1"
                             title="Agregar a cola"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                             </svg>
                           </button>
                           
                           <div className="flex items-center gap-1">
                             <span className="text-xs text-gray-500">
                               {Math.floor(parseInt(track.duration) / 60)}:{(parseInt(track.duration) % 60).toString().padStart(2, '0')}
                             </span>
                           </div>
                         </div>
                       </div>
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