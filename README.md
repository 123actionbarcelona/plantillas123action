# 📧 Gestor de Plantillas de Correo con Sincronización

Un gestor web completo para plantillas de email con sincronización en tiempo real entre dispositivos.

## 🚀 Características

### ✨ Funcionalidades Core
- **Gestión completa de plantillas**: Crear, editar, eliminar y visualizar plantillas
- **Vista previa en tiempo real**: Ver cómo se ve tu plantilla antes de usarla
- **Copiar al portapapeles**: Un clic para copiar el código HTML
- **Búsqueda avanzada**: Filtrar plantillas por título o descripción

### 🌐 Sincronización Multi-dispositivo
- **Servidor backend con API REST**: Datos almacenados en SQLite
- **Sincronización automática**: Cambios se reflejan en todos los dispositivos
- **Modo offline**: Funciona sin conexión usando caché local
- **Auto-sincronización**: Actualización cada 30 segundos

### 📱 Diseño y UX
- **Responsive design**: Funciona perfecto en móvil, tablet y desktop
- **Interfaz moderna**: Diseñado con Tailwind CSS
- **Notificaciones**: Feedback visual para todas las acciones
- **Indicadores de carga**: Muestra el estado de sincronización

## 🛠️ Instalación

### Requisitos Previos
- Node.js (versión 14 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd plantillas
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor**
   ```bash
   npm start
   ```
   
   O para desarrollo (con auto-reload):
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🎯 Uso

### Gestión de Plantillas
1. **Agregar plantilla**: Haz clic en "Nueva Plantilla" y completa el formulario
2. **Editar plantilla**: Usa el botón de editar (lápiz) en cada tarjeta
3. **Eliminar plantilla**: Usa el botón de eliminar (papelera) con confirmación
4. **Sincronizar**: Usa el botón de sincronización (⟲) para forzar actualización

### Funciones Avanzadas
- **Búsqueda**: Haz clic en "Buscar" para filtrar plantillas
- **Vista previa**: Usa el botón del ojo para abrir la plantilla en nueva ventana
- **Copiar código**: El botón azul copia el HTML al portapapeles
- **Estadísticas**: Panel superior muestra totales y uso de espacio

### Sincronización Entre Dispositivos
- Los cambios se sincronizan automáticamente cada 30 segundos
- Funciona en modo offline manteniendo una copia local
- Al reconectar, se sincroniza automáticamente con el servidor

## 🏗️ Arquitectura

### Backend
- **Framework**: Express.js
- **Base de datos**: SQLite con tabla de plantillas
- **API REST**: Endpoints CRUD completos
- **CORS**: Habilitado para desarrollo cross-origin

### Frontend
- **HTML5**: Estructura semántica moderna
- **CSS**: Tailwind CSS para estilos responsive
- **JavaScript**: Vanilla ES6+ con async/await
- **Almacenamiento**: localStorage como backup offline

### Estructura de Archivos
```
plantillas/
├── server.js          # Servidor Express
├── app.js             # Lógica del frontend
├── index.html         # Interfaz de usuario
├── package.json       # Dependencias del proyecto
├── templates.db       # Base de datos SQLite (se crea automáticamente)
└── README.md          # Documentación
```

## 🔧 API Endpoints

### Plantillas
- `GET /api/templates` - Obtener todas las plantillas
- `GET /api/templates/:id` - Obtener plantilla específica
- `POST /api/templates` - Crear nueva plantilla
- `PUT /api/templates/:id` - Actualizar plantilla
- `DELETE /api/templates/:id` - Eliminar plantilla

### Estadísticas
- `GET /api/stats` - Obtener estadísticas generales

### Ejemplo de JSON para plantilla
```json
{
  "title": "Bienvenida Corporativa",
  "description": "Email profesional para nuevos clientes",
  "html": "<!DOCTYPE html><html>...</html>"
}
```

## 🌐 Despliegue en Producción

### Opción 1: Servidor Tradicional
1. Subir archivos al servidor
2. Instalar dependencias: `npm install --production`
3. Configurar puerto: `PORT=80 npm start`
4. Configurar proxy reverso (nginx/apache)

### Opción 2: Heroku
```bash
# Crear Procfile
echo "web: node server.js" > Procfile

# Desplegar
git init
git add .
git commit -m "Initial commit"
heroku create tu-app-name
git push heroku main
```

### Opción 3: Docker
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Consideraciones de Seguridad

- La aplicación no tiene autenticación por defecto
- Para producción, considera agregar:
  - Autenticación de usuarios
  - Validación de inputs
  - Rate limiting
  - HTTPS obligatorio

## 🐛 Solución de Problemas

### Error: "Cannot connect to server"
- Verifica que el servidor esté ejecutándose en puerto 3000
- Revisa que no haya conflictos de puertos
- La app funcionará en modo offline automáticamente

### Plantillas no se sincronizan
- Revisa la conexión a internet
- Usa el botón de sincronización manual
- Revisa la consola del navegador para errores

### Base de datos corrupta
- Elimina el archivo `templates.db`
- Reinicia el servidor para recrear la base con plantillas por defecto

## 📝 Licencia

Este proyecto es de código abierto bajo licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**¡Disfruta gestionando tus plantillas de email con sincronización total! 🎉**