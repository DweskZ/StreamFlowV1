import { useState, useRef, useEffect } from 'react';
import { Plus, Music, ChevronRight } from 'lucide-react';
import { Track } from '@/types/music';
import { useLibrary } from '@/contexts/LibraryContext';

interface PlaylistMenuProps {
  readonly track: Track;
  readonly onAddToPlaylist?: (playlistId: string, track: Track) => void;
}

export default function PlaylistMenu({ track, onAddToPlaylist }: PlaylistMenuProps) {
  const { playlists, addTrackToPlaylist, createPlaylist } = useLibrary();
  const [isSubOpen, setIsSubOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const subMenuRef = useRef<HTMLDivElement>(null);

  const handleAddToPlaylist = (playlistId: string) => {
    if (onAddToPlaylist) {
      onAddToPlaylist(playlistId, track);
    } else {
      addTrackToPlaylist(playlistId, track);
    }
  };

  const handleCreatePlaylistAndAdd = () => {
    const newPlaylist = createPlaylist(`Nueva Playlist ${playlists.length + 1}`);
    handleAddToPlaylist(newPlaylist.id);
  };

  const handleSubMenuMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsSubOpen(true);
  };

  const handleSubMenuMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsSubOpen(false);
    }, 300); // Reduced delay for better responsiveness
  };

  const handleSubMenuClick = () => {
    setIsSubOpen(!isSubOpen);
  };

  // Ajustar posición del submenú cuando se abre
  useEffect(() => {
    if (isSubOpen && triggerRef.current && subMenuRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const subMenu = subMenuRef.current;
      
      // Posicionar el submenú a la derecha del trigger
      subMenu.style.position = 'fixed';
      subMenu.style.left = `${triggerRect.right + 4}px`;
      subMenu.style.top = `${triggerRect.top}px`;
      subMenu.style.zIndex = '9999';
      
      // Verificar si el submenú se sale de la pantalla
      const subMenuRect = subMenu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      if (subMenuRect.right > viewportWidth - 20) {
        // Si se sale por la derecha, posicionarlo a la izquierda
        subMenu.style.left = `${triggerRect.left - subMenu.offsetWidth - 4}px`;
      }
    }
  }, [isSubOpen]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-purple-500/20 focus:bg-purple-500/20 text-white w-full text-left"
        onMouseEnter={handleSubMenuMouseEnter}
        onMouseLeave={handleSubMenuMouseLeave}
        onClick={handleSubMenuClick}
      >
        <Plus className="h-4 w-4 mr-2" />
        Añadir a playlist
        <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${isSubOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {isSubOpen && (
        <div
          ref={subMenuRef}
          className="bg-black/90 backdrop-blur-sm border border-purple-500/30 rounded-md shadow-lg min-w-[220px] max-h-[300px] overflow-y-auto"
          onMouseEnter={handleSubMenuMouseEnter}
          onMouseLeave={handleSubMenuMouseLeave}
        >
          <div className="p-1">
            {playlists.length > 0 ? (
              <>
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    type="button"
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-purple-500/20 focus:bg-purple-500/20 text-white w-full text-left"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToPlaylist(playlist.id);
                      setIsSubOpen(false);
                    }}
                  >
                    <Music className="h-4 w-4 text-purple-400 flex-shrink-0 mr-2" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{playlist.name}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {playlist.tracks.length} {playlist.tracks.length === 1 ? 'canción' : 'canciones'}
                      </div>
                    </div>
                  </button>
                ))}
                <div className="h-px bg-purple-500/30 my-1" />
              </>
            ) : null}
            <button
              type="button"
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-purple-500/20 focus:bg-purple-500/20 text-purple-300 w-full text-left"
              onClick={(e) => {
                e.stopPropagation();
                handleCreatePlaylistAndAdd();
                setIsSubOpen(false);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear nueva playlist
            </button>
          </div>
        </div>
      )}
    </>
  );
} 