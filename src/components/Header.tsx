import { useState } from 'react';
import { Search, Music, Zap, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onSearch?: (query: string, genre?: string) => void;
}

const GENRES = [
  { value: 'all', label: 'Todos los géneros' },
  { value: 'rock', label: 'Rock' },
  { value: 'pop', label: 'Pop' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'classical', label: 'Classical' },
  { value: 'folk', label: 'Folk' },
  { value: 'hip-hop', label: 'Hip-Hop' },
  { value: 'ambient', label: 'Ambient' },
  { value: 'instrumental', label: 'Instrumental' },
];

export default function Header({ onSearch }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  const handleSearch = () => {
    if (!onSearch) return;
    const genre = selectedGenre === 'all' ? '' : selectedGenre;
    onSearch(searchQuery, genre);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className="cyber-card border-purple-500/20 sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl shadow-glow-purple">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div className="absolute inset-0 bg-purple-500/20 rounded-xl blur-lg" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
              StreamFlow
            </h1>
          </div>

          {onSearch && (
            <div className="flex items-center gap-3 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
                <Input
                  placeholder="Buscar en las dimensiones sonoras..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 bg-black/20 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:shadow-glow-purple transition-all"
                />
              </div>

              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-48 bg-black/20 border-purple-500/30 text-white hover:border-purple-400 transition-colors">
                  <SelectValue placeholder="Frecuencia" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-purple-500/30 backdrop-blur-xl">
                  {GENRES.map((genre) => (
                    <SelectItem 
                      key={genre.value} 
                      value={genre.value}
                      className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20"
                    >
                      {genre.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={handleSearch} 
                className="neon-button text-white font-semibold"
              >
                <Zap className="w-4 h-4 mr-2" />
                Escanear
              </Button>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400 hidden md:block">
              <span className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                Neural Audio ∞
              </span>
            </div>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <Link to="/profile" className="text-purple-300 hover:text-white transition-colors">
                    {user.email?.split('@')[0]}
                  </Link>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={signOut}
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:text-white transition-all"
                >
                  Desconectar
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm"
                  className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 hover:shadow-glow-cyan transition-all"
                >
                  <Link to="/login">Conectar</Link>
                </Button>
                <Button 
                  asChild 
                  size="sm"
                  className="neon-button text-white font-semibold"
                >
                  <Link to="/login">
                    <Zap className="w-4 h-4 mr-2" />
                    Registro Neural
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}