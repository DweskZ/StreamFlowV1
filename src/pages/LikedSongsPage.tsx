import { useState } from 'react';
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-end gap-6">
        <div className="h-60 w-60 bg-gradient-to-br from-purple-700 to-blue-500 rounded-lg flex items-center justify-center shadow-2xl">
          <Heart className="h-20 w-20 text-white" />
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-white">PLAYLIST</p>
            <h1 className="text-5xl font-bold text-white mb-2">Canciones que te gustan</h1>
            <p className="text-zinc-400">
              {likedSongs.length} canción{likedSongs.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 p-0"
          onClick={playAllSongs}
          disabled={filteredSongs.length === 0}
        >
          <Play className="h-6 w-6 text-white" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="text-zinc-400 hover:text-white"
          onClick={shufflePlayAll}
          disabled={filteredSongs.length === 0}
        >
          <Shuffle className="h-6 w-6" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="lg" className="text-zinc-400 hover:text-white">
              <MoreHorizontal className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
            <DropdownMenuItem className="text-white hover:bg-zinc-700">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      {likedSongs.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Buscar en canciones que te gustan"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
          />
        </div>
      )}

      {/* Song List */}
      {likedSongs.length === 0 ? (
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No tienes canciones que te gusten
            </h3>
            <p className="text-zinc-400 mb-6">
              Las canciones que marques como favoritas aparecerán aquí.
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              Buscar música
            </Button>
          </CardContent>
        </Card>
      ) : filteredSongs.length === 0 ? (
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No se encontraron canciones
            </h3>
            <p className="text-zinc-400">
              Intenta con otro término de búsqueda.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm text-zinc-400 border-b border-zinc-800">
            <div className="col-span-1">#</div>
            <div className="col-span-6">TÍTULO</div>
            <div className="col-span-3">ÁLBUM</div>
            <div className="col-span-1">FECHA</div>
            <div className="col-span-1 flex justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>

          {/* Songs */}
          {filteredSongs.map((track, index) => (
            <div
              key={track.id}
              className={cn(
                "grid grid-cols-12 gap-4 px-4 py-2 rounded-lg hover:bg-zinc-800 group transition-colors cursor-pointer",
                isCurrentlyPlaying(track) && "bg-zinc-800 text-green-500"
              )}
              onClick={() => playTrack(track)}
            >
              <div className="col-span-1 flex items-center text-zinc-400 group-hover:hidden">
                {isCurrentlyPlaying(track) ? (
                  <div className="h-4 w-4 flex items-center justify-center">
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  index + 1
                )}
              </div>
              <div className="col-span-1 items-center hidden group-hover:flex">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack(track);
                  }}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>

              <div className="col-span-6 flex items-center gap-3 min-w-0">
                <img
                  src={track.image}
                  alt={track.name}
                  className="h-10 w-10 rounded"
                />
                <div className="min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    isCurrentlyPlaying(track) ? "text-green-500" : "text-white"
                  )}>
                    {track.name}
                  </p>
                  <p className="text-sm text-zinc-400 truncate">{track.artist_name}</p>
                </div>
              </div>

              <div className="col-span-3 flex items-center text-zinc-400 truncate">
                {track.album_name}
              </div>

              <div className="col-span-1 flex items-center text-zinc-400 text-sm">
                {new Date(track.releasedate).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit'
                })}
              </div>

              <div className="col-span-1 flex items-center justify-between">
                <span className="text-zinc-400 text-sm group-hover:hidden">
                  {formatDuration(track.duration)}
                </span>
                <div className="hidden group-hover:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromLiked(track.id);
                    }}
                  >
                    <Heart className="h-4 w-4 fill-current text-green-500" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
                      <DropdownMenuItem 
                        className="text-white hover:bg-zinc-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToQueue(track);
                        }}
                      >
                        Añadir a la cola
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-400 hover:bg-zinc-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromLiked(track.id);
                        }}
                      >
                        Eliminar de Me gusta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedSongsPage;
