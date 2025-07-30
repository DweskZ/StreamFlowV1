import { Album } from '@/types/music';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Music, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlbumCardProps {
  album: Album;
  onPlay: (album: Album) => void;
  onAlbumClick: (album: Album) => void;
  className?: string;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ 
  album, 
  onPlay, 
  onAlbumClick, 
  className 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  return (
    <Card 
      className={cn(
        "cyber-card border-neon group hover:shadow-glow-purple/50 transition-all duration-300 cursor-pointer overflow-hidden",
        className
      )}
      onClick={() => onAlbumClick(album)}
    >
      <CardContent className="p-4">
        <div className="relative mb-4">
          <div className="aspect-square rounded-lg overflow-hidden border border-neon-purple/30">
            <img
              src={album.image}
              alt={album.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          {/* Play Button Overlay */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Button
              size="sm"
              className="h-10 w-10 rounded-full neon-button p-0 shadow-lg hover:scale-110 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                onPlay(album);
              }}
            >
              <Play className="h-5 w-5 text-white fill-white ml-0.5" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-foreground truncate group-hover:text-neon-purple transition-colors duration-300">
            {album.name}
          </h3>
          
          <p className="text-sm text-muted-foreground truncate group-hover:text-neon-cyan transition-colors duration-300">
            {album.artist_name}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="secondary" 
              className="bg-neon-purple/20 text-neon-purple border-neon-purple/30 text-xs"
            >
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(album.releasedate)}
            </Badge>
            
            <Badge 
              variant="secondary" 
              className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 text-xs"
            >
              <Music className="h-3 w-3 mr-1" />
              {album.totalTracks} canciones
            </Badge>

            <Badge 
              variant="secondary" 
              className="bg-neon-pink/20 text-neon-pink border-neon-pink/30 text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              {album.duration}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlbumCard;
