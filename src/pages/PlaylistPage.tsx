import { useState } from 'react';
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
  Clock,
  ArrowLeft
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
  const { playTrack: playerPlayTrack, addToQueue, currentTrack } = usePlayer();

  const playTrack = useCallback((track: Track) => {
    addToRecentlyPlayed(track);
    playerPlayTrack(track);
  }, [addToRecentlyPlayed, playerPlayTrack]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const playlist = playlists.find(p => p.id === playlistId);

  if (!playlist) {
    return (
      <div className="p-6">
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-12 text-center">
            <PlaySquare className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Playlist no encontrada
            </h3>
            <p className="text-zinc-400 mb-6">
              Esta playlist no existe o ha sido eliminada.
            </p>
            <Button onClick={() => navigate('/app')} className="bg-green-600 hover:bg-green-700">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredTracks = playlist.tracks.filter(track =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.album_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const playAllSongs = () => {
    if (filteredTracks.length > 0) {
      playTrack(filteredTracks[0]);
      filteredTracks.slice(1).forEach(track => addToQueue(track));
    }
  };

  const shufflePlayAll = () => {
    if (filteredTracks.length > 0) {
      const shuffled = [...filteredTracks].sort(() => Math.random() - 0.5);
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

  const getTotalDuration = () => {
    const totalSeconds = playlist.tracks.reduce((total, track) => {
      return total + (parseInt(track.duration) || 0);
    }, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} h ${minutes} min`;
    }
    return `${minutes} min`;
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
    updatePlaylist(playlist.id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined
    });
    setIsEditDialogOpen(false);
  };

  const handleDeletePlaylist = () => {
    deletePlaylist(playlist.id);
    navigate('/app');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="text-zinc-400 hover:text-white p-0"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Volver
      </Button>

      {/* Header */}
      <div className="flex items-end gap-6">
        <div className="h-60 w-60 bg-gradient-to-br from-green-700 to-green-500 rounded-lg flex items-center justify-center shadow-2xl">
          <PlaySquare className="h-20 w-20 text-white" />
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-white">PLAYLIST</p>
            <h1 className="text-5xl font-bold text-white mb-2">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-zinc-300 mb-2">{playlist.description}</p>
            )}
            <p className="text-zinc-400">
              {playlist.tracks.length} canción{playlist.tracks.length !== 1 ? 'es' : ''}
              {playlist.tracks.length > 0 && ` • ${getTotalDuration()}`}
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
          disabled={filteredTracks.length === 0}
        >
          <Play className="h-6 w-6 text-white" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="text-zinc-400 hover:text-white"
          onClick={shufflePlayAll}
          disabled={filteredTracks.length === 0}
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
            <DropdownMenuItem 
              className="text-white hover:bg-zinc-700"
              onClick={handleEditPlaylist}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar detalles
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-zinc-700">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-400 hover:bg-zinc-700"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Eliminar playlist
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      {playlist.tracks.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Buscar en esta playlist"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
          />
        </div>
      )}

      {/* Song List */}
      {playlist.tracks.length === 0 ? (
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-12 text-center">
            <PlaySquare className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Tu playlist está vacía
            </h3>
            <p className="text-zinc-400 mb-6">
              Busca canciones y álbumes para añadir a tu playlist.
            </p>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/app/search')}
            >
              Buscar música
            </Button>
          </CardContent>
        </Card>
      ) : filteredTracks.length === 0 ? (
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
          {filteredTracks.map((track, index) => (
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
                          removeTrackFromPlaylist(playlist.id, track.id);
                        }}
                      >
                        Eliminar de esta playlist
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white">Editar detalles de la playlist</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Cambia el nombre y la descripción de tu playlist.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-white">
                Nombre
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description" className="text-white">
                Descripción (opcional)
              </Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              disabled={!editName.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white">¿Eliminar playlist?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Esta acción no se puede deshacer. Se eliminará "{playlist.name}" de tu biblioteca.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleDeletePlaylist}
              className="bg-red-600 hover:bg-red-700 text-white"
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
