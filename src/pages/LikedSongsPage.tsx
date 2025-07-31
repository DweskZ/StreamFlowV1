import { useState, useCallback } from 'react';
import { useLibrary } from '@/contexts/LibraryContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Shuffle, 
  Search, 
  Heart, 
  MoreHorizontal,
  Download,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Track } from '@/types/music';
import { cn } from '@/lib/utils';

const LikedSongsPage = () => {
  const { likedSongs, removeFromLiked, addToRecentlyPlayed } = useLibrary();
  const { playTrack: playerPlayTrack, addToQueue, queue, currentTrack } = usePlayer();

  const playTrack = useCallback((track: Track) => {
    addToRecentlyPlayed(track);
    playerPlayTrack(track);
  }, [addToRecentlyPlayed, playerPlayTrack]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSongs = likedSongs.filter(track =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.album_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const playAllSongs = () => {
    if (filteredSongs.length > 0) {
      playTrack(filteredSongs[0]);
      // Add rest to queue
      filteredSongs.slice(1).forEach(track => addToQueue(track));
    }
  };

  const shufflePlayAll = () => {
    if (filteredSongs.length > 0) {
      const shuffled = [...filteredSongs].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0]);
      shuffled.slice(1).forEach(track => addToQueue(track));
    }
  };

  const formatDuration = (duration: string) => {
    // Assuming duration is in seconds, convert to mm:ss format
    const seconds = parseInt(duration) || 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isCurrentlyPlaying = (track: Track) => {
    return currentTrack?.id === track.id;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-black">
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="h-48 w-48 lg:h-60 lg:w-60 bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-glow-purple/50 border border-purple-500/30">
            <Heart className="h-16 w-16 lg:h-20 lg:w-20 text-white fill-current animate-pulse" />
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <p className="text-sm font-medium text-purple-400 uppercase tracking-wider">PLAYLIST</p>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Canciones que te gustan
              </h1>
              <p className="text-gray-400 text-lg">
                {likedSongs.length} canción{likedSongs.length !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 p-0 hover:scale-110 transition-all duration-300 shadow-glow-purple"
              onClick={playAllSongs}
              disabled={filteredSongs.length === 0}
            >
              <Play className="h-6 w-6 text-white fill-white ml-1" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="h-12 px-6 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
              onClick={shufflePlayAll}
              disabled={filteredSongs.length === 0}
            >
              <Shuffle className="h-5 w-5 mr-2" />
              Mezclar
            </Button>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar en canciones que te gustan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/40 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:shadow-glow-purple"
            />
          </div>
        </div>

        {/* Songs List */}
        <div className="space-y-4">
          {filteredSongs.length === 0 ? (
            <Card className="bg-black/40 border-purple-500/30">
              <CardContent className="p-12 text-center">
                <Heart className="h-16 w-16 text-purple-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchQuery ? 'No se encontraron canciones' : 'No tienes canciones favoritas'}
                </h3>
                <p className="text-gray-400">
                  {searchQuery 
                    ? 'Intenta con otro término de búsqueda.' 
                    : 'Comienza a agregar canciones que te gusten para verlas aquí.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredSongs.map((track, index) => (
                <Card
                  key={track.id}
                  className={cn(
                    "group bg-black/40 backdrop-blur-sm border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-glow-purple/30",
                    isCurrentlyPlaying(track) && "border-purple-400/50 shadow-glow-purple/30"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Track Number */}
                      <div className="w-8 text-center text-sm text-gray-400 font-mono">
                        {index + 1}
                      </div>

                      {/* Album Cover */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={track.album_image || track.image || '/placeholder.svg'}
                          alt={`${track.album_name} cover`}
                          className="w-12 h-12 rounded-lg object-cover shadow-lg border border-purple-500/30"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/70 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <Button
                            onClick={() => playTrack(track)}
                            className="h-8 w-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full shadow-glow-purple transition-all duration-200 hover:scale-110"
                          >
                            <Play className="h-3 w-3 fill-current text-white ml-0.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-medium text-white truncate",
                          isCurrentlyPlaying(track) && "text-purple-400"
                        )}>
                          {track.name}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">
                          {track.artist_name}
                        </p>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span className="font-mono">{formatDuration(track.duration)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => addToQueue(track)}
                          className="h-8 w-8 rounded-full text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-full text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-300"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48 bg-black/95 backdrop-blur-xl border-purple-500/30">
                            <DropdownMenuItem
                              onClick={() => removeFromLiked(track.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              Quitar de favoritos
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LikedSongsPage;
