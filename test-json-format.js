// Script para probar plantilla con formato $json
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database('./templates.db');

const template = {
  id: uuidv4(),
  title: "Nueva reserva – 123 Action",
  description: "Plantilla para confirmación de reservas con formato $json",
  html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        .info-box {
            background: #f8f9fa;
            border-left: 4px solid #3498db;
            padding: 15px;
            margin: 20px 0;
        }
        .label {
            font-weight: bold;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Nueva Reserva – 123 Action</h1>
        
        <div class="info-box">
            <h2>Detalles de la Reserva</h2>
            <p>🍽️ <span class="label">Comida/Cena prevista:</span> {{$json.horaComidaCena}} (aproximada)</p>
            <p>📅 <span class="label">Fecha y hora de la actividad:</span> {{$json.fecha_hora_actividad}}</p>
            <p>👥 <span class="label">Nº de personas (aprox.):</span> {{$json.num_personas}}</p>
        </div>
        
        <div class="info-box">
            <h2>Información del Cliente</h2>
            <p><span class="label">Nombre de la reserva:</span> {{$json.nombre_cliente}}</p>
            <p><span class="label">Email:</span> {{$json.email_cliente}}</p>
            <p><span class="label">Teléfono:</span> {{$json.telefono}}</p>
            <p><span class="label">Motivo de celebración:</span> {{$json.motivo}}</p>
        </div>
        
        <div class="info-box" style="background: #d4edda; border-color: #28a745;">
            <p>✅ La reserva ha sido confirmada exitosamente.</p>
            <p>Recibirás un recordatorio antes del evento.</p>
        </div>
        
        <p style="text-align: center; margin-top: 30px; color: #666;">
            Gracias por elegir 123 Action<br>
            {{$json.nombre_empresa}}<br>
            {{$json.email_empresa}}
        </p>
    </div>
</body>
</html>`
};

db.run(
  "INSERT INTO templates (id, title, description, html) VALUES (?, ?, ?, ?)",
  [template.id, template.title, template.description, template.html],
  function(err) {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('✅ Plantilla con formato $json añadida exitosamente!');
      console.log('\n📝 Variables detectadas (se convertirán automáticamente):');
      console.log('  {{$json.horaComidaCena}} → {{horaComidaCena}}');
      console.log('  {{$json.fecha_hora_actividad}} → {{fecha_hora_actividad}}');
      console.log('  {{$json.num_personas}} → {{num_personas}}');
      console.log('  {{$json.nombre_cliente}} → {{nombre_cliente}}');
      console.log('  {{$json.email_cliente}} → {{email_cliente}}');
      console.log('  {{$json.telefono}} → {{telefono}}');
      console.log('  {{$json.motivo}} → {{motivo}}');
      console.log('  {{$json.nombre_empresa}} → {{nombre_empresa}}');
      console.log('  {{$json.email_empresa}} → {{email_empresa}}');
      console.log('\n✨ El sistema ahora reconoce ambos formatos!');
    }
    db.close();
  }
);