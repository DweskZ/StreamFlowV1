import { Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Track } from '@/types/music';

interface SimpleTrackCardProps {
  readonly track: Track;
  readonly onPlay: (track: Track) => void;
  readonly isPlaying?: boolean;
}

const formatDuration = (duration: string): string => {
  const seconds = parseInt(duration);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function SimpleTrackCard({ track, onPlay, isPlaying }: SimpleTrackCardProps) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 group">
      {/* Album Cover */}
      <div className="relative flex-shrink-0">
        <img
          src={track.album_image || track.image || '/placeholder.svg'}
          alt={`${track.album_name} cover`}
          className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-lg object-cover shadow-lg border border-purple-500/30 group-hover:border-purple-400/50 transition-colors"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-black/70 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Button
            onClick={() => onPlay(track)}
            className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full shadow-glow-purple transition-all duration-200 hover:scale-110"
          >
            <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current text-white ml-0.5" />
          </Button>
        </div>
        
        {isPlaying && (
          <div className="absolute -top-1 -right-1 flex items-center gap-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse shadow-glow-cyan" />
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors text-xs sm:text-sm lg:text-base leading-tight">
          {track.name}
        </h3>
        <p className="text-xs text-gray-400 truncate group-hover:text-gray-300 transition-colors leading-tight">
          {track.artist_name}
        </p>
        <p className="text-xs text-gray-500 truncate hidden sm:block leading-tight">
          {track.album_name}
        </p>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-1 text-xs text-gray-400 bg-black/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-purple-500/20">
        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        <span className="font-mono">{formatDuration(track.duration)}</span>
      </div>
    </div>
  );
} 