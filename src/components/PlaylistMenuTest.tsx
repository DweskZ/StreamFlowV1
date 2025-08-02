import { useState } from 'react';
import { Plus, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function PlaylistMenuTest() {
  const { playlists, loading, error } = usePlaylists();
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('');

  const handleAddToPlaylist = (playlistId: string) => {
    console.log('🎯 Test - Añadiendo a playlist:', playlistId);
    setSelectedPlaylist(playlistId);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-white mb-4">Test DropdownMenuSub con Playlists Reales</h2>
      
      {/* Información de estado */}
      <div className="bg-black/20 border border-purple-500/30 rounded-lg p-3">
        <h3 className="text-purple-300 font-semibold mb-2">Estado de Playlists:</h3>
        <div className="space-y-1 text-sm">
          <p className="text-gray-300">Loading: <span className={loading ? 'text-yellow-400' : 'text-green-400'}>{loading ? 'Sí' : 'No'}</span></p>
          <p className="text-gray-300">Error: <span className={error ? 'text-red-400' : 'text-green-400'}>{error || 'Ninguno'}</span></p>
          <p className="text-gray-300">Playlists cargadas: <span className="text-cyan-400">{playlists.length}</span></p>
          {playlists.length > 0 && (
            <div className="mt-2">
              <p className="text-gray-300 mb-1">Playlists disponibles:</p>
              <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
                {playlists.map(playlist => (
                  <li key={playlist.id}>
                    {playlist.name} ({playlist.tracks.length} tracks)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="text-white">
            Abrir menú de playlists
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-black/90 border-purple-500/30 w-48">
          <DropdownMenuItem className="text-white">
            Opción 1
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-purple-500/30" />
          
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
          
          <DropdownMenuItem className="text-white">
            Opción 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {selectedPlaylist && (
        <div className="mt-4 p-2 bg-green-500/20 border border-green-500/30 rounded">
          <p className="text-green-300">Seleccionado: {selectedPlaylist}</p>
        </div>
      )}
    </div>
  );
} 