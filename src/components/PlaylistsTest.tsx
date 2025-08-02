// components/PlaylistsTest.tsx
import React, { useState } from 'react';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PlaySquare, Loader2, Plus, Trash2, Music } from 'lucide-react';
import { Track } from '@/types/music';

// Track de prueba con todos los campos requeridos
const testTrack: Track = {
  id: 'test-playlist-track-001',
  name: 'Test Playlist Song',
  artist_name: 'Test Playlist Artist',
  artist_id: 'test-playlist-artist-001',
  artist_idstr: 'test-playlist-artist-001',
  album_name: 'Test Playlist Album',
  album_id: 'test-playlist-album-001',
  album_image: '/placeholder.svg',
  album_images: {
    size25: '/placeholder.svg',
    size50: '/placeholder.svg',
    size100: '/placeholder.svg',
    size130: '/placeholder.svg',
    size200: '/placeholder.svg',
    size300: '/placeholder.svg',
    size400: '/placeholder.svg',
    size500: '/placeholder.svg',
    size600: '/placeholder.svg',
  },
  license_ccurl: '',
  image: '/placeholder.svg',
  duration: '200',
  position: 1,
  releasedate: '2024-01-01',
  album_datecreated: '2024-01-01',
  prourl: '',
  shorturl: '',
  shareurl: '',
  audio: '/placeholder-audio.mp3',
  audiodownload: '',
  audiodlallowed: false,
  waveform: '',
  proaudio: '',
  tags: { genres: [], instruments: [], vartags: [] }
};

export default function PlaylistsTest() {
  const { user } = useAuth();
  const { 
    playlists, 
    loading, 
    error, 
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist
  } = usePlaylists();

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');

  if (!user) {
    return (
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-yellow-400">⚠️ Debes iniciar sesión para probar las playlists</p>
      </div>
    );
  }

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim()) {
      await createPlaylist(newPlaylistName.trim(), newPlaylistDescription.trim() || undefined);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
    }
  };

  return (
    <div className="p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-lg space-y-4">
      <h2 className="text-xl font-bold text-white">🧪 Prueba de Playlists con Supabase</h2>
      
      {/* Estado de carga */}
      {loading && (
        <div className="flex items-center gap-2 text-cyan-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Cargando playlists...</span>
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
        <p><strong>Total playlists:</strong> {playlists.length}</p>
      </div>

      {/* Crear nueva playlist */}
      <div className="space-y-2 p-4 bg-white/5 rounded-lg">
        <h3 className="text-white font-medium">Crear nueva playlist:</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Nombre de la playlist"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            className="bg-black/40 border-cyan-500/30 text-white"
          />
          <Input
            placeholder="Descripción (opcional)"
            value={newPlaylistDescription}
            onChange={(e) => setNewPlaylistDescription(e.target.value)}
            className="bg-black/40 border-cyan-500/30 text-white"
          />
          <Button
            onClick={handleCreatePlaylist}
            disabled={!newPlaylistName.trim()}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear
          </Button>
        </div>
      </div>

      {/* Lista de playlists */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Playlists actuales:</h3>
        {playlists.length === 0 ? (
          <p className="text-gray-400 italic">No hay playlists creadas</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="bg-white/5 border-cyan-500/20">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header de la playlist */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PlaySquare className="w-8 h-8 text-cyan-400" />
                        <div>
                          <h4 className="text-white font-medium">{playlist.name}</h4>
                          {playlist.description && (
                            <p className="text-gray-400 text-sm">{playlist.description}</p>
                          )}
                          <p className="text-gray-500 text-xs">
                            {playlist.tracks.length} canciones • 
                            Creada: {playlist.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletePlaylist(playlist.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Botón para agregar canción de prueba */}
                    <Button
                      size="sm"
                      onClick={() => addTrackToPlaylist(playlist.id, testTrack)}
                      className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar canción de prueba
                    </Button>

                    {/* Lista de tracks */}
                    {playlist.tracks.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-300">Canciones:</h5>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {playlist.tracks.map((track, index) => (
                            <div key={`${track.id}-${index}`} className="flex items-center justify-between p-2 bg-black/20 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <Music className="w-3 h-3 text-gray-400" />
                                <div>
                                  <p className="text-white">{track.name}</p>
                                  <p className="text-gray-400 text-xs">{track.artist_name}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeTrackFromPlaylist(playlist.id, track.id)}
                                className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Instrucciones */}
      <div className="text-xs text-gray-500 bg-gray-800/20 p-3 rounded">
        <p><strong>Instrucciones:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Crea una playlist nueva para probar la funcionalidad</li>
          <li>Agrega la canción de prueba a diferentes playlists</li>
          <li>Revisa la consola del navegador para ver logs de migración</li>
          <li>Verifica en Supabase Dashboard (user_playlists y playlist_tracks)</li>
          <li>Recarga la página para verificar que los datos persistan</li>
          <li>Elimina playlists para probar esa funcionalidad</li>
        </ul>
      </div>
    </div>
  );
}
