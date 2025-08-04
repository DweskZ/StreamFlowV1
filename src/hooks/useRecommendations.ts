import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { Track } from '@/types/music';
import { supabase } from '@/integrations/supabase/client';

interface RecommendationSection {
  id: string;
  title: string;
  description: string;
  tracks: Track[];
  loading: boolean;
  error?: string;
}

interface UserStats {
  favoriteArtists: string[];
  totalPlays: number;
  totalTimeListened: number;
}

export const useRecommendations = () => {
  const { user } = useAuth();
  const { likedSongs, recentlyPlayed } = useLibrary();
  const [recommendations, setRecommendations] = useState<RecommendationSection[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Analizar estadísticas del usuario
  const analyzeUserStats = useCallback(async (): Promise<UserStats> => {
    if (!user) {
      return {
        favoriteArtists: [],
        totalPlays: 0,
        totalTimeListened: 0
      };
    }

    try {
      // Obtener historial de reproducción
      const { data: historyData, error: historyError } = await supabase
        .from('user_listening_history')
        .select('track_data')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(100);

      if (historyError) {
        console.error('Error fetching listening history:', historyError);
        return {
          favoriteArtists: [],
          totalPlays: 0,
          totalTimeListened: 0
        };
      }

      // Analizar artistas
      const artistCount: { [key: string]: number } = {};
      let totalPlays = 0;

      historyData?.forEach(record => {
        const track = record.track_data as Track;
        totalPlays++;

        // Contar artistas
        if (track.artist_name) {
          artistCount[track.artist_name] = (artistCount[track.artist_name] || 0) + 1;
        }
      });

      // Obtener top artistas
      const favoriteArtists = Object.entries(artistCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([artist]) => artist);

      return {
        favoriteArtists,
        totalPlays,
        totalTimeListened: totalPlays * 180 // Estimación de 3 minutos por canción
      };
         } catch (error) {
       console.error('Error analyzing user stats:', error);
       return {
         favoriteArtists: [],
         totalPlays: 0,
         totalTimeListened: 0
       };
     }
  }, [user]);

  // Buscar canciones por género
  const searchTracksByGenre = useCallback(async (genre: string, limit: number = 10): Promise<Track[]> => {
    try {
      console.log(`🔍 Buscando canciones de género: ${genre}`);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/recommendations/genre/${encodeURIComponent(genre)}?limit=${limit}`);
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        console.log(`✅ Encontradas ${data.results.length} canciones para ${genre}`);
        return data.results;
      } else {
        console.log(`⚠️ No se encontraron canciones para ${genre}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ Error searching tracks for genre ${genre}:`, error);
      return [];
    }
  }, []);

  // Buscar canciones por artista
  const searchTracksByArtist = useCallback(async (artist: string, limit: number = 10): Promise<Track[]> => {
    try {
      console.log(`🎤 Buscando canciones del artista: ${artist}`);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/recommendations/artist/${encodeURIComponent(artist)}?limit=${limit}`);
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        console.log(`✅ Encontradas ${data.results.length} canciones para ${artist}`);
        return data.results;
      } else {
        console.log(`⚠️ No se encontraron canciones para ${artist}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ Error searching tracks for artist ${artist}:`, error);
      return [];
    }
  }, []);

  // Obtener tendencias globales
  const getTrendingTracks = useCallback(async (limit: number = 10): Promise<Track[]> => {
    try {
      console.log(`📈 Obteniendo tendencias globales`);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/recommendations/trending?limit=${limit}`);
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        console.log(`✅ Encontradas ${data.results.length} tendencias`);
        return data.results;
      } else {
        console.log(`⚠️ No se encontraron tendencias`);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching trending tracks:', error);
      return [];
    }
  }, []);

  // Generar recomendaciones
  const generateRecommendations = useCallback(async () => {
    if (!user) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Analizar estadísticas del usuario
      const stats = await analyzeUserStats();
      setUserStats(stats);

             const sections: RecommendationSection[] = [];

       // 1. Basado en tu historial (solo si hay datos)
       if (stats.favoriteArtists.length > 0) {
         const topArtist = stats.favoriteArtists[0];
         const artistTracks = await searchTracksByArtist(topArtist, 8);
         
         if (artistTracks.length > 0) {
           sections.push({
             id: 'based-on-history',
             title: 'Basado en tu historial',
             description: `Más música de ${topArtist}`,
             tracks: artistTracks,
             loading: false
           });
         }
       }

       // 2. Tendencias para ti (SIEMPRE mostrar)
       const trendingTracks = await getTrendingTracks(8);
       if (trendingTracks.length > 0) {
         sections.push({
           id: 'trending-for-you',
           title: 'Tendencias para ti',
           description: 'Lo que está sonando ahora',
           tracks: trendingTracks,
           loading: false
         });
       }

       // 3. Géneros populares (SIEMPRE mostrar)
       const popularGenres = ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Latin'];
       // sonar:disable-next-line:typescript:S2245 -- Uso no crítico para selección aleatoria de géneros
       const randomGenre = popularGenres[Math.floor(Math.random() * popularGenres.length)];
       const popularTracks = await searchTracksByGenre(randomGenre, 8);
       
       if (popularTracks.length > 0) {
         sections.push({
           id: 'popular-genres',
           title: 'Géneros populares',
           description: `Descubre ${randomGenre}`,
           tracks: popularTracks,
           loading: false
         });
       }

       // 4. Artistas destacados (SIEMPRE mostrar)
       const featuredArtists = ['Ed Sheeran', 'Taylor Swift', 'Drake', 'Bad Bunny', 'The Weeknd'];
       // sonar:disable-next-line:typescript:S2245 -- Uso no crítico para selección aleatoria de artistas
       const randomArtist = featuredArtists[Math.floor(Math.random() * featuredArtists.length)];
       const artistTracks = await searchTracksByArtist(randomArtist, 8);
       
       if (artistTracks.length > 0) {
         sections.push({
           id: 'featured-artists',
           title: 'Artistas destacados',
           description: `Descubre ${randomArtist}`,
           tracks: artistTracks,
           loading: false
         });
       }

      console.log('🎵 Recomendaciones generadas:', sections.length, 'secciones');
      console.log('📊 Estadísticas del usuario:', stats);
      setRecommendations(sections);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [user, analyzeUserStats, searchTracksByGenre, searchTracksByArtist, getTrendingTracks]);

  // Cargar recomendaciones solo cuando cambie el usuario o se solicite explícitamente
  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]); // Removido likedSongs y recentlyPlayed

  // Función para actualizar recomendaciones basadas en el historial actual
  const updateRecommendationsFromHistory = useCallback(async () => {
    console.log('🔄 Actualizando recomendaciones basadas en historial actual...');
    await generateRecommendations();
  }, [generateRecommendations]);

  return {
    recommendations,
    userStats,
    loading,
    refreshRecommendations: generateRecommendations,
    updateRecommendationsFromHistory
  };
}; 