import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Music, 
  PlaySquare, 
  BarChart3, 
  Settings,
  TrendingUp,
  Activity,
  Shield,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Componentes de las secciones
import AdminOverview from '@/components/admin/AdminOverview';
import UserManagement from '@/components/admin/UserManagement';
import ContentManagement from '@/components/admin/ContentManagement';
import Analytics from '@/components/admin/Analytics';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { signOut } = useAuth();

  const navigationItems = [
    {
      id: 'overview',
      label: 'Vista General',
      icon: BarChart3,
      description: 'Estadísticas generales de la aplicación'
    },
    {
      id: 'users',
      label: 'Gestión de Usuarios',
      icon: Users,
      description: 'Administrar usuarios y suscripciones'
    },
    {
      id: 'content',
      label: 'Gestión de Contenido',
      icon: Music,
      description: 'Moderar playlists y contenido'
    },
    {
      id: 'analytics',
      label: 'Análisis',
      icon: TrendingUp,
      description: 'Reportes y métricas detalladas'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-black">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Panel de Administración</h1>
                <p className="text-sm sm:text-base text-gray-400">Gestiona tu aplicación de música</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-sm">
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Configuración</span>
              <span className="sm:hidden">Config</span>
            </Button>
            <Button 
              variant="outline" 
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <span className="sm:hidden">Salir</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 lg:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-black/20 backdrop-blur-sm border border-white/10 p-1">
            {navigationItems.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                <item.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">
                  {item.id === 'overview' && 'General'}
                  {item.id === 'users' && 'Usuarios'}
                  {item.id === 'content' && 'Contenido'}
                  {item.id === 'analytics' && 'Análisis'}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Analytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard; 