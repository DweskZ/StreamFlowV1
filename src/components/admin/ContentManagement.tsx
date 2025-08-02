import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Music, 
  PlaySquare, 
  Heart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Playlist {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  track_count: number;
  is_public: boolean;
  status: 'active' | 'flagged' | 'removed';
}

const ContentManagement = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('user_playlists')
        .select(`
          id,
          name,
          user_id,
          created_at,
          is_public,
          playlist_tracks(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const playlistsWithCount = data?.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        user_id: playlist.user_id,
        created_at: playlist.created_at,
        track_count: playlist.playlist_tracks?.[0]?.count || 0,
        is_public: playlist.is_public,
        status: 'active' as const
      })) || [];

      setPlaylists(playlistsWithCount);

    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Activo</Badge>;
      case 'flagged':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Marcado</Badge>;
      case 'removed':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Removido</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">Desconocido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
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
          <span className="text-white text-lg">Cargando contenido...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Music className="h-6 w-6 text-orange-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Gestión de Contenido</h2>
            <p className="text-sm text-gray-400">{playlists.length} playlists creadas</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Contenido Marcado
          </Button>
          <Button variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprobar Todo
          </Button>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Playlists Totales</CardTitle>
            <PlaySquare className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{playlists.length}</div>
            <p className="text-xs text-gray-400 mt-1">
              {playlists.filter(p => p.is_public).length} públicas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Contenido Activo</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {playlists.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Sin problemas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Marcados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {playlists.filter(p => p.status === 'flagged').length}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Requieren revisión
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Removidos</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {playlists.filter(p => p.status === 'removed').length}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Contenido eliminado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Playlists List */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Playlists Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {playlists.length === 0 ? (
              <div className="text-center py-8">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No hay playlists para mostrar</p>
              </div>
            ) : (
              playlists.slice(0, 10).map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center justify-between p-4 bg-black/10 rounded-lg border border-white/5 hover:border-orange-500/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <PlaySquare className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{playlist.name}</h3>
                        {getStatusBadge(playlist.status)}
                        {playlist.is_public && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Pública</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Music className="h-3 w-3" />
                          {playlist.track_count} canciones
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {formatDate(playlist.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Popular Content */}
      <Card className="bg-black/20 backdrop-blur-sm border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Contenido Popular
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-black/10 rounded-lg">
              <Heart className="h-8 w-8 text-pink-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white">Canciones Más Favoritas</h4>
              <p className="text-sm text-gray-400">Top 10 canciones</p>
            </div>
            <div className="text-center p-4 bg-black/10 rounded-lg">
              <PlaySquare className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white">Playlists Más Seguidas</h4>
              <p className="text-sm text-gray-400">Playlists populares</p>
            </div>
            <div className="text-center p-4 bg-black/10 rounded-lg">
              <Music className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white">Géneros Más Escuchados</h4>
              <p className="text-sm text-gray-400">Tendencias musicales</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManagement; 