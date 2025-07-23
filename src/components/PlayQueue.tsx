import { X, Music, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlaylistTrack } from '@/types/jamendo';

interface PlayQueueProps {
  queue: PlaylistTrack[];
  currentTrack: PlaylistTrack | null;
  onRemoveFromQueue: (trackId: string) => void;
  onSelectTrack: (track: PlaylistTrack) => void;
  onReorderQueue?: (startIndex: number, endIndex: number) => void;
}

export default function PlayQueue({ 
  queue, 
  currentTrack, 
  onRemoveFromQueue, 
  onSelectTrack 
}: PlayQueueProps) {
  if (queue.length === 0) {
    return (
      <Card className="w-80 bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Music className="h-5 w-5" />
            Cola de reproducción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay canciones en la cola</p>
            <p className="text-sm mt-1">Agrega canciones para reproducir</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Music className="h-5 w-5" />
          Cola de reproducción
          <span className="text-sm font-normal text-muted-foreground">
            ({queue.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 scrollbar-thin">
          <div className="space-y-1 p-2">
            {queue.map((track, index) => (
              <div
                key={`${track.id}-${track.addedAt.getTime()}`}
                className={`group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                  currentTrack?.id === track.id ? 'bg-primary/10 border border-primary/20' : ''
                }`}
                onClick={() => onSelectTrack(track)}
              >
                {/* Drag Handle */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                </div>

                {/* Track Number */}
                <div className="w-6 text-sm text-muted-foreground text-center">
                  {currentTrack?.id === track.id ? (
                    <div className="w-3 h-3 bg-spotify-green rounded-full animate-pulse mx-auto" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Album Cover */}
                <img
                  src={track.album_image || track.image || '/placeholder.svg'}
                  alt={`${track.album_name} cover`}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    currentTrack?.id === track.id ? 'text-primary' : 'text-foreground'
                  }`}>
                    {track.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.artist_name}
                  </p>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromQueue(track.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}