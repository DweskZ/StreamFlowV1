import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { LocalStorageCleanup } from '@/components/LocalStorageCleanup';
import PlaylistMenuTest from '@/components/PlaylistMenuTest';

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-6">
      <Header />
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Perfil de Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2"><strong>Email:</strong> {user.email}</p>
          </CardContent>
        </Card>
        
        {/* Componente de prueba para DropdownMenuSub */}
        <Card>
          <CardHeader>
            <CardTitle>Prueba de Menú de Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            <PlaylistMenuTest />
        

          </CardContent>
        </Card>
        
        {/* Herramienta de limpieza de localStorage (solo en desarrollo) */}
        <LocalStorageCleanup />
      </div>
    </div>
  );
}
