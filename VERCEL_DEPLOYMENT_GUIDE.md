# Guía de Despliegue en Vercel - StreamFlow

## Problemas Solucionados

### 1. Error de Rollup con dependencias opcionales
**Problema:** `Cannot find module @rollup/rollup-linux-x64-gnu`

**Solución implementada:**
- Configuración de `.npmrc` para evitar dependencias opcionales
- Uso de `--no-optional` en comandos de instalación
- Configuración específica de Vite para Vercel

### 2. Configuración de Build
**Archivos modificados:**
- `vite.config.ts` - Optimizaciones para Vercel
- `vercel.json` - Configuración de build robusta
- `.npmrc` - Configuración de npm
- `.vercelignore` - Exclusión de archivos innecesarios

## Configuración Actual

### Variables de Entorno Requeridas
```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
RENDER_API_KEY=your_render_api_key
RENDER_PRODUCTION_SERVICE_ID=your_service_id
```

### Scripts Disponibles
```bash
npm run build          # Build normal
npm run build:vercel   # Build optimizado para Vercel
npm run test:build     # Probar build localmente
npm run clean          # Limpiar archivos de build
npm run clean:install  # Limpiar e instalar dependencias
```

## Pasos para Despliegue

### 1. Configuración Local
```bash
# Instalar dependencias
npm run clean:install

# Probar build localmente
npm run test:build
```

### 2. Despliegue Automático
El workflow de GitHub Actions se ejecuta automáticamente en:
- Push a `main`
- Push a `release/v1.0.0`

### 3. Despliegue Manual
```bash
# Usando Vercel CLI
vercel --prod

# O usando el workflow manual
# Ir a Actions > CI/CD Pipeline > Run workflow
```

## Solución de Problemas

### Si el build falla en Vercel:
1. Verificar que todas las variables de entorno estén configuradas
2. Ejecutar `npm run test:build` localmente
3. Revisar logs de Vercel para errores específicos

### Si hay problemas con dependencias:
```bash
# Limpiar completamente
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --prefer-offline --no-audit --no-fund --no-optional
```

### Si hay problemas con Rollup:
- El archivo `vite.config.ts` ya está configurado para usar `esbuild`
- Las dependencias opcionales están excluidas en `.npmrc`

## Monitoreo

### Logs de Vercel
- Revisar logs en el dashboard de Vercel
- Verificar que el build use la configuración correcta

### Logs de GitHub Actions
- Revisar el workflow `CI/CD Pipeline`
- Verificar que todos los jobs pasen exitosamente

## Contacto
Si persisten los problemas, revisar:
1. Configuración de variables de entorno
2. Permisos de Vercel
3. Configuración del proyecto en Vercel 