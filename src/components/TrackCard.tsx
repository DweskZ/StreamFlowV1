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
      <CardContent className="p-2 sm:p-3 lg:p-4">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          {/* Album Cover with Play Button */}
          <div className="relative flex-shrink-0">
            <div className="relative">
              <img
                src={track.album_image || track.image || '/placeholder.svg'}
                alt={`${track.album_name} cover`}
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl object-cover shadow-lg border border-purple-500/20"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
              {/* Neon border effect */}
              <div className="absolute inset-0 rounded-lg sm:rounded-xl border-2 border-transparent bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="absolute inset-0 bg-black/70 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-sm">
              <Button
                onClick={() => onPlay(track)}
                className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full shadow-glow-purple transition-all duration-200 hover:scale-110"
              >
                <Play className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 fill-current text-white ml-0.5" />
              </Button>
            </div>
            
            {isPlaying && (
              <div className="absolute -top-1 -right-1 flex items-center gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse shadow-glow-cyan" />
                <Volume2 className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 text-cyan-400 animate-pulse" />
              </div>
            )}
          </div>

          {/* Track Info - Mobile Optimized */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors text-xs sm:text-sm lg:text-base leading-tight">
              {track.name}
            </h3>
            <p className="text-xs text-gray-400 truncate group-hover:text-gray-300 transition-colors leading-tight">
              {track.artist_name}
            </p>
            <p className="text-xs text-gray-500 truncate hidden sm:block leading-tight">
              {track.album_name}
            </p>
          </div>

          {/* Duration - Mobile Optimized */}
          <div className="flex items-center gap-1 text-xs text-gray-400 bg-black/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-purple-500/20">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="font-mono">{formatDuration(track.duration)}</span>
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Mobile: Show only essential buttons */}
            <Button
              onClick={() => onPlay(track)}
              className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium shadow-glow-purple/50 transition-all hover:shadow-glow-purple rounded-full"
            >
              <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 fill-current" />
            </Button>
            
            {/* Desktop: Show full buttons */}
            <Button
              onClick={() => onPlay(track)}
              className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 px-2 sm:px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium shadow-glow-purple/50 transition-all hover:shadow-glow-purple text-xs sm:text-sm hidden lg:flex"
            >
              <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 mr-1 fill-current" />
              <span>Stream</span>
            </Button>
            
            <Button
              onClick={() => onAddToQueue(track)}
              className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 p-0 bg-black/40 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all rounded-full"
            >
              <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
            </Button>

            {/* Desktop: Show full queue button */}
            <Button
              onClick={() => onAddToQueue(track)}
              className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 px-2 sm:px-3 bg-black/40 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all text-xs sm:text-sm hidden lg:flex"
            >
              <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 mr-1" />
              <span>Queue</span>
            </Button>

            {/* More Actions Dropdown - IMPLEMENTACIÓN EXACTA DEL COMPONENTE DE PRUEBA */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 p-0 bg-black/40 border border-gray-500/50 text-gray-400 hover:bg-gray-500/10 hover:text-gray-300 transition-all rounded-full"
                >
                  <MoreHorizontal className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
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

        {/* Tags - Mobile Optimized */}
        {track.tags?.genres?.length ? (
          <div className="mt-2 sm:mt-3 lg:mt-4 flex flex-wrap gap-1 sm:gap-2">
            {track.tags.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="text-xs bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-300 px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full backdrop-blur-sm hover:border-purple-400/50 transition-colors"
              >
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-1" />
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