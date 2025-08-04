# ADR-002: Estrategia de Gestión de Estado

## Estado
Accepted

## Fecha
2024-01-20

## Participantes
- Equipo de Desarrollo (Desarrolladores Frontend)
- Arquitecto Principal

## Contexto

StreamFlow requiere una estrategia robusta de gestión de estado para manejar:

- **Estado de autenticación** del usuario
- **Estado del reproductor** (canción actual, volumen, progreso, cola)
- **Estado de la biblioteca** (playlists, canciones favoritas)
- **Estado de suscripción** (plan actual, características disponibles)
- **Estado de UI** (modales, navegación, loading states)
- **Estado de búsqueda** (resultados, filtros, historial)

La aplicación necesita:
- **Performance óptima** para reproducción de audio sin interrupciones
- **Sincronización** entre diferentes componentes
- **Persistencia** de ciertos estados
- **Escalabilidad** para futuras funcionalidades
- **Simplicidad** para facilitar el desarrollo y mantenimiento

## Decisiones

**Se implementará una estrategia híbrida de gestión de estado utilizando React Context API para estado global y useState/useReducer para estado local.**

### Arquitectura de Estado

1. **React Context API** para estado global compartido
2. **useState/useReducer** para estado local de componentes
3. **LocalStorage/SessionStorage** para persistencia de datos críticos
4. **Custom Hooks** para encapsular lógica de estado compleja

### Contextos Principales

- **AuthContext**: Autenticación y perfil de usuario
- **PlayerContext**: Estado del reproductor de audio
- **LibraryContext**: Playlists y biblioteca personal
- **SubscriptionContext**: Estado de suscripción
- **UIContext**: Estados de interfaz global

## Alternativas Consideradas

### Alternativa 1: Redux Toolkit
- **Pros**:
  - Gestión de estado muy robusta
  - DevTools excelentes
  - Patrones establecidos
  - Middleware para side effects
- **Contras**:
  - Overhead significativo
  - Curva de aprendizaje alta
  - Boilerplate excesivo para el tamaño del proyecto
  - Bundle size más grande
- **Razón de rechazo**: Overhead innecesario para las necesidades actuales del proyecto

### Alternativa 2: Zustand
- **Pros**:
  - API simple y minimalista
  - Bundle size pequeño
  - TypeScript nativo
  - Fácil de aprender
- **Contras**:
  - Menos maduro que otras soluciones
  - DevTools limitados
  - Patrones menos establecidos
- **Razón de rechazo**: Madurez insuficiente para un proyecto de producción

### Alternativa 3: Jotai/Recoil
- **Pros**:
  - Estado atómico
  - Performance excelente
  - React concurrent features
- **Contras**:
  - Paradigma diferente al tradicional
  - Curva de aprendizaje
  - Ecosistema más pequeño
- **Razón de rechazo**: Complejidad innecesaria para el equipo actual

### Alternativa 4: Zustand + React Query
- **Pros**:
  - Combinación poderosa
  - Separación clara de responsabilidades
  - Cache inteligente
- **Contras**:
  - Dos librerías para aprender
  - Configuración más compleja
  - Overhead adicional
- **Razón de rechazo**: Complejidad excesiva para las necesidades actuales

## Consecuencias

### Positivas
- **Simplicidad**: React Context es nativo y fácil de entender
- **Bundle size mínimo**: No hay dependencias adicionales
- **TypeScript nativo**: Integración perfecta con TypeScript
- **Flexibilidad**: Fácil de extender y modificar
- **Performance**: React Context optimizado en React 18
- **Mantenibilidad**: Código más simple y directo

### Negativas
- **Re-renders**: Posibles re-renders innecesarios si no se optimiza
- **DevTools limitados**: Menos herramientas de debugging que Redux
- **Escalabilidad**: Puede volverse complejo con mucho estado
- **Boilerplate**: Requiere más código manual para optimizaciones

### Neutrales
- **Aprendizaje**: React Context es estándar, pero requiere buenas prácticas
- **Comunidad**: Amplio soporte, pero menos herramientas especializadas

## Implementación

### Estructura de Contextos

```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
}

// src/contexts/PlayerContext.tsx
interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  queue: Track[];
  play: (track: Track) => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
}

// src/contexts/LibraryContext.tsx
interface LibraryContextType {
  playlists: Playlist[];
  likedSongs: Track[];
  isLoading: boolean;
  createPlaylist: (name: string, description?: string) => Promise<void>;
  addToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  toggleLike: (trackId: string) => Promise<void>;
}
```

### Custom Hooks

```typescript
// src/hooks/useAuth.ts
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// src/hooks/usePlayer.ts
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};
```

### Optimizaciones

```typescript
// Memoización de context values
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const value = useMemo(() => ({
    user,
    isLoading,
    signIn: async (email: string, password: string) => {
      // implementación
    },
    signOut: async () => {
      // implementación
    },
    signUp: async (email: string, password: string, name: string) => {
      // implementación
    }
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Persistencia

```typescript
// Persistencia de estado crítico
const usePersistedState = <T>(key: string, defaultValue: T) => {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setPersistedState = useCallback((value: T) => {
    setState(value);
    localStorage.setItem(key, JSON.stringify(value));
  }, [key]);

  return [state, setPersistedState] as const;
};
```

## Referencias

- [React Context Documentation](https://react.dev/learn/passing-data-deeply-with-context)
- [React Hooks Documentation](https://react.dev/reference/react)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Local Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) 