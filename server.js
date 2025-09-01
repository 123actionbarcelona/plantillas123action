const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-super-segura-2024';

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
  db.all("SELECT * FROM templates ORDER BY updated_at DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
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
  const { title, description, html } = req.body;
  const id = uuidv4();
  
  db.run(
    "INSERT INTO templates (id, title, description, html) VALUES (?, ?, ?, ?)",
    [id, title, description, html],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get("SELECT * FROM templates WHERE id = ?", [id], (err, row) => {
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
  const { title, description, html } = req.body;
  
  db.run(
    "UPDATE templates SET title = ?, description = ?, html = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [title, description, html, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Plantilla no encontrada' });
        return;
      }
      
      db.get("SELECT * FROM templates WHERE id = ?", [id], (err, row) => {
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('API disponible en:');
  console.log(`  GET    http://localhost:${PORT}/api/templates`);
  console.log(`  POST   http://localhost:${PORT}/api/templates`);
  console.log(`  PUT    http://localhost:${PORT}/api/templates/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/templates/:id`);
});