import { Outlet } from 'react-router-dom';
import MusicPlayer from '@/components/AudioPlayer';
import { usePlayer } from '@/contexts/PlayerContext';

export default function MainLayout() {
  const { currentTrack, nextTrack } = usePlayer();
  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <Outlet />
      <MusicPlayer currentTrack={currentTrack} onEnded={nextTrack} />
    </div>
  );
}
