@echo off
echo 🚀 Iniciando StreamFlow Backend...
echo.

:: Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js v16 o superior.
    pause
    exit /b 1
)

:: Verificar si estamos en la carpeta correcta
if not exist package.json (
    echo ❌ No se encontró package.json. 
    echo    Asegúrate de ejecutar este script desde la carpeta backend.
    pause
    exit /b 1
)

:: Instalar dependencias si no existen
if not exist node_modules (
    echo 📦 Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error al instalar dependencias.
        pause
        exit /b 1
    )
)

:: Verificar que el archivo .env existe
if not exist .env (
    echo ⚠️  Archivo .env no encontrado. Creando uno por defecto...
    echo PORT=3001 > .env
    echo DEEZER_API_BASE_URL=https://api.deezer.com >> .env
)

echo ✅ Todo listo. Iniciando servidor en modo desarrollo...
echo.
echo 📡 El servidor estará disponible en: http://localhost:3001
echo 🌐 El frontend puede conectarse desde: http://localhost:5173
echo.
echo ⏹️  Para detener el servidor presiona Ctrl+C
echo.

:: Iniciar el servidor
npm run dev
