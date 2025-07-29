# StreamFlow Backend API

Backend Express.js para la aplicación StreamFlow Music Discovery que utiliza la API pública de Deezer.

## 🚀 Instalación y Configuración

### Requisitos
- Node.js (v16 o superior)
- npm o yarn

### Instalación
```bash
cd backend
npm install
```

### Configuración
1. Copia el archivo `.env` y ajusta las variables si es necesario:
   - `PORT`: Puerto del servidor (por defecto 3001)
   - `DEEZER_API_BASE_URL`: URL base de la API de Deezer

### Ejecutar en desarrollo
```bash
npm run dev
```

### Ejecutar en producción
```bash
npm start
```

## 📚 Endpoints Disponibles

### Música (Deezer API)

#### 🔍 Búsqueda de canciones
```
GET /api/search?q=<query>&limit=<number>
```
- **q**: Término de búsqueda (requerido)
- **limit**: Número de resultados (opcional, máximo 25, por defecto 10)

**Ejemplo:**
```
GET /api/search?q=coldplay&limit=5
```

#### 🎵 Detalles de una canción
```
GET /api/track/:id
```
- **id**: ID de la canción en Deezer

**Ejemplo:**
```
GET /api/track/3135556
```

#### 📈 Top canciones (Chart)
```
GET /api/chart?limit=<number>
```
- **limit**: Número de resultados (opcional, máximo 25, por defecto 10)

**Ejemplo:**
```
GET /api/chart?limit=10
```

#### 👤 Búsqueda de artistas
```
GET /api/artist/search?q=<query>&limit=<number>
```

#### 💿 Álbumes de un artista
```
GET /api/artist/:id/albums?limit=<number>
```

#### 🎵 Canciones de un álbum
```
GET /api/album/:id/tracks
```

### Usuario (Futuras funcionalidades)

#### ⭐ Favoritos
```
POST /api/user/favorites          # Agregar a favoritos
GET /api/user/favorites/:userId   # Obtener favoritos
DELETE /api/user/favorites/:userId/:trackId  # Eliminar favorito
```

#### 📝 Playlists
```
POST /api/user/playlists         # Crear playlist
GET /api/user/playlists/:userId  # Obtener playlists
```

*Nota: Los endpoints de usuario están preparados pero no implementados. Se implementarán cuando se decida usar Supabase para almacenar datos de usuario.*

## 🔄 Formato de Respuesta

Todas las respuestas siguen el formato compatible con el frontend existente:

```json
{
  "headers": {
    "status": "success",
    "code": 200,
    "error_message": "",
    "warnings": "",
    "results_fullcount": 10
  },
  "results": [
    {
      "id": "3135556",
      "name": "Something Just Like This",
      "duration": "247",
      "artist_name": "The Chainsmokers",
      "album_name": "Memories...Do Not Open",
      "album_image": "https://...",
      "audio": "https://...",
      // ... más campos
    }
  ]
}
```

## 🔧 Transformación de Datos

El backend transforma automáticamente los datos de Deezer al formato esperado por el frontend, manteniendo compatibilidad con la estructura anterior de Jamendo.

### Campos mapeados:
- `deezer.title` → `name`
- `deezer.artist.name` → `artist_name`
- `deezer.album.title` → `album_name`
- `deezer.album.cover_*` → `album_images.*`
- `deezer.preview` → `audio`
- Y muchos más...

## 🛠️ CORS

El servidor tiene CORS configurado para permitir conexiones desde:
- `http://localhost:5173` (Vite)
- `http://localhost:3000` (React)

## 📝 Logs

El servidor muestra logs útiles en consola:
- 🔍 Búsquedas realizadas
- 🎵 Canciones solicitadas
- 📈 Solicitudes de charts
- ❌ Errores con detalles

## 🚧 Próximas Mejoras

1. **Autenticación de usuarios** con Supabase
2. **Sistema de favoritos** persistente
3. **Playlists personalizadas**
4. **Historial de reproducción**
5. **Recomendaciones personalizadas**
6. **Cache de respuestas** para mejorar rendimiento
7. **Rate limiting** para proteger la API

## 🔐 Seguridad

- Validación de parámetros de entrada
- Manejo de errores apropiado
- Límites en el número de resultados
- CORS configurado correctamente

## 📊 Estado del Proyecto

✅ **Implementado:**
- Búsqueda de canciones
- Detalles de canciones
- Top charts
- Búsqueda de artistas
- Álbumes y canciones de álbumes
- Transformación de datos compatible

🚧 **En desarrollo:**
- Sistema de usuarios con Supabase
- Favoritos y playlists
- Cache y optimizaciones
