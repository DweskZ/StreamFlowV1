/**
 * Configuración del backend StreamFlow
 */

export const config = {
  // Configuración del servidor
  server: {
    port: process.env.PORT || 3001,
    cors: {
      origins: [
        'http://localhost:5173', // Vite
        'http://localhost:3000', // React/Next.js
        'http://localhost:4173', // Vite preview
      ]
    }
  },

  // Configuración de Deezer API
  deezer: {
    baseUrl: process.env.DEEZER_API_BASE_URL || 'https://api.deezer.com',
    defaultLimit: 10,
    maxLimit: 25,
    timeout: 10000 // 10 segundos
  },

  // Configuración de Supabase (para futuro)
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    tables: {
      favorites: 'user_favorites',
      playlists: 'user_playlists',
      playlistTracks: 'playlist_tracks'
    }
  },

  // Configuración de logs
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableRequestLogging: process.env.NODE_ENV !== 'test'
  },

  // Configuración de cache (para futuro)
  cache: {
    ttl: 300, // 5 minutos
    maxSize: 100 // máximo 100 entradas
  }
};

export default config;
