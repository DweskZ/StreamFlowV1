// hooks/useMusicAPI.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Track, Album, ApiResponse } from '@/types/music';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface UseMusicAPIParams {
  name?: string;
  limit?: number;
}

export const useMusicAPI = (params: UseMusicAPIParams = {}) => {
  const [tracks, setTracks] = useState<Track[]>([]);
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

      const response = await axios.get<ApiResponse>(url, { timeout: 10000 });

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
  }, [params.name, params.limit]);

  return { tracks, loading, error, refetch: fetchTracks };
};

export const searchTracks = async (query: string): Promise<Track[]> => {
  const url = `${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}`;
  const response = await axios.get<ApiResponse>(url);
  if (response.data.headers.status === 'success') {
    return response.data.results;
  }
  throw new Error('Error al buscar canciones');
};

export const getAlbumsFromTracks = (tracks: Track[]): Album[] => {
  const albumMap = new Map<string, Album>();

  tracks.forEach(track => {
    if (!albumMap.has(track.album_id)) {
      const albumTracks = tracks.filter(t => t.album_id === track.album_id);
      const sortedTracks = [...albumTracks].sort((a, b) => a.position - b.position);
      const totalDuration = albumTracks.reduce((total, t) => total + (parseInt(t.duration) || 0), 0);
      
      albumMap.set(track.album_id, {
        id: track.album_id,
        name: track.album_name,
        artist_id: track.artist_id,
        artist_name: track.artist_name,
        image: track.album_image || track.image,
        releasedate: track.releasedate,
        tracks: sortedTracks,
        totalTracks: albumTracks.length,
        duration: formatDuration(totalDuration)
      });
    }
  });

  return Array.from(albumMap.values()).sort((a, b) => 
    new Date(b.releasedate).getTime() - new Date(a.releasedate).getTime()
  );
};

const formatDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  }
  return `${minutes} min`;
};

export const searchAlbums = async (query: string): Promise<Album[]> => {
  const tracks = await searchTracks(query);
  return getAlbumsFromTracks(tracks);
};
