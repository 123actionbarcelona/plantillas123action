const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-super-segura-2024';

// Configurar Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// Inicializar base de datos SQLite
const db = new sqlite3.Database('./templates.db');

// Crear tabla de plantillas si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    html TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Error creando tabla templates:', err);
  } else {
    console.log('Tabla templates inicializada');
    // Crear tabla de usuarios admin
    createUsersTable();
  }
});

// Crear tabla de usuarios admin
function createUsersTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creando tabla users:', err);
    } else {
      console.log('Tabla users inicializada');
      // Agregar columna email si no existe (migración)
      db.run(`ALTER TABLE users ADD COLUMN email TEXT`, (alterErr) => {
        // Ignorar error si la columna ya existe
        initializeDefaultData();
      });
    }
  });
}

// Inicializar datos por defecto
function initializeDefaultData() {
  initializeDefaultTemplates();
  initializeDefaultAdmin();
}

// Inicializar plantillas por defecto si la tabla está vacía
function initializeDefaultTemplates() {
  db.get("SELECT COUNT(*) as count FROM templates", (err, row) => {
    if (err) {
      console.error('Error contando plantillas:', err);
      return;
    }
    
    if (row.count === 0) {
      const defaultTemplates = [
        {
          id: uuidv4(),
          title: "Bienvenida Corporativa",
          description: "Email de bienvenida profesional para nuevos clientes",
          html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c3e50; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f4f4f4; }
        .button { display: inline-block; padding: 12px 30px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Bienvenido a Nuestra Empresa!</h1>
        </div>
        <div class="content">
            <h2>Hola [Nombre],</h2>
            <p>Nos complace darte la bienvenida a nuestra comunidad. Estamos emocionados de tenerte con nosotros.</p>
            <p>Para comenzar, te invitamos a explorar nuestros servicios:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="#" class="button">Comenzar Ahora</a>
            </p>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p>Saludos cordiales,<br>El Equipo</p>
        </div>
    </div>
</body>
</html>`
        },
        {
          id: uuidv4(),
          title: "Newsletter Mensual",
          description: "Plantilla para boletín informativo mensual",
          html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .wrapper { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; }
        .article { padding: 30px; border-bottom: 1px solid #eee; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>Newsletter - Mes [Mes]</h1>
            <p>Las últimas novedades y actualizaciones</p>
        </div>
        <div class="article">
            <h2>Artículo Principal</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <a href="#" style="color: #667eea;">Leer más →</a>
        </div>
        <div class="footer">
            <p>© 2024 Tu Empresa. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`
        },
        {
          id: uuidv4(),
          title: "Confirmación de Pedido",
          description: "Email de confirmación para compras en línea",
          html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9f9f9; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .order-info { padding: 30px; }
        .total { font-size: 1.2em; font-weight: bold; color: #28a745; text-align: right; padding: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Pedido Confirmado</h1>
            <p>Orden #12345</p>
        </div>
        <div class="order-info">
            <h2>Gracias por tu compra!</h2>
            <p>Hemos recibido tu pedido y lo estamos procesando.</p>
            <div class="total">Total: $84.98</div>
            <p>Recibirás un email cuando tu pedido sea enviado.</p>
        </div>
    </div>
</body>
</html>`
        }
      ];

      const stmt = db.prepare("INSERT INTO templates (id, title, description, html) VALUES (?, ?, ?, ?)");
      
      defaultTemplates.forEach(template => {
        stmt.run(template.id, template.title, template.description, template.html);
      });
      
      stmt.finalize();
      console.log('Plantillas por defecto inicializadas');
    }
  });
}

// Inicializar usuario admin por defecto
function initializeDefaultAdmin() {
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err) {
      console.error('Error contando usuarios:', err);
      return;
    }
    
    if (row.count === 0) {
      const adminPassword = bcrypt.hashSync('admin123', 10);
      const adminId = uuidv4();
      
      db.run(
        "INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)",
        [adminId, 'admin', adminPassword, 'admin'],
        (err) => {
          if (err) {
            console.error('Error creando admin:', err);
          } else {
            console.log('🔐 Usuario admin creado - Usuario: admin | Contraseña: admin123');
          }
        }
      );
    }
  });
}

// Middleware de autenticación
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

// RUTAS DE AUTENTICACIÓN

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }
  
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  });
});

// Verificar token
app.get('/api/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

// RUTAS DE GESTIÓN DE USUARIOS

// Obtener todos los usuarios (solo admin)
app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  db.all("SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Crear nuevo usuario
app.post('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  const { username, email, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username y password son requeridos' });
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = uuidv4();
  
  db.run(
    "INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)",
    [userId, username, email || null, hashedPassword, 'admin'],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(400).json({ error: 'El nombre de usuario ya existe' });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }
      
      db.get("SELECT id, username, email, role, created_at FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json(row);
      });
    }
  );
});

// Actualizar usuario
app.put('/api/users/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  const { id } = req.params;
  const { username, email, password } = req.body;
  
  let query = "UPDATE users SET username = ?, email = ?";
  let params = [username, email || null];
  
  if (password) {
    query += ", password = ?";
    params.push(bcrypt.hashSync(password, 10));
  }
  
  query += " WHERE id = ?";
  params.push(id);
  
  db.run(query, params, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'El nombre de usuario ya existe' });
      } else {
        res.status(500).json({ error: err.message });
      }
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    
    db.get("SELECT id, username, email, role, created_at FROM users WHERE id = ?", [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(row);
    });
  });
});

// Eliminar usuario
app.delete('/api/users/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  const { id } = req.params;
  
  // Prevenir eliminar el usuario actual
  if (id === req.user.id) {
    return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
  }
  
  db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    
    res.json({ message: 'Usuario eliminado exitosamente' });
  });
});

// RUTAS API PROTEGIDAS

// Obtener todas las plantillas
app.get('/api/templates', authenticateToken, (req, res) => {
  const { category, tags } = req.query;
  
  let query = `
    SELECT 
      t.*,
      c.name as category_name,
      c.color as category_color,
      c.icon as category_icon,
      GROUP_CONCAT(tg.id) as tag_ids,
      GROUP_CONCAT(tg.name) as tag_names,
      GROUP_CONCAT(tg.color) as tag_colors,
      GROUP_CONCAT(tg.icon) as tag_icons
    FROM templates t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN template_tags tt ON t.id = tt.template_id
    LEFT JOIN tags tg ON tt.tag_id = tg.id
  `;
  
  const params = [];
  const conditions = [];
  
  if (category) {
    conditions.push("t.category_id = ?");
    params.push(category);
  }
  
  if (tags) {
    // Filtrar por tags (puede ser uno o varios separados por coma)
    const tagList = tags.split(',');
    const tagPlaceholders = tagList.map(() => '?').join(',');
    conditions.push(`t.id IN (
      SELECT DISTINCT template_id 
      FROM template_tags 
      WHERE tag_id IN (${tagPlaceholders})
    )`);
    params.push(...tagList);
  }
  
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  
  query += " GROUP BY t.id ORDER BY t.updated_at DESC";
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Procesar los tags para cada plantilla
    rows.forEach(row => {
      if (row.tag_ids) {
        const tagIds = row.tag_ids.split(',');
        const tagNames = row.tag_names.split(',');
        const tagColors = row.tag_colors.split(',');
        const tagIcons = row.tag_icons ? row.tag_icons.split(',') : [];
        
        row.tags = tagIds.map((id, index) => ({
          id: id,
          name: tagNames[index],
          color: tagColors[index],
          icon: tagIcons[index] || null
        }));
      } else {
        row.tags = [];
      }
      
      // Limpiar campos temporales
      delete row.tag_ids;
      delete row.tag_names;
      delete row.tag_colors;
      delete row.tag_icons;
    });
    
    res.json(rows);
  });
});

// Obtener una plantilla por ID
app.get('/api/templates/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM templates WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Plantilla no encontrada' });
      return;
    }
    res.json(row);
  });
});

// Crear nueva plantilla
app.post('/api/templates', authenticateToken, (req, res) => {
  const { title, description, html, category_id } = req.body;
  const id = uuidv4();
  
  db.run(
    "INSERT INTO templates (id, title, description, html, category_id) VALUES (?, ?, ?, ?, ?)",
    [id, title, description, html, category_id || null],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get(`
        SELECT 
          t.*,
          c.name as category_name,
          c.color as category_color,
          c.icon as category_icon
        FROM templates t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = ?
      `, [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json(row);
      });
    }
  );
});

// Actualizar plantilla
app.put('/api/templates/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, html, category_id } = req.body;
  
  db.run(
    "UPDATE templates SET title = ?, description = ?, html = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [title, description, html, category_id, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Plantilla no encontrada' });
        return;
      }
      
      db.get(`
        SELECT 
          t.*,
          c.name as category_name,
          c.color as category_color,
          c.icon as category_icon
        FROM templates t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = ?
      `, [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

// Eliminar plantilla
app.delete('/api/templates/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM templates WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Plantilla no encontrada' });
      return;
    }
    
    res.json({ message: 'Plantilla eliminada exitosamente' });
  });
});

// Estadísticas
app.get('/api/stats', authenticateToken, (req, res) => {
  db.get(
    `SELECT 
      COUNT(*) as total,
      MAX(updated_at) as last_update,
      SUM(LENGTH(html)) as total_size
    FROM templates`,
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        total: row.total || 0,
        lastUpdate: row.last_update || null,
        totalSize: row.total_size || 0
      });
    }
  );
});

// ==========================================
// SISTEMA DE CATEGORÍAS
// ==========================================

// Obtener todas las categorías
app.get('/api/categories', authenticateToken, (req, res) => {
  db.all("SELECT * FROM categories ORDER BY order_index ASC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Obtener estadísticas de categorías (DEBE IR ANTES que :id)
app.get('/api/categories/stats', authenticateToken, (req, res) => {
  db.all(
    `SELECT 
      c.id,
      c.name,
      c.color,
      c.icon,
      COUNT(t.id) as template_count
    FROM categories c
    LEFT JOIN templates t ON c.id = t.category_id
    GROUP BY c.id
    ORDER BY c.order_index ASC`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Obtener una categoría por ID
app.get('/api/categories/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM categories WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Categoría no encontrada' });
      return;
    }
    res.json(row);
  });
});

// Crear nueva categoría
app.post('/api/categories', authenticateToken, (req, res) => {
  const { name, color, icon } = req.body;
  const id = 'cat-' + uuidv4();
  
  // Obtener el máximo order_index actual
  db.get("SELECT MAX(order_index) as maxOrder FROM categories", (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const nextOrder = (row?.maxOrder || 0) + 1;
    
    db.run(
      "INSERT INTO categories (id, name, color, icon, order_index) VALUES (?, ?, ?, ?, ?)",
      [id, name, color || '#6366f1', icon || null, nextOrder],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
          } else {
            res.status(500).json({ error: err.message });
          }
          return;
        }
        
        db.get("SELECT * FROM categories WHERE id = ?", [id], (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.status(201).json(row);
        });
      }
    );
  });
});

// Actualizar categoría
app.put('/api/categories/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, color, icon } = req.body;
  
  db.run(
    "UPDATE categories SET name = ?, color = ?, icon = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [name, color, icon, id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Categoría no encontrada' });
        return;
      }
      
      db.get("SELECT * FROM categories WHERE id = ?", [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

// Actualizar orden de categorías
app.put('/api/categories/reorder', authenticateToken, (req, res) => {
  const { orders } = req.body; // Array de {id, order_index}
  
  if (!Array.isArray(orders)) {
    return res.status(400).json({ error: 'Se requiere un array de órdenes' });
  }
  
  const stmt = db.prepare("UPDATE categories SET order_index = ? WHERE id = ?");
  
  orders.forEach(({ id, order_index }) => {
    stmt.run(order_index, id);
  });
  
  stmt.finalize((err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Orden actualizado exitosamente' });
  });
});

// Eliminar categoría
app.delete('/api/categories/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // Primero actualizar las plantillas que usan esta categoría
  db.run("UPDATE templates SET category_id = NULL WHERE category_id = ?", [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.run("DELETE FROM categories WHERE id = ?", [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Categoría no encontrada' });
        return;
      }
      
      res.json({ message: 'Categoría eliminada exitosamente' });
    });
  });
});

// Asignar categoría a plantillas (bulk)
app.post('/api/templates/assign-category', authenticateToken, (req, res) => {
  const { templateIds, categoryId } = req.body;
  
  if (!Array.isArray(templateIds) || templateIds.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de IDs de plantillas' });
  }
  
  const placeholders = templateIds.map(() => '?').join(',');
  const query = `UPDATE templates SET category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`;
  const params = [categoryId, ...templateIds];
  
  db.run(query, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      message: 'Categorías asignadas exitosamente',
      affected: this.changes 
    });
  });
});

// ==========================================
// SISTEMA DE TAGS/ETIQUETAS
// ==========================================

// Obtener todos los tags (opcionalmente filtrados por categoría)
app.get('/api/tags', authenticateToken, (req, res) => {
  const { category_id } = req.query;
  
  let query = `
    SELECT t.*, c.name as category_name, c.color as category_color 
    FROM tags t
    LEFT JOIN categories c ON t.category_id = c.id
  `;
  
  const params = [];
  
  if (category_id && category_id !== 'all') {
    query += " WHERE t.category_id = ?";
    params.push(category_id);
  }
  
  query += " ORDER BY t.order_index, t.name";
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Obtener un tag por ID
app.get('/api/tags/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM tags WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Tag no encontrado' });
      return;
    }
    res.json(row);
  });
});

// Crear nuevo tag
app.post('/api/tags', authenticateToken, (req, res) => {
  const { name, color, icon, category_id } = req.body;
  const id = 'tag-' + uuidv4();
  
  // Validar que category_id sea proporcionado
  if (!category_id) {
    res.status(400).json({ error: 'Se requiere una categoría para el tag' });
    return;
  }
  
  // Verificar que la categoría existe
  db.get("SELECT id FROM categories WHERE id = ?", [category_id], (err, category) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!category) {
      res.status(404).json({ error: 'Categoría no encontrada' });
      return;
    }
    
    // Obtener el siguiente order_index para tags de esta categoría
    db.get("SELECT MAX(order_index) as maxOrder FROM tags WHERE category_id = ?", [category_id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const nextOrder = (row?.maxOrder || 0) + 1;
      
      db.run(
        "INSERT INTO tags (id, name, color, icon, category_id, order_index) VALUES (?, ?, ?, ?, ?, ?)",
        [id, name, color || '#9ca3af', icon || null, category_id, nextOrder],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            res.status(400).json({ error: 'Ya existe un tag con ese nombre' });
          } else {
            res.status(500).json({ error: err.message });
          }
          return;
        }
        
        db.get("SELECT * FROM tags WHERE id = ?", [id], (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.status(201).json(row);
        });
      }
    );
    });
  });
});

// Actualizar tag
app.put('/api/tags/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, color, icon, category_id } = req.body;
  
  // Si se proporciona category_id, verificar que existe
  if (category_id) {
    db.get("SELECT id FROM categories WHERE id = ?", [category_id], (err, category) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!category) {
        res.status(404).json({ error: 'Categoría no encontrada' });
        return;
      }
      
      updateTag();
    });
  } else {
    updateTag();
  }
  
  function updateTag() {
    const updateFields = ["name = ?", "color = ?", "icon = ?", "updated_at = CURRENT_TIMESTAMP"];
    const params = [name, color, icon];
    
    if (category_id) {
      updateFields.push("category_id = ?");
      params.push(category_id);
    }
    
    params.push(id);
    
    db.run(
      `UPDATE tags SET ${updateFields.join(", ")} WHERE id = ?`,
      params,
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          res.status(400).json({ error: 'Ya existe un tag con ese nombre' });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Tag no encontrado' });
        return;
      }
      
      db.get("SELECT * FROM tags WHERE id = ?", [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
  }
});

// Eliminar tag
app.delete('/api/tags/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // Primero eliminar las relaciones en template_tags
  db.run("DELETE FROM template_tags WHERE tag_id = ?", [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.run("DELETE FROM tags WHERE id = ?", [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Tag no encontrado' });
        return;
      }
      
      res.json({ message: 'Tag eliminado exitosamente' });
    });
  });
});

// Obtener tags de una plantilla
app.get('/api/templates/:id/tags', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.all(
    `SELECT t.* FROM tags t
     INNER JOIN template_tags tt ON t.id = tt.tag_id
     WHERE tt.template_id = ?
     ORDER BY t.name`,
    [id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Asignar tags a una plantilla
app.post('/api/templates/:id/tags', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { tagIds } = req.body;
  
  if (!Array.isArray(tagIds)) {
    return res.status(400).json({ error: 'Se requiere un array de IDs de tags' });
  }
  
  // Primero eliminar tags existentes
  db.run("DELETE FROM template_tags WHERE template_id = ?", [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Si no hay tags nuevos, terminar aquí
    if (tagIds.length === 0) {
      res.json({ message: 'Tags actualizados', tags: [] });
      return;
    }
    
    // Insertar nuevos tags
    const stmt = db.prepare("INSERT INTO template_tags (template_id, tag_id) VALUES (?, ?)");
    
    tagIds.forEach(tagId => {
      stmt.run(id, tagId);
    });
    
    stmt.finalize((err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Devolver los tags actualizados
      db.all(
        `SELECT t.* FROM tags t
         INNER JOIN template_tags tt ON t.id = tt.tag_id
         WHERE tt.template_id = ?
         ORDER BY t.name`,
        [id],
        (err, rows) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ message: 'Tags actualizados', tags: rows });
        }
      );
    });
  });
});

// ==========================================
// NUEVAS FUNCIONALIDADES: SISTEMA DE VARIABLES
// ==========================================

// Función para extraer variables de una plantilla HTML
function extractVariables(html) {
  // Primero convertir variables de formato $json.variable a variable simple
  html = html.replace(/\{\{\$json\.(\w+)\}\}/g, '{{$1}}');
  
  // Ahora extraer las variables normales
  const regex = /\{\{([\w_]+)\}\}/g;
  const variables = new Set();
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    variables.add(match[1]);
  }
  
  return Array.from(variables);
}

// Función para reemplazar variables con valores
function replaceVariables(html, values) {
  let result = html;
  
  // Primero convertir variables de formato $json.variable a variable simple
  result = result.replace(/\{\{\$json\.(\w+)\}\}/g, '{{$1}}');
  
  // Ahora reemplazar las variables con sus valores
  for (const [key, value] of Object.entries(values)) {
    // Reemplazar tanto {{variable}} como {{$json.variable}}
    const regex1 = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    const regex2 = new RegExp(`\\{\\{\\$json\\.${key}\\}\\}`, 'g');
    result = result.replace(regex1, value || '');
    result = result.replace(regex2, value || '');
  }
  
  return result;
}

// Obtener variables de una plantilla
app.get('/api/templates/:id/variables', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get("SELECT html FROM templates WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Plantilla no encontrada' });
      return;
    }
    
    const variables = extractVariables(row.html);
    res.json({ variables });
  });
});

// Preview de plantilla con variables reemplazadas
app.post('/api/templates/:id/preview', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { variables } = req.body;
  
  db.get("SELECT * FROM templates WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Plantilla no encontrada' });
      return;
    }
    
    const processedHtml = replaceVariables(row.html, variables || {});
    
    res.json({
      ...row,
      html: processedHtml,
      originalVariables: extractVariables(row.html)
    });
  });
});

// ==========================================
// ENDPOINT DE ENVÍO DE EMAILS CON NODEMAILER
// ==========================================

// Enviar email con plantilla
app.post('/api/templates/:id/send', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { to, subject, variables } = req.body;
  
  // Validar entrada
  if (!to || !subject) {
    return res.status(400).json({ error: 'Destinatario y asunto son requeridos' });
  }
  
  // Verificar configuración de email
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(500).json({ 
      error: 'Email no configurado. Por favor configura EMAIL_USER y EMAIL_PASS en el archivo .env' 
    });
  }
  
  try {
    // Obtener la plantilla
    const template = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM templates WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!template) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
    
    // Procesar HTML con variables
    const processedHtml = replaceVariables(template.html, variables || {});
    
    // Configurar el email
    const mailOptions = {
      from: `"Gestor de Plantillas" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: processedHtml
    };
    
    // Enviar el email
    const info = await transporter.sendMail(mailOptions);
    
    // Responder con éxito
    res.json({
      success: true,
      message: 'Email enviado exitosamente',
      messageId: info.messageId,
      accepted: info.accepted
    });
    
  } catch (error) {
    console.error('Error enviando email:', error);
    
    // Mensajes de error específicos
    if (error.code === 'EAUTH') {
      res.status(500).json({ 
        error: 'Error de autenticación. Verifica EMAIL_USER y EMAIL_PASS en .env' 
      });
    } else if (error.code === 'ECONNECTION') {
      res.status(500).json({ 
        error: 'Error de conexión con Gmail. Verifica tu conexión a internet' 
      });
    } else {
      res.status(500).json({ 
        error: 'Error enviando email: ' + error.message 
      });
    }
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('API disponible en:');
  console.log(`  GET    http://localhost:${PORT}/api/templates`);
  console.log(`  POST   http://localhost:${PORT}/api/templates`);
  console.log(`  PUT    http://localhost:${PORT}/api/templates/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/templates/:id`);
});