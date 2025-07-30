import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Bell, MoreHorizontal, User, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  readonly onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (!onSearch) return;
    onSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  const goForward = () => {
    navigate(1);
  };

  return (
    <header className={`fixed top-0 right-0 h-16 bg-cyber-gradient border-b border-neon backdrop-blur-glass z-40 ${user ? 'left-64' : 'left-0'} transition-all duration-300`}>
      <div className="h-full px-6 flex items-center justify-between max-w-screen-2xl mx-auto">
        
        {/* LEFT - Navigation buttons */}
        <div className="flex items-center gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={goBack}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={goForward}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* CENTER - Search bar */}
        {onSearch && (
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="¿Qué quieres reproducir?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 bg-black/30 border-neon-purple/30 text-foreground placeholder:text-muted-foreground focus:border-neon-purple focus:shadow-glow-purple transition-all rounded-full"
              />
            </div>
          </div>
        )}

        {/* RIGHT - Actions and user */}
        <div className="flex items-center gap-3">
          {/* Notification button */}
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-neon-cyan hover:shadow-glow-cyan transition-all duration-300 relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-neon-pink rounded-full animate-pulse"></span>
          </Button>

          {/* More options */}
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {/* User section */}
          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 rounded-full pl-2 pr-3 py-1 hover:bg-neon-purple/20 hover:shadow-glow-purple transition-all duration-300"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-neon-purple to-neon-pink text-white text-xs">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground font-medium hidden md:block">
                    {user.email?.split('@')[0]}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 cyber-card border-neon backdrop-blur-glass" side="bottom" align="end">
                <div className="space-y-2">
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-neon-purple/20">
                    Mi cuenta
                  </div>
                  <Link 
                    to="/profile"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-neon-purple/20 hover:text-neon-purple rounded transition-all duration-300"
                  >
                    <User className="w-4 h-4" />
                    Perfil
                  </Link>
                  <button
                    className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-neon-purple/20 hover:text-neon-purple rounded transition-all duration-300 w-full text-left"
                  >
                    <Settings className="w-4 h-4" />
                    Configuración
                  </button>
                  <div className="border-t border-neon-purple/20 pt-2">
                    <button
                      onClick={signOut}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-red-500/20 hover:text-red-400 rounded transition-all duration-300 w-full text-left"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                asChild 
                variant="ghost" 
                size="sm"
                className="text-neon-cyan hover:text-neon-cyan/80 hover:bg-neon-cyan/10 transition-all duration-300"
              >
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button 
                asChild 
                size="sm"
                className="neon-button text-white font-medium"
              >
                <Link to="/login">Registrarse</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}