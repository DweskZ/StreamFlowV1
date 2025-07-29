# Solucionador de errores CORS - StreamFlow
Write-Host "🔧 StreamFlow - Diagnóstico y Solución de CORS" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Función para probar conexión HTTP
function Test-HttpConnection {
    param([string]$Url, [int]$TimeoutSec = 5)
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSec -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
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

Write-Host "🔍 Diagnosticando el problema..." -ForegroundColor Yellow
Write-Host ""

# 1. Verificar si el backend está corriendo
Write-Host "1️⃣ Verificando backend en puerto 3001..." -ForegroundColor Blue
$backendRunning = Test-HttpConnection "http://localhost:3001"

if ($backendRunning) {
    Write-Host "   ✅ Backend está corriendo correctamente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend NO está corriendo" -ForegroundColor Red
    
    if (Test-Port 3001) {
        Write-Host "   ⚠️  Puerto 3001 está ocupado por otro proceso" -ForegroundColor Yellow
    } else {
        Write-Host "   📝 Puerto 3001 está libre - backend no iniciado" -ForegroundColor Yellow
    }
}

# 2. Verificar archivo .env del frontend
Write-Host ""
Write-Host "2️⃣ Verificando configuración del frontend..." -ForegroundColor Blue
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "VITE_BACKEND_URL") {
        Write-Host "   ✅ Archivo .env existe y tiene VITE_BACKEND_URL" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Archivo .env existe pero falta VITE_BACKEND_URL" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Archivo .env NO existe" -ForegroundColor Red
}

# 3. Verificar dependencias del backend
Write-Host ""
Write-Host "3️⃣ Verificando dependencias del backend..." -ForegroundColor Blue
if (Test-Path "backend/node_modules") {
    Write-Host "   ✅ Dependencias del backend instaladas" -ForegroundColor Green
} else {
    Write-Host "   ❌ Dependencias del backend NO instaladas" -ForegroundColor Red
}

Write-Host ""
Write-Host "🛠️ SOLUCIONES:" -ForegroundColor Cyan
Write-Host ""

if (-not $backendRunning) {
    Write-Host "❌ PROBLEMA PRINCIPAL: El backend no está corriendo" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 SOLUCIONES RECOMENDADAS:" -ForegroundColor Yellow
    Write-Host ""
    
    if (-not (Test-Path "backend/node_modules")) {
        Write-Host "🔧 1. Primero instalar dependencias del backend:" -ForegroundColor White
        Write-Host "   cd backend" -ForegroundColor Gray
        Write-Host "   npm install" -ForegroundColor Gray
        Write-Host ""
    }
    
    Write-Host "🔧 2. Iniciar el backend:" -ForegroundColor White
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "🔧 3. O usar el script automático:" -ForegroundColor White
    Write-Host "   ./start-streamflow.ps1" -ForegroundColor Gray
    Write-Host "   (Seleccionar opción 3)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "🤖 ¿Quieres que lo haga automáticamente? (s/n): " -ForegroundColor Green -NoNewline
    $autoFix = Read-Host
    
    if ($autoFix -eq "s" -or $autoFix -eq "S" -or $autoFix -eq "si" -or $autoFix -eq "yes") {
        Write-Host ""
        Write-Host "🚀 Iniciando reparación automática..." -ForegroundColor Green
        
        # Instalar dependencias si no existen
        if (-not (Test-Path "backend/node_modules")) {
            Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
            Set-Location backend
            npm install
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
            } else {
                Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
                Set-Location ..
                Read-Host "Presiona Enter para continuar"
                exit 1
            }
            Set-Location ..
        }
        
        # Crear .env si no existe
        if (-not (Test-Path ".env")) {
            Write-Host "⚙️ Creando .env del frontend..." -ForegroundColor Yellow
            @"
# Backend URL para desarrollo local
VITE_BACKEND_URL=http://localhost:3001
"@ | Out-File -FilePath ".env" -Encoding utf8
        }
        
        if (-not (Test-Path "backend/.env")) {
            Write-Host "⚙️ Creando .env del backend..." -ForegroundColor Yellow
            @"
PORT=3001
DEEZER_API_BASE_URL=https://api.deezer.com
"@ | Out-File -FilePath "backend/.env" -Encoding utf8
        }
        
        Write-Host ""
        Write-Host "✅ Configuración completada. Ahora iniciando backend..." -ForegroundColor Green
        Write-Host ""
        Write-Host "🔄 El backend se iniciará en segundo plano..." -ForegroundColor Blue
        Write-Host "📱 Luego inicia el frontend manualmente con: npm run dev" -ForegroundColor Blue
        Write-Host ""
        
        # Iniciar backend
        Set-Location backend
        Start-Process powershell -ArgumentList "-Command", "npm run dev" -WindowStyle Normal
        Set-Location ..
        
        Write-Host "🎉 ¡Backend iniciado! Espera 5 segundos y luego inicia el frontend." -ForegroundColor Green
        
    } else {
        Write-Host ""
        Write-Host "💡 Sigue las instrucciones manuales arriba para solucionar el problema." -ForegroundColor Blue
    }
    
} else {
    Write-Host "✅ El backend está funcionando correctamente." -ForegroundColor Green
    Write-Host "💡 Si sigues viendo errores CORS, intenta:" -ForegroundColor Blue
    Write-Host "   1. Recargar la página del frontend (Ctrl+F5)" -ForegroundColor White
    Write-Host "   2. Verificar que el frontend esté en http://localhost:5173" -ForegroundColor White
    Write-Host "   3. Revisar la consola del backend para errores" -ForegroundColor White
}

Write-Host ""
Write-Host "📊 Estado final:" -ForegroundColor Magenta
Write-Host "   Backend (http://localhost:3001): $(if($backendRunning){'✅ Online'}else{'❌ Offline'})" -ForegroundColor White
Write-Host "   Frontend esperado: http://localhost:5173" -ForegroundColor White

Write-Host ""
Read-Host "Presiona Enter para salir"
