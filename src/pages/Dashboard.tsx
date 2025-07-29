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
  Play, 
  Heart, 
  PlaySquare, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Music2,
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
      gradient: 'from-purple-700 to-blue-500',
      action: playRandomLikedSong,
      path: '/app/liked'
    },
    ...playlists.slice(0, 5).map(playlist => ({
      title: playlist.name,
      subtitle: `${playlist.tracks.length} canciones`,
      icon: PlaySquare,
      gradient: 'from-green-700 to-green-500',
      action: () => {
        if (playlist.tracks.length > 0) {
          playTrack(playlist.tracks[0]);
        }
      },
      path: `/app/playlist/${playlist.id}`
    }))
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Greeting */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">{greeting}</h1>
        <p className="text-zinc-400">¿Qué te gustaría escuchar hoy?</p>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickAccessItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card
              key={index}
              className="bg-black/20 backdrop-blur-sm border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-glow-purple/30 group cursor-pointer"
            >
              <Link to={item.path}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-glow-purple/30",
                      item.gradient
                    )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate group-hover:text-purple-300 transition-colors">{item.title}</h3>
                      <p className="text-sm text-gray-400 truncate group-hover:text-gray-300 transition-colors">{item.subtitle}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full shadow-glow-purple/50"
                      onClick={(e) => {
                        e.preventDefault();
                        item.action();
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Reproducido recientemente</h2>
            <Link to="/app/recent">
              <Button variant="ghost" className="text-zinc-400 hover:text-white">
                Ver todo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {recentlyPlayed.slice(0, 6).map((track, index) => (
                <div key={`${track.id}-${index}`} className="w-48 flex-shrink-0">
                  <TrackCard
                    track={track}
                    onPlay={() => playTrack(track)}
                    onAddToQueue={() => addToQueue(track)}
                  />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Made for You */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Hecho para ti</h2>
          <Link to="/app/recommendations">
            <Button variant="ghost" className="text-zinc-400 hover:text-white">
              Ver todo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Daily Mix based on liked songs */}
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-glow-purple/30 group cursor-pointer">
            <CardContent className="p-4">
              <div className="aspect-square bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mb-4 flex items-center justify-center relative group">
                <Music2 className="h-8 w-8 text-white" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full shadow-glow-purple/50"
                  onClick={() => {
                    if (likedSongs.length > 0) {
                      shuffleQueue();
                      playTrack(likedSongs[0]);
                    }
                  }}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-medium text-white mb-1 group-hover:text-purple-300 transition-colors">Daily Mix 1</h3>
              <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Basado en tus canciones favoritas</p>
            </CardContent>
          </Card>

          {/* Discover Weekly placeholder */}
          <Card className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-colors group cursor-pointer">
            <CardContent className="p-4">
              <div className="aspect-square bg-gradient-to-br from-orange-600 to-red-600 rounded-lg mb-4 flex items-center justify-center relative group">
                <TrendingUp className="h-8 w-8 text-white" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 p-0 bg-green-600 hover:bg-green-700 text-white rounded-full"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-medium text-white mb-1">Discover Weekly</h3>
              <p className="text-sm text-zinc-400">Tu mezcla semanal personalizada</p>
            </CardContent>
          </Card>

          {/* Release Radar placeholder */}
          <Card className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-colors group cursor-pointer">
            <CardContent className="p-4">
              <div className="aspect-square bg-gradient-to-br from-green-600 to-teal-600 rounded-lg mb-4 flex items-center justify-center relative group">
                <Clock className="h-8 w-8 text-white" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 p-0 bg-green-600 hover:bg-green-700 text-white rounded-full"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-medium text-white mb-1">Release Radar</h3>
              <p className="text-sm text-zinc-400">Nuevos lanzamientos para ti</p>
            </CardContent>
          </Card>

          {/* Random Mix */}
          <Card className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-colors group cursor-pointer">
            <CardContent className="p-4">
              <div className="aspect-square bg-gradient-to-br from-pink-600 to-purple-600 rounded-lg mb-4 flex items-center justify-center relative group">
                <Shuffle className="h-8 w-8 text-white" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 p-0 bg-green-600 hover:bg-green-700 text-white rounded-full"
                  onClick={() => {
                    if (popularTracks && popularTracks.length > 0) {
                      const randomTrack = popularTracks[Math.floor(Math.random() * popularTracks.length)];
                      playTrack(randomTrack);
                    }
                  }}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-medium text-white mb-1">Mix Aleatorio</h3>
              <p className="text-sm text-zinc-400">Música popular y descubrimientos</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Popular Now */}
      {popularTracks && popularTracks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Popular ahora</h2>
            <Link to="/app/trending">
              <Button variant="ghost" className="text-zinc-400 hover:text-white">
                Ver todo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {popularTracks.slice(0, 6).map((track, index) => (
                <div key={`${track.id}-popular-${index}`} className="w-48 flex-shrink-0">
                  <TrackCard
                    track={track}
                    onPlay={() => playTrack(track)}
                    onAddToQueue={() => addToQueue(track)}
                  />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
