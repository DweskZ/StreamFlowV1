# Inicio rápido del backend
Write-Host "🚀 Iniciando Backend StreamFlow..." -ForegroundColor Green
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "backend")) {
    Write-Host "❌ No se encuentra la carpeta 'backend'. Ejecuta este script desde la raíz del proyecto." -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Ir al directorio backend
Set-Location backend

# Verificar que package.json existe
if (-not (Test-Path "package.json")) {
    Write-Host "❌ No se encuentra package.json en la carpeta backend." -ForegroundColor Red
    Set-Location ..
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Instalar dependencias si no existen
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al instalar dependencias." -ForegroundColor Red
        Set-Location ..
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}

# Verificar .env
if (-not (Test-Path ".env")) {
    Write-Host "⚙️ Creando archivo .env..." -ForegroundColor Yellow
    @"
PORT=3001
DEEZER_API_BASE_URL=https://api.deezer.com
"@ | Out-File -FilePath ".env" -Encoding utf8
}

Write-Host "✅ Backend configurado correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Backend estará disponible en: http://localhost:3001" -ForegroundColor Cyan
Write-Host "📡 API de prueba: http://localhost:3001/api/search?q=test" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏹️ Para detener el servidor presiona Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Iniciar el servidor
npm run dev
