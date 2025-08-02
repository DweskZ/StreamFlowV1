# StreamFlow - Descubre Música Libre

StreamFlow es una aplicación web para descubrir y reproducir música utilizando la API de Deezer a través de un backend Express personalizado.

## 🎯 Migración Completada: Jamendo → Deezer

**¡Nueva versión!** StreamFlow ahora usa la API de Deezer en lugar de Jamendo para obtener música de mayor calidad y mejor disponibilidad.

## Características

- 🎵 Explorar música popular de Deezer
- 🔍 Búsqueda de canciones por nombre
- 🎧 Reproductor de audio integrado con previews
- 📝 Cola de reproducción
- 👤 Sistema de autenticación con Supabase
- 📱 Diseño responsive
- 🔄 Backend Express para API unificada
- 🛡️ CORS y validación de datos

## Tecnologías

### Frontend:
- React + TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- Supabase (autenticación)

### Backend:
- Node.js + Express
- Axios para llamadas a Deezer API
- CORS configurado
- Transformación automática de datos
## 🚀 Instalación y Uso

### Requisitos
- Node.js v16 o superior
- npm o yarn

### Instalación Rápida (Recomendado)

1. **Ejecutar script automático:**
   ```powershell
   ./start-streamflow.ps1
   ```
   
2. **Seleccionar opción 3** para iniciar frontend y backend simultáneamente

### Instalación Manual

```sh
# Paso 1: Clona el repositorio
git clone <TU_URL_GIT>

# Paso 2: Navega al directorio del proyecto
cd streamflow-music-discovery

# Paso 3: Instala dependencias del frontend
npm install

# Paso 4: Instala dependencias del backend
cd backend
npm install
cd ..

# Paso 5: Configura variables de entorno (ya incluidas)
# Frontend: .env con VITE_BACKEND_URL=http://localhost:3001
# Backend: backend/.env con PORT=3001

# Paso 6: Inicia el backend (terminal 1)
cd backend
npm run dev

# Paso 7: Inicia el frontend (terminal 2)
npm run dev
```

### URLs de Desarrollo
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001
- **API Test:** http://localhost:3001/api/search?q=test

# Paso 4: Inicia el servidor de desarrollo
npm run dev
```

## Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la construcción de producción
- `npm run lint` - Ejecuta el linter

## Estructura del proyecto

```
src/
├── components/     # Componentes reutilizables
├── contexts/       # Contextos de React
├── hooks/          # Hooks personalizados
├── pages/          # Páginas de la aplicación
├── types/          # Definiciones de tipos TypeScript
└── lib/            # Utilidades
```
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/07b31bdf-0989-4bdc-99ff-5c339acf861e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
