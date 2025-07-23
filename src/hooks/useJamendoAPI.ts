import { useState, useEffect } from 'react';
import { JamendoResponse, JamendoTrack } from '@/types/jamendo';

const BASE_URL = 'https://api.jamendo.com/v3.0/tracks/';
const CLIENT_ID = 'e4782328';

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

  const fetchTracks = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('client_id', CLIENT_ID);
      queryParams.append('format', 'json');
      queryParams.append('audioformat', 'mp32');
      queryParams.append('limit', (params.limit || 20).toString());
      queryParams.append('offset', (params.offset || 0).toString());
      
      if (params.order) queryParams.append('order', params.order);
      if (params.name) queryParams.append('name', params.name);
      if (params.tags) queryParams.append('tags', params.tags);

      const response = await fetch(`${BASE_URL}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: JamendoResponse = await response.json();
      
      if (data.headers.code !== 0) {
        throw new Error(data.headers.error_message || 'Error en la API de Jamendo');
      }

      setTracks(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar las canciones');
      console.error('Error fetching tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [JSON.stringify(params)]);

  return { tracks, loading, error, refetch: fetchTracks };
};

export const searchTracks = async (searchParams: UseJamendoAPIParams): Promise<JamendoTrack[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append('client_id', CLIENT_ID);
  queryParams.append('format', 'json');
  queryParams.append('audioformat', 'mp32');
  queryParams.append('limit', (searchParams.limit || 20).toString());
  queryParams.append('offset', (searchParams.offset || 0).toString());
  
  if (searchParams.order) queryParams.append('order', searchParams.order);
  if (searchParams.name) queryParams.append('name', searchParams.name);
  if (searchParams.tags) queryParams.append('tags', searchParams.tags);

  const response = await fetch(`${BASE_URL}?${queryParams}`);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const data: JamendoResponse = await response.json();
  
  if (data.headers.code !== 0) {
    throw new Error(data.headers.error_message || 'Error en la API de Jamendo');
  }

  return data.results;
};