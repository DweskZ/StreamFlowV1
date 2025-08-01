// hooks/useQuickSearch.ts
import { useState, useEffect, useCallback } from 'react';
import { searchTracks } from './useMusicAPI';
import { Track } from '@/types/music';

export const useQuickSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const tracks = await searchTracks(query);
        setResults(tracks.slice(0, 8)); // Limit to 8 results for quick search
        setIsOpen(true);
      } catch (err: any) {
        setError(err.message || 'Error al buscar');
        setResults([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setError(null);
  }, []);

  const closeResults = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openResults = useCallback(() => {
    if (results.length > 0) {
      setIsOpen(true);
    }
  }, [results.length]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    isOpen,
    clearSearch,
    closeResults,
    openResults
  };
};
