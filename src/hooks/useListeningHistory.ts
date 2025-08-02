import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Track } from '@/types/music';
import { supabase } from '@/integrations/supabase/client';

export const useListeningHistory = () => {
  const { user } = useAuth();

  const recordPlay = useCallback(async (track: Track, playDuration?: number, completed: boolean = false) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_listening_history')
        .insert({
          user_id: user.id,
          track_id: track.id,
          track_data: track,
          play_duration: playDuration || 180, // Default 3 minutes
          completed: completed,
          device_type: 'web',
          source_type: 'player',
          source_id: 'main-player'
        });

      if (error) {
        console.error('Error recording play history:', error);
      }
    } catch (error) {
      console.error('Error recording play history:', error);
    }
  }, [user]);

  const recordPlayStart = useCallback((track: Track) => {
    console.log('🎵 Registrando reproducción de:', track.name, 'por', track.artist_name);
    recordPlay(track, 0, false);
  }, [recordPlay]);

  const recordPlayComplete = useCallback((track: Track, duration: number) => {
    recordPlay(track, duration, true);
  }, [recordPlay]);

  return {
    recordPlay,
    recordPlayStart,
    recordPlayComplete
  };
};
