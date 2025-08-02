import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Music, 
  PlaySquare, 
  Heart,
  TrendingUp,
  Activity,
  Clock,
  Crown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  totalPlays: number;
  totalPlaylists: number;
  totalLikedSongs: number;
  activeUsersToday: number;
  premiumUsers: number;
  averageSessionTime: number;
  topGenres: string[];
}

const AdminOverview = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);

      // Obtener estadísticas de usuarios
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Obtener estadísticas de reproducciones
      const { count: totalPlays } = await supabase
        .from('user_listening_history')
        .select('*', { count: 'exact', head: true });

      // Obtener estadísticas de playlists
      const { count: totalPlaylists } = await supabase
        .from('user_playlists')
        .select('*', { count: 'exact', head: true });

      // Obtener estadísticas de canciones favoritas
      const { count: totalLikedSongs } = await supabase
        .from('user_favorites')
        .select('*', { count: 'exact', head: true });

      // Obtener usuarios activos hoy
      const today = new Date().toISOString().split('T')[0];
      const { count: activeUsersToday } = await supabase
        .from('user_listening_history')
        .select('user_id', { count: 'exact', head: true })
        .gte('played_at', today);

      // Obtener usuarios premium (simulado)
      const { count: premiumUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'premium');

      setStats({
        totalUsers: totalUsers || 0,
        totalPlays: totalPlays || 0,
        totalPlaylists: totalPlaylists || 0,
        totalLikedSongs: totalLikedSongs || 0,
        activeUsersToday: activeUsersToday || 0,
        premiumUsers: premiumUsers || 0,
        averageSessionTime: 25, // Simulado
        topGenres: ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Latin']
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="text-white text-lg">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <Activity className="h-16 w-16 text-orange-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          No se pudieron cargar las estadísticas
        </h3>
        <Button onClick={fetchAdminStats} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-black/20 backdrop-blur-sm border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1">
              {stats.activeUsersToday} activos hoy
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Reproducciones</CardTitle>
            <Music className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalPlays.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1">
              {Math.round(stats.totalPlays / stats.totalUsers)} por usuario
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-cyan-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Playlists</CardTitle>
            <PlaySquare className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalPlaylists.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1">
              {Math.round(stats.totalPlaylists / stats.totalUsers)} por usuario
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-pink-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Canciones Favoritas</CardTitle>
            <Heart className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalLikedSongs.toLocaleString()}</div>
            <p className="text-xs text-gray-400 mt-1">
              {Math.round(stats.totalLikedSongs / stats.totalUsers)} por usuario
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Premium Users & Session Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-black/20 backdrop-blur-sm border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Usuarios Premium</CardTitle>
            <Crown className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.premiumUsers}</div>
            <p className="text-xs text-gray-400 mt-1">
              {((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Tiempo Promedio de Sesión</CardTitle>
            <Clock className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.averageSessionTime} min</div>
            <p className="text-xs text-gray-400 mt-1">
              Por sesión de usuario
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Genres */}
      <Card className="bg-black/20 backdrop-blur-sm border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Géneros Más Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats.topGenres.map((genre, index) => (
              <Badge 
                key={genre}
                variant="outline" 
                className="bg-blue-500/10 border-blue-500/30 text-blue-300 text-xs sm:text-sm"
              >
                {genre}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-black/20 backdrop-blur-sm border-gray-500/20">
        <CardHeader>
          <CardTitle className="text-white">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-sm">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Ver Usuarios</span>
              <span className="sm:hidden">Usuarios</span>
            </Button>
            <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-sm">
              <Music className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Moderar Contenido</span>
              <span className="sm:hidden">Contenido</span>
            </Button>
            <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Ver Reportes</span>
              <span className="sm:hidden">Reportes</span>
            </Button>
            <Button variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-sm">
              <Activity className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Actividad Reciente</span>
              <span className="sm:hidden">Actividad</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview; 