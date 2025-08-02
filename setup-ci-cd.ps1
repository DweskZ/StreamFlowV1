# StreamFlow CI/CD Setup Script
# Este script ayuda a configurar el entorno CI/CD para StreamFlow

param(
    [switch]$SkipDocker,
    [switch]$SkipTests,
    [switch]$Verbose
)

Write-Host "🚀 StreamFlow CI/CD Setup" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Verificar Node.js
Write-Host "📋 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no encontrado. Por favor instala Node.js 18+" -ForegroundColor Red
    exit 1
}

# Verificar Docker
if (-not $SkipDocker) {
    Write-Host "🐳 Verificando Docker..." -ForegroundColor Yellow
    try {
        $dockerVersion = docker --version
        Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Docker no encontrado. Algunas funcionalidades no estarán disponibles." -ForegroundColor Yellow
    }
}

# Instalar dependencias del frontend
Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencias del frontend instaladas" -ForegroundColor Green
} catch {
    Write-Host "❌ Error instalando dependencias del frontend" -ForegroundColor Red
    exit 1
}

# Instalar dependencias del backend
Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
try {
    Set-Location backend
    npm install
    Set-Location ..
    Write-Host "✅ Dependencias del backend instaladas" -ForegroundColor Green
} catch {
    Write-Host "❌ Error instalando dependencias del backend" -ForegroundColor Red
    exit 1
}

# Ejecutar tests (opcional)
if (-not $SkipTests) {
    Write-Host "🧪 Ejecutando tests..." -ForegroundColor Yellow
    
    # Tests del frontend
    Write-Host "  - Tests del frontend..." -ForegroundColor Cyan
    try {
        npm test -- --run --silent
        Write-Host "  ✅ Tests del frontend pasaron" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Tests del frontend fallaron (continuando...)" -ForegroundColor Yellow
    }
    
    # Tests del backend
    Write-Host "  - Tests del backend..." -ForegroundColor Cyan
    try {
        Set-Location backend
        npm test -- --silent
        Set-Location ..
        Write-Host "  ✅ Tests del backend pasaron" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Tests del backend fallaron (continuando...)" -ForegroundColor Yellow
    }
}

# Verificar configuración de Git
Write-Host "🔧 Verificando configuración de Git..." -ForegroundColor Yellow
try {
    $gitConfig = git config --list
    if ($gitConfig -match "user\.name" -and $gitConfig -match "user\.email") {
        Write-Host "✅ Configuración de Git encontrada" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Configuración de Git incompleta. Configura tu nombre y email:" -ForegroundColor Yellow
        Write-Host "   git config --global user.name 'Tu Nombre'" -ForegroundColor Cyan
        Write-Host "   git config --global user.email 'tu@email.com'" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Git no encontrado" -ForegroundColor Red
}

# Crear archivos de configuración si no existen
Write-Host "📝 Verificando archivos de configuración..." -ForegroundColor Yellow

# Frontend .env
if (-not (Test-Path ".env")) {
    Write-Host "  - Creando .env para frontend..." -ForegroundColor Cyan
    @"
# Frontend Environment Variables
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_BACKEND_URL=http://localhost:3000
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "  ✅ Archivo .env creado" -ForegroundColor Green
}

# Backend .env
if (-not (Test-Path "backend\.env")) {
    Write-Host "  - Creando .env para backend..." -ForegroundColor Cyan
    @"
# Backend Environment Variables
NODE_ENV=development
PORT=3000
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
"@ | Out-File -FilePath "backend\.env" -Encoding UTF8
    Write-Host "  ✅ Archivo backend\.env creado" -ForegroundColor Green
}

# Verificar estructura de directorios
Write-Host "📁 Verificando estructura de directorios..." -ForegroundColor Yellow
$requiredDirs = @(".github\workflows", "src\test", "backend\__tests__")
foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✅ Directorio $dir creado" -ForegroundColor Green
    }
}

# Mostrar próximos pasos
Write-Host "`n🎯 Próximos pasos:" -ForegroundColor Green
Write-Host "================" -ForegroundColor Green
Write-Host "1. Configura las variables de entorno en .env y backend\.env" -ForegroundColor Cyan
Write-Host "2. Configura GitHub Secrets para CI/CD:" -ForegroundColor Cyan
Write-Host "   - RENDER_API_KEY" -ForegroundColor White
Write-Host "   - RENDER_STAGING_SERVICE_ID" -ForegroundColor White
Write-Host "   - RENDER_PRODUCTION_SERVICE_ID" -ForegroundColor White
Write-Host "   - VERCEL_TOKEN" -ForegroundColor White
Write-Host "   - VERCEL_ORG_ID" -ForegroundColor White
Write-Host "   - VERCEL_PROJECT_ID" -ForegroundColor White
Write-Host "3. Configura SonarQube para análisis de código" -ForegroundColor Cyan
Write-Host "4. Configura Vercel y Render para deployment" -ForegroundColor Cyan
Write-Host "5. Ejecuta 'npm run dev:full' para desarrollo local" -ForegroundColor Cyan

Write-Host "`n✅ Setup completado exitosamente!" -ForegroundColor Green
Write-Host "🚀 ¡Listo para desarrollar con CI/CD!" -ForegroundColor Green 