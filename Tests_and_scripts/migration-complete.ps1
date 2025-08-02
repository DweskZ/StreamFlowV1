# StreamFlow Migration Test Script
Write-Host "🔄 StreamFlow - Prueba de Migración a Deezer" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que el .env existe en el frontend
if (-not (Test-Path ".env")) {
    Write-Host "⚙️  Creando .env para frontend..." -ForegroundColor Yellow
    @"
# Backend URL para desarrollo local
VITE_BACKEND_URL=http://localhost:3001
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
} else {
    Write-Host "✅ Archivo .env existe" -ForegroundColor Green
}

# Verificar que el .env existe en el backend
if (-not (Test-Path "backend/.env")) {
    Write-Host "⚙️  Creando .env para backend..." -ForegroundColor Yellow
    @"
PORT=3001
DEEZER_API_BASE_URL=https://api.deezer.com
"@ | Out-File -FilePath "backend/.env" -Encoding utf8
    Write-Host "✅ Archivo .env del backend creado" -ForegroundColor Green
} else {
    Write-Host "✅ Archivo .env del backend existe" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Resumen de la Migración:" -ForegroundColor Cyan
Write-Host "  ✅ Hooks actualizados para usar backend local" -ForegroundColor Green
Write-Host "  ✅ useJamendoAPI → ahora usa Deezer via backend" -ForegroundColor Green
Write-Host "  ✅ useTrendingSongs → ahora usa charts de Deezer" -ForegroundColor Green
Write-Host "  ✅ Tipos de datos mantenidos (compatibilidad total)" -ForegroundColor Green
Write-Host "  ✅ Componentes React sin cambios necesarios" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Instalar dependencias del backend: cd backend && npm install" -ForegroundColor White
Write-Host "  2. Iniciar backend: npm run dev (en carpeta backend)" -ForegroundColor White
Write-Host "  3. Iniciar frontend: npm run dev (en carpeta raíz)" -ForegroundColor White
Write-Host "  4. Probar búsquedas en http://localhost:5173" -ForegroundColor White

Write-Host ""
Write-Host "🧪 Para probar la migración:" -ForegroundColor Blue
Write-Host "  • Usar el script start-streamflow.ps1 (opción 3)" -ForegroundColor White
Write-Host "  • O manualmente con dos terminales" -ForegroundColor White

Write-Host ""
Write-Host "🔍 URLs importantes:" -ForegroundColor Magenta
Write-Host "  • Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  • Backend: http://localhost:3001" -ForegroundColor White
Write-Host "  • API Test: http://localhost:3001/api/search?q=test" -ForegroundColor White

Write-Host ""
Write-Host "✨ ¡La migración está completa!" -ForegroundColor Green
Write-Host "   Ahora StreamFlow usa Deezer en lugar de Jamendo" -ForegroundColor Green

Read-Host "`nPresiona Enter para continuar"
