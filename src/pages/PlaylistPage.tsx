import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLibrary } from '@/contexts/LibraryContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Shuffle, 
  Search, 
  PlaySquare, 
  MoreHorizontal,
  Edit,
  Trash,
  Download,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Track } from '@/types/music';
import { cn } from '@/lib/utils';

const PlaylistPage = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { playlists, deletePlaylist, updatePlaylist, removeTrackFromPlaylist, addToRecentlyPlayed } = useLibrary();
  const { playTrack: playerPlayTrack, playFromContext, addToQueue, currentTrack } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const playlist = playlists.find(p => p.id === playlistId);

  const filteredTracks = playlist?.tracks.filter(track =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.album_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const playTrack = useCallback((track: Track, index?: number) => {
    addToRecentlyPlayed(track);
    
    // Si se proporciona un índice, reproducir desde el contexto de la playlist
    if (typeof index === 'number') {
      playFromContext(track, filteredTracks, index);
    } else {
      // Reproducción individual (sin contexto)
      playerPlayTrack(track);
    }
  }, [addToRecentlyPlayed, playerPlayTrack, playFromContext, filteredTracks]);

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-black">
        <div className="p-4 sm:p-6 lg:p-8">
          <Card className="bg-black/40 border-purple-500/30">
            <CardContent className="p-8 sm:p-12 text-center">
              <PlaySquare className="h-12 w-12 sm:h-16 sm:w-16 text-purple-400/50 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                Playlist no encontrada
              </h3>
              <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                Esta playlist no existe o ha sido eliminada.
              </p>
              <Button 
                onClick={() => navigate('/app')} 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm sm:text-base"
              >
                Volver al inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const playAllSongs = () => {
    if (filteredTracks.length > 0) {
      // Reproducir la primera canción con contexto completo
      playTrack(filteredTracks[0], 0);
    }
  };

  const shufflePlayAll = () => {
    if (filteredTracks.length > 0) {
      // sonar:disable-next-line:typescript:S2245 -- Uso no crítico para mezcla de canciones
      const shuffled = [...filteredTracks].sort(() => Math.random() - 0.5);
      // Reproducir desde la lista mezclada
      playFromContext(shuffled[0], shuffled, 0);
    }
  };

  const formatDuration = (duration: string) => {
    const seconds = parseInt(duration) || 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    const totalSeconds = playlist.tracks.reduce((acc, track) => {
      return acc + (parseInt(track.duration) || 0);
    }, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const isCurrentlyPlaying = (track: Track) => {
    return currentTrack?.id === track.id;
  };

  const handleEditPlaylist = () => {
    setEditName(playlist.name);
    setEditDescription(playlist.description || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      updatePlaylist(playlist.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined
      });
      setIsEditDialogOpen(false);
    }
  };

  const handleDeletePlaylist = () => {
    deletePlaylist(playlist.id);
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-black">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 sm:gap-6">
          <div className="h-32 w-32 sm:h-48 sm:w-48 lg:h-60 lg:w-60 bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-glow-cyan/50 border border-cyan-500/30">
            <PlaySquare className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-white" />
          </div>
          <div className="space-y-3 sm:space-y-4 flex-1">
            <div>
              <p className="text-xs sm:text-sm font-medium text-cyan-400 uppercase tracking-wider">PLAYLIST</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                {playlist.name}
              </h1>
              <p className="text-gray-400 text-sm sm:text-lg mb-1 sm:mb-2">
                {playlist.description || 'Sin descripción'}
              </p>
              <p className="text-gray-400 text-sm sm:text-base">
                {playlist.tracks.length} canción{playlist.tracks.length !== 1 ? 'es' : ''} • {getTotalDuration()}
              </p>
            </div>
          </div>
        </div>

        {/* Controls - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              size="lg"
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 p-0 hover:scale-110 transition-all duration-300 shadow-glow-cyan"
              onClick={playAllSongs}
              disabled={filteredTracks.length === 0}
            >
              <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white fill-white ml-0.5" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="h-10 sm:h-12 px-4 sm:px-6 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 text-sm sm:text-base"
              onClick={shufflePlayAll}
              disabled={filteredTracks.length === 0}
            >
              <Shuffle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Mezclar
            </Button>
          </div>

          {/* Search - Mobile Optimized */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar en la playlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/40 border-cyan-500/30 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:shadow-glow-cyan text-sm"
            />
          </div>

          {/* Playlist Actions - Mobile Optimized */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className="h-10 sm:h-12 px-4 sm:px-6 text-gray-400 hover:text-white hover:bg-gray-500/10 border border-gray-500/30 hover:border-gray-400/50 transition-all duration-300 text-sm sm:text-base"
              >
                <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Más opciones
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-black/95 backdrop-blur-xl border-cyan-500/30">
              <DropdownMenuItem
                onClick={handleEditPlaylist}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar playlist
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash className="h-4 w-4 mr-2" />
                Eliminar playlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Songs List - Mobile Optimized */}
        <div className="space-y-3 sm:space-y-4">
          {filteredTracks.length === 0 ? (
            <Card className="bg-black/40 border-cyan-500/30">
              <CardContent className="p-8 sm:p-12 text-center">
                <PlaySquare className="h-12 w-12 sm:h-16 sm:w-16 text-cyan-400/50 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                  {searchQuery ? 'No se encontraron canciones' : 'Playlist vacía'}
                </h3>
                <p className="text-gray-400 text-sm sm:text-base">
                  {searchQuery 
                    ? 'Intenta con otro término de búsqueda.' 
                    : 'Agrega canciones a esta playlist para comenzar.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredTracks.map((track, index) => (
                <Card
                  key={track.id}
                  className={cn(
                    "group bg-black/40 backdrop-blur-sm border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-glow-cyan/30",
                    isCurrentlyPlaying(track) && "border-cyan-400/50 shadow-glow-cyan/30"
                  )}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                      {/* Track Number - Mobile Optimized */}
                      <div className="w-6 sm:w-8 text-center text-xs sm:text-sm text-gray-400 font-mono">
                        {index + 1}
                      </div>

                      {/* Album Cover - Mobile Optimized */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={track.album_image || track.image || '/placeholder.svg'}
                          alt={`${track.album_name} cover`}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover shadow-lg border border-cyan-500/30"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/70 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <Button
                            onClick={() => playTrack(track)}
                            className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-full shadow-glow-cyan transition-all duration-200 hover:scale-110"
                          >
                            <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current text-white ml-0.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Track Info - Mobile Optimized */}
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-medium text-white truncate text-sm sm:text-base",
                          isCurrentlyPlaying(track) && "text-cyan-400"
                        )}>
                          {track.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400 truncate">
                          {track.artist_name}
                        </p>
                      </div>

                      {/* Duration - Mobile Optimized */}
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-mono">{formatDuration(track.duration)}</span>
                      </div>

                      {/* Actions - Mobile Optimized */}
                      <div className="flex items-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => addToQueue(track)}
                          className="h-6 w-6 sm:h-8 sm:w-8 rounded-full text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 sm:h-8 sm:w-8 rounded-full text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
                            >
                              <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48 bg-black/95 backdrop-blur-xl border-cyan-500/30">
                            <DropdownMenuItem
                              onClick={() => removeTrackFromPlaylist(playlist.id, track.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              Quitar de la playlist
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

      {/* Edit Dialog - Mobile Optimized */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-white text-lg sm:text-xl">Editar Playlist</DialogTitle>
            <DialogDescription className="text-gray-400 text-sm sm:text-base">
              Modifica el nombre y descripción de tu playlist.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="name" className="text-white text-sm sm:text-base">Nombre</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-black/40 border-cyan-500/30 text-white text-sm sm:text-base"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-white text-sm sm:text-base">Descripción</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-black/40 border-cyan-500/30 text-white text-sm sm:text-base"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-gray-400 hover:text-white text-sm sm:text-base"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-sm sm:text-base"
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog - Mobile Optimized */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-red-500/30">
          <DialogHeader>
            <DialogTitle className="text-white text-lg sm:text-xl">Eliminar Playlist</DialogTitle>
            <DialogDescription className="text-gray-400 text-sm sm:text-base">
              ¿Estás seguro de que quieres eliminar "{playlist.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-gray-400 hover:text-white text-sm sm:text-base"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeletePlaylist}
              className="bg-red-600 hover:bg-red-700 text-sm sm:text-base"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlaylistPage;
