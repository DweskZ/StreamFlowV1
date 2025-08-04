import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '@/contexts/LibraryContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { useMusicAPI } from '@/hooks/useMusicAPI';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import TrackCard from '@/components/TrackCardNew';
import { Track } from '@/types/music';
import { 
  Heart, 
  PlaySquare, 
  ChevronRight,
  Shuffle
} from 'lucide-react';
import { cn, secureRandom } from '@/lib/utils';

// Estilos CSS para line-clamp
const lineClampStyles = `
  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
`;

const Dashboard = () => {
  const { likedSongs, playlists, recentlyPlayed, addToRecentlyPlayed } = useLibrary();
  const { playTrack: playerPlayTrack, addToQueue } = usePlayer();
  const { recommendations, updateRecommendationsFromHistory } = useRecommendations();
  const [greeting, setGreeting] = useState('');

  // Funciones para iconos y gradientes de secciones
  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'based-on-history':
        return <Heart className="h-4 w-4" />;
      case 'trending-for-you':
        return <Shuffle className="h-4 w-4" />;
      case 'popular-genres':
        return <PlaySquare className="h-4 w-4" />;
      case 'featured-artists':
        return <Heart className="h-4 w-4" />;
      default:
        return <PlaySquare className="h-4 w-4" />;
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

  // Integrar playTrack con recently played
  const playTrack = useCallback((track: Track) => {
    addToRecentlyPlayed(track);
    playerPlayTrack(track);
  }, [addToRecentlyPlayed, playerPlayTrack]);

  // Popular tracks for recommendations
  const { tracks: popularTracks, loading: popularLoading } = useMusicAPI({
    limit: 12
  });

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

  const playRandomLikedSong = () => {
    if (likedSongs.length > 0) {
      const randomTrack = secureRandom.choice(likedSongs);
      playTrack(randomTrack);
    }
  };

  const quickAccessItems = [
    {
      title: 'Canciones que te gustan',
      subtitle: `${likedSongs.length} canciones`,
      icon: Heart,
      gradient: 'from-purple-600 to-pink-600',
      action: playRandomLikedSong,
      path: '/app/liked'
    },
    ...playlists.slice(0, 5).map(playlist => ({
      title: playlist.name,
      subtitle: `${playlist.tracks.length} canciones`,
      icon: PlaySquare,
      gradient: 'from-cyan-600 to-blue-600',
      action: () => {
        if (playlist.tracks.length > 0) {
          playTrack(playlist.tracks[0]);
        }
      },
      path: `/app/playlist/${playlist.id}`
    }))
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-black">
      <style>{lineClampStyles}</style>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Greeting Section */}
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold text-white">{greeting}</h1>
          <p className="text-gray-400 text-lg">¿Qué te gustaría escuchar hoy?</p>
        </div>

        {/* Quick Access Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Acceso Rápido</h2>
            <Link 
              to="/app/search"
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              Ver todo
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {quickAccessItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="group bg-black/40 backdrop-blur-sm border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-glow-purple/30 cursor-pointer hover:scale-105"
                >
                  <Link to={item.path}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg",
                          item.gradient
                        )}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-400 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recently Played Section */}
        {recentlyPlayed.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Reproducido Recientemente</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (recentlyPlayed.length > 0) {
                    const shuffled = secureRandom.shuffle([...recentlyPlayed]);
                    playTrack(shuffled[0]);
                    shuffled.slice(1).forEach(track => addToQueue(track));
                  }
                }}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Mezclar
              </Button>
            </div>
            
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4">
                {recentlyPlayed.slice(0, 8).map((track, index) => (
                  <div key={`${track.id}-${index}`} className="flex-shrink-0 w-48">
                    <TrackCard
                      track={track}
                      onPlay={playTrack}
                      onAddToQueue={addToQueue}
                    />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="bg-purple-500/20" />
            </ScrollArea>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Para ti</h2>
              <Link 
                to="/app/recommendations"
                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                Ver todas las recomendaciones
              </Link>
            </div>
            
                         {recommendations.slice(0, 3).map((section) => (
               <div key={section.id} className="space-y-4">
                 <div className="flex items-center gap-3 mb-4">
                   <div className={cn(
                     "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                     getSectionGradient(section.id)
                   )}>
                     {getSectionIcon(section.id)}
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                     <p className="text-sm text-gray-400">{section.description}</p>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                   {section.tracks.slice(0, 6).map((track) => (
                     <div key={track.id} className="group relative">
                       <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 hover:bg-black/30 transition-all duration-300 border border-white/5 hover:border-purple-500/30">
                         {/* Imagen del álbum */}
                         <div className="relative mb-2">
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
                               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                               </svg>
                             </button>
                           </div>
                         </div>
                         
                         {/* Información de la canción */}
                         <div className="space-y-1">
                           <h3 className="font-semibold text-white text-xs line-clamp-1 group-hover:text-purple-300 transition-colors">
                             {track.name}
                           </h3>
                           <p className="text-gray-400 text-xs line-clamp-1">
                             {track.artist_name}
                           </p>
                         </div>
                         
                         {/* Botón de agregar a cola */}
                         <div className="flex justify-end mt-2">
                           <button
                             onClick={() => addToQueue(track)}
                             className="text-gray-400 hover:text-purple-400 transition-colors p-1"
                             title="Agregar a cola"
                           >
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                             </svg>
                           </button>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
          </div>
        )}

        {/* Popular Tracks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Tendencias</h2>
            <Link 
              to="/app/search"
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              Explorar más
            </Link>
          </div>
          
          {popularLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="bg-black/40 border-purple-500/20 animate-pulse">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="w-full h-32 bg-gray-700 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {popularTracks.slice(0, 8).map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  onPlay={playTrack}
                  onAddToQueue={addToQueue}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
