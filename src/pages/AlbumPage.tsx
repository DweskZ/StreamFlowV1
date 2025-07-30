import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Album, Track } from '@/types/music';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Shuffle, 
  MoreHorizontal, 
  ArrowLeft, 
  Heart,
  Clock,
  Calendar,
  Music
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AlbumPageProps {
  album?: Album;
}

const AlbumPage: React.FC<AlbumPageProps> = ({ album: propAlbum }) => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const [album] = useState<Album | null>(propAlbum || null);
  const [loading] = useState(!propAlbum);

  const { playTrack: playerPlayTrack, addToQueue, currentTrack } = usePlayer();
  const { addToLiked, removeFromLiked, isLiked: isTrackLiked } = useLibrary();

  const playTrack = useCallback((track: Track) => {
    playerPlayTrack(track);
  }, [playerPlayTrack]);

  const playAllSongs = () => {
    if (album && album.tracks.length > 0) {
      playTrack(album.tracks[0]);
      // Add remaining tracks to queue
      album.tracks.slice(1).forEach(track => addToQueue(track));
    }
  };

  const shufflePlayAll = () => {
    if (album && album.tracks.length > 0) {
      const shuffled = [...album.tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0]);
      shuffled.slice(1).forEach(track => addToQueue(track));
    }
  };

  const formatDuration = (duration: string) => {
    const seconds = parseInt(duration) || 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isCurrentlyPlaying = (track: Track) => {
    return currentTrack?.id === track.id;
  };

  const isLiked = (trackId: string) => {
    return isTrackLiked(trackId);
  };

  const toggleLikedSong = (track: Track) => {
    if (isTrackLiked(track.id)) {
      removeFromLiked(track.id);
    } else {
      addToLiked(track);
    }
  };

  useEffect(() => {
    // Si no tenemos el álbum como prop, podríamos cargarlo desde una API
    // Por ahora, si no lo tenemos, redirigimos atrás
    if (!propAlbum && !album) {
      navigate(-1);
    }
  }, [albumId, propAlbum, album, navigate]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-purple border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando álbum...</p>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="p-6">
        <Card className="cyber-card border-neon">
          <CardContent className="p-12 text-center">
            <Music className="h-16 w-16 text-neon-purple/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Álbum no encontrado
            </h3>
            <p className="text-muted-foreground mb-6">
              No se pudo cargar la información del álbum.
            </p>
            <Button 
              className="neon-button"
              onClick={() => navigate(-1)}
            >
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="text-muted-foreground hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300 p-0"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Volver
      </Button>

      {/* Header */}
      <div className="flex items-end gap-6">
        <div className="h-60 w-60 rounded-xl overflow-hidden border border-neon-purple/30 shadow-glow-purple/50">
          <img
            src={album.image}
            alt={album.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-neon-cyan uppercase tracking-wider">ÁLBUM</p>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent mb-2">
              {album.name}
            </h1>
            <p className="text-xl text-foreground/80 mb-2">{album.artist_name}</p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(album.releasedate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Music className="h-4 w-4" />
                <span>{album.totalTracks} canciones</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{album.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full neon-button p-0 hover:scale-110 transition-all duration-300"
          onClick={playAllSongs}
          disabled={album.tracks.length === 0}
        >
          <Play className="h-6 w-6 text-white fill-white ml-1" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="text-muted-foreground hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300"
          onClick={shufflePlayAll}
          disabled={album.tracks.length === 0}
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
              Añadir a playlist
            </DropdownMenuItem>
            <DropdownMenuItem className="text-foreground hover:bg-neon-purple/20 hover:text-neon-purple transition-all duration-300">
              Compartir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Track List */}
      <div className="space-y-2">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-neon-purple/20">
          <div className="col-span-1">#</div>
          <div className="col-span-8">TÍTULO</div>
          <div className="col-span-2 flex justify-center">
            <Heart className="h-4 w-4" />
          </div>
          <div className="col-span-1 flex justify-center">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        {/* Tracks */}
        {album.tracks.map((track, index) => (
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

            <div className="col-span-8 flex items-center gap-3 min-w-0">
              <div className="min-w-0 flex-1">
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

            <div className="col-span-2 flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 transition-all duration-300",
                  isLiked(track.id) 
                    ? "text-neon-pink hover:text-neon-pink/80" 
                    : "text-muted-foreground hover:text-neon-pink"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLikedSong(track);
                }}
              >
                <Heart className={cn("h-4 w-4", isLiked(track.id) && "fill-current")} />
              </Button>
            </div>

            <div className="col-span-1 flex items-center justify-center text-muted-foreground text-sm group-hover:text-neon-cyan transition-colors duration-300">
              {formatDuration(track.duration)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumPage;
