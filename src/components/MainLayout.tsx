import { Outlet } from 'react-router-dom';
import MusicPlayer from '@/components/AudioPlayer';
import Sidebar from '@/components/Sidebar';
import { usePlayer } from '@/contexts/PlayerContext';

export default function MainLayout() {
  const { currentTrack, nextTrack } = usePlayer();
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 text-white">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content with left margin to account for fixed sidebar */}
      <div className="ml-64 flex flex-col min-h-screen">
        <div className="flex-1 bg-gradient-to-b from-black/50 via-purple-900/10 to-black overflow-auto">
          <Outlet />
        </div>
        
        {/* Audio Player */}
        <div className="border-t border-purple-500/20 bg-black/90 backdrop-blur-sm">
          <MusicPlayer currentTrack={currentTrack} onEnded={nextTrack} />
        </div>
      </div>
    </div>
  );
}
