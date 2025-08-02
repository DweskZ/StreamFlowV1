import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search,
  Mail,
  Calendar,
  Activity,
  Crown,
  MoreHorizontal,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  subscription_status: string;
  last_sign_in_at: string;
  stats: {
    totalPlays: number;
    totalPlaylists: number;
    totalLikedSongs: number;
  };
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Obtener usuarios con sus perfiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Obtener estadísticas para cada usuario
      const usersWithStats = await Promise.all(
        profiles?.map(async (profile) => {
          const userId = profile.id;

          // Obtener estadísticas de reproducción
          const { count: totalPlays } = await supabase
            .from('user_listening_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

          // Obtener estadísticas de playlists
          const { count: totalPlaylists } = await supabase
            .from('user_playlists')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

          // Obtener estadísticas de canciones favoritas
          const { count: totalLikedSongs } = await supabase
            .from('user_favorites')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

          return {
            id: profile.id,
            email: profile.email || 'N/A',
            full_name: profile.full_name || 'Usuario sin nombre',
            created_at: profile.created_at,
            subscription_status: profile.subscription_status || 'free',
            last_sign_in_at: profile.last_sign_in_at || 'Nunca',
            stats: {
              totalPlays: totalPlays || 0,
              totalPlaylists: totalPlaylists || 0,
              totalLikedSongs: totalLikedSongs || 0,
            }
          };
        }) || []
      );

      setUsers(usersWithStats);

    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.subscription_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'premium':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Premium</Badge>;
      case 'free':
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">Gratuito</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">Gratuito</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'Nunca') return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="text-white text-lg">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Gestión de Usuarios</h2>
            <p className="text-xs sm:text-sm text-gray-400">{users.length} usuarios registrados</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-400 text-sm"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black/20 border border-white/10 text-white rounded-md px-3 py-2 text-sm"
          >
            <option value="all">Todos</option>
            <option value="free">Gratuitos</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No se encontraron usuarios</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/10 rounded-lg border border-white/5 hover:border-orange-500/30 transition-colors gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs sm:text-sm">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-semibold text-white text-sm sm:text-base truncate">{user.full_name}</h3>
                        {getStatusBadge(user.subscription_status)}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(user.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-6">
                    {/* User Stats */}
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div className="text-center">
                        <div className="text-white font-semibold">{user.stats.totalPlays}</div>
                        <div className="text-gray-400 text-xs">Reproducciones</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">{user.stats.totalPlaylists}</div>
                        <div className="text-gray-400 text-xs">Playlists</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">{user.stats.totalLikedSongs}</div>
                        <div className="text-gray-400 text-xs">Favoritas</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                      >
                        Ver Detalles
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-500/30 text-gray-400 hover:bg-gray-500/10"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/20 backdrop-blur-sm border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{users.length}</div>
            <p className="text-xs text-gray-400 mt-1">
              {users.filter(u => u.subscription_status === 'premium').length} premium
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Usuarios Activos</CardTitle>
            <Activity className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {users.filter(u => u.last_sign_in_at !== 'Nunca').length}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Conversión Premium</CardTitle>
            <Crown className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {((users.filter(u => u.subscription_status === 'premium').length / users.length) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Tasa de conversión
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement; 