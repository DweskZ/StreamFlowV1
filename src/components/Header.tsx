import { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Bell, MoreHorizontal, User, Settings, Crown, Menu, X, Music, Mic, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanInfo } from '@/hooks/useSubscription';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  readonly onSearch?: (query: string) => void;
  readonly onToggleSidebar?: () => void;
  readonly isSidebarOpen?: boolean;
}

export default function Header({ onSearch, onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { isPremium } = usePlanInfo();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Popular search suggestions
  const searchSuggestions = [
    { icon: Music, text: 'Rock clásico', category: 'Género' },
    { icon: TrendingUp, text: 'Tendencias 2024', category: 'Popular' },
    { icon: Mic, text: 'Duran Duran', category: 'Artista' },
    { icon: Music, text: 'Synthwave', category: 'Género' },
    { icon: TrendingUp, text: 'Nuevos lanzamientos', category: 'Popular' },
  ];

  // Clear search when navigating away from search page
  useEffect(() => {
    if (!location.pathname.includes('/search')) {
      setSearchQuery('');
      setShowSearchSuggestions(false);
    }
  }, [location.pathname]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        // Navigate to search page if no onSearch handler
        navigate(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
      setShowSearchSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSearchSuggestions(false);
      searchInputRef.current?.blur();
    }
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchQuery.trim()) {
      setShowSearchSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSearchSuggestions(false), 200);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchSuggestions(value.trim().length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    if (onSearch) {
      onSearch(suggestion);
    } else {
      navigate(`/app/search?q=${encodeURIComponent(suggestion)}`);
    }
    setShowSearchSuggestions(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchSuggestions(false);
    searchInputRef.current?.focus();
  };

  const goBack = () => {
    navigate(-1);
  };

  const goForward = () => {
    navigate(1);
  };

  const isSearchPage = location.pathname.includes('/search');

  return (
    <header className={`fixed top-0 right-0 h-16 bg-cyber-gradient border-b border-neon backdrop-blur-glass z-40 transition-all duration-300 ${user ? 'lg:left-64 left-0' : 'left-0'}`}>
      <div className="h-full px-4 lg:px-6 flex items-center justify-between max-w-screen-2xl mx-auto">
        
        {/* LEFT - Mobile menu button and Navigation buttons */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          {user && onToggleSidebar && (
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onToggleSidebar}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300 lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          
          {/* Navigation buttons - hidden on mobile when sidebar is open */}
          <div className={`flex items-center gap-2 ${user && isSidebarOpen ? 'hidden' : ''}`}>
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
        </div>

        {/* CENTER - Enhanced Search bar */}
        <div className="flex-1 max-w-md mx-4 lg:mx-8 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
            <Input
              ref={searchInputRef}
              placeholder={isSearchPage ? "Buscar canciones, artistas, álbumes..." : "¿Qué quieres reproducir?"}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="pl-10 pr-10 bg-black/30 border-neon-purple/30 text-foreground placeholder:text-muted-foreground focus:border-neon-purple focus:shadow-glow-purple transition-all rounded-full"
            />
            {searchQuery && (
              <Button
                size="icon"
                variant="ghost"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full text-muted-foreground hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Search Suggestions Dropdown */}
          {showSearchSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-purple-500/30 rounded-lg shadow-xl z-50">
              <div className="p-2">
                {/* Recent searches or suggestions */}
                <div className="space-y-1">
                  {searchSuggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-purple-500/20 rounded-md transition-all duration-200 group"
                      >
                        <Icon className="h-4 w-4 text-purple-400 group-hover:text-purple-300" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{suggestion.text}</div>
                          <div className="text-xs text-gray-500">{suggestion.category}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Quick search options */}
                <div className="border-t border-purple-500/20 mt-2 pt-2">
                  <div className="text-xs text-gray-500 px-3 py-1 mb-1">Búsqueda rápida</div>
                  <div className="flex flex-wrap gap-2">
                    {['Rock', 'Pop', 'Electrónica', 'Jazz'].map((genre) => (
                      <button
                        key={genre}
                        onClick={() => handleSuggestionClick(genre)}
                        className="px-3 py-1 text-xs bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-full transition-colors"
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT - Actions and user */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Quick Search Button - visible when not on search page */}
          {!isSearchPage && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate('/app/search')}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300"
              title="Ir a búsqueda"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          {/* Notification button - hidden on mobile */}
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-neon-cyan hover:shadow-glow-cyan transition-all duration-300 relative hidden sm:flex"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-neon-pink rounded-full animate-pulse"></span>
          </Button>

          {/* More options - hidden on mobile */}
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-neon-purple hover:shadow-glow-purple transition-all duration-300 hidden sm:flex"
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
                  <span className="text-sm text-foreground font-medium hidden lg:block">
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
                  {!isPremium && (
                    <Link
                      to="/app/pricing"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300 rounded transition-all duration-300"
                    >
                      <Crown className="w-4 h-4" />
                      Actualizar Plan
                    </Link>
                  )}
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
                className="text-neon-cyan hover:text-neon-cyan/80 hover:bg-neon-cyan/10 transition-all duration-300 hidden sm:flex"
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