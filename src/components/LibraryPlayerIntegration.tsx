import { useEffect } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';

export const LibraryPlayerIntegration = ({ children }: { children: React.ReactNode }) => {
  const { playTrack: playerPlayTrack } = usePlayer();
  const { addToRecentlyPlayed } = useLibrary();

  useEffect(() => {
    // Override the playTrack function to also add to recently played
    const originalPlayTrack = playerPlayTrack;
    
    const enhancedPlayTrack = (track: any) => {
      addToRecentlyPlayed(track);
      originalPlayTrack(track);
    };

    // This is a simplified approach - in a real app you'd want to use a more sophisticated method
    // to hook into the player state changes
  }, [playerPlayTrack, addToRecentlyPlayed]);

  return <>{children}</>;
};
