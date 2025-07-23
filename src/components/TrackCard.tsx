import { Play, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { JamendoTrack } from '@/types/jamendo';

interface TrackCardProps {
  track: JamendoTrack;
  onPlay: (track: JamendoTrack) => void;
  onAddToQueue: (track: JamendoTrack) => void;
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
    <Card className="group hover:bg-card/80 transition-all duration-300 hover:shadow-card border-border/50 hover:border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Album Cover with Play Button */}
          <div className="relative flex-shrink-0">
            <img
              src={track.album_image || track.image || '/placeholder.svg'}
              alt={`${track.album_name} cover`}
              className="w-16 h-16 rounded-lg object-cover shadow-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <Button
                variant="play"
                size="play"
                onClick={() => onPlay(track)}
                className="w-8 h-8 opacity-90 hover:opacity-100"
              >
                <Play className="h-4 w-4 fill-current" />
              </Button>
            </div>
            {isPlaying && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-spotify-green rounded-full animate-pulse" />
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {track.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {track.artist_name}
            </p>
            <p className="text-xs text-muted-foreground/70 truncate">
              {track.album_name}
            </p>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(track.duration)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="spotify"
              size="sm"
              onClick={() => onPlay(track)}
              className="h-8 px-3"
            >
              <Play className="h-3 w-3 mr-1 fill-current" />
              Reproducir
            </Button>
            <Button
              variant="queue"
              size="sm"
              onClick={() => onAddToQueue(track)}
              className="h-8 px-3"
            >
              <Plus className="h-3 w-3 mr-1" />
              Cola
            </Button>
          </div>
        </div>

        {/* Tags */}
        {track.tags && track.tags.genres && track.tags.genres.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {track.tags.genres.slice(0, 3).map((genre, index) => (
              <span
                key={index}
                className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}