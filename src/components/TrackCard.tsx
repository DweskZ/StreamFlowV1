import { Play, Plus, Clock, Zap, Volume2, Heart, MoreHorizontal, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Track } from '@/types/music';
import { useLibrary } from '@/contexts/LibraryContext';
import { usePlaylists } from '@/hooks/usePlaylists';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect } from 'react';

interface TrackCardProps {
  readonly track: Track;
  readonly onPlay: (track: Track) => void;
  readonly onAddToQueue: (track: Track) => void;
  readonly isPlaying?: boolean;
}

const formatDuration = (duration: string): string => {
  const seconds = parseInt(duration);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function TrackCard({ track, onPlay, onAddToQueue, isPlaying }: TrackCardProps) {
  // Debug: verificar que el componente se está cargando
  console.log('🎵 TrackCard renderizado para:', track.name);
  
  // Usar usePlaylists directamente como en el componente de prueba
  const { playlists, addTrackToPlaylist, createPlaylist, loading, error } = usePlaylists();
  const { addToLiked, removeFromLiked, isLiked } = useLibrary();
  
  // Debug: verificar si las playlists se cargan
  useEffect(() => {
    console.log('🔍 TrackCard - Playlists cargadas:', playlists.length, playlists.map(p => p.name));
    console.log('🔍 TrackCard - Loading:', loading, 'Error:', error);
  }, [playlists, loading, error]);
  
  const handleAddToPlaylist = (playlistId: string) => {
    console.log('🎯 Añadiendo track a playlist:', playlistId);
    addTrackToPlaylist(playlistId, track);
  };

  const handleCreatePlaylistAndAdd = async () => {
    console.log('🆕 Creando nueva playlist...');
    const newPlaylist = await createPlaylist(`Nueva Playlist ${playlists.length + 1}`);
    if (newPlaylist) {
      handleAddToPlaylist(newPlaylist.id);
    }
  };

  const handleToggleLike = () => {
    if (isLiked(track.id)) {
      removeFromLiked(track.id);
    } else {
      addToLiked(track);
    }
  };

  return (
    <Card className="group bg-black/20 backdrop-blur-sm border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-glow-purple/30">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Album Cover with Play Button */}
          <div className="relative flex-shrink-0">
            <div className="relative">
              <img
                src={track.album_image || track.image || '/placeholder.svg'}
                alt={`${track.album_name} cover`}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover shadow-lg border border-purple-500/20"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
              {/* Neon border effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="absolute inset-0 bg-black/70 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-sm">
              <Button
                onClick={() => onPlay(track)}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full shadow-glow-purple transition-all duration-200 hover:scale-110"
              >
                <Play className="h-3 w-3 sm:h-4 sm:w-4 fill-current text-white ml-0.5" />
              </Button>
            </div>
            
            {isPlaying && (
              <div className="absolute -top-1 -right-1 flex items-center gap-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse shadow-glow-cyan" />
                <Volume2 className="w-2 h-2 sm:w-3 sm:h-3 text-cyan-400 animate-pulse" />
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors text-sm sm:text-base">
              {track.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 truncate group-hover:text-gray-300 transition-colors">
              {track.artist_name}
            </p>
            <p className="text-xs text-gray-500 truncate hidden sm:block">
              {track.album_name}
            </p>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1 text-xs text-gray-400 bg-black/30 px-2 py-1 rounded-full border border-purple-500/20">
            <Clock className="h-3 w-3" />
            <span className="font-mono hidden sm:inline">{formatDuration(track.duration)}</span>
            <span className="font-mono sm:hidden">{formatDuration(track.duration).split(':')[0]}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              onClick={() => onPlay(track)}
              className="h-7 sm:h-8 px-2 sm:px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium shadow-glow-purple/50 transition-all hover:shadow-glow-purple text-xs sm:text-sm"
            >
              <Play className="h-3 w-3 mr-1 fill-current" />
              <span className="hidden sm:inline">Stream</span>
              <span className="sm:hidden">Play</span>
            </Button>
            
            <Button
              onClick={() => onAddToQueue(track)}
              className="h-7 sm:h-8 px-2 sm:px-3 bg-black/40 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all text-xs sm:text-sm"
            >
              <Plus className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Queue</span>
              <span className="sm:hidden">+</span>
            </Button>

            {/* More Actions Dropdown - IMPLEMENTACIÓN EXACTA DEL COMPONENTE DE PRUEBA */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="h-7 sm:h-8 px-2 bg-black/40 border border-gray-500/50 text-gray-400 hover:bg-gray-500/10 hover:text-gray-300 transition-all text-xs sm:text-sm"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/90 border-purple-500/30 w-48" align="end">
                <DropdownMenuItem 
                  onClick={() => onAddToQueue(track)}
                  className="text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir a la cola
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-purple-500/30" />
                
                {/* IMPLEMENTACIÓN EXACTA DEL COMPONENTE DE PRUEBA QUE FUNCIONA */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-purple-400 hover:bg-purple-500/10">
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir a playlist ({playlists.length})
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-black/90 border-purple-500/30 w-44">
                    {playlists.length > 0 ? (
                      playlists.map((playlist) => (
                        <DropdownMenuItem
                          key={playlist.id}
                          onClick={() => handleAddToPlaylist(playlist.id)}
                          className="text-gray-300 hover:bg-purple-500/10"
                        >
                          <Music className="w-4 h-4 mr-2 text-purple-400" />
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">{playlist.name}</div>
                            <div className="text-xs text-gray-500 truncate">
                              {playlist.tracks.length} {playlist.tracks.length === 1 ? 'canción' : 'canciones'}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled className="text-gray-500">
                        {loading ? 'Cargando playlists...' : 'No hay playlists'}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSeparator className="bg-purple-500/30" />
                
                <DropdownMenuItem 
                  onClick={handleToggleLike}
                  className={`transition-colors ${
                    isLiked(track.id) 
                      ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' 
                      : 'text-pink-400 hover:bg-pink-500/10 hover:text-pink-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isLiked(track.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  {isLiked(track.id) ? 'Quitar de Me gusta' : 'Me gusta'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tags */}
        {track.tags?.genres?.length ? (
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-1 sm:gap-2">
            {track.tags.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="text-xs bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-300 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm hover:border-purple-400/50 transition-colors"
              >
                <Zap className="w-3 h-3 inline mr-1" />
                <span className="hidden sm:inline">{genre}</span>
                <span className="sm:hidden">{genre.substring(0, 3)}</span>
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}