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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-end gap-6">
        <div className="h-60 w-60 bg-gradient-to-br from-neon-purple via-neon-pink to-neon-cyan rounded-xl flex items-center justify-center shadow-glow-purple/50 border border-neon-purple/30">
          <Heart className="h-20 w-20 text-white fill-current animate-pulse" />
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-neon-cyan uppercase tracking-wider">PLAYLIST</p>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent mb-2">
              Canciones que te gustan
            </h1>
            <p className="text-muted-foreground">
              {likedSongs.length} canción{likedSongs.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full neon-button p-0 hover:scale-110 transition-all duration-300"
          onClick={playAllSongs}
          disabled={filteredSongs.length === 0}
        >
          <Play className="h-6 w-6 text-white fill-white ml-1" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="text-muted-foreground hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300"
          onClick={shufflePlayAll}
          disabled={filteredSongs.length === 0}
        >
          <Shuffle className="h-6 w-6" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="lg" 
              className="text-muted-foreground hover:text-neon-cyan hover:shadow-glow-cyan transition-all duration-300"
            >
              <MoreHorizontal className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="cyber-card border-neon backdrop-blur-glass">
            <DropdownMenuItem className="text-foreground hover:bg-neon-purple/20 hover:text-neon-purple transition-all duration-300">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      {likedSongs.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar en canciones que te gustan"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/30 border-neon-purple/30 text-foreground placeholder:text-muted-foreground focus:border-neon-purple focus:shadow-glow-purple transition-all"
          />
        </div>
      )}

      {/* Song List */}
      {likedSongs.length === 0 ? (
        <Card className="cyber-card border-neon">
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 text-neon-purple/50 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No tienes canciones que te gusten
            </h3>
            <p className="text-muted-foreground mb-6">
              Las canciones que marques como favoritas aparecerán aquí.
            </p>
            <Button className="neon-button">
              Buscar música
            </Button>
          </CardContent>
        </Card>
      ) : filteredSongs.length === 0 ? (
        <Card className="cyber-card border-neon">
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-neon-purple/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No se encontraron canciones
            </h3>
            <p className="text-muted-foreground">
              Intenta con otro término de búsqueda.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-neon-purple/20">
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
                "grid grid-cols-12 gap-4 px-4 py-2 rounded-lg hover:bg-neon-purple/10 hover:shadow-glow-purple/30 group transition-all duration-300 cursor-pointer",
                isCurrentlyPlaying(track) && "bg-neon-purple/20 text-neon-purple shadow-glow-purple/50"
              )}
              onClick={() => playTrack(track)}
            >
              <div className="col-span-1 flex items-center text-muted-foreground group-hover:hidden">
                {isCurrentlyPlaying(track) ? (
                  <div className="h-4 w-4 flex items-center justify-center">
                    <div className="w-1 h-1 bg-neon-purple rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  index + 1
                )}
              </div>
              <div className="col-span-1 items-center hidden group-hover:flex">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-foreground hover:bg-transparent hover:text-neon-purple hover:scale-110 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack(track);
                  }}
                >
                  <Play className="h-4 w-4 fill-current" />
                </Button>
              </div>

              <div className="col-span-6 flex items-center gap-3 min-w-0">
                <div className="relative">
                  <img
                    src={track.image}
                    alt={track.name}
                    className="h-10 w-10 rounded-md border border-neon-purple/30"
                  />
                  <div className="absolute inset-0 rounded-md border border-transparent bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="min-w-0">
                  <p className={cn(
                    "font-medium truncate transition-colors duration-300",
                    isCurrentlyPlaying(track) ? "text-neon-purple" : "text-foreground group-hover:text-neon-purple"
                  )}>
                    {track.name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate group-hover:text-neon-cyan transition-colors duration-300">
                    {track.artist_name}
                  </p>
                </div>
              </div>

              <div className="col-span-3 flex items-center text-muted-foreground truncate group-hover:text-neon-cyan transition-colors duration-300">
                {track.album_name}
              </div>

              <div className="col-span-1 flex items-center text-muted-foreground text-sm group-hover:text-neon-cyan transition-colors duration-300">
                {new Date(track.releasedate).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit'
                })}
              </div>

              <div className="col-span-1 flex items-center justify-between">
                <span className="text-muted-foreground text-sm group-hover:hidden">
                  {formatDuration(track.duration)}
                </span>
                <div className="hidden group-hover:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-neon-pink hover:text-neon-pink/80 hover:scale-110 transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromLiked(track.id);
                    }}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-neon-purple hover:scale-110 transition-all duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="cyber-card border-neon backdrop-blur-glass">
                      <DropdownMenuItem 
                        className="text-foreground hover:bg-neon-purple/20 hover:text-neon-purple transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToQueue(track);
                        }}
                      >
                        Añadir a la cola
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
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
