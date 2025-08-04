# 🎵 StreamFlow - Plataforma de Música Streaming

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-purple.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-4.4-yellow.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **StreamFlow** es una plataforma moderna de streaming de música que combina una interfaz elegante con funcionalidades avanzadas de reproducción, gestión de playlists y recomendaciones personalizadas.

## 🌟 Características Principales

### 🎧 **Reproducción de Música**
- ✅ Reproducción en tiempo real con controles avanzados
- ✅ Barra de progreso interactiva con navegación por tiempo
- ✅ Control de volumen con visualización
- ✅ Modos de reproducción: Shuffle, Repeat, Loop
- ✅ Cola de reproducción con gestión completa

### 🎨 **Interfaz de Usuario**
- ✅ Diseño responsive optimizado para móvil, tablet y desktop
- ✅ Tema cyberpunk con efectos neon y gradientes
- ✅ Animaciones fluidas y transiciones suaves
- ✅ Modo oscuro con paleta de colores personalizada
- ✅ Componentes UI reutilizables con Shadcn/ui

### 👤 **Sistema de Usuarios**
- ✅ Autenticación segura con Supabase
- ✅ Gestión de perfiles de usuario
- ✅ Sistema de suscripciones (Gratis/Premium)
- ✅ Playlists personales y colaborativas
- ✅ Historial de reproducción

### 🔍 **Búsqueda y Descubrimiento**
- ✅ Búsqueda en tiempo real con resultados instantáneos
- ✅ Filtros avanzados por artista, álbum, género
- ✅ Recomendaciones personalizadas basadas en preferencias
- ✅ Trending songs y charts
- ✅ Exploración por géneros y mood

### 📱 **Funcionalidades Móviles**
- ✅ Player optimizado para pantallas táctiles
- ✅ Navegación gestual intuitiva
- ✅ Controles adaptativos según el contexto
- ✅ Modo offline para contenido descargado

## 🚀 Tecnologías Utilizadas

### **Frontend**
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para mayor robustez
- **Vite** - Build tool rápido y moderno
- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn/ui** - Componentes UI reutilizables
- **Lucide React** - Iconografía moderna

### **Backend & Servicios**
- **Supabase** - Backend as a Service (Auth, Database, Storage)
- **PostgreSQL** - Base de datos relacional
- **Row Level Security (RLS)** - Seguridad a nivel de fila

### **Estado y Gestión**
- **React Context API** - Gestión de estado global
- **React Router DOM** - Enrutamiento de aplicaciones
- **React Hook Form** - Gestión de formularios
- **Zod** - Validación de esquemas

### **Herramientas de Desarrollo**
- **ESLint** - Linting de código JavaScript/TypeScript
- **Prettier** - Formateo de código
- **Husky** - Git hooks
- **Commitlint** - Validación de mensajes de commit

## 📦 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+
- npm o yarn
- Cuenta en Supabase

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/tu-usuario/streamflow.git
cd streamflow
```

### **2. Instalar Dependencias**
```bash
npm install
# o
yarn install
```

### **3. Configurar Variables de Entorno**
Crear archivo `.env.local` en la raíz del proyecto:
```env
# Supabase Configuration
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key

# API Configuration
VITE_API_BASE_URL=tu_api_base_url

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
```

### **4. Configurar Base de Datos**
```sql
-- Ejecutar en Supabase SQL Editor
-- Crear tablas necesarias (ver docs/database-schema.sql)
```

### **5. Ejecutar en Desarrollo**
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base de Shadcn/ui
│   ├── FixedPlayerBar.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── TrackCard.tsx
├── contexts/           # Contextos de React
│   ├── AuthContext.tsx
│   ├── PlayerContext.tsx
│   └── LibraryContext.tsx
├── hooks/              # Custom hooks
│   ├── useAuth.ts
│   ├── usePlayer.ts
│   └── useSubscription.ts
├── pages/              # Páginas de la aplicación
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Search.tsx
│   └── Profile.tsx
├── types/              # Definiciones de tipos TypeScript
│   ├── music.ts
│   └── user.ts
├── utils/              # Utilidades y helpers
│   ├── api.ts
│   └── format.ts
└── styles/             # Estilos globales
    └── index.css
```

## 🎯 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Construir para producción
npm run preview          # Preview de la build

# Linting y Formateo
npm run lint             # Ejecutar ESLint
npm run lint:fix         # Corregir errores de linting
npm run format           # Formatear código con Prettier

# Testing
npm run test             # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Generar reporte de cobertura

# Type Checking
npm run type-check       # Verificar tipos TypeScript
```

## 🔧 Configuración de Desarrollo

### **Configuración de ESLint**
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### **Configuración de Tailwind**
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'neon-purple': '#a855f7',
        'neon-cyan': '#06b6d4',
        'neon-pink': '#ec4899'
      }
    }
  }
}
```

## 🚀 Despliegue

### **Vercel (Recomendado)**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Configurar variables de entorno en Vercel Dashboard
```

### **Netlify**
```bash
# Construir el proyecto
npm run build

# Desplegar manualmente o con Git integration
```

### **Docker**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

### **Estructura de Tests**
```
tests/
├── unit/               # Tests unitarios
├── integration/        # Tests de integración
└── e2e/               # Tests end-to-end
```

### **Ejecutar Tests**
```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:coverage

# Tests e2e
npm run test:e2e
```

## 📊 Métricas y Analytics

### **Lighthouse Score**
- Performance: 95+
- Accessibility: 98+
- Best Practices: 95+
- SEO: 90+

### **Bundle Analysis**
```bash
npm run analyze        # Analizar tamaño del bundle
```

## 🤝 Contribución

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre cómo contribuir al proyecto.

### **Proceso de Contribución**
1. Fork el repositorio
2. Crear una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- **Supabase** por proporcionar una excelente plataforma backend
- **Shadcn/ui** por los componentes UI de alta calidad
- **Tailwind CSS** por el framework CSS utility-first
- **React Team** por la increíble biblioteca de UI

## 📞 Soporte

- 📧 Email: soporte@streamflow.com
- 💬 Discord: [StreamFlow Community](https://discord.gg/streamflow)
- 📖 Documentación: [docs.streamflow.com](https://docs.streamflow.com)
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/streamflow/issues)

## 🔄 Roadmap

### **v2.0 (Próximamente)**
- [ ] Modo offline completo
- [ ] Sincronización entre dispositivos
- [ ] Integración con redes sociales
- [ ] Podcasts y contenido de audio
- [ ] Modo colaborativo para playlists

### **v2.1**
- [ ] IA para recomendaciones avanzadas
- [ ] Integración con dispositivos IoT
- [ ] Modo karaoke
- [ ] Exportación de playlists

---

<div align="center">
  <p>Hecho con ❤️ por el equipo de StreamFlow</p>
  <p>⭐ Si te gusta este proyecto, ¡déjanos una estrella!</p>
</div>