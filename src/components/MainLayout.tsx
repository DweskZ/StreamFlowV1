import { Outlet } from 'react-router-dom';
import FixedPlayerBar from '@/components/FixedPlayerBar';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';

export default function MainLayout() {
  const { currentTrack, nextTrack, prevTrack } = usePlayer();
  const { user } = useAuth();
  
  const isAuthenticated = !!user;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 text-white">
      {/* Fixed Header */}
      <Header />
      
      {/* Fixed Sidebar - only for authenticated users */}
      <Sidebar />
      
      {/* Main Content with conditional margins and padding for header */}
      <div className={`${isAuthenticated ? 'ml-64' : ''} pt-16 pb-24 min-h-screen`}>
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
