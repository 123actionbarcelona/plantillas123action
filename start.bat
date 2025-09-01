@echo off
echo 🚀 Iniciando Gestor de Plantillas de Correo...
echo =================================

:: Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor, instala Node.js primero.
    pause
    exit /b 1
)

:: Verificar si las dependencias están instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm install
)

:: Encontrar puerto disponible (simplificado para Windows)
set PORT=3000
:checkport
netstat -an | find ":%PORT%" >nul
if %errorlevel% equ 0 (
    set /a PORT+=1
    goto checkport
)

echo 🌐 Iniciando servidor en puerto %PORT%...
echo 📧 Aplicación disponible en: http://localhost:%PORT%
echo 🔗 API disponible en: http://localhost:%PORT%/api
echo.
echo Para detener el servidor, presiona Ctrl+C
echo =================================

:: Iniciar el servidor
set PORT=%PORT%
npm start