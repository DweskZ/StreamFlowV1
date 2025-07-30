import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PlanBadge } from './subscription/PlanBadge';
import { useLibrary } from '@/contexts/LibraryContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  Search, 
  Library, 
  Heart, 
  Plus, 
  Music, 
  PlaySquare,
  TrendingUp,
  Radio,
  User
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const Sidebar = () => {
  const location = useLocation();
  const { playlists, createPlaylist } = useLibrary();
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');

  // Don't render sidebar for non-authenticated users
  if (!user) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  const mainMenuItems = [
    {
      icon: Home,
      label: 'Inicio',
      path: '/app',
      active: isActive('/app')
    },
    {
      icon: Search,
      label: 'Buscar',
      path: '/app/search',
      active: isActive('/app/search')
    },
    {
      icon: TrendingUp,
      label: 'Tendencias',
      path: '/app/trending',
      active: isActive('/app/trending')
    },
    {
      icon: Radio,
      label: 'Radio',
      path: '/app/radio',
      active: isActive('/app/radio')
    }
  ];

  const libraryItems = [
    {
      icon: Heart,
      label: 'Canciones que te gustan',
      path: '/app/liked',
      active: isActive('/app/liked')
    }
  ];

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim(), newPlaylistDescription.trim() || undefined);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className="w-64 bg-black/90 backdrop-blur-sm border-r border-purple-500/20 text-white h-screen flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 flex-shrink-0 space-y-3">
        <div className="flex items-center gap-2">
          <Music className="h-8 w-8 text-purple-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">StreamFlow</span>
        </div>
        {/* Plan Badge */}
        <PlanBadge variant="outline" className="text-xs" clickable={true} />
      </div>

      <ScrollArea className="flex-1 px-3 overflow-y-auto">
        {/* Main Menu */}
        <div className="space-y-2">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  item.active
                    ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white border border-purple-500/30 shadow-glow-purple/20"
                    : "text-gray-400 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/20 border border-transparent"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <Separator className="my-4 bg-purple-500/20" />

        {/* Library Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3">
              <Library className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Tu biblioteca</span>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-black/90 backdrop-blur-sm border-purple-500/30">
                <DialogHeader>
                  <DialogTitle className="text-white">Crear playlist</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Crea una nueva playlist para organizar tu música.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-white">
                      Nombre
                    </Label>
                    <Input
                      id="name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="Mi playlist #1"
                      className="bg-black/50 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-400 focus:ring-purple-400/20"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description" className="text-white">
                      Descripción (opcional)
                    </Label>
                    <Textarea
                      id="description"
                      value={newPlaylistDescription}
                      onChange={(e) => setNewPlaylistDescription(e.target.value)}
                      placeholder="Describe tu playlist..."
                      className="bg-black/50 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-400 focus:ring-purple-400/20 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-purple-500/30 text-gray-400 hover:text-white hover:bg-purple-500/10 hover:border-purple-400/50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreatePlaylist}
                    disabled={!newPlaylistName.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-glow-purple/50"
                  >
                    Crear
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Liked Songs */}
          {libraryItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  item.active
                    ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white border border-purple-500/30"
                    : "text-gray-400 hover:text-white hover:bg-purple-500/10 border border-transparent"
                )}
              >
                <div className="h-8 w-8 bg-gradient-to-br from-purple-700 to-pink-500 rounded-sm flex items-center justify-center shadow-glow-purple/30">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                {item.label}
              </Link>
            );
          })}

          {/* User Playlists */}
          <div className="space-y-1">
            {playlists.map((playlist) => (
              <Link
                key={playlist.id}
                to={`/app/playlist/${playlist.id}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  isActive(`/app/playlist/${playlist.id}`)
                    ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white border border-purple-500/30"
                    : "text-gray-400 hover:text-white hover:bg-purple-500/10 border border-transparent"
                )}
              >
                <div className="h-8 w-8 bg-black/50 border border-purple-500/30 rounded-sm flex items-center justify-center">
                  <PlaySquare className="h-4 w-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{playlist.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {playlist.tracks.length} canción{playlist.tracks.length !== 1 ? 'es' : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-3 border-t border-purple-500/20 flex-shrink-0">
        <Link
          to="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-purple-500/10 transition-all duration-200"
        >
          <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-glow-purple/30">
            <User className="h-4 w-4 text-white" />
          </div>
          <span>Perfil</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
