-- Migración para vincular tags con categorías específicas
-- Fecha: 2025-01-09
-- Esta migración modifica el sistema de tags para que cada tag pertenezca a una categoría

-- 1. Añadir columna category_id a la tabla tags
ALTER TABLE tags ADD COLUMN category_id TEXT REFERENCES categories(id) ON DELETE CASCADE;

-- 2. Crear índice para mejorar rendimiento de búsquedas por categoría
CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category_id);

-- 3. Migración de datos existentes
-- Opción 1: Asignar todos los tags existentes a la primera categoría disponible
-- (El usuario puede reasignarlos después desde la interfaz)
UPDATE tags 
SET category_id = (SELECT id FROM categories ORDER BY order_index LIMIT 1)
WHERE category_id IS NULL;

-- 4. Crear vista mejorada que incluye información de categorías
DROP VIEW IF EXISTS templates_with_tags;
CREATE VIEW templates_with_tags AS
SELECT 
    t.*,
    c.name as category_name,
    c.color as category_color,
    GROUP_CONCAT(tg.name, ', ') as tag_names,
    GROUP_CONCAT(tg.id, ',') as tag_ids
FROM templates t
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN template_tags tt ON t.id = tt.template_id
LEFT JOIN tags tg ON tt.tag_id = tg.id
GROUP BY t.id;

-- 5. Crear vista para tags con información de categoría
CREATE VIEW IF NOT EXISTS tags_with_category AS
SELECT 
    t.*,
    c.name as category_name,
    c.color as category_color,
    c.icon as category_icon
FROM tags t
LEFT JOIN categories c ON t.category_id = c.id;

-- Nota: Después de esta migración, todos los tags estarán vinculados a categorías
-- Los tags se mostrarán solo cuando su categoría esté seleccionada