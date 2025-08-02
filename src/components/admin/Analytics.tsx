import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Activity,
  Users,
  Music,
  Calendar,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  dailyPlays: { date: string; count: number }[];
  userGrowth: { date: string; count: number }[];
  topArtists: { name: string; plays: number }[];
  topGenres: { name: string; percentage: number }[];
  retentionRate: number;
  averageSessionTime: number;
  conversionRate: number;
}

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Simular datos de analytics (en un caso real, esto vendría de una API)
      const mockAnalytics: AnalyticsData = {
        dailyPlays: [
          { date: '2024-01-01', count: 120 },
          { date: '2024-01-02', count: 145 },
          { date: '2024-01-03', count: 132 },
          { date: '2024-01-04', count: 167 },
          { date: '2024-01-05', count: 189 },
          { date: '2024-01-06', count: 201 },
          { date: '2024-01-07', count: 178 }
        ],
        userGrowth: [
          { date: '2024-01-01', count: 50 },
          { date: '2024-01-02', count: 52 },
          { date: '2024-01-03', count: 55 },
          { date: '2024-01-04', count: 58 },
          { date: '2024-01-05', count: 62 },
          { date: '2024-01-06', count: 65 },
          { date: '2024-01-07', count: 68 }
        ],
        topArtists: [
          { name: 'Ed Sheeran', plays: 1250 },
          { name: 'Taylor Swift', plays: 1180 },
          { name: 'Drake', plays: 1050 },
          { name: 'Bad Bunny', plays: 980 },
          { name: 'The Weeknd', plays: 920 }
        ],
        topGenres: [
          { name: 'Pop', percentage: 35 },
          { name: 'Hip Hop', percentage: 25 },
          { name: 'Rock', percentage: 20 },
          { name: 'Electronic', percentage: 15 },
          { name: 'Latin', percentage: 5 }
        ],
        retentionRate: 78.5,
        averageSessionTime: 25.3,
        conversionRate: 12.8
      };

      setAnalytics(mockAnalytics);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-400" />;
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-400" />;
    }
    return <BarChart3 className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="text-white text-lg">Cargando analytics...</span>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-16 w-16 text-orange-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          No se pudieron cargar los analytics
        </h3>
        <Button onClick={fetchAnalytics} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-orange-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Análisis y Reportes</h2>
            <p className="text-sm text-gray-400">Métricas detalladas de la aplicación</p>
          </div>
        </div>

        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-black/20 border border-white/10 text-white rounded-md px-3 py-2"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
          <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-black/20 backdrop-blur-sm border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Tasa de Retención</CardTitle>
            {getTrendIcon(analytics.retentionRate, 75)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.retentionRate}%</div>
            <p className="text-xs text-gray-400 mt-1">
              +3.5% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Tiempo de Sesión</CardTitle>
            {getTrendIcon(analytics.averageSessionTime, 22)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.averageSessionTime} min</div>
            <p className="text-xs text-gray-400 mt-1">
              +3.3 min vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Tasa de Conversión</CardTitle>
            {getTrendIcon(analytics.conversionRate, 10)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.conversionRate}%</div>
            <p className="text-xs text-gray-400 mt-1">
              +2.8% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-sm border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Usuarios Activos</CardTitle>
            <Activity className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,234</div>
            <p className="text-xs text-gray-400 mt-1">
              +12% vs período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Plays Chart */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Music className="h-5 w-5 text-purple-400" />
              Reproducciones Diarias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.dailyPlays.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      {new Date(day.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        style={{ width: `${(day.count / 250) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-white font-medium">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Crecimiento de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.userGrowth.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      {new Date(day.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${(day.count / 100) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-white font-medium">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Artists */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pink-400" />
              Artistas Más Escuchados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topArtists.map((artist, index) => (
                <div key={artist.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="text-sm text-white font-medium">{artist.name}</span>
                  </div>
                  <span className="text-sm text-gray-400">{artist.plays.toLocaleString()} reproducciones</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Genres */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Géneros Más Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topGenres.map((genre, index) => (
                <div key={genre.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="text-sm text-white font-medium">{genre.name}</span>
                  </div>
                  <span className="text-sm text-gray-400">{genre.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-black/20 backdrop-blur-sm border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Insights y Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <h4 className="font-semibold text-green-300 mb-2">✅ Tendencias Positivas</h4>
              <p className="text-sm text-gray-300">
                La retención de usuarios ha aumentado un 3.5% en el último período.
              </p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <h4 className="font-semibold text-blue-300 mb-2">📈 Oportunidades</h4>
              <p className="text-sm text-gray-300">
                El género Pop representa el 35% del contenido. Considera expandir la biblioteca.
              </p>
            </div>
            <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <h4 className="font-semibold text-orange-300 mb-2">🎯 Acciones Sugeridas</h4>
              <p className="text-sm text-gray-300">
                Implementa recomendaciones personalizadas para aumentar el tiempo de sesión.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics; 