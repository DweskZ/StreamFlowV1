import { Play, Plus, Heart, MoreHorizontal, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Track } from '@/types/music';
import { useLibrary } from '@/contexts/LibraryContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PlaylistMenu from './PlaylistMenu';

interface TrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  isPlaying?: boolean;
}

export default function TrackCard({ track, onPlay, onAddToQueue, isPlaying }: TrackCardProps) {
  const { addToLiked, removeFromLiked, isLiked } = useLibrary();
  const trackIsLiked = isLiked(track.id);

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (trackIsLiked) {
      removeFromLiked(track.id);
    } else {
      addToLiked(track);
    }
  };

  return (
    <Card className="group bg-black/20 backdrop-blur-sm border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-glow-purple/30">
      <CardContent className="p-4">
        <div className="aspect-square relative mb-4">
          <div className="relative">
            <img
              src={track.album_image || track.image || '/placeholder.svg'}
              alt={`${track.album_name} cover`}
              className="w-full h-full object-cover rounded-xl shadow-lg border border-purple-500/20"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            {/* Neon border effect */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/70 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-sm">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(track);
              }}
              className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full shadow-glow-purple transition-all duration-200 hover:scale-110"
            >
              <Play className="h-5 w-5 fill-current text-white ml-0.5" />
            </Button>
          </div>

          {/* Playing indicator */}
          {isPlaying && (
            <div className="absolute -top-1 -right-1 flex items-center gap-1">
              <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse shadow-glow-cyan" />
              <Volume2 className="w-3 h-3 text-cyan-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* Track info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors text-sm">
            {track.name}
          </h3>
          <p className="text-gray-400 text-sm truncate group-hover:text-gray-300 transition-colors">
            {track.artist_name}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${trackIsLiked ? 'text-pink-500 hover:text-pink-400' : 'text-gray-400 hover:text-white'}`}
            onClick={handleLikeToggle}
          >
            <Heart className={`h-4 w-4 ${trackIsLiked ? 'fill-current' : ''}`} />
          </Button>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-cyan-400 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onAddToQueue(track);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/90 backdrop-blur-sm border-purple-500/30 w-48">
                <DropdownMenuItem 
                  className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToQueue(track);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir a la cola
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-purple-500/30" />
                <div className="relative">
                  <PlaylistMenu track={track} />
                </div>
                
                <DropdownMenuSeparator className="bg-purple-500/30" />
                <DropdownMenuItem 
                  className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20"
                  onClick={handleLikeToggle}
                >
                  <Heart className={`h-4 w-4 mr-2 ${trackIsLiked ? 'fill-current text-pink-500' : ''}`} />
                  {trackIsLiked ? 'Quitar de Me gusta' : 'Me gusta'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
