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
        className="text-muted-foreground hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300 p-0"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Volver
      </Button>

      {/* Header */}
      <div className="flex items-end gap-6">
        <div className="h-60 w-60 bg-gradient-to-br from-neon-purple via-neon-pink to-neon-cyan rounded-xl flex items-center justify-center shadow-glow-purple/50 border border-neon-purple/30">
          <PlaySquare className="h-20 w-20 text-white animate-pulse" />
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-neon-cyan uppercase tracking-wider">PLAYLIST</p>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent mb-2">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-foreground/80 mb-2">{playlist.description}</p>
            )}
            <p className="text-muted-foreground">
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
          className="h-14 w-14 rounded-full neon-button p-0 hover:scale-110 transition-all duration-300"
          onClick={playAllSongs}
          disabled={filteredTracks.length === 0}
        >
          <Play className="h-6 w-6 text-white fill-white ml-1" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="text-muted-foreground hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300"
          onClick={shufflePlayAll}
          disabled={filteredTracks.length === 0}
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
            <DropdownMenuItem 
              className="text-foreground hover:bg-neon-purple/20 hover:text-neon-purple transition-all duration-300"
              onClick={handleEditPlaylist}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar detalles
            </DropdownMenuItem>
            <DropdownMenuItem className="text-foreground hover:bg-neon-purple/20 hover:text-neon-purple transition-all duration-300">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar en esta playlist"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/30 border-neon-purple/30 text-foreground placeholder:text-muted-foreground focus:border-neon-purple focus:shadow-glow-purple transition-all"
          />
        </div>
      )}

      {/* Song List */}
      {playlist.tracks.length === 0 ? (
        <Card className="cyber-card border-neon">
          <CardContent className="p-12 text-center">
            <PlaySquare className="h-16 w-16 text-neon-purple/50 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Tu playlist está vacía
            </h3>
            <p className="text-muted-foreground mb-6">
              Busca canciones y álbumes para añadir a tu playlist.
            </p>
            <Button 
              className="neon-button"
              onClick={() => navigate('/app/search')}
            >
              Buscar música
            </Button>
          </CardContent>
        </Card>
      ) : filteredTracks.length === 0 ? (
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
          {filteredTracks.map((track, index) => (
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
        <DialogContent className="sm:max-w-[425px] cyber-card border-neon backdrop-blur-glass">
          <DialogHeader>
            <DialogTitle className="text-foreground bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent font-bold">
              Editar detalles de la playlist
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Cambia el nombre y la descripción de tu playlist.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-foreground">
                Nombre
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-black/30 border-neon-purple/30 text-foreground focus:border-neon-purple focus:shadow-glow-purple transition-all"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description" className="text-foreground">
                Descripción (opcional)
              </Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-black/30 border-neon-purple/30 text-foreground focus:border-neon-purple focus:shadow-glow-purple transition-all resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-neon-purple/30 text-muted-foreground hover:text-neon-purple hover:bg-neon-purple/10 hover:border-neon-purple transition-all duration-300"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              disabled={!editName.trim()}
              className="neon-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] cyber-card border-neon backdrop-blur-glass">
          <DialogHeader>
            <DialogTitle className="text-red-400 font-bold">¿Eliminar playlist?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Esta acción no se puede deshacer. Se eliminará "{playlist.name}" de tu biblioteca.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-neon-purple/30 text-muted-foreground hover:text-neon-purple hover:bg-neon-purple/10 hover:border-neon-purple transition-all duration-300"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleDeletePlaylist}
              className="bg-red-600 hover:bg-red-700 text-white border border-red-500 hover:shadow-glow-red transition-all duration-300"
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
