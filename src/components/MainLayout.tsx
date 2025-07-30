import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import FixedPlayerBar from '@/components/FixedPlayerBar';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function MainLayout() {
  const { currentTrack, nextTrack, prevTrack } = usePlayer();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const isAuthenticated = !!user;
  
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
      
      {/* Fixed Header */}
      <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      {/* Fixed Sidebar - only for authenticated users */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content with conditional margins and padding for header */}
      <div className={`${isAuthenticated ? 'lg:ml-64' : ''} pt-16 pb-24 min-h-screen`}>
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
