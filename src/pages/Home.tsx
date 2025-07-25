import { useCallback } from 'react';
import Header from '@/components/Header';
import TrackCard from '@/components/TrackCard';
import MusicPlayer from '@/components/AudioPlayer';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useTrendingSongs from '@/hooks/useTrendingSongs';

export default function Home() {
  const { tracks, loading, error, search } = useTrendingSongs();
  const { currentTrack, playTrack, addToQueue, nextTrack } = usePlayer();

  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      search(query.trim());
    }
  }, [search]);

  const artistsMap = new Map<string, { name: string; image: string }>();
  tracks.forEach(t => {
    if (!artistsMap.has(t.artist_id)) {
      artistsMap.set(t.artist_id, { name: t.artist_name, image: t.album_image || t.image });
    }
  });
  const artists = Array.from(artistsMap.values()).slice(0, 6);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <Header onSearch={handleSearch} />
      <section className="bg-card text-center py-16 border-b border-border">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Bienvenido a StreamFlow</h2>
        <p className="text-muted-foreground mb-6">Regístrate para escuchar música completa y crea tus playlists</p>
        <Button asChild variant="spotify" size="lg">
          <a href="/login">Registrarse</a>
        </Button>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-12">
        <div>
          <h3 className="text-2xl font-bold mb-4">Canciones Populares</h3>
          {loading && <p>Cargando...</p>}
          {error && <p className="text-destructive mb-4">{error}</p>}
          <div className="space-y-3">
            {tracks.map(track => (
              <TrackCard
                key={track.id}
                track={track}
                onPlay={playTrack}
                onAddToQueue={addToQueue}
                isPlaying={currentTrack?.id === track.id}
              />
            ))}
          </div>
        </div>

        {artists.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-4">Artistas Populares</h3>
            <div className="flex flex-wrap gap-6">
              {artists.map((artist, idx) => (
                <div key={idx} className="flex flex-col items-center w-24">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={artist.image || '/placeholder.svg'} />
                    <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="mt-2 text-sm text-center truncate">{artist.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <MusicPlayer currentTrack={currentTrack} onEnded={nextTrack} />
    </div>
  );
}
