import { X, Radio, GripVertical, Zap, Activity, Volume2 } from 'lucide-react';
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
      <Card className="w-80 cyber-card border-purple-500/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-3 text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Radio className="h-4 w-4 text-white" />
            </div>
            Matriz de reproducción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-400">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-500/30">
                <Radio className="h-10 w-10 text-purple-400 opacity-60" />
              </div>
            </div>
            <p className="text-lg text-white mb-2">Matriz vacía</p>
            <p className="text-sm text-gray-400">
              Agrega frecuencias para inicializar la transmisión
            </p>
            <div className="mt-4 w-full h-1 bg-black/30 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 cyber-card border-purple-500/30 shadow-glow-purple/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-3 text-white">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center animate-pulse">
            <Radio className="h-4 w-4 text-white" />
          </div>
          Matriz Neural
          <span className="text-sm font-normal text-purple-300 bg-purple-600/20 border border-purple-500/30 px-2 py-1 rounded-full">
            {queue.length} streams
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 login-scroll">
          <div className="space-y-2 p-3">
            {queue.map((track, index) => (
              <div
                key={`${track.id}-${track.addedAt.getTime()}`}
                className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer border ${
                  currentTrack?.id === track.id 
                    ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-purple-400/50 shadow-glow-purple/30' 
                    : 'bg-black/20 border-purple-500/20 hover:border-purple-400/40 hover:bg-purple-600/10'
                }`}
                onClick={() => onSelectTrack(track)}
              >
                {/* Animated border for current track */}
                {currentTrack?.id === track.id && (
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-br from-purple-500/30 to-pink-500/30 animate-pulse" />
                )}

                {/* Drag Handle */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                  <GripVertical className="h-4 w-4 text-purple-400 cursor-grab hover:text-purple-300" />
                </div>

                {/* Track Number / Playing Indicator */}
                <div className="w-8 text-sm text-center relative z-10">
                  {currentTrack?.id === track.id ? (
                    <div className="flex items-center justify-center">
                      <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                    </div>
                  ) : (
                    <span className="text-gray-400 font-mono text-xs bg-black/30 w-6 h-6 rounded-full flex items-center justify-center">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* Album Cover */}
                <div className="relative flex-shrink-0">
                  <img
                    src={track.album_image || track.image || '/placeholder.svg'}
                    alt={`${track.album_name} cover`}
                    className="w-12 h-12 rounded-lg object-cover border border-purple-500/30"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  {currentTrack?.id === track.id && (
                    <div className="absolute inset-0 rounded-lg border-2 border-cyan-400/50 animate-pulse" />
                  )}
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0 relative z-10">
                  <p className={`text-sm font-medium truncate transition-colors ${
                    currentTrack?.id === track.id ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {track.name}
                  </p>
                  <p className={`text-xs truncate transition-colors ${
                    currentTrack?.id === track.id ? 'text-purple-300' : 'text-gray-500 group-hover:text-gray-400'
                  }`}>
                    {track.artist_name}
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="relative z-10">
                  {currentTrack?.id === track.id ? (
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                    </div>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Zap className="w-3 h-3 text-purple-400" />
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromQueue(track.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10 relative z-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {/* Queue Stats */}
        <div className="p-3 border-t border-purple-500/20 bg-black/20">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3" />
              {queue.length} frecuencias cargadas
            </span>
            <span className="text-purple-400 font-mono">
              NEURAL_MATRIX_ACTIVE
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}