# 🎵 StreamFlow - Descubre Música Libre

StreamFlow es una aplicación web moderna para descubrir y reproducir música utilizando la API de Deezer a través de un backend Express personalizado. Ofrece una experiencia de usuario intuitiva con autenticación, gestión de playlists y un reproductor de audio integrado.

## 🚀 Características Principales

- 🎵 **Exploración de música** - Acceso a millones de canciones de Deezer
- 🔍 **Búsqueda avanzada** - Encuentra canciones, artistas y álbumes
- 🎧 **Reproductor integrado** - Con controles completos y cola de reproducción
- 👤 **Sistema de autenticación** - Con Supabase para gestión de usuarios
- ❤️ **Favoritos y playlists** - Guarda y organiza tu música
- 📱 **Diseño responsive** - Funciona perfectamente en todos los dispositivos
- 🎨 **UI moderna** - Interfaz elegante con Shadcn/ui y Tailwind CSS
- 🔄 **Backend robusto** - API Express con transformación automática de datos

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** + **TypeScript** - Framework principal
- **Vite** - Herramienta de construcción rápida
- **Tailwind CSS** - Framework de estilos
- **Shadcn/ui** - Componentes de UI modernos
- **React Router** - Navegación entre páginas
- **React Query** - Gestión de estado del servidor
- **Supabase** - Autenticación y base de datos

### Backend
- **Node.js** + **Express** - Servidor API
- **Axios** - Cliente HTTP para llamadas a Deezer
- **CORS** - Configuración de seguridad
- **Transformación de datos** - Compatibilidad con formato anterior

## 📦 Instalación y Configuración

### Requisitos Previos
- Node.js v16 o superior
- npm o yarn
- Git

### Instalación Rápida (Recomendado)

1. **Clona el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd StreamRefactor
   ```

2. **Ejecuta el script de instalación automática:**
   ```powershell
   ./start-streamflow.ps1
   ```
   
3. **Selecciona la opción 3** para iniciar frontend y backend simultáneamente

### Instalación Manual

```bash
# 1. Instalar dependencias del frontend
npm install

# 2. Instalar dependencias del backend
cd backend
npm install
cd ..

# 3. Configurar variables de entorno (opcional)
# Los archivos .env ya están configurados por defecto

# 4. Iniciar el backend (Terminal 1)
cd backend
npm run dev

# 5. Iniciar el frontend (Terminal 2)
npm run dev
```

### URLs de Desarrollo
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001
- **API Test:** http://localhost:3001/api/search?q=test

## 🎯 Scripts Disponibles

### Frontend
```bash
npm run dev              # Inicia servidor de desarrollo
npm run dev:backend      # Inicia solo el backend
npm run dev:full         # Inicia frontend y backend simultáneamente
npm run build            # Construye para producción
npm run preview          # Vista previa de producción
npm run lint             # Ejecuta el linter
```

### Backend
```bash
cd backend
npm run dev              # Inicia servidor de desarrollo
npm start                # Inicia en modo producción
npm test                 # Ejecuta tests de API
```

## 📁 Estructura del Proyecto

```
StreamRefactor/
├── src/                    # Código fuente del frontend
│   ├── components/         # Componentes reutilizables
│   │   ├── admin/         # Componentes de administración
│   │   ├── ui/            # Componentes de UI (Shadcn)
│   │   └── ...
│   ├── pages/             # Páginas de la aplicación
│   │   ├── Home.tsx       # Página principal
│   │   ├── Dashboard.tsx  # Panel principal
│   │   ├── SearchPage.tsx # Búsqueda de música
│   │   ├── Login.tsx      # Autenticación
│   │   └── ...
│   ├── contexts/          # Contextos de React
│   ├── hooks/             # Hooks personalizados
│   ├── types/             # Definiciones TypeScript
│   ├── lib/               # Utilidades
│   └── integrations/      # Integraciones externas
├── backend/               # Servidor Express
│   ├── routes/            # Rutas de la API
│   ├── config/            # Configuración
│   ├── utils/             # Utilidades del backend
│   └── server.js          # Servidor principal
├── supabase/              # Configuración de Supabase
├── Sqlscripts/            # Scripts de base de datos
├── Tests_and_scripts/     # Scripts de utilidad
│   └── fix-cors.ps1       # Solucionador de CORS
├── Docs/                  # Documentación
└── public/                # Archivos estáticos
```

## 🎵 Funcionalidades de la Aplicación

### Para Usuarios
- **Exploración de música** - Descubre canciones populares y nuevas
- **Búsqueda avanzada** - Encuentra música por título, artista o álbum
- **Reproductor de audio** - Escucha previews de canciones
- **Gestión de favoritos** - Guarda tus canciones favoritas
- **Playlists personalizadas** - Crea y gestiona tus listas de reproducción
- **Perfil de usuario** - Gestiona tu cuenta y preferencias
- **Sistema de suscripciones** - Planes premium disponibles

### Para Administradores
- **Panel de administración** - Gestión completa de usuarios y contenido
- **Gestión de usuarios** - Ver, editar y gestionar cuentas
- **Gestión de contenido** - Moderar y gestionar música
- **Estadísticas** - Métricas de uso de la aplicación

## 🔧 API Endpoints

### Música (Deezer API)
- `GET /api/search?q=<query>&limit=<number>` - Búsqueda de canciones
- `GET /api/track/:id` - Detalles de una canción
- `GET /api/chart?limit=<number>` - Top canciones
- `GET /api/artist/search?q=<query>` - Búsqueda de artistas
- `GET /api/artist/:id/albums` - Álbumes de un artista
- `GET /api/album/:id/tracks` - Canciones de un álbum

### Usuario (Supabase)
- `POST /api/user/favorites` - Agregar a favoritos
- `GET /api/user/favorites/:userId` - Obtener favoritos
- `DELETE /api/user/favorites/:userId/:trackId` - Eliminar favorito
- `POST /api/user/playlists` - Crear playlist
- `GET /api/user/playlists/:userId` - Obtener playlists

## 🛡️ Seguridad y Configuración

### CORS
El servidor tiene CORS configurado para permitir conexiones desde:
- `http://localhost:5173` (Vite)
- `http://localhost:3000` (React)

### Variables de Entorno
```env
# Frontend (.env)
VITE_BACKEND_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Backend (backend/.env)
PORT=3001
DEEZER_API_BASE_URL=https://api.deezer.com
```

## 🚧 Solución de Problemas

### Error de CORS
Si encuentras errores de CORS, ejecuta el script de diagnóstico:
```powershell
./Tests_and_scripts/fix-cors.ps1
```

### Backend no responde
1. Verifica que el backend esté corriendo en el puerto 3001
2. Ejecuta `cd backend && npm run dev`
3. Verifica que no haya conflictos de puerto

### Problemas de dependencias
```bash
# Limpiar e reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
cd backend && rm -rf node_modules package-lock.json && npm install
```

## 🚀 Despliegue

### Desarrollo Local
```bash
npm run dev:full
```

### Producción
```bash
# Construir frontend
npm run build

# Iniciar backend en producción
cd backend
npm start
```

## 📊 Estado del Proyecto

✅ **Completado:**
- Migración de Jamendo a Deezer API
- Sistema de autenticación con Supabase
- Reproductor de audio integrado
- Búsqueda y exploración de música
- Gestión de favoritos y playlists
- Panel de administración
- Diseño responsive
- Backend Express robusto

🚧 **En desarrollo:**
- Cache de respuestas para mejor rendimiento
- Rate limiting para protección de API
- Recomendaciones personalizadas
- Historial de reproducción
- Integración con más servicios de música

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa la documentación en `/Docs`
2. Ejecuta el script de diagnóstico CORS
3. Abre un issue en el repositorio

---

**¡Disfruta explorando música con StreamFlow! 🎵** 