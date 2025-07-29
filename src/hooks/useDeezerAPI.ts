import { useState, useEffect } from 'react';
import axios from 'axios';

// URL base del backend local
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface UseDeezerAPIParams {
  order?: string;
  name?: string;
  tags?: string;
  limit?: number;
  offset?: number;
}

interface DeezerTrack {
  id: string;
  name: string;
  duration: string;
  artist_id: string;
  artist_name: string;
  artist_idstr: string;
  album_id: string;
  album_name: string;
  album_image: string;
  album_images: {
    size25: string;
    size50: string;
    size100: string;
    size130: string;
    size200: string;
    size300: string;
    size400: string;
    size500: string;
    size600: string;
  };
  license_ccurl: string;
  position: number;
  releasedate: string;
  album_datecreated: string;
  prourl: string;
  shorturl: string;
  shareurl: string;
  waveform: string;
  image: string;
  audio: string;
  audiodownload: string;
  proaudio: string;
  audiodlallowed: boolean;
  tags: {
    genres: string[];
    instruments: string[];
    vartags: string[];
  };
  // Campos adicionales de Deezer
  deezer_id?: number;
  rank?: number;
  explicit_lyrics?: boolean;
}

interface DeezerResponse {
  headers: {
    status: string;
    code: number;
    error_message: string;
    warnings: string;
    results_fullcount: number;
  };
  results: DeezerTrack[];
}

// Hook principal para reemplazar useJamendoAPI
export const useDeezerAPI = (params: UseDeezerAPIParams = {}) => {
  const [tracks, setTracks] = useState<DeezerTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracks = async (searchQuery?: string) => {
    setLoading(true);
    setError(null);

    try {
      let url = `${BACKEND_URL}/api`;
      
      if (searchQuery || params.name) {
        // Búsqueda
        const query = searchQuery || params.name || '';
        url += `/search?q=${encodeURIComponent(query)}`;
        if (params.limit) url += `&limit=${params.limit}`;
      } else {
        // Charts por defecto
        url += `/chart`;
        if (params.limit) url += `?limit=${params.limit}`;
      }

      console.log('🔍 Fetching from:', url);

      const response = await axios.get<DeezerResponse>(url, {
        timeout: 10000,
      });

      if (response.data.headers.status === 'success') {
        setTracks(response.data.results);
      } else {
        throw new Error(response.data.headers.error_message || 'Error al obtener canciones');
      }
    } catch (err: any) {
      console.error('❌ Error fetching tracks:', err);
      setError(err.response?.data?.message || err.message || 'Error de conexión');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch en mount o cuando cambian los parámetros
  useEffect(() => {
    fetchTracks();
  }, [params.limit, params.order]); // Solo auto-fetch para charts

  return {
    tracks,
    loading,
    error,
    fetchTracks,
    refetch: fetchTracks
  };
};

// Hook para obtener detalles de una canción específica
export const useDeezerTrack = (trackId: string | null) => {
  const [track, setTrack] = useState<DeezerTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrack = async () => {
    if (!trackId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<DeezerResponse>(
        `${BACKEND_URL}/api/track/${trackId}`,
        { timeout: 10000 }
      );

      if (response.data.headers.status === 'success' && response.data.results.length > 0) {
        setTrack(response.data.results[0]);
      } else {
        throw new Error('Canción no encontrada');
      }
    } catch (err: any) {
      console.error('❌ Error fetching track:', err);
      setError(err.response?.data?.message || err.message || 'Error al obtener la canción');
      setTrack(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrack();
  }, [trackId]);

  return {
    track,
    loading,
    error,
    refetch: fetchTrack
  };
};

// Hook para canciones trending/charts
export const useDeezerCharts = (limit: number = 10) => {
  const [tracks, setTracks] = useState<DeezerTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCharts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<DeezerResponse>(
        `${BACKEND_URL}/api/chart?limit=${limit}`,
        { timeout: 10000 }
      );

      if (response.data.headers.status === 'success') {
        setTracks(response.data.results);
      } else {
        throw new Error(response.data.headers.error_message || 'Error al obtener charts');
      }
    } catch (err: any) {
      console.error('❌ Error fetching charts:', err);
      setError(err.response?.data?.message || err.message || 'Error de conexión');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharts();
  }, [limit]);

  return {
    tracks,
    loading,
    error,
    refetch: fetchCharts
  };
};

// Hook para búsqueda de artistas
export const useDeezerArtistSearch = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchArtists = async (query: string, limit: number = 10) => {
    if (!query.trim()) {
      setArtists([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/artist/search?q=${encodeURIComponent(query)}&limit=${limit}`,
        { timeout: 10000 }
      );

      if (response.data.headers.status === 'success') {
        setArtists(response.data.results);
      } else {
        throw new Error(response.data.headers.error_message || 'Error al buscar artistas');
      }
    } catch (err: any) {
      console.error('❌ Error searching artists:', err);
      setError(err.response?.data?.message || err.message || 'Error de conexión');
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    artists,
    loading,
    error,
    searchArtists
  };
};

// Función utilitaria para verificar si el backend está disponible
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/`, { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

// Exportaciones para compatibilidad con el código existente
export { useDeezerAPI as useJamendoAPI }; // Alias para transición gradual
export type { DeezerTrack as JamendoTrack, DeezerResponse as JamendoResponse };
