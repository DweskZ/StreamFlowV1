 # 🤝 Guía de Contribución - StreamFlow

¡Gracias por tu interés en contribuir a StreamFlow! Este documento te guiará a través del proceso de contribución.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Contribuir?](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Convenciones de Código](#convenciones-de-código)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Testing](#testing)
- [Pull Request](#pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Solicitar Features](#solicitar-features)
- [Preguntas Frecuentes](#preguntas-frecuentes)

## 📜 Código de Conducta

### Nuestros Estándares

Al participar en este proyecto, esperamos que mantengas un comportamiento respetuoso y profesional:

- ✅ **Sé respetuoso** con todos los contribuyentes
- ✅ **Sé inclusivo** y acogedor con nuevos miembros
- ✅ **Sé constructivo** en tus comentarios y críticas
- ✅ **Sé colaborativo** y ayuda a otros cuando puedas
- ✅ **Sé profesional** en todas las interacciones

### Comportamiento Inaceptable

- ❌ **Acoso o intimidación** de cualquier tipo
- ❌ **Comentarios ofensivos** o discriminatorios
- ❌ **Spam** o contenido no relacionado
- ❌ **Comportamiento tóxico** o destructivo

## 🚀 ¿Cómo Contribuir?

### Tipos de Contribuciones

Aceptamos diferentes tipos de contribuciones:

#### 🐛 **Reportar Bugs**
- Usa el template de bug report
- Incluye pasos para reproducir
- Adjunta screenshots si es relevante

#### ✨ **Solicitar Features**
- Describe la funcionalidad deseada
- Explica el caso de uso
- Considera la implementación

#### 📝 **Mejorar Documentación**
- Corregir errores en la documentación
- Agregar ejemplos y casos de uso
- Traducir contenido

#### 🔧 **Contribuir Código**
- Implementar nuevas features
- Corregir bugs existentes
- Mejorar performance
- Refactorizar código

## ⚙️ Configuración del Entorno

### Prerrequisitos

- **Node.js** 18+ 
- **npm** o **yarn**
- **Git**
- **Editor de código** (VS Code recomendado)

### Instalación Local

1. **Fork el repositorio**
   ```bash
   # Ve a GitHub y haz fork del repositorio
   # Luego clona tu fork
   git clone https://github.com/tu-usuario/streamflow.git
   cd streamflow
   ```

2. **Instala dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configura variables de entorno**
   ```bash
   cp .env.example .env.local
   # Edita .env.local con tus credenciales
   ```

4. **Verifica la instalación**
   ```bash
   npm run dev
   # La app debería estar en http://localhost:5173
   ```

### Configuración de VS Code

Recomendamos instalar estas extensiones:

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base (Shadcn/ui)
│   ├── layout/         # Componentes de layout
│   └── features/       # Componentes específicos de features
├── contexts/           # React Contexts
├── hooks/              # Custom hooks
├── pages/              # Páginas de la aplicación
├── types/              # Definiciones de TypeScript
├── utils/              # Utilidades y helpers
├── styles/             # Estilos globales
└── lib/                # Configuraciones de librerías
```

### Convenciones de Nomenclatura

- **Archivos**: `PascalCase` para componentes, `camelCase` para utilidades
- **Carpetas**: `kebab-case` para páginas, `camelCase` para features
- **Variables**: `camelCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Componentes**: `PascalCase`

## 📝 Convenciones de Código

### TypeScript

```typescript
// ✅ Bueno
interface UserProfile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

const getUserProfile = async (userId: string): Promise<UserProfile> => {
  // implementación
};

// ❌ Evitar
interface userProfile {
  id: string;
  name: string;
  email: string;
}

const getUserProfile = async (userId) => {
  // implementación
};
```

### React Components

```typescript
// ✅ Componente funcional con TypeScript
interface ButtonProps {
  readonly children: React.ReactNode;
  readonly variant?: 'primary' | 'secondary';
  readonly onClick?: () => void;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  onClick 
}: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### CSS/Tailwind

```typescript
// ✅ Clases organizadas y responsive
<div className="
  flex items-center justify-between
  p-4 sm:p-6 lg:p-8
  bg-white dark:bg-gray-900
  rounded-lg shadow-md
  hover:shadow-lg transition-shadow
">
  {/* contenido */}
</div>

// ❌ Clases desordenadas
<div className="bg-white p-4 flex items-center justify-between rounded-lg shadow-md hover:shadow-lg transition-shadow dark:bg-gray-900 sm:p-6 lg:p-8">
  {/* contenido */}
</div>
```

### Imports

```typescript
// ✅ Imports organizados
// 1. React y librerías externas
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 2. Componentes internos
import Button from '@/components/ui/button';
import Header from '@/components/layout/header';

// 3. Hooks y utilidades
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/format';

// 4. Tipos
import type { User } from '@/types/user';
```

## 🔄 Proceso de Desarrollo

### 1. Crear una Rama

```bash
# Asegúrate de estar en develop
git checkout develop
git pull origin develop

# Crea una nueva rama
git checkout -b feature/nombre-de-la-feature
# o
git checkout -b fix/nombre-del-bug
```

### 2. Desarrollar

- Escribe código limpio y bien documentado
- Sigue las convenciones establecidas
- Escribe tests para nuevas funcionalidades
- Actualiza la documentación si es necesario

### 3. Commits

Usa el formato de commits convencionales:

```bash
# Formato
type(scope): description

# Ejemplos
feat(auth): implement user authentication
fix(player): resolve audio playback issue
docs(api): update endpoint documentation
style(ui): improve button styling
refactor(utils): simplify date formatting
test(auth): add authentication tests
chore(deps): update dependencies
```

### Tipos de Commits

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (espacios, etc.)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

### 4. Push y Pull Request

```bash
# Push a tu fork
git push origin feature/nombre-de-la-feature

# Crea un Pull Request en GitHub
# Usa el template de PR
```

## 🧪 Testing

### Escribir Tests

```typescript
// ✅ Test de componente
import { render, screen } from '@testing-library/react';
import Button from '@/components/ui/button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage

# Tests específicos
npm test -- --testNamePattern="Button"
```

### Cobertura Mínima

- **Statements**: 80%
- **Branches**: 70%
- **Functions**: 80%
- **Lines**: 80%

## 🔀 Pull Request

### Template de PR

```markdown
## 📝 Descripción

Describe brevemente los cambios realizados.

## 🎯 Tipo de Cambio

- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación
- [ ] Refactorización

## 🧪 Testing

- [ ] Tests unitarios agregados/actualizados
- [ ] Tests de integración agregados/actualizados
- [ ] Tests manuales realizados

## 📸 Screenshots

Si aplica, incluye screenshots de los cambios visuales.

## ✅ Checklist

- [ ] Mi código sigue las convenciones del proyecto
- [ ] He revisado mi código
- [ ] He comentado mi código donde sea necesario
- [ ] He hecho los cambios correspondientes en la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He agregado tests que prueban mi cambio
- [ ] Todos los tests pasan
- [ ] He verificado que mi feature funciona correctamente

## 🔗 Issues Relacionados

Closes #123
Relates to #456
```

### Proceso de Review

1. **Auto-review**: Revisa tu propio código antes de solicitar review
2. **Tests**: Asegúrate de que todos los tests pasen
3. **Linting**: Verifica que no hay errores de linting
4. **Documentación**: Actualiza la documentación si es necesario
5. **Solicitar review**: Asigna reviewers apropiados

### Criterios de Aprobación

- ✅ Código limpio y bien estructurado
- ✅ Tests pasando
- ✅ Sin errores de linting
- ✅ Documentación actualizada
- ✅ Funcionalidad probada
- ✅ Performance aceptable

## 🐛 Reportar Bugs

### Template de Bug Report

```markdown
## 🐛 Descripción del Bug

Descripción clara y concisa del bug.

## 🔄 Pasos para Reproducir

1. Ve a '...'
2. Haz clic en '...'
3. Desplázate hacia abajo hasta '...'
4. Ve el error

## ✅ Comportamiento Esperado

Descripción de lo que debería suceder.

## 📸 Screenshots

Si aplica, incluye screenshots.

## 💻 Información del Sistema

- OS: [ej. Windows 10]
- Browser: [ej. Chrome 91]
- Version: [ej. 1.0.0]

## 📋 Información Adicional

Cualquier información adicional sobre el problema.
```

## ✨ Solicitar Features

### Template de Feature Request

```markdown
## 🎯 Problema

Descripción del problema que esta feature resolvería.

## 💡 Solución Propuesta

Descripción de la solución que te gustaría ver implementada.

## 🔄 Alternativas Consideradas

Descripción de otras alternativas que consideraste.

## 📋 Información Adicional

Cualquier información adicional o contexto.
```

## ❓ Preguntas Frecuentes

### ¿Cómo empiezo a contribuir?

1. Lee esta guía completa
2. Configura tu entorno de desarrollo
3. Busca issues marcados como "good first issue"
4. Únete a nuestro Discord para preguntas

### ¿Qué hago si tengo dudas?

- Revisa la documentación existente
- Busca en issues y discussions previas
- Pregunta en Discord
- Abre un issue con la etiqueta "question"

### ¿Cómo sé si mi contribución será aceptada?

- Sigue las convenciones establecidas
- Escribe código limpio y bien documentado
- Incluye tests apropiados
- Responde a los comentarios de review

### ¿Puedo contribuir sin experiencia en React?

¡Sí! Hay muchas formas de contribuir:
- Documentación
- Testing
- Reportar bugs
- Sugerir mejoras de UX

## 📞 Contacto

- **Discord**: [StreamFlow Community](https://discord.gg/streamflow)
- **Email**: contributors@streamflow.com
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/streamflow/issues)

## 🙏 Agradecimientos

Gracias por considerar contribuir a StreamFlow. Tu tiempo y esfuerzo son muy apreciados por toda la comunidad.

---

**¡Juntos hacemos StreamFlow mejor! 🎵✨**