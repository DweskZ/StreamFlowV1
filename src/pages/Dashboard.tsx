import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '@/contexts/LibraryContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { useMusicAPI } from '@/hooks/useMusicAPI';
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
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { likedSongs, playlists, recentlyPlayed, addToRecentlyPlayed } = useLibrary();
  const { playTrack: playerPlayTrack, shuffleQueue, addToQueue } = usePlayer();
  const [greeting, setGreeting] = useState('');

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
      const randomTrack = likedSongs[Math.floor(Math.random() * likedSongs.length)];
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
                    const shuffled = [...recentlyPlayed].sort(() => Math.random() - 0.5);
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
