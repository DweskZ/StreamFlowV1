# StreamFlow - Descubre Música Libre

StreamFlow es una aplicación web para descubrir y reproducir música libre de derechos utilizando la API de Jamendo.

## Características

- 🎵 Explorar música popular
- 🔍 Búsqueda de canciones por nombre y género
- 🎧 Reproductor de audio integrado
- 📝 Cola de reproducción
- 👤 Sistema de autenticación
- 📱 Diseño responsive

## Tecnologías

- React + TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- Supabase (autenticación)
- API de Jamendo

## Instalación y uso

Asegúrate de tener Node.js instalado - [instalar con nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Sigue estos pasos:

```sh
# Paso 1: Clona el repositorio
git clone <TU_URL_GIT>

# Paso 2: Navega al directorio del proyecto
cd streamflow-music-discovery

# Paso 3: Instala las dependencias
npm install

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
