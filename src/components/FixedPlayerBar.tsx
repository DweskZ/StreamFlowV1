// FixedPlayerBar.tsx
import { useRef, useEffect, useState } from 'react';
import type { DeezerTrack, PlaylistTrack } from '@/hooks/useDeezerAPI';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Heart, MoreHorizontal, Volume2, VolumeX, Volume1, Monitor, ListMusic, Shuffle, SkipBack, SkipForward, Play, Pause, Repeat, Zap } from 'lucide-react';
import { useLibrary } from '@/contexts/LibraryContext';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Track } from '@/types/music';

interface FixedPlayerBarProps {
  readonly currentTrack: PlaylistTrack | DeezerTrack | null;
  readonly onEnded: () => void;
  readonly onPlay?: () => void;
  readonly onPause?: () => void;
  readonly onPrevious?: () => void;
  readonly onNext?: () => void;
  readonly isRepeatMode?: boolean;
  readonly isShuffleMode?: boolean;
  readonly autoPlayEnabled?: boolean;
  readonly onToggleRepeat?: () => void;
  readonly onToggleShuffle?: () => void;
  readonly onToggleAutoPlay?: () => void;
}

export default function FixedPlayerBar({ 
  currentTrack, 
  onEnded, 
  onPlay, 
  onPause, 
  onPrevious,
  onNext,
  isRepeatMode = false,
  isShuffleMode = false,
  autoPlayEnabled = false,
  onToggleRepeat,
  onToggleShuffle,
  onToggleAutoPlay
}: FixedPlayerBarProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { addToLiked, removeFromLiked, likedSongs, playlists, addTrackToPlaylist, createPlaylist } = useLibrary();
  const { user } = useAuth();
  const isMobile = useIsMobile();

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
      setCurrentTime(0);
      setDuration(0);
      
      // Establecer isReady antes de cargar para que el src se configure correctamente
      setIsReady(true);
      
      // Cargar el audio después de que isReady esté establecido
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          
          const attemptAutoplay = async () => {
            try {
              await audioRef.current?.play();
            } catch (error) {
              console.log('Autoplay prevented:', error);
            }
          };
          
          attemptAutoplay();
        }
      }, 100);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
    setIsMuted(false);
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const handleLikeToggle = () => {
    if (currentTrack) {
      if (isLiked) {
        removeFromLiked(currentTrack.id);
      } else {
        addToLiked(convertToLibraryTrack(currentTrack));
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current) return;
    
      try {
      if (isPlaying) {
        audioRef.current.pause();
        onPause?.();
      } else {
          await audioRef.current.play();
          onPlay?.();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    onPlay?.();
  };

  const handlePause = () => {
    setIsPlaying(false);
    onPause?.();
  };

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-28 sm:h-32 lg:h-36 bg-black/95 border-t border-purple-500/30 backdrop-blur-xl z-50">
        <div className="flex items-center justify-center h-full px-4">
          <div className="flex items-center gap-2 sm:gap-3 text-gray-400">
            <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 animate-pulse" />
            <span className="text-sm sm:text-base font-medium hidden sm:block">Selecciona una canción para comenzar</span>
            <span className="text-sm sm:text-base font-medium sm:hidden">Selecciona una canción</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-28 sm:h-32 lg:h-36 bg-black/95 border-t border-purple-500/30 backdrop-blur-xl z-50">
      <div className="h-full px-3 sm:px-4 lg:px-6 flex items-center justify-between max-w-screen-2xl mx-auto">
        
        {/* LEFT - Track Info (Mobile Optimized for Authenticated Users) */}
        <div className={`flex items-center gap-3 sm:gap-4 ${isAuthenticated ? 'w-[200px] sm:w-[260px] md:w-[280px] lg:w-[320px]' : 'w-[180px] sm:w-[240px] md:w-[260px] lg:w-[320px]'} min-w-0`}>
          <div className="relative flex-shrink-0 group">
            <img
              src={currentTrack.album_image || currentTrack.image || '/placeholder.svg'}
              alt={`${currentTrack.album_name} cover`}
              className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg object-cover shadow-lg border border-purple-500/30 group-hover:border-purple-400/50 transition-colors"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-white truncate text-sm sm:text-base hover:text-purple-300 cursor-pointer transition-colors">
              {currentTrack.name}
            </h4>
            <p className="text-sm text-gray-400 truncate hover:text-cyan-300 cursor-pointer transition-colors">
              {currentTrack.artist_name}
            </p>
          </div>
        </div>

        {/* CENTER - Playback Controls (Mobile Optimized) */}
        <div className="flex-1 max-w-[280px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] mx-auto">
          <div className="flex flex-col items-center space-y-2">
            {/* Control Buttons - Responsive Layout */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {/* Shuffle - Now visible on mobile */}
              <Button 
                size="icon" 
                variant="ghost"
                onClick={onToggleShuffle}
                className={`h-7 w-7 sm:h-9 sm:w-9 rounded-full transition-all duration-300 ${
                  isShuffleMode 
                    ? 'text-purple-400 hover:text-purple-300 shadow-glow-purple' 
                    : 'text-gray-400 hover:text-purple-400 hover:shadow-glow-purple'
                }`}
              >
                <Shuffle className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
              </Button>
              
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={onPrevious}
                className="h-7 w-7 sm:h-9 sm:w-9 rounded-full text-gray-400 hover:text-purple-400 hover:shadow-glow-purple transition-all duration-300"
              >
                <SkipBack className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
              </Button>
              
              <Button
                onClick={togglePlayPause}
                className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full shadow-glow-purple transition-all duration-300 hover:scale-105 flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 sm:h-5 sm:w-5 fill-current text-white" />
                ) : (
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current text-white ml-0.5" />
                )}
              </Button>
              
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={onNext}
                className="h-7 w-7 sm:h-9 sm:w-9 rounded-full text-gray-400 hover:text-purple-400 hover:shadow-glow-purple transition-all duration-300"
              >
                <SkipForward className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
              </Button>
              
              {/* Repeat - Now visible on mobile */}
              <Button 
                size="icon" 
                variant="ghost"
                onClick={onToggleRepeat}
                className={`h-7 w-7 sm:h-9 sm:w-9 rounded-full transition-all duration-300 ${
                  isRepeatMode 
                    ? 'text-cyan-400 hover:text-cyan-300 shadow-glow-cyan' 
                    : 'text-gray-400 hover:text-cyan-400 hover:shadow-glow-cyan'
                }`}
              >
                <Repeat className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
              </Button>
              
              {/* AutoPlay - Only on large screens */}
              <Button 
                size="icon" 
                variant="ghost"
                onClick={onToggleAutoPlay}
                className={`h-7 w-7 sm:h-9 sm:w-9 rounded-full transition-all duration-300 ${
                  autoPlayEnabled 
                    ? 'text-green-400 hover:text-green-300 shadow-glow-green' 
                    : 'text-gray-400 hover:text-green-400 hover:shadow-glow-green'
                } hidden lg:flex`}
                title={autoPlayEnabled ? 'Desactivar reproducción automática' : 'Activar reproducción automática'}
              >
                <Zap className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
              </Button>
            </div>
            
            {/* Progress Bar - Fixed for mobile */}
            <div className="w-full flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm text-gray-400 font-mono min-w-[35px] sm:min-w-[40px] text-right">
                {formatTime(currentTime)}
              </span>
              
              <div className="flex-1 relative group">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer progress-slider"
                />
              </div>
              
              <span className="text-xs sm:text-sm text-gray-400 font-mono min-w-[35px] sm:min-w-[40px] text-left">
                {formatTime(duration)}
              </span>
            </div>
          </div>
          
          {/* Hidden Audio Player for functionality */}
          <audio
            ref={audioRef}
            src={isReady ? currentTrack.audio : ''}
            onEnded={onEnded}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={handlePlay}
            onPause={handlePause}
            onError={(e) => {
              console.error('Audio error:', e);
            }}
            style={{ display: 'none' }}
            preload="auto"
          />
        </div>

        {/* RIGHT - Volume and Controls (Mobile Optimized) */}
        <div className={`flex items-center gap-3 sm:gap-4 ${isAuthenticated ? 'w-[140px] sm:w-[180px] md:w-[200px] lg:w-[250px]' : 'w-[120px] sm:w-[180px] md:w-[200px] lg:w-[250px]'} justify-end`}>
          {/* Authenticated User Controls - Moved to right side */}
          {isAuthenticated && (
            <>
              {/* Like Button - Moved to right side */}
              <Button 
                size="icon" 
                variant="ghost" 
                className={`h-7 w-7 sm:h-9 sm:w-9 rounded-full transition-all duration-300 ${
                  isLiked 
                    ? 'text-pink-400 hover:text-pink-300 shadow-glow-pink' 
                    : 'text-gray-400 hover:text-purple-400 hover:shadow-glow-purple'
                }`} 
                onClick={handleLikeToggle}
              >
                <Heart className={`h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              
              {/* More Options Button - Now visible on mobile */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 sm:h-9 sm:w-9 rounded-full text-gray-400 hover:text-purple-400 hover:shadow-glow-purple transition-all duration-300"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 cyber-card border-purple-500/30 backdrop-blur-xl" side="top" align="end">
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-xs font-medium text-gray-400 border-b border-purple-500/20">Agregar a playlist</div>
                    {playlists.length > 0 ? (
                      <>
                        {playlists.map((playlist) => (
                          <button
                            key={playlist.id}
                            onClick={() => {
                              const libraryTrack = convertToLibraryTrack(currentTrack);
                              addTrackToPlaylist(playlist.id, libraryTrack);
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-purple-500/20 hover:text-purple-300 rounded flex items-center gap-2 transition-all duration-300"
                          >
                            <ListMusic className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="truncate font-medium">{playlist.name}</div>
                              <div className="text-xs text-gray-400 truncate">
                                {playlist.tracks.length} {playlist.tracks.length === 1 ? 'canción' : 'canciones'}
                              </div>
                            </div>
                          </button>
                        ))}
                        <div className="border-t border-purple-500/20 my-1"></div>
                      </>
                    ) : null}
                    <button
                      onClick={async () => {
                        const libraryTrack = convertToLibraryTrack(currentTrack);
                        const newPlaylist = await createPlaylist(`Nueva Playlist ${playlists.length + 1}`);
                        addTrackToPlaylist(newPlaylist.id, libraryTrack);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 rounded flex items-center gap-2 transition-all duration-300"
                    >
                      <ListMusic className="w-4 h-4 text-purple-400" />
                      Crear nueva playlist
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-9 sm:w-9 rounded-full text-gray-400 hover:text-blue-400 hover:shadow-glow-blue transition-all duration-300 hidden lg:flex">
                <Monitor className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
              </Button>
            </>
          )}
          
          {/* Volume Controls - Hidden on mobile, visible on larger screens */}
          <div className="hidden md:flex items-center gap-3 sm:gap-4">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 sm:h-9 sm:w-9 rounded-full text-gray-400 hover:text-purple-400 hover:shadow-glow-purple transition-all duration-300" 
              onClick={toggleMute}
            >
              <VolumeIcon className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
            </Button>
            
            {/* Volume slider - Only visible on medium screens and up */}
            <div className="w-10 sm:w-16 lg:w-20 group">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer volume-slider"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .progress-slider {
          background: linear-gradient(to right, 
            hsl(270, 50%, 60%) 0%, 
            hsl(270, 50%, 60%) ${duration ? (currentTime / duration) * 100 : 0}%, 
            hsl(0, 0%, 30%) ${duration ? (currentTime / duration) * 100 : 0}%, 
            hsl(0, 0%, 30%) 100%);
          transition: all 0.3s ease;
        }

        .progress-slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          background: hsl(270, 50%, 60%);
          border-radius: 50%;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s ease;
          box-shadow: 0 0 8px hsl(270, 50%, 60% / 0.5);
        }

        .group:hover .progress-slider::-webkit-slider-thumb {
          opacity: 1;
        }

        .progress-slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          background: hsl(270, 50%, 60%);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s ease;
          box-shadow: 0 0 8px hsl(270, 50%, 60% / 0.5);
        }

        .group:hover .progress-slider::-moz-range-thumb {
          opacity: 1;
        }

        .volume-slider {
          background: linear-gradient(to right, 
            hsl(270, 50%, 60%) 0%, 
            hsl(270, 50%, 60%) ${(isMuted ? 0 : volume) * 100}%, 
            hsl(0, 0%, 30%) ${(isMuted ? 0 : volume) * 100}%, 
            hsl(0, 0%, 30%) 100%);
          transition: all 0.3s ease;
        }

        .shadow-glow-green {
          box-shadow: 0 0 20px hsl(142, 76%, 36% / 0.5);
        }

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          background: hsl(270, 50%, 60%);
          border-radius: 50%;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s ease;
          box-shadow: 0 0 8px hsl(270, 50%, 60% / 0.5);
        }

        .group:hover .volume-slider::-webkit-slider-thumb {
          opacity: 1;
        }

        .volume-slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          background: hsl(270, 50%, 60%);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s ease;
          box-shadow: 0 0 8px hsl(270, 50%, 60% / 0.5);
        }

        .group:hover .volume-slider::-moz-range-thumb {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

// Helper component for volume icon
function VolumeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  );
}
