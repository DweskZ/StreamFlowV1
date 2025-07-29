import { useRef, useEffect, useState } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import type { DeezerTrack, PlaylistTrack } from '@/hooks/useDeezerAPI';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Info, Radio, Waves } from 'lucide-react';

interface AudioPlayerProps {
  readonly currentTrack: PlaylistTrack | DeezerTrack | null;
  readonly onEnded: () => void;
  readonly onPlay?: () => void;
  readonly onPause?: () => void;
  readonly onPrevious?: () => void;
}

export default function MusicPlayer({ currentTrack, onEnded, onPlay, onPause, onPrevious }: AudioPlayerProps) {
  const audioRef = useRef<AudioPlayer>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      setIsReady(false);
      setTimeout(() => {
        setIsReady(true);
      }, 100);
    }
  }, [currentTrack]);


  if (!currentTrack) {
    return (
      <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl z-50 cyber-card border-purple-500/30 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-center h-16 text-gray-400">
            <div className="flex items-center gap-3">
              <Radio className="w-6 h-6 text-purple-400 animate-pulse" />
              <p className="text-lg">Inicializa el stream neural para comenzar...</p>
              <Waves className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl z-50 cyber-card border-purple-500/30 backdrop-blur-xl shadow-neon">
      <div className="px-4 py-3">
        {/* Track Info Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative">
              <img
                src={currentTrack.album_image || currentTrack.image || '/placeholder.svg'}
                alt={`${currentTrack.album_name} cover`}
                className="w-12 h-12 rounded-lg object-cover border border-purple-500/30 flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 rounded-lg border border-cyan-400/50 animate-pulse opacity-60" />
            </div>
            
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-white truncate text-sm">
                {currentTrack.name}
              </h4>
              <p className="text-xs text-purple-300 truncate">
                {currentTrack.artist_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Duration */}
            <div className="text-xs text-cyan-400 bg-black/40 px-2 py-1 rounded border border-purple-500/20 font-mono">
              {Math.floor(parseInt(currentTrack.duration) / 60)}:
              {(parseInt(currentTrack.duration) % 60).toString().padStart(2, '0')}
            </div>

            {/* Info Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  className="h-8 w-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full shadow-glow-purple/50 transition-all"
                >
                  <Info className="h-3 w-3 text-white" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 cyber-card border-purple-500/30 backdrop-blur-xl">
                <div className="text-center space-y-3">
                  <div className="relative mx-auto w-20 h-20">
                    <img
                      src={currentTrack.image || currentTrack.album_image || '/placeholder.svg'}
                      alt={currentTrack.artist_name}
                      className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-purple-500/30"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{currentTrack.artist_name}</h4>
                    <p className="text-sm text-purple-300">{currentTrack.album_name}</p>
                    <div className="mt-2 text-xs text-gray-400 bg-black/30 px-2 py-1 rounded-full inline-block">
                      Neural Stream Active
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Audio Player Row */}
        <div className="w-full">
          <AudioPlayer
            ref={audioRef}
            src={isReady ? currentTrack.audio : ''}
            onEnded={onEnded}
            onClickNext={onEnded}
            onClickPrevious={onPrevious}
            onPlay={onPlay}
            onPause={onPause}
            showSkipControls={true}
            showJumpControls={false}
            showDownloadProgress={false}
            showFilledProgress={true}
            style={{
              backgroundColor: 'transparent',
              boxShadow: 'none',
              color: 'white',
            }}
            className="cyber-audio-player"
          />
        </div>
      </div>

      <style>{`
        .cyber-audio-player .rhap_container {
          background-color: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-direction: row !important;
          gap: 16px !important;
        }
        
        .cyber-audio-player .rhap_main-controls {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 12px !important;
        }
        
        .cyber-audio-player .rhap_main-controls-button {
          color: hsl(var(--neon-purple)) !important;
          transition: all 0.3s ease !important;
          margin: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .cyber-audio-player .rhap_main-controls-button:hover {
          color: hsl(var(--neon-pink)) !important;
          filter: drop-shadow(0 0 8px hsl(var(--neon-purple))) !important;
          transform: scale(1.1) !important;
        }
        
        .cyber-audio-player .rhap_play-pause-button {
          width: 44px !important;
          height: 44px !important;
          background: linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-pink))) !important;
          border-radius: 50% !important;
          box-shadow: 0 0 20px hsl(var(--neon-purple) / 0.4) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 8px !important;
        }
        
        .cyber-audio-player .rhap_play-pause-button:hover {
          box-shadow: 0 0 30px hsl(var(--neon-purple) / 0.6) !important;
          transform: scale(1.05) !important;
        }

        .cyber-audio-player .rhap_play-pause-button svg {
          fill: white !important;
          color: white !important;
        }
        
        .cyber-audio-player .rhap_skip-button {
          width: 36px !important;
          height: 36px !important;
          background: rgba(255, 255, 255, 0.1) !important;
          border-radius: 50% !important;
          border: 1px solid hsl(var(--neon-purple) / 0.3) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .cyber-audio-player .rhap_skip-button:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          border-color: hsl(var(--neon-purple) / 0.6) !important;
        }
        
        .cyber-audio-player .rhap_progress-section {
          flex: 1 !important;
          margin: 0 20px !important;
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
        }
        
        .cyber-audio-player .rhap_progress-container {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
          height: 4px !important;
          flex: 1 !important;
          position: relative !important;
          cursor: pointer !important;
        }
        
        .cyber-audio-player .rhap_progress-filled {
          background: linear-gradient(90deg, hsl(var(--neon-purple)), hsl(var(--neon-pink))) !important;
          border-radius: 8px !important;
          box-shadow: 0 0 8px hsl(var(--neon-purple) / 0.5) !important;
          height: 100% !important;
        }
        
        .cyber-audio-player .rhap_progress-indicator {
          background: linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-pink))) !important;
          border: 2px solid white !important;
          width: 14px !important;
          height: 14px !important;
          box-shadow: 0 0 12px hsl(var(--neon-purple) / 0.8) !important;
          top: -5px !important;
        }
        
        .cyber-audio-player .rhap_time {
          color: hsl(var(--neon-cyan)) !important;
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 12px !important;
          text-shadow: 0 0 4px hsl(var(--neon-cyan) / 0.5) !important;
          min-width: 45px !important;
          text-align: center !important;
        }
        
        .cyber-audio-player .rhap_volume-controls {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          margin-left: 16px !important;
        }
        
        .cyber-audio-player .rhap_volume-button {
          color: hsl(var(--neon-cyan)) !important;
          transition: all 0.3s ease !important;
        }
        
        .cyber-audio-player .rhap_volume-button:hover {
          color: hsl(var(--neon-blue)) !important;
          filter: drop-shadow(0 0 6px hsl(var(--neon-cyan))) !important;
        }
        
        .cyber-audio-player .rhap_volume-container {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
          height: 4px !important;
          width: 60px !important;
        }
        
        .cyber-audio-player .rhap_volume-filled {
          background: linear-gradient(90deg, hsl(var(--neon-cyan)), hsl(var(--neon-blue))) !important;
          border-radius: 8px !important;
          height: 100% !important;
        }
        
        .cyber-audio-player .rhap_volume-indicator {
          background: hsl(var(--neon-cyan)) !important;
          border: 2px solid white !important;
          box-shadow: 0 0 8px hsl(var(--neon-cyan) / 0.6) !important;
          width: 12px !important;
          height: 12px !important;
          top: -4px !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .cyber-audio-player .rhap_volume-controls {
            display: none !important;
          }
          
          .cyber-audio-player .rhap_progress-section {
            margin: 0 12px !important;
          }
          
          .cyber-audio-player .rhap_time {
            font-size: 10px !important;
            min-width: 35px !important;
          }
        }
      `}</style>
    </Card>
  );
}