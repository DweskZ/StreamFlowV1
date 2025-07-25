import { useState, useEffect } from 'react';
import axios from 'axios';
import { JamendoTrack, JamendoResponse } from '@/types/jamendo';

const API_URL = 'https://api.jamendo.com/v3.0/tracks/';
const CLIENT_ID = 'e4782328';

export default function useTrendingSongs() {
  const [tracks, setTracks] = useState<JamendoTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<JamendoResponse>(API_URL, {
        params: {
          client_id: CLIENT_ID,
          format: 'json',
          order: 'popularity_total',
          limit: 10,
          audioformat: 'mp32'
        }
      });
      setTracks(response.data.results);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error cargando canciones';
      setError(message);
      console.error('useTrendingSongs', err);
    } finally {
      setLoading(false);
    }
  };

  const search = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<JamendoResponse>(API_URL, {
        params: {
          client_id: CLIENT_ID,
          format: 'json',
          search: query,
          limit: 10,
          audioformat: 'mp32'
        }
      });
      setTracks(response.data.results);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error buscando canciones';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  return { tracks, loading, error, search };
}
