#!/bin/bash

echo "🚀 Iniciando Gestor de Plantillas de Correo..."
echo "================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instala Node.js primero."
    exit 1
fi

# Verificar si las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Encontrar un puerto disponible
PORT=3000
while lsof -ti:$PORT > /dev/null 2>&1; do
    PORT=$((PORT + 1))
done

echo "🌐 Iniciando servidor en puerto $PORT..."
echo "📧 Aplicación disponible en: http://localhost:$PORT"
echo "🔗 API disponible en: http://localhost:$PORT/api"
echo ""
echo "Para detener el servidor, presiona Ctrl+C"
echo "================================="

# Iniciar el servidor
PORT=$PORT npm start