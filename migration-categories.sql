-- Migración para añadir sistema de categorías
-- Fecha: 2025-01-09

-- 1. Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#6366f1',
    icon TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Añadir columna category_id a la tabla templates
ALTER TABLE templates ADD COLUMN category_id TEXT REFERENCES categories(id) ON DELETE SET NULL;

-- 3. Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(order_index);

-- 4. Insertar categorías por defecto
INSERT INTO categories (id, name, color, icon, order_index) VALUES 
    ('cat-' || lower(hex(randomblob(16))), 'Particulares', '#10b981', 'fa-user', 1),
    ('cat-' || lower(hex(randomblob(16))), 'Cluedo', '#f59e0b', 'fa-puzzle-piece', 2),
    ('cat-' || lower(hex(randomblob(16))), 'Team Building', '#8b5cf6', 'fa-users', 3),
    ('cat-' || lower(hex(randomblob(16))), 'Empresas', '#3b82f6', 'fa-building', 4),
    ('cat-' || lower(hex(randomblob(16))), 'English', '#ef4444', 'fa-globe', 5);

-- 5. Crear trigger para actualizar updated_at en categories
CREATE TRIGGER IF NOT EXISTS update_categories_timestamp 
AFTER UPDATE ON categories
BEGIN
    UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;