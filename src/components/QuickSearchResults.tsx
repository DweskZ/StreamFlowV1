// components/QuickSearchResults.tsx
import { Track } from '@/types/music';
import { Play, Music, Loader2 } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { useNavigate } from 'react-router-dom';

interface QuickSearchResultsProps {
  results: Track[];
  loading: boolean;
  error: string | null;
  onSelectTrack?: () => void;
  query: string;
}

export default function QuickSearchResults({ 
  results, 
  loading, 
  error, 
  onSelectTrack,
  query 
}: QuickSearchResultsProps) {
  const { playTrack } = usePlayer();
  const { addToRecentlyPlayed } = useLibrary();
  const navigate = useNavigate();

  const handleTrackClick = (track: Track) => {
    playTrack(track);
    addToRecentlyPlayed(track);
    onSelectTrack?.();
  };

  const handleSeeAllResults = () => {
    navigate(`/app/search?q=${encodeURIComponent(query)}`);
    onSelectTrack?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
        <span className="ml-2 text-sm text-gray-400">Buscando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-4">
        <Music className="h-8 w-8 text-gray-500 mx-auto mb-2" />
        <p className="text-sm text-gray-400">No se encontraron resultados</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* Results header */}
      <div className="px-3 py-2 border-b border-purple-500/20">
        <h3 className="text-sm font-medium text-gray-300">
          Resultados para "{query}"
        </h3>
      </div>

      {/* Track results */}
      <div className="max-h-64 overflow-y-auto">
        {results.map((track, index) => (
          <button
            key={`${track.id}-${index}`}
            onClick={() => handleTrackClick(track)}
            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-purple-500/20 transition-colors group"
          >
            {/* Track image */}
            <div className="relative flex-shrink-0">
              <img
                src={track.image || track.album_image || '/placeholder.svg'}
                alt={track.name}
                className="w-10 h-10 rounded object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 bg-black/60 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {track.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {track.artist_name}
              </p>
            </div>

            {/* Duration */}
            <div className="text-xs text-gray-500">
              {Math.floor(parseInt(track.duration) / 60)}:
              {(parseInt(track.duration) % 60).toString().padStart(2, '0')}
            </div>
          </button>
        ))}
      </div>

      {/* See all results link */}
      {results.length >= 8 && (
        <div className="border-t border-purple-500/20 p-3">
          <button
            onClick={handleSeeAllResults}
            className="w-full text-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Ver todos los resultados
          </button>
        </div>
      )}
    </div>
  );
}
