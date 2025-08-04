# ADR-003: Arquitectura de Base de Datos

## Estado
Accepted

## Fecha
2024-01-25

## Participantes
- Equipo de Desarrollo (Backend)
- Arquitecto Principal
- DevOps Engineer

## Contexto

StreamFlow requiere una arquitectura de base de datos que soporte:

- **Gestión de usuarios** y autenticación
- **Catálogo de música** con metadatos complejos
- **Playlists** personales y colaborativas
- **Sistema de suscripciones** con diferentes planes
- **Historial de reproducción** y analytics
- **Búsqueda avanzada** con filtros múltiples
- **Escalabilidad** para crecimiento futuro
- **Performance** para consultas frecuentes
- **Seguridad** y privacidad de datos

La aplicación necesita:
- **Tiempo real** para sincronización entre dispositivos
- **Backup automático** y recuperación de desastres
- **Migraciones** seguras y versionadas
- **Monitoreo** y alertas
- **Cumplimiento** con regulaciones de privacidad

## Decisiones

**Se implementará una arquitectura de base de datos utilizando Supabase (PostgreSQL) como base principal con Row Level Security (RLS) para seguridad.**

### Arquitectura de Base de Datos

1. **Supabase PostgreSQL** como base de datos principal
2. **Row Level Security (RLS)** para seguridad a nivel de fila
3. **Índices optimizados** para consultas de búsqueda
4. **Triggers y funciones** para lógica de negocio
5. **Backup automático** y point-in-time recovery
6. **Real-time subscriptions** para sincronización

### Esquema de Base de Datos

```sql
-- Tabla de usuarios (extendida de auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  subscription_plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tracks
CREATE TABLE public.tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT NOT NULL,
  duration INTEGER NOT NULL, -- en segundos
  genre TEXT,
  album_image TEXT,
  audio_url TEXT NOT NULL,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de playlists
CREATE TABLE public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación playlist-tracks
CREATE TABLE public.playlist_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, track_id)
);

-- Tabla de likes
CREATE TABLE public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

-- Tabla de historial de reproducción
CREATE TABLE public.play_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_played INTEGER -- en segundos
);
```

## Alternativas Consideradas

### Alternativa 1: MongoDB + Atlas
- **Pros**:
  - Flexibilidad de esquema
  - Escalabilidad horizontal
  - JSON nativo
  - Atlas con features avanzadas
- **Contras**:
  - Menos maduro para relaciones complejas
  - Transacciones limitadas
  - Menos herramientas de SQL
  - Costo más alto para consultas complejas
- **Razón de rechazo**: Menos adecuado para datos relacionales y consultas complejas

### Alternativa 2: MySQL + PlanetScale
- **Pros**:
  - Base de datos relacional madura
  - PlanetScale con branching
  - Compatibilidad amplia
- **Contras**:
  - Menos features avanzadas que PostgreSQL
  - Configuración más compleja
  - Menos integración con autenticación
- **Razón de rechazo**: PostgreSQL ofrece más features avanzadas para las necesidades del proyecto

### Alternativa 3: Firebase Firestore
- **Pros**:
  - Integración completa con Google
  - Real-time por defecto
  - Escalabilidad automática
- **Contras**:
  - Costo alto para consultas complejas
  - Menos control sobre la base de datos
  - Vendor lock-in
  - Limitaciones en consultas complejas
- **Razón de rechazo**: Costo y limitaciones para consultas complejas de música

### Alternativa 4: PostgreSQL + AWS RDS
- **Pros**:
  - PostgreSQL completo
  - Control total
  - AWS ecosystem
- **Contras**:
  - Configuración compleja
  - Más responsabilidades de infraestructura
  - Costo de mantenimiento
- **Razón de rechazo**: Supabase ofrece PostgreSQL con menos overhead de configuración

## Consecuencias

### Positivas
- **PostgreSQL robusto**: Base de datos relacional madura y confiable
- **Row Level Security**: Seguridad granular a nivel de fila
- **Real-time**: Sincronización automática entre dispositivos
- **Escalabilidad**: Supabase maneja escalabilidad automáticamente
- **Herramientas integradas**: Auth, storage, y edge functions incluidos
- **SQL completo**: Todas las features de PostgreSQL disponibles
- **Backup automático**: Point-in-time recovery incluido

### Negativas
- **Vendor lock-in**: Dependencia de Supabase
- **Costo**: Puede ser costoso con alto volumen
- **Limitaciones**: Algunas limitaciones de Supabase
- **Menos control**: Menos control sobre configuración avanzada

### Neutrales
- **Curva de aprendizaje**: PostgreSQL requiere conocimiento de SQL
- **Comunidad**: Amplia comunidad de PostgreSQL

## Implementación

### Configuración de RLS

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.play_history ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para playlists
CREATE POLICY "Users can view public playlists" ON public.playlists
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own playlists" ON public.playlists
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create playlists" ON public.playlists
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own playlists" ON public.playlists
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own playlists" ON public.playlists
  FOR DELETE USING (auth.uid() = created_by);
```

### Índices Optimizados

```sql
-- Índices para búsqueda de tracks
CREATE INDEX idx_tracks_name ON public.tracks USING gin(to_tsvector('english', name));
CREATE INDEX idx_tracks_artist ON public.tracks USING gin(to_tsvector('english', artist_name));
CREATE INDEX idx_tracks_album ON public.tracks USING gin(to_tsvector('english', album_name));
CREATE INDEX idx_tracks_genre ON public.tracks(genre);

-- Índices para playlists
CREATE INDEX idx_playlists_created_by ON public.playlists(created_by);
CREATE INDEX idx_playlists_public ON public.playlists(is_public) WHERE is_public = true;

-- Índices para playlist_tracks
CREATE INDEX idx_playlist_tracks_playlist_id ON public.playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_position ON public.playlist_tracks(playlist_id, position);

-- Índices para likes
CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_likes_track_id ON public.likes(track_id);

-- Índices para play_history
CREATE INDEX idx_play_history_user_id ON public.play_history(user_id);
CREATE INDEX idx_play_history_played_at ON public.play_history(played_at DESC);
```

### Funciones y Triggers

```sql
-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at 
  BEFORE UPDATE ON public.playlists 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para incrementar play_count
CREATE OR REPLACE FUNCTION increment_play_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tracks 
  SET play_count = play_count + 1 
  WHERE id = NEW.track_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para play_count
CREATE TRIGGER increment_track_play_count
  AFTER INSERT ON public.play_history
  FOR EACH ROW EXECUTE FUNCTION increment_play_count();
```

### Configuración de Cliente

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

## Referencias

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security) 