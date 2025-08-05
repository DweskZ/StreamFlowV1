// components/PlaylistPlaybackTest.tsx
import { useState } from 'react';
import { useLibrary } from '@/contexts/LibraryContext';
import { usePlaylistPlayback } from '@/hooks/usePlaylistPlayback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Shuffle, TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const PlaylistPlaybackTest = () => {
  const { playlists } = useLibrary();
  const { playPlaylist, shufflePlayPlaylist, enrichTrackData } = usePlaylistPlayback();
  const [testResults, setTestResults] = useState<{
    [playlistId: string]: {
      status: 'pending' | 'success' | 'error';
      message: string;
      tracksWithAudio: number;
      totalTracks: number;
    };
  }>({});

  const testPlaylist = async (playlist: any) => {
    setTestResults(prev => ({
      ...prev,
      [playlist.id]: {
        status: 'pending',
        message: 'Probando playlist...',
        tracksWithAudio: 0,
        totalTracks: playlist.tracks.length
      }
    }));

    try {
      // Enriquecer todos los tracks de la playlist
      const enrichedTracks = await Promise.all(
        playlist.tracks.map(async (track: any) => await enrichTrackData(track))
      );

      // Contar tracks con audio válido
      const tracksWithAudio = enrichedTracks.filter(track => 
        track.audio && track.audio.trim() !== ''
      ).length;

      const status = tracksWithAudio > 0 ? 'success' : 'error';
      const message = tracksWithAudio > 0 
        ? `${tracksWithAudio}/${playlist.tracks.length} canciones reproducibles`
        : 'No hay canciones reproducibles';

      setTestResults(prev => ({
        ...prev,
        [playlist.id]: {
          status,
          message,
          tracksWithAudio,
          totalTracks: playlist.tracks.length
        }
      }));
    } catch (error) {
      console.error('❌ Error probando playlist:', error);
      setTestResults(prev => ({
        ...prev,
        [playlist.id]: {
          status: 'error',
          message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          tracksWithAudio: 0,
          totalTracks: playlist.tracks.length
        }
      }));
    }
  };

  const testAllPlaylists = async () => {
    for (const playlist of playlists) {
      await testPlaylist(playlist);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-400 animate-pulse" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'pending':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TestTube className="h-5 w-5 text-purple-400" />
            Prueba de Reproducción de Playlists
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={testAllPlaylists}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Probar Todas las Playlists
            </Button>
          </div>

          <div className="text-sm text-gray-400">
            Esta herramienta verifica que todas las canciones en tus playlists guardadas tengan la información de audio necesaria para la reproducción.
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {playlists.map((playlist) => {
          const result = testResults[playlist.id];
          return (
            <Card 
              key={playlist.id} 
              className={`bg-black/40 border-purple-500/30 ${
                result?.status === 'success' ? 'border-green-500/30' : 
                result?.status === 'error' ? 'border-red-500/30' : 
                result?.status === 'pending' ? 'border-yellow-500/30' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-white mb-1">{playlist.name}</h3>
                    <p className="text-sm text-gray-400">
                      {playlist.tracks.length} canción{playlist.tracks.length !== 1 ? 'es' : ''}
                    </p>
                    {result && (
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusIcon(result.status)}
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(result.status)}`}>
                          {result.message}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => testPlaylist(playlist)}
                      variant="outline"
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      Probar
                    </Button>
                    
                                         {result?.status === 'success' && (
                       <>
                         <Button
                           size="sm"
                                                       onClick={async () => {
                              try {
                                await playPlaylist(playlist.tracks, 0);
                              } catch (error) {
                                console.error('Error en reproducción:', error);
                              }
                            }}
                           className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500"
                         >
                           <Play className="h-3 w-3 mr-1" />
                           Reproducir
                         </Button>
                         <Button
                           size="sm"
                                                       onClick={async () => {
                              try {
                                await shufflePlayPlaylist(playlist.tracks);
                              } catch (error) {
                                console.error('Error en reproducción mezclada:', error);
                              }
                            }}
                           variant="outline"
                           className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                         >
                           <Shuffle className="h-3 w-3 mr-1" />
                           Mezclar
                         </Button>
                       </>
                     )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {playlists.length === 0 && (
        <Card className="bg-black/40 border-purple-500/30">
          <CardContent className="p-8 text-center">
            <TestTube className="h-12 w-12 text-purple-400/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No hay playlists para probar
            </h3>
            <p className="text-gray-400 text-sm">
              Crea algunas playlists y agrega canciones para poder probar la reproducción.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 