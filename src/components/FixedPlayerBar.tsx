// FixedPlayerBar.tsx
import { useRef, useEffect, useState } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import type { DeezerTrack, PlaylistTrack } from '@/hooks/useDeezerAPI';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Heart, MoreHorizontal, Volume2, VolumeX, Volume1, Monitor, ListMusic } from 'lucide-react';
import { useLibrary } from '@/contexts/LibraryContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Track } from '@/types/music';

interface FixedPlayerBarProps {
  readonly currentTrack: PlaylistTrack | DeezerTrack | null;
  readonly onEnded: () => void;
  readonly onPlay?: () => void;
  readonly onPause?: () => void;
  readonly onPrevious?: () => void;
}

export default function FixedPlayerBar({ 
  currentTrack, 
  onEnded, 
  onPlay, 
  onPause, 
  onPrevious 
}: FixedPlayerBarProps) {
  const audioRef = useRef<AudioPlayer>(null);
  const [isReady, setIsReady] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const { addToLiked, removeFromLiked, likedSongs, playlists, addTrackToPlaylist } = useLibrary();
  const { user } = useAuth();

  const isAuthenticated = !!user;
  const isLiked = currentTrack ? likedSongs.some(song => song.id === currentTrack.id) : false;

  const convertToLibraryTrack = (track: PlaylistTrack | DeezerTrack): Track => {
    return {
      id: track.id,
      name: track.name,
      duration: track.duration,
      artist_id: track.artist_id || 'unknown',
      artist_name: track.artist_name,
      artist_idstr: track.artist_id || 'unknown',
      album_id: track.album_id || 'unknown',
      album_name: track.album_name || 'Unknown Album',
      album_image: track.album_image || track.image || '/placeholder.svg',
      album_images: {
        size25: track.image || '/placeholder.svg',
        size50: track.image || '/placeholder.svg',
        size100: track.image || '/placeholder.svg',
        size130: track.image || '/placeholder.svg',
        size200: track.image || '/placeholder.svg',
        size300: track.image || '/placeholder.svg',
        size400: track.image || '/placeholder.svg',
        size500: track.image || '/placeholder.svg',
        size600: track.image || '/placeholder.svg',
      },
      license_ccurl: '',
      position: 0,
      releasedate: '',
      album_datecreated: '',
      prourl: '',
      shorturl: '',
      shareurl: '',
      audio: track.audio || '',
      audiodownload: '',
      audiodlallowed: false,
      image: track.image || track.album_image || '/placeholder.svg',
      waveform: '',
      proaudio: '',
      tags: { genres: [], instruments: [], vartags: [] },
    };
  };

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      setIsReady(false);
      setTimeout(() => setIsReady(true), 100);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current.audio.current;
      if (audio) audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(false);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const VolumeIcon = getVolumeIcon();

  const handleLikeToggle = () => {
    if (!currentTrack || !isAuthenticated) return;
    const libraryTrack = convertToLibraryTrack(currentTrack);
    isLiked ? removeFromLiked(currentTrack.id) : addToLiked(libraryTrack);
  };

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-black/98 via-gray-900/95 to-black/98 border-t border-purple-500/20 backdrop-blur-xl z-50">
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-3 text-gray-400">
            <Monitor className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-sm font-medium">Selecciona una canción para comenzar</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-black/98 via-gray-900/95 to-black/98 border-t border-purple-500/20 backdrop-blur-xl z-50">
      <div className="h-full px-4 flex items-center justify-between max-w-screen-2xl mx-auto">
        
        {/* LEFT - Info de canción */}
        <div className="flex items-center gap-4 w-80 min-w-0 pl-2">
          <div className="relative flex-shrink-0 group">
            <img
              src={currentTrack.album_image || currentTrack.image || '/placeholder.svg'}
              alt={`${currentTrack.album_name} cover`}
              className="w-14 h-14 rounded object-cover shadow-lg shadow-black/50"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 rounded bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-white truncate text-sm hover:underline cursor-pointer leading-tight">
              {currentTrack.name}
            </h4>
            <p className="text-sm text-gray-400 truncate hover:underline cursor-pointer mt-1">
              {currentTrack.artist_name}
            </p>
          </div>
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className={`h-8 w-8 rounded-full ${isLiked ? 'text-purple-400 hover:text-purple-300' : 'text-gray-400 hover:text-white'}`} onClick={handleLikeToggle}>
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-gray-400 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 cyber-card border-purple-500/30 backdrop-blur-xl" side="top" align="start">
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-xs font-medium text-gray-400 border-b border-purple-500/20">Agregar a playlist</div>
                    {playlists.map((playlist) => (
                      <button
                        key={playlist.id}
                        onClick={() => {
                          const libraryTrack = convertToLibraryTrack(currentTrack);
                          addTrackToPlaylist(playlist.id, libraryTrack);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-white hover:bg-purple-500/20 rounded flex items-center gap-2"
                      >
                        <ListMusic className="w-4 h-4 text-purple-400" />
                        {playlist.name}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* CENTER - Controles */}
        <div className="flex-1 mx-auto max-w-xl">
          <AudioPlayer
            ref={audioRef}
            src={isReady ? currentTrack.audio : ''}
            onEnded={onEnded}
            onClickNext={onEnded}
            onClickPrevious={onPrevious}
            onPlay={onPlay}
            onPause={onPause}
            showSkipControls
            showJumpControls={false}
            showDownloadProgress={false}
            showFilledProgress
            className="spotify-player"
          />
        </div>

        {/* RIGHT - Volumen y lista */}
        <div className="flex items-center gap-2 w-80 justify-end pr-2">
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-gray-400 hover:text-white">
            <ListMusic className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-gray-400 hover:text-white">
            <Monitor className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 min-w-32">
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-gray-400 hover:text-white" onClick={toggleMute}>
              <VolumeIcon className="h-4 w-4" />
            </Button>
            <div className="w-24 group">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Estilos personalizados */}
      <style>{`
        .spotify-player .rhap_container {
          background-color: transparent !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-direction: column !important;
          gap: 8px !important;
        }

        .spotify-player .rhap_main-controls {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 16px !important;
          height: 40px !important;
          margin-bottom: 0 !important;
        }

        .spotify-player .rhap_play-pause-button {
          width: 32px !important;
          height: 32px !important;
          background: white !important;
          border-radius: 9999px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .spotify-player .rhap_play-pause-button svg {
          width: 16px !important;
          height: 16px !important;
          fill: black !important;
        }

        .spotify-player .rhap_progress-section {
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 8px !important;
          margin-top: 4px !important;
        }

        .spotify-player .rhap_progress-container {
          background-color: #4b5563 !important;
          height: 4px !important;
          border-radius: 2px !important;
          flex: 1 !important;
        }

        .spotify-player .rhap_progress-filled {
          background-color: #1db954 !important;
        }

        .spotify-player .rhap_volume-controls {
          display: none !important;
        }

        .slider {
          background: linear-gradient(to right, #1db954 0%, #1db954 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%);
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          background: white;
          border-radius: 9999px;
          cursor: pointer;
          opacity: 0;
        }

        .group:hover .slider::-webkit-slider-thumb {
          opacity: 1;
        }

        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          background: white;
          border-radius: 9999px;
          cursor: pointer;
          opacity: 0;
        }

        .group:hover .slider::-moz-range-thumb {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
