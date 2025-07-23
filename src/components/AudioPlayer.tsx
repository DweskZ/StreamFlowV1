import { useRef, useEffect, useState } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { JamendoTrack } from '@/types/jamendo';
import { Card } from '@/components/ui/card';

interface AudioPlayerProps {
  currentTrack: JamendoTrack | null;
  onEnded: () => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export default function MusicPlayer({ currentTrack, onEnded, onPlay, onPause }: AudioPlayerProps) {
  const audioRef = useRef<AudioPlayer>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      setIsReady(false);
      // Small delay to ensure the audio element is updated
      setTimeout(() => {
        setIsReady(true);
      }, 100);
    }
  }, [currentTrack]);

  if (!currentTrack) {
    return (
      <Card className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center h-16 text-muted-foreground">
            <p>Selecciona una canción para reproducir</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Current Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img
              src={currentTrack.album_image || currentTrack.image || '/placeholder.svg'}
              alt={`${currentTrack.album_name} cover`}
              className="w-12 h-12 rounded object-cover shadow-md flex-shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="min-w-0">
              <h4 className="font-semibold text-foreground truncate">
                {currentTrack.name}
              </h4>
              <p className="text-sm text-muted-foreground truncate">
                {currentTrack.artist_name}
              </p>
            </div>
          </div>

          {/* Audio Player */}
          <div className="flex-1 max-w-2xl">
            <AudioPlayer
              ref={audioRef}
              src={isReady ? currentTrack.audio : ''}
              onEnded={onEnded}
              onPlay={onPlay}
              onPause={onPause}
              showSkipControls={false}
              showJumpControls={false}
              showDownloadProgress={false}
              showFilledProgress={true}
              style={{
                backgroundColor: 'transparent',
                boxShadow: 'none',
                color: 'hsl(var(--foreground))',
              }}
              className="streamflow-player"
            />
          </div>

          {/* Track Duration */}
          <div className="text-sm text-muted-foreground hidden md:block">
            {Math.floor(parseInt(currentTrack.duration) / 60)}:
            {(parseInt(currentTrack.duration) % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      <style>{`
        .streamflow-player .rhap_container {
          background-color: transparent !important;
          box-shadow: none !important;
        }
        
        .streamflow-player .rhap_main-controls-button {
          color: hsl(var(--spotify-green)) !important;
        }
        
        .streamflow-player .rhap_main-controls-button:hover {
          color: hsl(var(--spotify-green)) !important;
          filter: brightness(1.2);
        }
        
        .streamflow-player .rhap_progress-filled {
          background-color: hsl(var(--spotify-green)) !important;
        }
        
        .streamflow-player .rhap_progress-indicator {
          background-color: hsl(var(--spotify-green)) !important;
          border: 2px solid hsl(var(--spotify-green)) !important;
        }
        
        .streamflow-player .rhap_volume-bar-area {
          color: hsl(var(--foreground)) !important;
        }
        
        .streamflow-player .rhap_volume-filled {
          background-color: hsl(var(--spotify-green)) !important;
        }
        
        .streamflow-player .rhap_volume-indicator {
          background-color: hsl(var(--spotify-green)) !important;
        }
        
        .streamflow-player .rhap_time {
          color: hsl(var(--muted-foreground)) !important;
        }
      `}</style>
    </Card>
  );
}