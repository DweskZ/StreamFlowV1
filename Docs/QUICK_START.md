# 🎵 StreamFlow Backend - Guía Rápida

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)
```powershell
# En la raíz del proyecto
./start-streamflow.ps1
```

### Opción 2: Manual

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## 📡 Endpoints Principales

| Endpoint | Descripción | Ejemplo |
|----------|-------------|---------|
| `GET /api/search?q=query` | Buscar canciones | `/api/search?q=coldplay&limit=5` |
| `GET /api/track/:id` | Detalles de canción | `/api/track/3135556` |
| `GET /api/chart` | Top canciones | `/api/chart?limit=10` |

## 🔧 URLs de Desarrollo

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001
- **API Test:** http://localhost:3001/api/search?q=test

## 🧪 Probar Backend

```bash
cd backend
node test-api.js
```

## 🔄 Migración del Frontend

1. **Importar nuevo hook:**
   ```typescript
   import { useDeezerAPI } from '@/hooks/useDeezerAPI';
   ```

2. **Usar igual que antes:**
   ```typescript
   const { tracks, loading, fetchTracks } = useDeezerAPI({ limit: 10 });
   ```

3. **Para búsquedas:**
   ```typescript
   fetchTracks("coldplay");
   ```

## 📂 Estructura del Backend

```
backend/
├── server.js              # Servidor principal
├── routes/
│   ├── music.js           # Endpoints de música (Deezer)
│   └── user.js            # Endpoints de usuario (futuro)
├── utils/
│   └── helpers.js         # Utilidades
├── config/
│   └── index.js           # Configuración
├── .env                   # Variables de entorno
└── package.json
```

## 🎯 Características

### ✅ Implementado:
- 🔍 Búsqueda de canciones en Deezer
- 🎵 Detalles de canciones individuales
- 📈 Charts/Top canciones
- 👤 Búsqueda de artistas
- 💿 Álbumes y tracklist
- 🔄 Transformación automática de datos
- 🌐 CORS configurado
- 🛡️ Validación de parámetros

### 🚧 Preparado para el futuro:
- ⭐ Sistema de favoritos con Supabase
- 📝 Playlists personalizadas
- 📊 Historial de reproducción
- 🔐 Autenticación de usuarios

## 🐛 Troubleshooting

### Backend no inicia:
```bash
# Verificar puerto 3001 libre
netstat -an | findstr 3001

# Reinstalar dependencias
cd backend
rm -rf node_modules
npm install
```

### Frontend no conecta:
1. Verificar que `.env` tiene `VITE_BACKEND_URL=http://localhost:3001`
2. Verificar que backend está corriendo
3. Revisar consola del navegador para errores CORS

### Sin resultados en búsqueda:
1. Verificar conexión a internet
2. Probar endpoint directamente: http://localhost:3001/api/search?q=test
3. Revisar logs del backend

## 📞 Comandos Útiles

```bash
# Iniciar solo backend
cd backend && npm run dev

# Probar API
curl http://localhost:3001/api/search?q=coldplay

# Ver logs en tiempo real
cd backend && npm run dev

# Instalar dependencias de ambos
npm run backend:install && npm install

# Limpiar y reinstalar todo
rm -rf node_modules backend/node_modules
npm install && npm run backend:install
```

## 🔐 Variables de Entorno

**Frontend (.env):**
```env
VITE_BACKEND_URL=http://localhost:3001
```

**Backend (backend/.env):**
```env
PORT=3001
DEEZER_API_BASE_URL=https://api.deezer.com
```

## 🎉 ¡Listo para usar!

Tu backend está configurado y listo para sustituir las llamadas directas a Jamendo. El frontend puede seguir funcionando con mínimos cambios gracias a la transformación automática de datos.
