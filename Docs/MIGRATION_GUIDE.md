# 🔄 Guía de Migración de Jamendo a Deezer

Esta guía te ayudará a migrar tu frontend de la API de Jamendo al nuevo backend con Deezer.

## 📋 Resumen de Cambios

### ✅ Lo que NO necesita cambios:
- Estructura de datos de las canciones (se mantiene igual)
- Componentes React existentes
- Contextos y estado global
- Interfaz de usuario

### 🔄 Lo que SÍ necesita cambios:
- Hook `useJamendoAPI` → `useDeezerAPI`
- URLs de API directas a Jamendo
- Configuración de endpoints

## 🚀 Pasos de Migración

### 1. Configurar variables de entorno

Agrega al archivo `.env` del frontend:
```env
VITE_BACKEND_URL=http://localhost:3001
```

### 2. Actualizar imports en los archivos

**Antes (Jamendo):**
```typescript
import { useJamendoAPI } from '@/hooks/useJamendoAPI';
```

**Después (Deezer):**
```typescript
import { useDeezerAPI } from '@/hooks/useDeezerAPI';
// O para transición gradual:
import { useJamendoAPI } from '@/hooks/useDeezerAPI'; // Alias disponible
```

### 3. Actualizar hooks en componentes

El nuevo hook mantiene la misma interfaz:

```typescript
// ✅ Esto sigue funcionando igual
const { tracks, loading, error, fetchTracks } = useDeezerAPI({
  limit: 10
});

// ✅ Para búsquedas
const handleSearch = (query: string) => {
  fetchTracks(query);
};

// ✅ Para charts/trending
const { tracks } = useDeezerCharts(10);
```

### 4. Archivos que necesitan actualización

| Archivo | Cambio Requerido |
|---------|------------------|
| `src/hooks/useTrendingSongs.ts` | Cambiar a `useDeezerCharts` |
| `src/pages/Home.tsx` | Actualizar import si usa búsqueda |
| `src/pages/StreamFlow.tsx` | Actualizar import del hook |
| Cualquier componente que haga búsquedas | Actualizar import |

### 5. Hooks especializados disponibles

```typescript
// Para detalles de una canción específica
import { useDeezerTrack } from '@/hooks/useDeezerAPI';
const { track, loading } = useDeezerTrack('123456');

// Para charts/trending
import { useDeezerCharts } from '@/hooks/useDeezerAPI';
const { tracks } = useDeezerCharts(20);

// Para búsqueda de artistas
import { useDeezerArtistSearch } from '@/hooks/useDeezerAPI';
const { artists, searchArtists } = useDeezerArtistSearch();
```

## 🔧 Configuración del Backend

### Iniciar el backend:
```bash
cd backend
npm install
npm run dev
```

El backend estará disponible en `http://localhost:3001`

### Verificar que funciona:
```bash
# En el navegador o con curl:
http://localhost:3001/
http://localhost:3001/api/search?q=coldplay
http://localhost:3001/api/chart
```

## 🧪 Testing de la Migración

### 1. Verificar backend
```bash
cd backend
node test-api.js
```

### 2. Verificar frontend
1. Iniciar el backend: `npm run dev` (en carpeta backend)
2. Iniciar el frontend: `npm run dev` (en carpeta raíz)
3. Probar búsquedas y navegación

### 3. Puntos de verificación
- ✅ Las búsquedas devuelven resultados
- ✅ Los charts se cargan correctamente
- ✅ El reproductor funciona con las previews
- ✅ Las imágenes de álbumes se muestran
- ✅ No hay errores de CORS

## 🔍 Debugging

### Backend no responde:
```bash
# Verificar que está corriendo:
curl http://localhost:3001/

# Ver logs en tiempo real:
cd backend && npm run dev
```

### Frontend no conecta:
1. Verificar `.env` con `VITE_BACKEND_URL`
2. Verificar CORS en `backend/server.js`
3. Revisar consola del navegador para errores

### Datos incorrectos:
- Los datos se transforman automáticamente de Deezer a formato Jamendo
- Si algo no funciona, revisar `transformDeezerTrack()` en `backend/routes/music.js`

## 📊 Nuevas Capacidades

Con el backend de Deezer tienes acceso a:

### Endpoints adicionales:
- `/api/artist/search` - Búsqueda de artistas
- `/api/artist/:id/albums` - Álbumes de un artista
- `/api/album/:id/tracks` - Canciones de un álbum

### Datos mejorados:
- Mejor calidad de imágenes de álbumes
- Rankings de popularidad
- Información de contenido explícito
- Mejores previews de audio

### Futuras funcionalidades preparadas:
- Sistema de favoritos (con Supabase)
- Playlists personalizadas
- Historial de reproducción

## 🚨 Troubleshooting Común

### Error de CORS
**Síntoma:** `Access to fetch at 'http://localhost:3001' from origin 'http://localhost:5173' has been blocked`

**Solución:** Verificar que el frontend está corriendo en puerto 5173 o agregar tu puerto al CORS en `backend/server.js`

### Backend no encuentra Deezer
**Síntoma:** Error 503 o timeout

**Solución:** Verificar conexión a internet y que `https://api.deezer.com` sea accesible

### Componentes no se actualizan
**Síntoma:** UI no refleja nuevos datos

**Solución:** Verificar que estás llamando a `fetchTracks()` o `refetch()` cuando es necesario

## 🎯 Rollback (Volver a Jamendo)

Si necesitas volver temporalmente a Jamendo:

1. Revertir imports a `useJamendoAPI` original
2. Comentar variable `VITE_BACKEND_URL` en `.env`
3. El código anterior seguirá funcionando

## 📞 Soporte

- **Logs del backend:** Revisar consola donde corre `npm run dev`
- **Test de endpoints:** Usar `backend/test-api.js`
- **Verificar datos:** Comparar respuestas en `http://localhost:3001/api/search?q=test`
