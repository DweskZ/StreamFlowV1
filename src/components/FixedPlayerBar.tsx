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
      <div className="fixed bottom-0 left-0 right-0 h-[90px] bg-cyber-gradient border-t border-neon backdrop-blur-glass z-50">
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Monitor className="w-5 h-5 text-neon-purple animate-pulse" />
            <span className="text-sm font-medium">Selecciona una canción para comenzar</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[90px] bg-cyber-gradient border-t border-neon backdrop-blur-glass z-50">
      <div className="h-full px-6 flex items-center justify-between max-w-screen-2xl mx-auto">
        
        {/* LEFT - Info de canción */}
        <div className="flex items-center gap-4 w-[300px] min-w-0">
          <div className="relative flex-shrink-0 group">
            <img
              src={currentTrack.album_image || currentTrack.image || '/placeholder.svg'}
              alt={`${currentTrack.album_name} cover`}
              className="w-12 h-12 rounded-xl object-cover shadow-lg border border-neon-purple/30"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            {/* Neon border effect */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-foreground truncate text-sm hover:text-neon-purple cursor-pointer transition-colors">
              {currentTrack.name}
            </h4>
            <p className="text-xs text-muted-foreground truncate hover:text-neon-cyan cursor-pointer transition-colors">
              {currentTrack.artist_name}
            </p>
          </div>
          {isAuthenticated && (
            <div className="flex items-center gap-1">
              <Button 
                size="icon" 
                variant="ghost" 
                className={`h-8 w-8 rounded-full transition-all duration-300 ${
                  isLiked 
                    ? 'text-neon-pink hover:text-neon-pink/80 shadow-glow-pink' 
                    : 'text-muted-foreground hover:text-neon-purple hover:shadow-glow-purple'
                }`} 
                onClick={handleLikeToggle}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 cyber-card border-neon backdrop-blur-glass" side="top" align="start">
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-neon-purple/20">Agregar a playlist</div>
                    {playlists.map((playlist) => (
                      <button
                        key={playlist.id}
                        onClick={() => {
                          const libraryTrack = convertToLibraryTrack(currentTrack);
                          addTrackToPlaylist(playlist.id, libraryTrack);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-neon-purple/20 hover:text-neon-purple rounded flex items-center gap-2 transition-all duration-300"
                      >
                        <ListMusic className="w-4 h-4 text-neon-cyan" />
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
        <div className="flex-1 max-w-[600px] mx-auto">
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
            className="modern-player"
          />
        </div>

        {/* RIGHT - Volumen y lista */}
        <div className="flex items-center gap-3 w-[300px] justify-end">
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:text-neon-cyan hover:shadow-glow-cyan transition-all duration-300">
            <ListMusic className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:text-neon-blue hover:shadow-glow-blue transition-all duration-300">
            <Monitor className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 min-w-[120px]">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300" 
              onClick={toggleMute}
            >
              <VolumeIcon className="h-4 w-4" />
            </Button>
            <div className="w-20 group">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer cyber-volume-slider"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Estilos personalizados */}
      <style>{`
        .modern-player .rhap_container {
          background-color: transparent !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-direction: column !important;
          gap: 8px !important;
        }

        .modern-player .rhap_main-controls {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 12px !important;
          height: 32px !important;
          margin-bottom: 8px !important;
        }

        .modern-player .rhap_button-clear {
          width: 32px !important;
          height: 32px !important;
          color: hsl(var(--muted-foreground)) !important;
          background: none !important;
          border: none !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
        }

        .modern-player .rhap_button-clear:hover {
          color: hsl(var(--neon-purple)) !important;
          transform: scale(1.1) !important;
          filter: drop-shadow(0 0 8px hsl(var(--neon-purple) / 0.5)) !important;
        }

        .modern-player .rhap_play-pause-button {
          width: 36px !important;
          height: 36px !important;
          background: linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-pink))) !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 0 20px hsl(var(--neon-purple) / 0.5) !important;
        }

        .modern-player .rhap_play-pause-button:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 0 30px hsl(var(--neon-purple) / 0.7) !important;
        }

        .modern-player .rhap_play-pause-button svg {
          width: 16px !important;
          height: 16px !important;
          fill: white !important;
        }

        .modern-player .rhap_progress-section {
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 12px !important;
          margin-top: 0 !important;
        }

        .modern-player .rhap_time {
          color: hsl(var(--muted-foreground)) !important;
          font-size: 11px !important;
          font-weight: 400 !important;
          min-width: 40px !important;
          text-align: center !important;
        }

        .modern-player .rhap_progress-container {
          background-color: hsl(var(--muted)) !important;
          height: 4px !important;
          border-radius: 2px !important;
          flex: 1 !important;
          cursor: pointer !important;
          position: relative !important;
        }

        .modern-player .rhap_progress-container:hover .rhap_progress-filled {
          background: linear-gradient(90deg, hsl(var(--neon-purple)), hsl(var(--neon-pink))) !important;
          box-shadow: 0 0 10px hsl(var(--neon-purple) / 0.5) !important;
        }

        .modern-player .rhap_progress-filled {
          background: linear-gradient(90deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan))) !important;
          border-radius: 2px !important;
          transition: all 0.3s ease !important;
        }

        .modern-player .rhap_progress-indicator {
          width: 12px !important;
          height: 12px !important;
          background: hsl(var(--foreground)) !important;
          border-radius: 50% !important;
          opacity: 0 !important;
          transition: opacity 0.2s ease !important;
          box-shadow: 0 0 8px hsl(var(--neon-purple) / 0.5) !important;
        }

        .modern-player .rhap_progress-container:hover .rhap_progress-indicator {
          opacity: 1 !important;
        }

        .modern-player .rhap_volume-controls {
          display: none !important;
        }

        .cyber-volume-slider {
          background: linear-gradient(to right, 
            hsl(var(--neon-purple)) 0%, 
            hsl(var(--neon-purple)) ${(isMuted ? 0 : volume) * 100}%, 
            hsl(var(--muted)) ${(isMuted ? 0 : volume) * 100}%, 
            hsl(var(--muted)) 100%);
          transition: all 0.3s ease;
        }

        .cyber-volume-slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          background: hsl(var(--foreground));
          border-radius: 50%;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s ease;
          box-shadow: 0 0 8px hsl(var(--neon-purple) / 0.5);
        }

        .group:hover .cyber-volume-slider::-webkit-slider-thumb {
          opacity: 1;
        }

        .cyber-volume-slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          background: hsl(var(--foreground));
          border: none;
          border-radius: 50%;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s ease;
          box-shadow: 0 0 8px hsl(var(--neon-purple) / 0.5);
        }

        .group:hover .cyber-volume-slider::-moz-range-thumb {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
