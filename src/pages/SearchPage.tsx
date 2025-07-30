import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { searchTracks, searchAlbums } from '@/hooks/useMusicAPI';
import { usePlayer } from '@/contexts/PlayerContext';
import { Track, Album } from '@/types/music';
import TrackCard from '@/components/TrackCardNew';
import AlbumCard from '@/components/AlbumCard';
import AlbumPage from '@/pages/AlbumPage';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Loader2, 
  Music, 
  Mic2, 
  Guitar, 
  Piano, 
  Drum,
  TrendingUp,
  Disc3
} from 'lucide-react';
import { useLibrary } from '@/contexts/LibraryContext';

const musicGenres = [
  { name: 'Pop', color: 'bg-pink-600', icon: Mic2 },
  { name: 'Rock', color: 'bg-red-600', icon: Guitar },
  { name: 'Hip Hop', color: 'bg-purple-600', icon: Mic2 },
  { name: 'Electronic', color: 'bg-blue-600', icon: Piano },
  { name: 'Jazz', color: 'bg-yellow-600', icon: Piano },
  { name: 'Classical', color: 'bg-green-600', icon: Piano },
  { name: 'R&B', color: 'bg-orange-600', icon: Mic2 },
  { name: 'Country', color: 'bg-amber-600', icon: Guitar },
  { name: 'Reggae', color: 'bg-emerald-600', icon: Guitar },
  { name: 'Folk', color: 'bg-teal-600', icon: Guitar },
  { name: 'Blues', color: 'bg-indigo-600', icon: Guitar },
  { name: 'Punk', color: 'bg-rose-600', icon: Drum }
];

const SearchPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [albumResults, setAlbumResults] = useState<Album[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'tracks' | 'albums'>('tracks');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const { addToRecentlyPlayed } = useLibrary();
  const { playTrack: playerPlayTrack, addToQueue } = usePlayer();

  const playTrack = useCallback((track: Track) => {
    addToRecentlyPlayed(track);
    playerPlayTrack(track);
  }, [addToRecentlyPlayed, playerPlayTrack]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sf_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('sf_recent_searches', JSON.stringify(updated));
  };

  const handleSearch = useCallback(async (query: string, genre?: string) => {
    if (!query.trim() && !genre) {
      setSearchResults([]);
      setAlbumResults([]);
      return;
    }

    const searchTerm = query.trim() || genre;
    if (!searchTerm) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const [trackResults, albumSearchResults] = await Promise.all([
        searchTracks(searchTerm),
        searchAlbums(searchTerm)
      ]);
      
      setSearchResults(trackResults);
      setAlbumResults(albumSearchResults);
      
      if (query.trim()) {
        saveRecentSearch(query.trim());
      }

      if (trackResults.length === 0 && albumSearchResults.length === 0) {
        toast({
          title: 'Sin resultados',
          description: `No se encontraron canciones ni álbumes para "${searchTerm}"`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error searching:', error);
      setSearchError('Error al buscar. Inténtalo de nuevo.');
      toast({
        title: 'Error de búsqueda',
        description: 'No se pudo realizar la búsqueda. Verifica tu conexión.',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast, recentSearches]);

  const playAlbum = useCallback((album: Album) => {
    if (album.tracks.length > 0) {
      playTrack(album.tracks[0]);
      album.tracks.slice(1).forEach(track => addToQueue(track));
    }
  }, [playTrack, addToQueue]);

  const handleAlbumClick = useCallback((album: Album) => {
    setSelectedAlbum(album);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setAlbumResults([]);
    setSearchError(null);
  };

  // Si estamos viendo un álbum, mostrar la página del álbum
  if (selectedAlbum) {
    return <AlbumPage album={selectedAlbum} />;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent">
          Buscar
        </h1>
        
        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="¿Qué quieres escuchar?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="pl-10 bg-black/30 border-neon-purple/30 text-foreground placeholder:text-muted-foreground focus:border-neon-purple focus:shadow-glow-purple transition-all"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-neon-purple transition-colors"
              onClick={clearSearch}
            >
              ×
            </Button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-neon-purple" />
            <span>Buscando...</span>
          </div>
        </div>
      )}

      {searchError && (
        <div className="text-center py-12">
          <div className="text-red-400 mb-2">{searchError}</div>
          <Button 
            variant="outline" 
            onClick={() => handleSearch(searchQuery)}
            className="border-neon-purple/30 text-muted-foreground hover:text-neon-purple hover:bg-neon-purple/10 transition-all"
          >
            Reintentar
          </Button>
        </div>
      )}

      {(searchResults.length > 0 || albumResults.length > 0) && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">
            Resultados para "{searchQuery || 'género seleccionado'}"
          </h2>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'tracks' | 'albums')}>
            <TabsList className="cyber-card border-neon bg-black/30">
              <TabsTrigger 
                value="tracks" 
                className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple text-muted-foreground"
              >
                <Music className="h-4 w-4 mr-2" />
                Canciones ({searchResults.length})
              </TabsTrigger>
              <TabsTrigger 
                value="albums"
                className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple text-muted-foreground"
              >
                <Disc3 className="h-4 w-4 mr-2" />
                Álbumes ({albumResults.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tracks" className="space-y-4">
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {searchResults.map((track, index) => (
                    <TrackCard
                      key={`${track.id}-${index}`}
                      track={track}
                      onPlay={() => playTrack(track)}
                      onAddToQueue={() => addToQueue(track)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="cyber-card border-neon">
                  <CardContent className="p-8 text-center">
                    <Music className="h-12 w-12 text-neon-purple/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No se encontraron canciones
                    </h3>
                    <p className="text-muted-foreground">
                      Intenta con otro término de búsqueda.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="albums" className="space-y-4">
              {albumResults.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {albumResults.map((album, index) => (
                    <AlbumCard
                      key={`${album.id}-${index}`}
                      album={album}
                      onPlay={() => playAlbum(album)}
                      onAlbumClick={() => handleAlbumClick(album)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="cyber-card border-neon">
                  <CardContent className="p-8 text-center">
                    <Disc3 className="h-12 w-12 text-neon-purple/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No se encontraron álbumes
                    </h3>
                    <p className="text-muted-foreground">
                      Intenta con otro término de búsqueda.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Show content only when not searching and no results */}
      {!isSearching && searchResults.length === 0 && albumResults.length === 0 && (
        <>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Búsquedas recientes</h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <Badge
                    key={search}
                    variant="outline"
                    className="cursor-pointer border-neon-purple/30 text-muted-foreground hover:text-neon-purple hover:bg-neon-purple/10 hover:border-neon-purple px-3 py-1 transition-all"
                    onClick={() => {
                      setSearchQuery(search);
                      handleSearch(search);
                    }}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Browse Categories */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Explorar géneros</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {musicGenres.map((genre) => {
                const Icon = genre.icon;
                return (
                  <Card
                    key={genre.name}
                    className={`${genre.color} border-0 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-glow-purple/50 group`}
                    onClick={() => handleSearch('', genre.name.toLowerCase())}
                  >
                    <CardContent className="p-6 relative overflow-hidden">
                      <h3 className="text-xl font-bold text-white mb-4">{genre.name}</h3>
                      <Icon className="absolute bottom-4 right-4 h-12 w-12 text-white/20 group-hover:text-white/40 transition-colors" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Popular Searches */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Búsquedas populares</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className="cyber-card border-neon hover:shadow-glow-purple/50 transition-all cursor-pointer group"
                onClick={() => handleSearch('trending music')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-neon-pink to-neon-purple rounded-lg flex items-center justify-center shadow-glow-purple/30">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-neon-purple transition-colors">Música Trending</h3>
                      <p className="text-sm text-muted-foreground">Lo más popular ahora</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cyber-card border-neon hover:shadow-glow-cyan/50 transition-all cursor-pointer group"
                onClick={() => handleSearch('new releases')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-lg flex items-center justify-center shadow-glow-cyan/30">
                      <Music className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-neon-cyan transition-colors">Nuevos Lanzamientos</h3>
                      <p className="text-sm text-muted-foreground">Lo último en música</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchPage;
