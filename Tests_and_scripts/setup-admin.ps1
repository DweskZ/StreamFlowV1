# =====================================================
# SCRIPT PARA CONFIGURAR UN USUARIO ADMINISTRADOR
# =====================================================

Write-Host "🔧 Configuración del Sistema de Administrador" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Solicitar información del usuario
$userEmail = Read-Host "📧 Ingresa el email del usuario que será administrador"
$userName = Read-Host "👤 Ingresa el nombre completo del administrador"

Write-Host "`n📋 Pasos para configurar el administrador:" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

Write-Host "`n1️⃣ Ve a tu dashboard de Supabase:" -ForegroundColor Green
Write-Host "   https://supabase.com/dashboard" -ForegroundColor White

Write-Host "`n2️⃣ Ve a Authentication > Users" -ForegroundColor Green
Write-Host "   Crea un nuevo usuario con el email: $userEmail" -ForegroundColor White

Write-Host "`n3️⃣ Copia el ID del usuario creado" -ForegroundColor Green
Write-Host "   (Aparece en la lista de usuarios)" -ForegroundColor White

Write-Host "`n4️⃣ Ve a SQL Editor y ejecuta este comando:" -ForegroundColor Green
Write-Host "   (Reemplaza TU_USER_ID_AQUI con el ID que copiaste)" -ForegroundColor White

Write-Host "`n📝 COMANDO SQL A EJECUTAR:" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Magenta

$sqlCommand = @"
-- Agregar columna is_admin si no existe
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Hacer al usuario administrador
UPDATE profiles 
SET is_admin = TRUE, 
    full_name = '$userName',
    updated_at = NOW()
WHERE email = '$userEmail';

-- Si el usuario no existe en profiles, crearlo
INSERT INTO profiles (id, email, full_name, is_admin, created_at, updated_at)
SELECT 
    auth.uid(),
    '$userEmail',
    '$userName',
    TRUE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = '$userEmail'
);
"@

Write-Host $sqlCommand -ForegroundColor White

Write-Host "`n5️⃣ Verifica que el usuario sea administrador:" -ForegroundColor Green
Write-Host "   SELECT email, full_name, is_admin FROM profiles WHERE email = '$userEmail';" -ForegroundColor White

Write-Host "`n✅ Una vez completado, podrás acceder al dashboard de administración" -ForegroundColor Green
Write-Host "   desde el sidebar de la aplicación (solo visible para administradores)" -ForegroundColor White

Write-Host "`n🔗 URL del dashboard: http://localhost:8080/admin" -ForegroundColor Cyan

Write-Host "`n⚠️  IMPORTANTE: Asegúrate de que la aplicación esté corriendo" -ForegroundColor Red
Write-Host "   Ejecuta: npm run dev" -ForegroundColor White

Read-Host "`nPresiona Enter para continuar..." 