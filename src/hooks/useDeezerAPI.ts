import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface UseDeezerAPIParams {
  order?: string;
  name?: string;
  tags?: string;
  limit?: number;
  offset?: number;
}

export interface DeezerTrack {
  id: string;
  name: string;
  duration: string;
  artist_id: string;
  artist_name: string;
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

// Hook para obtener canciones
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
        const query = searchQuery || params.name || '';
        url += `/search?q=${encodeURIComponent(query)}`;
        if (params.limit) url += `&limit=${params.limit}`;
      } else {
        url += `/chart`;
        if (params.limit) url += `?limit=${params.limit}`;
      }

      const response = await axios.get<DeezerResponse>(url, { timeout: 10000 });

      if (response.data.headers.status === 'success') {
        setTracks(response.data.results);
      } else {
        throw new Error(response.data.headers.error_message || 'Error al obtener canciones');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [params.limit, params.order]);

  return { tracks, loading, error, refetch: fetchTracks };
};

// Obtener detalle de canción por ID
export const useDeezerTrack = (trackId: string | null) => {
  const [track, setTrack] = useState<DeezerTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrack = async () => {
    if (!trackId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<DeezerResponse>(`${BACKEND_URL}/api/track/${trackId}`, { timeout: 10000 });

      if (response.data.headers.status === 'success' && response.data.results.length > 0) {
        setTrack(response.data.results[0]);
      } else {
        throw new Error('Canción no encontrada');
      }
    } catch (err: any) {
      setError(err.message || 'Error al obtener la canción');
      setTrack(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrack();
  }, [trackId]);

  return { track, loading, error, refetch: fetchTrack };
};

// Búsqueda directa sin hook
export const searchTracks = async (query: string): Promise<DeezerTrack[]> => {
  const response = await axios.get<DeezerResponse>(`${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}`);
  if (response.data.headers.status === 'success') {
    return response.data.results;
  }
  throw new Error('Error al buscar canciones');
};

// Hook para artistas
export const useDeezerArtistSearch = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchArtists = async (query: string, limit = 10) => {
    if (!query.trim()) {
      setArtists([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${BACKEND_URL}/api/artist/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
        timeout: 10000,
      });

      if (response.data.headers.status === 'success') {
        setArtists(response.data.results);
      } else {
        throw new Error(response.data.headers.error_message || 'Error al buscar artistas');
      }
    } catch (err: any) {
      setError(err.message || 'Error al buscar artistas');
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  return { artists, loading, error, searchArtists };
};

export interface PlaylistTrack extends DeezerTrack {
  addedAt: Date;
}


// Check de estado del backend
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/`, { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
};
