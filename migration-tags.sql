-- Migración para añadir sistema de tags/etiquetas
-- Fecha: 2025-01-09
-- Este sistema complementa a las categorías sin modificarlas

-- 1. Crear tabla de tags
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#9ca3af',
    icon TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear tabla relacional muchos-a-muchos para plantillas y tags
CREATE TABLE IF NOT EXISTS template_tags (
    template_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (template_id, tag_id),
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 3. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_template_tags_template ON template_tags(template_id);
CREATE INDEX IF NOT EXISTS idx_template_tags_tag ON template_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_order ON tags(order_index);

-- 4. Crear trigger para actualizar updated_at en tags
CREATE TRIGGER IF NOT EXISTS update_tags_timestamp 
AFTER UPDATE ON tags
BEGIN
    UPDATE tags SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 5. Insertar algunos tags de ejemplo (opcionales, el usuario puede eliminarlos/editarlos)
INSERT OR IGNORE INTO tags (id, name, color, icon, order_index) VALUES 
    ('tag-' || lower(hex(randomblob(16))), 'Navidad', '#dc2626', 'fa-tree', 1),
    ('tag-' || lower(hex(randomblob(16))), 'Virtual', '#2563eb', 'fa-laptop', 2),
    ('tag-' || lower(hex(randomblob(16))), 'Presencial', '#16a34a', 'fa-users', 3),
    ('tag-' || lower(hex(randomblob(16))), '2 horas', '#eab308', 'fa-clock', 4),
    ('tag-' || lower(hex(randomblob(16))), 'Best Seller', '#ec4899', 'fa-star', 5),
    ('tag-' || lower(hex(randomblob(16))), 'Nuevo', '#8b5cf6', 'fa-sparkles', 6);

-- 6. Vista útil para obtener plantillas con sus tags (opcional)
CREATE VIEW IF NOT EXISTS templates_with_tags AS
SELECT 
    t.*,
    GROUP_CONCAT(tg.name, ', ') as tag_names,
    GROUP_CONCAT(tg.id, ',') as tag_ids
FROM templates t
LEFT JOIN template_tags tt ON t.id = tt.template_id
LEFT JOIN tags tg ON tt.tag_id = tg.id
GROUP BY t.id;