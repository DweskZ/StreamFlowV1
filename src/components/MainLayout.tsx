import { Outlet } from 'react-router-dom';
import FixedPlayerBar from '@/components/FixedPlayerBar';
import Sidebar from '@/components/Sidebar';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';

export default function MainLayout() {
  const { currentTrack, nextTrack, prevTrack } = usePlayer();
  const { user } = useAuth();
  
  const isAuthenticated = !!user;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 text-white">
      {/* Fixed Sidebar - only for authenticated users */}
      <Sidebar />
      
      {/* Main Content with conditional margins */}
      <div className={`${isAuthenticated ? 'ml-64' : ''} pb-24 min-h-screen`}>
        <div className="bg-gradient-to-b from-black/50 via-purple-900/10 to-black min-h-full">
          <Outlet />
        </div>
      </div>
      
      {/* Fixed Player Bar */}
      <FixedPlayerBar 
        currentTrack={currentTrack} 
        onEnded={nextTrack}
        onPrevious={prevTrack}
      />
    </div>
  );
}
