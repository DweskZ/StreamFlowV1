// components/FavoritesTest.tsx
import React from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { Track } from '@/types/music';

// Track de prueba
const testTrack: Track = {
  id: 'test-track-001',
  name: 'Test Song',
  artist_name: 'Test Artist',
  artist_id: 'test-artist-001',
  album_name: 'Test Album',
  album_id: 'test-album-001',
  album_image: '/placeholder.svg',
  image: '/placeholder.svg',
  duration: '180',
  position: 1,
  releasedate: '2024-01-01',
  genre: 'Test',
  audiodownload: '',
  audiodlallowed: false,
  waveform: '',
  proaudio: '',
  tags: { genres: [], instruments: [], vartags: [] }
};

export default function FavoritesTest() {
  const { user } = useAuth();
  const { 
    likedSongs, 
    loading, 
    error, 
    addToLiked, 
    removeFromLiked, 
    isLiked 
  } = useFavorites();

  if (!user) {
    return (
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-yellow-400">⚠️ Debes iniciar sesión para probar los favoritos</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-lg space-y-4">
      <h2 className="text-xl font-bold text-white">🧪 Prueba de Favoritos con Supabase</h2>
      
      {/* Estado de carga */}
      {loading && (
        <div className="flex items-center gap-2 text-purple-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Cargando favoritos...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Información del usuario */}
      <div className="text-sm text-gray-400">
        <p><strong>Usuario:</strong> {user.email}</p>
        <p><strong>Total favoritos:</strong> {likedSongs.length}</p>
      </div>

      {/* Botón de prueba */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => isLiked(testTrack.id) ? removeFromLiked(testTrack.id) : addToLiked(testTrack)}
          variant={isLiked(testTrack.id) ? "destructive" : "default"}
          className="flex items-center gap-2"
        >
          <Heart className={`w-4 h-4 ${isLiked(testTrack.id) ? 'fill-current' : ''}`} />
          {isLiked(testTrack.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        </Button>
        <span className="text-sm text-gray-400">
          Canción de prueba: "{testTrack.name}"
        </span>
      </div>

      {/* Lista de favoritos */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-white mb-2">Favoritos actuales:</h3>
        {likedSongs.length === 0 ? (
          <p className="text-gray-400 italic">No hay canciones favoritas</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {likedSongs.map((track) => (
              <div key={track.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                <div>
                  <p className="text-white text-sm">{track.name}</p>
                  <p className="text-gray-400 text-xs">{track.artist_name}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFromLiked(track.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instrucciones */}
      <div className="text-xs text-gray-500 bg-gray-800/20 p-3 rounded">
        <p><strong>Instrucciones:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Haz clic en "Agregar a favoritos" para probar la funcionalidad</li>
          <li>Revisa la consola del navegador para ver logs de migración</li>
          <li>Verifica en Supabase Dashboard que los datos se guarden correctamente</li>
          <li>Recarga la página para verificar que los datos persistan</li>
        </ul>
      </div>
    </div>
  );
}
