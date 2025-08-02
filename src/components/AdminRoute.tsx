import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-black flex items-center justify-center">
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20 w-96">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
            <CardTitle className="text-white">Verificando permisos...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-400">Comprobando acceso de administrador</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si no es admin, mostrar página de acceso denegado
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-black flex items-center justify-center">
        <Card className="bg-black/20 backdrop-blur-sm border-red-500/20 w-96">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-white">Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400">
              No tienes permisos de administrador para acceder a esta página.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Se requieren privilegios de administrador</span>
            </div>
            <div className="pt-4">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors"
              >
                Volver
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si es admin, mostrar el contenido
  return <>{children}</>;
};

export default AdminRoute; 