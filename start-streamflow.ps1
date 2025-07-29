# StreamFlow Setup Script
Write-Host "🎵 StreamFlow Music Discovery - Setup & Start" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instala Node.js v16 o superior." -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Función para verificar si un puerto está en uso
function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $false
    } catch {
        return $true
    }
}

# Verificar puertos
$frontendPort = 5173
$backendPort = 3001

if (Test-Port $frontendPort) {
    Write-Host "⚠️  Puerto $frontendPort está en uso. El frontend podría no iniciar correctamente." -ForegroundColor Yellow
}

if (Test-Port $backendPort) {
    Write-Host "⚠️  Puerto $backendPort está en uso. El backend podría no iniciar correctamente." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Verificando dependencias..." -ForegroundColor Blue

# Instalar dependencias del frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "⬇️  Instalando dependencias del frontend..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al instalar dependencias del frontend." -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}

# Instalar dependencias del backend
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "⬇️  Instalando dependencias del backend..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al instalar dependencias del backend." -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    Set-Location ..
}

# Verificar archivos de configuración
if (-not (Test-Path ".env")) {
    Write-Host "⚙️  Creando archivo .env para el frontend..." -ForegroundColor Yellow
    @"
# Backend URL para desarrollo local
VITE_BACKEND_URL=http://localhost:3001
"@ | Out-File -FilePath ".env" -Encoding utf8
}

if (-not (Test-Path "backend/.env")) {
    Write-Host "⚙️  Creando archivo .env para el backend..." -ForegroundColor Yellow
    @"
PORT=3001
DEEZER_API_BASE_URL=https://api.deezer.com
"@ | Out-File -FilePath "backend/.env" -Encoding utf8
}

Write-Host ""
Write-Host "✅ Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Opciones disponibles:" -ForegroundColor Cyan
Write-Host "1. Iniciar solo el frontend (necesitarás iniciar el backend manualmente)" -ForegroundColor White
Write-Host "2. Iniciar solo el backend" -ForegroundColor White
Write-Host "3. Iniciar frontend y backend simultáneamente (recomendado)" -ForegroundColor White
Write-Host "4. Probar la API del backend" -ForegroundColor White
Write-Host "5. Salir" -ForegroundColor White
Write-Host ""

do {
    $choice = Read-Host "Selecciona una opción (1-5)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "🚀 Iniciando frontend en http://localhost:5173" -ForegroundColor Green
            Write-Host "⚠️  Recuerda iniciar el backend manualmente en otra terminal con: cd backend && npm run dev" -ForegroundColor Yellow
            Write-Host ""
            npm run dev
            break
        }
        "2" {
            Write-Host ""
            Write-Host "🚀 Iniciando backend en http://localhost:3001" -ForegroundColor Green
            Write-Host ""
            Set-Location backend
            npm run dev
            Set-Location ..
            break
        }
        "3" {
            Write-Host ""
            Write-Host "🚀 Iniciando frontend y backend simultáneamente..." -ForegroundColor Green
            Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Cyan
            Write-Host "🔧 Backend: http://localhost:3001" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "⏹️  Para detener ambos servidores presiona Ctrl+C" -ForegroundColor Yellow
            Write-Host ""
            
            # Iniciar backend en background
            $backendJob = Start-Job -ScriptBlock {
                Set-Location $using:PWD
                Set-Location backend
                npm run dev
            }
            
            # Esperar un poco para que el backend inicie
            Start-Sleep -Seconds 3
            
            # Iniciar frontend
            try {
                npm run dev
            } finally {
                # Limpiar el job del backend cuando el frontend termine
                Stop-Job $backendJob -ErrorAction SilentlyContinue
                Remove-Job $backendJob -ErrorAction SilentlyContinue
            }
            break
        }
        "4" {
            Write-Host ""
            Write-Host "🧪 Probando la API del backend..." -ForegroundColor Green
            
            # Verificar si el backend está corriendo
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5 -ErrorAction Stop
                Write-Host "✅ Backend está corriendo. Ejecutando pruebas..." -ForegroundColor Green
                Set-Location backend
                node test-api.js
                Set-Location ..
            } catch {
                Write-Host "❌ Backend no está corriendo en http://localhost:3001" -ForegroundColor Red
                Write-Host "💡 Inicia el backend primero con la opción 2 o 3" -ForegroundColor Yellow
            }
            
            Write-Host ""
            Read-Host "Presiona Enter para continuar"
        }
        "5" {
            Write-Host ""
            Write-Host "👋 ¡Hasta luego!" -ForegroundColor Cyan
            exit 0
        }
        default {
            Write-Host "❌ Opción inválida. Por favor selecciona 1, 2, 3, 4 o 5." -ForegroundColor Red
        }
    }
} while ($true)
