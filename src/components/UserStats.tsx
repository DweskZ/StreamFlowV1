import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Music, 
  Heart, 
  Clock, 
  Play, 
  Calendar,
  TrendingUp,
  Users,
  Star
} from 'lucide-react';
import { useLibrary } from '@/contexts/LibraryContext';
import { useAuth } from '@/contexts/AuthContext';

interface UserStatsProps {
  className?: string;
}

export const UserStats = ({ className }: UserStatsProps) => {
  const { playlists, likedSongs } = useLibrary();
  const { user } = useAuth();

  // Calcular estadísticas
  const totalPlaylists = playlists.length;
  const totalLikedSongs = likedSongs.length;
  const totalTracks = playlists.reduce((acc, playlist) => acc + playlist.tracks.length, 0);
  
  // Fecha de registro (aproximada)
  const registrationDate = user?.created_at ? new Date(user.created_at) : new Date();
  const daysSinceRegistration = Math.floor((Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));

  const stats = [
    {
      title: 'Playlists',
      value: totalPlaylists,
      icon: Music,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Canciones Me Gusta',
      value: totalLikedSongs,
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      title: 'Total Canciones',
      value: totalTracks,
      icon: Play,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Días como Miembro',
      value: daysSinceRegistration,
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-black/40 border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stat.value.toLocaleString()}
              </div>
              {stat.title === 'Días como Miembro' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Miembro desde {registrationDate.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}; 