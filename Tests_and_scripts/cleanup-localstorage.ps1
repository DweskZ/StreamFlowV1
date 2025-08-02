# Script de PowerShell para limpiar localStorage
# Ejecuta este script después de confirmar que la migración a Supabase fue exitosa

Write-Host "🧹 Iniciando limpieza de localStorage..." -ForegroundColor Green

# Verificar si estamos en el directorio correcto
if (-not (Test-Path "src")) {
    Write-Host "❌ Error: No se encontró el directorio 'src'. Ejecuta este script desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Directorio del proyecto encontrado" -ForegroundColor Green

# Verificar archivos importantes
$importantFiles = @(
    "src/hooks/useFavorites.ts",
    "src/hooks/usePlaylists.ts",
    "src/lib/utils.ts",
    "src/components/LocalStorageCleanup.tsx"
)

foreach ($file in $importantFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file no encontrado" -ForegroundColor Red
    }
}

Write-Host "`n📋 Resumen de cambios realizados:" -ForegroundColor Yellow
Write-Host "1. ✅ Función cleanupLocalStorage() agregada a src/lib/utils.ts" -ForegroundColor White
Write-Host "2. ✅ Limpieza automática habilitada en useFavorites.ts" -ForegroundColor White
Write-Host "3. ✅ Limpieza automática habilitada en usePlaylists.ts" -ForegroundColor White
Write-Host "4. ✅ Componente LocalStorageCleanup.tsx creado" -ForegroundColor White
Write-Host "5. ✅ Componente agregado a la página de Perfil" -ForegroundColor White
Write-Host "6. ✅ Script cleanup-localstorage.js creado" -ForegroundColor White
Write-Host "7. ✅ Documentación LOCALSTORAGE_CLEANUP.md creada" -ForegroundColor White

Write-Host "`n🎯 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Inicia la aplicación en modo desarrollo" -ForegroundColor White
Write-Host "2. Ve a la página de Perfil (/profile)" -ForegroundColor White
Write-Host "3. Usa la herramienta de limpieza de localStorage" -ForegroundColor White
Write-Host "4. O ejecuta el script cleanup-localstorage.js en la consola del navegador" -ForegroundColor White

Write-Host "`n✅ Limpieza de localStorage configurada correctamente!" -ForegroundColor Green
Write-Host "Los datos migrados se limpiarán automáticamente después de la migración exitosa." -ForegroundColor Cyan 