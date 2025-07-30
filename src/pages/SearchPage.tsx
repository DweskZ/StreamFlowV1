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
  Disc3,
  Clock,
  X
} from 'lucide-react';
import { useLibrary } from '@/contexts/LibraryContext';
import { cn } from '@/lib/utils';

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
        setSearchError('No se encontraron resultados para tu búsqueda.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Error al buscar. Intenta de nuevo.');
      toast({
        title: "Error de búsqueda",
        description: "No se pudo completar la búsqueda. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

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

  const handleRecentSearchClick = (search: string) => {
    setSearchQuery(search);
    handleSearch(search);
  };

  const removeRecentSearch = (searchToRemove: string) => {
    const updated = recentSearches.filter(s => s !== searchToRemove);
    setRecentSearches(updated);
    localStorage.setItem('sf_recent_searches', JSON.stringify(updated));
  };

      if (selectedAlbum) {
      return (
        <AlbumPage 
          album={selectedAlbum} 
        />
      );
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-black">
      <div className="p-6 lg:p-8 space-y-8">
        {/* Search Header */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-white">Buscar</h1>
            <p className="text-gray-400 text-lg">Encuentra tu música favorita</p>
          </div>

          {/* Search Input */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar canciones, artistas, álbumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-12 pr-12 h-12 bg-black/40 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:shadow-glow-purple rounded-full text-lg"
            />
            {searchQuery && (
              <Button
                size="icon"
                variant="ghost"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search Results or Browse Content */}
        {searchQuery || searchResults.length > 0 || albumResults.length > 0 ? (
          <div className="space-y-6">
            {/* Search Results Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'tracks' | 'albums')} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-black/40 border-purple-500/30">
                <TabsTrigger value="tracks" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <Music className="h-4 w-4 mr-2" />
                  Canciones ({searchResults.length})
                </TabsTrigger>
                <TabsTrigger value="albums" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <Disc3 className="h-4 w-4 mr-2" />
                  Álbumes ({albumResults.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tracks" className="space-y-6 mt-6">
                {isSearching ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-purple-400">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Buscando canciones...</span>
                    </div>
                  </div>
                ) : searchError ? (
                  <Card className="bg-black/40 border-red-500/30">
                    <CardContent className="p-8 text-center">
                      <p className="text-red-400 mb-4">{searchError}</p>
                      <Button onClick={() => handleSearch(searchQuery)} variant="outline">
                        Intentar de nuevo
                      </Button>
                    </CardContent>
                  </Card>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {searchResults.map((track) => (
                      <TrackCard
                        key={track.id}
                        track={track}
                        onPlay={playTrack}
                        onAddToQueue={addToQueue}
                      />
                    ))}
                  </div>
                ) : null}
              </TabsContent>

              <TabsContent value="albums" className="space-y-6 mt-6">
                {isSearching ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-purple-400">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Buscando álbumes...</span>
                    </div>
                  </div>
                ) : searchError ? (
                  <Card className="bg-black/40 border-red-500/30">
                    <CardContent className="p-8 text-center">
                      <p className="text-red-400 mb-4">{searchError}</p>
                      <Button onClick={() => handleSearch(searchQuery)} variant="outline">
                        Intentar de nuevo
                      </Button>
                    </CardContent>
                  </Card>
                ) : albumResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                         {albumResults.map((album) => (
                       <AlbumCard
                         key={album.id}
                         album={album}
                         onPlay={() => {
                           if (album.tracks.length > 0) {
                             playTrack(album.tracks[0]);
                             album.tracks.slice(1).forEach(track => addToQueue(track));
                           }
                         }}
                         onAlbumClick={() => setSelectedAlbum(album)}
                       />
                     ))}
                  </div>
                ) : null}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Búsquedas Recientes</h2>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 8).map((search, index) => (
                    <div key={index} className="flex items-center gap-2 bg-black/40 border border-purple-500/30 rounded-full px-4 py-2 group hover:border-purple-400/50 transition-colors">
                      <button
                        onClick={() => handleRecentSearchClick(search)}
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        {search}
                      </button>
                      <button
                        onClick={() => removeRecentSearch(search)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Browse by Genre */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Explorar por Género</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {musicGenres.map((genre) => {
                  const Icon = genre.icon;
                  return (
                    <Card
                      key={genre.name}
                      className="group bg-black/40 backdrop-blur-sm border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-glow-purple/30 cursor-pointer hover:scale-105"
                      onClick={() => handleSearch('', genre.name)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-lg",
                          genre.color
                        )}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors">
                          {genre.name}
                        </h3>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Trending Searches */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Tendencias</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Rock Clásico', 'Synthwave', 'Jazz Moderno', 'Electrónica', 'Hip Hop', 'Pop'].map((trend) => (
                  <Card
                    key={trend}
                    className="group bg-black/40 backdrop-blur-sm border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 hover:shadow-glow-purple/30 cursor-pointer"
                    onClick={() => handleSearch(trend)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-purple-400" />
                        <span className="text-white group-hover:text-purple-300 transition-colors">
                          {trend}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
