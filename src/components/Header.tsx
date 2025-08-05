import { useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Bell, MoreHorizontal, User, Crown, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanInfo } from '@/hooks/useSubscription';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuickSearch } from '@/hooks/useQuickSearch';
import QuickSearchResults from '@/components/QuickSearchResults';

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Use quick search hook
  const { 
    query: searchQuery, 
    setQuery: setSearchQuery,
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    isOpen: showSearchResults,
    clearSearch,
    closeResults,
    openResults
  } = useQuickSearch();

  // Clear search when navigating away from search page
  useEffect(() => {
    if (!location.pathname.includes('/search')) {
      clearSearch();
    }
  }, [location.pathname, clearSearch]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        // Navigate to search page if no onSearch handler
        navigate(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
      closeResults();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      closeResults();
      searchInputRef.current?.blur();
    }
  };

  const handleSearchFocus = () => {
    openResults();
  };

  const handleSearchBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => closeResults(), 150);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    // Prevenir que el blur del input cierre el dropdown
    e.stopPropagation();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    clearSearch();
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
        <div className="flex-1 max-w-md mx-4 lg:mx-8 relative z-50">
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
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full text-muted-foreground hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

                               {/* Quick Search Results Dropdown */}
          {showSearchResults && (
            <div 
              className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black/95 backdrop-blur-xl border border-purple-500/30 rounded-lg shadow-xl z-50 max-h-[60vh] sm:max-h-[70vh] overflow-hidden w-[280px] sm:w-[320px] lg:w-[400px]"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleDropdownClick}
            >
              <QuickSearchResults
                results={searchResults}
                loading={searchLoading}
                error={searchError}
                query={searchQuery}
                onSelectTrack={closeResults}
              />
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
                 size="sm"
                 className="neon-button text-white font-medium"
               >
                 <Link to="/login">Iniciar</Link>
               </Button>
             </div>
          )}
        </div>
      </div>
    </header>
  );
}