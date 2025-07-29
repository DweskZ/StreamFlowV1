import { useState, useEffect } from 'react';
import { JamendoResponse, JamendoTrack } from '@/types/jamendo';
import axios from 'axios';

// Usar el backend local en lugar de llamar directamente a Jamendo
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface UseJamendoAPIParams {
  order?: string;
  name?: string;
  tags?: string;
  limit?: number;
  offset?: number;
}

export const useJamendoAPI = (params: UseJamendoAPIParams = {}) => {
  const [tracks, setTracks] = useState<JamendoTrack[]>([]);
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

      console.log('🔍 Fetching from backend:', url);

      const response = await axios.get<JamendoResponse>(url, {
        timeout: 10000,
      });

      if (response.data.headers.status === 'success') {
        setTracks(response.data.results);
      } else {
        throw new Error(response.data.headers.error_message || 'Error al obtener canciones');
      }
    } catch (err: any) {
      console.error('❌ Error fetching tracks from backend:', err);
      setError(err.response?.data?.message || err.message || 'Error de conexión con el backend');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo auto-fetch para charts, no para búsquedas
    if (!params.name) {
      fetchTracks();
    }
  }, [params.limit, params.order]);

  return { 
    tracks, 
    loading, 
    error, 
    refetch: fetchTracks,
    fetchTracks // Añadir este método para búsquedas
  };
};

export const searchTracks = async (searchParams: UseJamendoAPIParams): Promise<JamendoTrack[]> => {
  try {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    
    let url = `${BACKEND_URL}/api`;
    
    if (searchParams.name) {
      // Búsqueda
      url += `/search?q=${encodeURIComponent(searchParams.name)}`;
      if (searchParams.limit) url += `&limit=${searchParams.limit}`;
    } else {
      // Charts por defecto
      url += `/chart`;
      if (searchParams.limit) url += `?limit=${searchParams.limit}`;
    }

    const response = await axios.get<JamendoResponse>(url, {
      timeout: 10000,
    });

    if (response.data.headers.status === 'success') {
      return response.data.results;
    } else {
      throw new Error(response.data.headers.error_message || 'Error al obtener canciones');
    }
  } catch (err: any) {
    console.error('❌ Error in searchTracks:', err);
    throw new Error(err.response?.data?.message || err.message || 'Error de conexión con el backend');
  }
};