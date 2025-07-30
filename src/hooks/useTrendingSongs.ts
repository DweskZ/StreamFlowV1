// hooks/useTrendingSongs.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Track, ApiResponse } from '@/types/music';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function useTrendingSongs() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching trending songs from backend...');
      const response = await axios.get<ApiResponse>(`${BACKEND_URL}/api/chart?limit=10`, {
        timeout: 10000,
      });

      if (response.data.headers.status === 'success') {
        setTracks(response.data.results);
      } else {
        throw new Error(response.data.headers.error_message || 'Error al obtener canciones trending');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Error cargando canciones trending';
      setError(message);
      console.error('❌ Error in useTrendingSongs:', err);
    } finally {
      setLoading(false);
    }
  };

  const search = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🔍 Searching for: "${query}" via backend...`);
      const response = await axios.get<ApiResponse>(
        `${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}&limit=10`,
        { timeout: 10000 }
      );

      if (response.data.headers.status === 'success') {
        setTracks(response.data.results);
      } else {
        throw new Error(response.data.headers.error_message || 'Error al buscar canciones');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Error buscando canciones';
      setError(message);
      console.error('❌ Error in search:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  return { tracks, loading, error, search };
}
