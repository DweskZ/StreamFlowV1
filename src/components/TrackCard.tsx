import { Play, Plus, Clock, Zap, Volume2, Heart, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Track } from '@/types/music';
import { useLibrary } from '@/contexts/LibraryContext';
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

interface TrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  isPlaying?: boolean;
}

const formatDuration = (duration: string): string => {
  const seconds = parseInt(duration);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function TrackCard({ track, onPlay, onAddToQueue, isPlaying }: TrackCardProps) {
  return (
    <Card className="group bg-black/20 backdrop-blur-sm border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-glow-purple/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Album Cover with Play Button */}
          <div className="relative flex-shrink-0">
            <div className="relative">
              <img
                src={track.album_image || track.image || '/placeholder.svg'}
                alt={`${track.album_name} cover`}
                className="w-16 h-16 rounded-xl object-cover shadow-lg border border-purple-500/20"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
              {/* Neon border effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="absolute inset-0 bg-black/70 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-sm">
              <Button
                onClick={() => onPlay(track)}
                className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full shadow-glow-purple transition-all duration-200 hover:scale-110"
              >
                <Play className="h-4 w-4 fill-current text-white ml-0.5" />
              </Button>
            </div>
            
            {isPlaying && (
              <div className="absolute -top-1 -right-1 flex items-center gap-1">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse shadow-glow-cyan" />
                <Volume2 className="w-3 h-3 text-cyan-400 animate-pulse" />
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors text-base">
              {track.name}
            </h3>
            <p className="text-sm text-gray-400 truncate group-hover:text-gray-300 transition-colors">
              {track.artist_name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {track.album_name}
            </p>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1 text-xs text-gray-400 bg-black/30 px-2 py-1 rounded-full border border-purple-500/20">
            <Clock className="h-3 w-3" />
            <span className="font-mono">{formatDuration(track.duration)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              onClick={() => onPlay(track)}
              className="h-8 px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium shadow-glow-purple/50 transition-all hover:shadow-glow-purple"
            >
              <Play className="h-3 w-3 mr-1 fill-current" />
              Stream
            </Button>
            <Button
              onClick={() => onAddToQueue(track)}
              className="h-8 px-3 bg-black/40 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all"
            >
              <Plus className="h-3 w-3 mr-1" />
              Queue
            </Button>
          </div>
        </div>

        {/* Tags */}
        {track.tags && track.tags.genres && track.tags.genres.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {track.tags.genres.slice(0, 3).map((genre, index) => (
              <span
                key={index}
                className="text-xs bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full backdrop-blur-sm hover:border-purple-400/50 transition-colors"
              >
                <Zap className="w-3 h-3 inline mr-1" />
                {genre}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}