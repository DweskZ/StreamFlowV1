import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { searchTracks } from '@/hooks/useMusicAPI';
import { usePlayer } from '@/contexts/PlayerContext';
import { Track } from '@/types/music';
import TrackCard from '@/components/TrackCardNew';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Search, 
  Loader2, 
  Music, 
  Mic2, 
  Guitar, 
  Piano, 
  Drum,
  TrendingUp
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
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

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
      return;
    }

    const searchTerm = query.trim() || genre;
    if (!searchTerm) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await searchTracks(searchTerm);
      setSearchResults(results);
      
      if (query.trim()) {
        saveRecentSearch(query.trim());
      }

      if (results.length === 0) {
        toast({
          title: 'Sin resultados',
          description: `No se encontraron canciones para "${searchTerm}"`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error searching tracks:', error);
      setSearchError('Error al buscar canciones. Inténtalo de nuevo.');
      toast({
        title: 'Error de búsqueda',
        description: 'No se pudo realizar la búsqueda. Verifica tu conexión.',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast, recentSearches]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Buscar</h1>
        
        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="¿Qué quieres escuchar?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:ring-green-500 focus:border-green-500"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-zinc-400 hover:text-white"
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
          <div className="flex items-center gap-2 text-zinc-400">
            <Loader2 className="h-6 w-6 animate-spin" />
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
            className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            Reintentar
          </Button>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Resultados para "{searchQuery || 'género seleccionado'}"
          </h2>
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
        </div>
      )}

      {/* Show content only when not searching and no results */}
      {!isSearching && searchResults.length === 0 && (
        <>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Búsquedas recientes</h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 px-3 py-1"
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
            <h2 className="text-xl font-semibold text-white">Explorar géneros</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {musicGenres.map((genre) => {
                const Icon = genre.icon;
                return (
                  <Card
                    key={genre.name}
                    className={`${genre.color} border-0 cursor-pointer hover:scale-105 transition-transform group`}
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
            <h2 className="text-xl font-semibold text-white">Búsquedas populares</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-colors cursor-pointer group"
                onClick={() => handleSearch('trending music')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Música Trending</h3>
                      <p className="text-sm text-zinc-400">Lo más popular ahora</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-colors cursor-pointer group"
                onClick={() => handleSearch('new releases')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <Music className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Nuevos Lanzamientos</h3>
                      <p className="text-sm text-zinc-400">Lo último en música</p>
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
