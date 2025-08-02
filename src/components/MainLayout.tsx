import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FixedPlayerBar from '@/components/FixedPlayerBar';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function MainLayout() {
  const { 
    currentTrack, 
    nextTrack, 
    prevTrack, 
    isRepeatMode, 
    isShuffleMode, 
    autoPlayEnabled,
    toggleRepeat, 
    toggleShuffle,
    toggleAutoPlay
  } = usePlayer();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  const isAuthenticated = !!user;
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20 text-white">
      {/* Mobile Sidebar Overlay */}
      {isAuthenticated && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Fixed Header - hidden for admin routes */}
      {!isAdminRoute && (
        <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      )}
      
      {/* Fixed Sidebar - hidden for admin routes */}
      {!isAdminRoute && (
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      )}
      
      {/* Main Content with conditional margins and padding */}
      <div className={`${isAuthenticated && !isAdminRoute ? 'lg:ml-64' : ''} ${!isAdminRoute ? 'pt-16 pb-24' : 'pt-0 pb-0'} min-h-screen`}>
        <div className={`min-h-full ${!isAdminRoute ? 'bg-gradient-to-b from-black/50 via-purple-900/10 to-black' : ''}`}>
          <Outlet />
        </div>
      </div>
      
      {/* Fixed Player Bar - hidden for admin routes */}
      {!isAdminRoute && (
        <FixedPlayerBar 
          currentTrack={currentTrack} 
          onEnded={nextTrack}
          onNext={nextTrack}
          onPrevious={prevTrack}
          isRepeatMode={isRepeatMode}
          isShuffleMode={isShuffleMode}
          autoPlayEnabled={autoPlayEnabled}
          onToggleRepeat={toggleRepeat}
          onToggleShuffle={toggleShuffle}
          onToggleAutoPlay={toggleAutoPlay}
        />
      )}
    </div>
  );
}
