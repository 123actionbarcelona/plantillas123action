# 📋 Sistema de Categorización de Plantillas - Instrucciones de Uso

## 🚀 Instalación

### 1. Aplicar la migración de base de datos

Si aún no has ejecutado la migración, ejecuta el siguiente comando en la raíz del proyecto:

```bash
sqlite3 templates.db < migration-categories.sql
```

Esto creará:
- Tabla `categories` con campos: id, name, color, icon, order_index
- Campo `category_id` en la tabla `templates`
- 5 categorías por defecto: Particulares, Cluedo, Team Building, Empresas, English

### 2. Reiniciar el servidor

Si el servidor está en ejecución, reinícialo para que tome los cambios:

```bash
npm start
```

## 📖 Guía de Uso

### 1. Filtrar Plantillas por Categoría

En la página principal, verás chips de categorías en la parte superior:

- **[Todas]** - Muestra todas las plantillas
- **[Particulares]** - Plantillas para clientes particulares (color verde)
- **[Cluedo]** - Plantillas para eventos Cluedo (color naranja)
- **[Team Building]** - Plantillas para actividades de equipo (color violeta)
- **[Empresas]** - Plantillas corporativas (color azul)
- **[English]** - Plantillas en inglés (color rojo)

Haz clic en cualquier chip para filtrar las plantillas de esa categoría.

### 2. Gestionar Categorías

Haz clic en el botón **"Gestionar Categorías"** (ícono de engranaje) para:

#### Crear nueva categoría:
1. Ingresa el nombre de la categoría
2. Selecciona un color con el selector
3. Opcionalmente, añade un ícono de FontAwesome (ej: `fa-star`, `fa-heart`)
4. Haz clic en "Añadir"

#### Eliminar categoría:
1. En la lista de categorías, haz clic en el ícono de papelera
2. Las plantillas NO se eliminarán, solo perderán la categoría

### 3. Asignar Categorías a Plantillas

#### Método 1: Al crear/editar plantilla
- En el formulario de crear/editar, selecciona la categoría del menú desplegable

#### Método 2: Asignación rápida (ícono de etiqueta)
1. En cada tarjeta de plantilla, haz clic en el ícono de etiqueta 🏷️
2. Selecciona la categoría del menú emergente
3. La plantilla se actualizará inmediatamente

#### Método 3: Asignación masiva
1. Haz clic en el botón "Selección" en el header
2. Marca las plantillas que quieres actualizar
3. Haz clic en "Asignar Categoría" en la barra inferior
4. Selecciona o ingresa la categoría

### 4. Visualización de Categorías

Cada plantilla muestra su categoría de tres formas:
- **Borde izquierdo** de 4px con el color de la categoría
- **Badge** con el nombre e ícono de la categoría
- **Fondo sutil** con el color de la categoría (10% de opacidad)

## 🎨 Características del Sistema

### Colores Distintivos
- Cada categoría tiene un color único que se usa consistentemente
- Los colores son visibles tanto en modo claro como oscuro
- Puedes cambiar el color de cualquier categoría desde el gestor

### Iconos Personalizables
- Usa cualquier ícono de FontAwesome 6.4
- Formato: `fa-[nombre-icono]` (ej: `fa-envelope`, `fa-rocket`)
- Los iconos aparecen en chips y badges

### Orden Personalizable
- Las categorías mantienen un orden específico
- Próximamente: drag & drop para reordenar

### Estadísticas
- Ve cuántas plantillas tiene cada categoría
- Identifica categorías sin uso

## 🔧 Configuración Avanzada

### Modificar categorías por defecto

Si quieres cambiar las categorías iniciales, edita el archivo `migration-categories.sql` antes de ejecutar la migración:

```sql
INSERT INTO categories (id, name, color, icon, order_index) VALUES 
    ('cat-' || lower(hex(randomblob(16))), 'Tu Categoría', '#color-hex', 'fa-icon', orden);
```

### API Endpoints disponibles

- `GET /api/categories` - Listar todas las categorías
- `POST /api/categories` - Crear nueva categoría
- `PUT /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar categoría
- `GET /api/categories/stats` - Estadísticas de uso
- `POST /api/templates/assign-category` - Asignación masiva

## 🐛 Solución de Problemas

### Las categorías no aparecen
1. Verifica que la migración se ejecutó: `sqlite3 templates.db "SELECT * FROM categories"`
2. Reinicia el servidor
3. Limpia caché del navegador

### Error al crear categoría
- Verifica que el nombre no esté duplicado
- El color debe ser formato hexadecimal (#RRGGBB)

### Las plantillas no muestran categoría
- Las plantillas existentes no tienen categoría asignada por defecto
- Usa la asignación rápida o masiva para categorizarlas

## 📸 Capturas de Pantalla

### Vista Principal con Categorías
- Los chips de filtro aparecen en la parte superior
- Cada plantilla muestra su badge de categoría
- El borde izquierdo indica visualmente la categoría

### Modal de Gestión
- Lista todas las categorías con sus colores
- Muestra contador de plantillas por categoría
- Permite crear y eliminar categorías

### Menú de Asignación Rápida
- Aparece al hacer clic en el ícono de etiqueta
- Muestra todas las categorías disponibles con sus colores
- Actualización instantánea sin recargar la página

## ✅ Checklist de Funcionalidades

- [x] Filtrar plantillas por categoría
- [x] Crear nuevas categorías con color e ícono
- [x] Eliminar categorías (sin eliminar plantillas)
- [x] Asignar categoría al crear/editar plantilla
- [x] Cambio rápido de categoría desde la tarjeta
- [x] Asignación masiva de categorías
- [x] Badges visuales con colores distintivos
- [x] Estadísticas de uso por categoría
- [x] Categoría "Sin categoría" por defecto
- [x] Persistencia en base de datos

## 🚧 Próximas Mejoras

- [ ] Drag & drop para reordenar categorías
- [ ] Edición inline de categorías existentes
- [ ] Selector de iconos visual
- [ ] Exportar/importar configuración de categorías
- [ ] Subcategorías o etiquetas múltiples

---

**Desarrollado con ❤️ para el Gestor de Plantillas de Email**