const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

// Conectar a la base de datos
const db = new sqlite3.Database('./templates.db');

const additionalTemplates = [
  {
    id: uuidv4(),
    title: "Recordatorio de Cita",
    description: "Plantilla para recordar citas médicas o reuniones",
    html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; background: #f8f9fa; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ff6b6b, #feca57); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .appointment-details { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .button { display: inline-block; padding: 15px 30px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 25px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Recordatorio de Cita</h1>
        </div>
        <div class="content">
            <h2>Hola [Nombre],</h2>
            <p>Este es un recordatorio amigable sobre tu próxima cita:</p>
            
            <div class="appointment-details">
                <h3>Detalles de la Cita</h3>
                <p><strong>📅 Fecha:</strong> [Fecha]</p>
                <p><strong>🕐 Hora:</strong> [Hora]</p>
                <p><strong>📍 Lugar:</strong> [Dirección]</p>
                <p><strong>👨‍⚕️ Con:</strong> [Doctor/Persona]</p>
            </div>
            
            <p>Si necesitas reprogramar o tienes alguna pregunta, no dudes en contactarnos.</p>
            
            <center>
                <a href="#" class="button">Confirmar Asistencia</a>
            </center>
        </div>
    </div>
</body>
</html>`
  },
  {
    id: uuidv4(),
    title: "Promoción Especial",
    description: "Plantilla para ofertas y promociones comerciales",
    html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #000; color: white; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; overflow: hidden; }
        .header { padding: 40px; text-align: center; background: rgba(255,255,255,0.1); }
        .offer { background: #ff4757; color: white; padding: 30px; text-align: center; font-size: 24px; font-weight: bold; }
        .content { padding: 40px; }
        .cta-button { display: inline-block; padding: 20px 40px; background: #ff4757; color: white; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: bold; margin: 20px 0; }
        .timer { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 ¡OFERTA ESPECIAL! 🎉</h1>
        </div>
        <div class="offer">
            ¡50% DE DESCUENTO!
        </div>
        <div class="content">
            <h2>¡Hola [Nombre]!</h2>
            <p>No podíamos dejarte fuera de esta increíble promoción. Por tiempo limitado, disfruta de:</p>
            
            <ul>
                <li>✨ 50% de descuento en productos seleccionados</li>
                <li>🚚 Envío gratuito</li>
                <li>🎁 Regalo sorpresa en compras superiores a $100</li>
            </ul>
            
            <div class="timer">
                <h3>⏰ ¡Solo por 48 horas!</h3>
                <p>La oferta expira el [Fecha]</p>
            </div>
            
            <center>
                <a href="#" class="cta-button">COMPRAR AHORA</a>
            </center>
            
            <p><small>* Términos y condiciones aplican. No se puede combinar con otras ofertas.</small></p>
        </div>
    </div>
</body>
</html>`
  },
  {
    id: uuidv4(),
    title: "Encuesta de Satisfacción",
    description: "Solicitar feedback de clientes o usuarios",
    html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
        .container { max-width: 550px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 15px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%); color: white; padding: 35px; text-align: center; }
        .content { padding: 35px; line-height: 1.6; }
        .rating-buttons { display: flex; gap: 10px; justify-content: center; margin: 25px 0; }
        .rating-btn { width: 40px; height: 40px; background: #e9ecef; border-radius: 50%; border: none; font-size: 18px; cursor: pointer; }
        .survey-button { display: block; width: 200px; margin: 25px auto; padding: 15px; background: #48c6ef; color: white; text-decoration: none; border-radius: 25px; text-align: center; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💭 Tu Opinión Nos Importa</h1>
        </div>
        <div class="content">
            <h2>¡Hola [Nombre]!</h2>
            <p>Esperamos que hayas tenido una excelente experiencia con nosotros. Tu opinión es muy valiosa y nos ayuda a mejorar constantemente.</p>
            
            <p><strong>¿Cómo calificarías tu experiencia?</strong></p>
            <div class="rating-buttons">
                <button class="rating-btn">😞</button>
                <button class="rating-btn">😐</button>
                <button class="rating-btn">🙂</button>
                <button class="rating-btn">😊</button>
                <button class="rating-btn">🤩</button>
            </div>
            
            <p>La encuesta toma menos de 2 minutos y nos ayuda enormemente a brindarte un mejor servicio.</p>
            
            <a href="#" class="survey-button">Completar Encuesta</a>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
                Como agradecimiento, recibirás un 10% de descuento en tu próxima compra.
            </p>
        </div>
    </div>
</body>
</html>`
  }
];

// Insertar plantillas adicionales
console.log('🔧 Agregando plantillas de ejemplo adicionales...');

const stmt = db.prepare("INSERT INTO templates (id, title, description, html) VALUES (?, ?, ?, ?)");

additionalTemplates.forEach((template, index) => {
  stmt.run(template.id, template.title, template.description, template.html, (err) => {
    if (err) {
      console.error(`❌ Error agregando plantilla ${index + 1}:`, err.message);
    } else {
      console.log(`✅ Plantilla agregada: ${template.title}`);
    }
  });
});

stmt.finalize(() => {
  console.log('🎉 ¡Plantillas de ejemplo agregadas exitosamente!');
  db.close();
});