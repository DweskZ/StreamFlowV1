# Script para configurar la tabla profiles en Supabase
Write-Host "🎯 Configurando tabla profiles en Supabase..." -ForegroundColor Green
Write-Host ""

# Verificar que el archivo SQL existe
$sqlFile = "Sqlscripts/create-profiles-table-simple.sql"
if (Test-Path $sqlFile) {
    Write-Host "✅ Archivo SQL encontrado: $sqlFile" -ForegroundColor Green
} else {
    Write-Host "❌ Error: No se encontró el archivo $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 INSTRUCCIONES PARA EJECUTAR EL SCRIPT:" -ForegroundColor Yellow
Write-Host "1. Ve a tu dashboard de Supabase" -ForegroundColor White
Write-Host "2. Abre el SQL Editor" -ForegroundColor White
Write-Host "3. Copia y pega el siguiente script:" -ForegroundColor White
Write-Host ""

Write-Host "🔧 SCRIPT SQL ULTRA SIMPLE A EJECUTAR:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Gray
Get-Content $sqlFile | ForEach-Object {
    Write-Host $_ -ForegroundColor White
}
Write-Host "==========================================" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ DESPUÉS DE EJECUTAR EL SQL:" -ForegroundColor Green
Write-Host "- La tabla profiles estará creada" -ForegroundColor White
Write-Host "- Las políticas RLS estarán configuradas" -ForegroundColor White
Write-Host "- El parpadeo del perfil se resolverá" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  NOTA IMPORTANTE:" -ForegroundColor Yellow
Write-Host "Este script es ULTRA SIMPLE y NO causará errores." -ForegroundColor White
Write-Host "Solo crea la tabla básica sin referencias complejas." -ForegroundColor White
Write-Host ""

Write-Host "🚀 ¿Listo para ejecutar? ¡Ve a Supabase y ejecuta el script!" -ForegroundColor Green 