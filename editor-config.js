// Configuración y funciones adicionales para el Editor Visual

// Plantillas predefinidas para iniciar rápidamente
const templatePresets = {
    welcome: {
        title: 'Email de Bienvenida',
        content: `
            <h1>¡Bienvenido {{nombre_cliente}}!</h1>
            <p>Nos alegra mucho que te hayas unido a {{nombre_empresa}}.</p>
            <p>Tu cuenta ha sido creada exitosamente con el email: {{email_cliente}}</p>
            <p>Para comenzar, visita nuestro sitio web: {{web_empresa}}</p>
            <p>Si tienes alguna pregunta, contáctanos en {{email_empresa}}</p>
            <p>Saludos,<br>El equipo de {{nombre_empresa}}</p>
        `
    },
    order: {
        title: 'Confirmación de Pedido',
        content: `
            <h2>Pedido Confirmado</h2>
            <p>Hola {{nombre_cliente}},</p>
            <p>Tu pedido <strong>{{numero_pedido}}</strong> ha sido confirmado.</p>
            <ul>
                <li>Fecha: {{fecha_pedido}}</li>
                <li>Total: {{total_pedido}}</li>
                <li>Estado: {{estado_pedido}}</li>
            </ul>
            <p>Productos: {{productos}}</p>
            <p>Lo enviaremos a: {{direccion_cliente}}</p>
            <p>Gracias por tu compra!</p>
        `
    },
    newsletter: {
        title: 'Newsletter Mensual',
        content: `
            <h1>Newsletter de {{mes}} {{año}}</h1>
            <p>Hola {{nombre_cliente}},</p>
            <p>Aquí están las novedades de este mes en {{nombre_empresa}}:</p>
            <h3>Destacados</h3>
            <p>{{contenido_destacado}}</p>
            <h3>Próximos Eventos</h3>
            <p>{{eventos}}</p>
            <p>Visita nuestro sitio: {{web_empresa}}</p>
            <p>Síguenos en redes sociales!</p>
        `
    },
    reminder: {
        title: 'Recordatorio',
        content: `
            <p>Hola {{nombre_cliente}},</p>
            <p>Este es un recordatorio sobre: <strong>{{asunto}}</strong></p>
            <p>Fecha: {{fecha}}</p>
            <p>Detalles: {{detalles}}</p>
            <p>Si tienes preguntas, contáctanos en {{email_empresa}}</p>
            <p>Saludos,<br>{{nombre_remitente}}</p>
        `
    }
};

// Categorías de variables predefinidas expandidas
const variableCategories = {
    cliente: {
        icon: 'fa-user',
        color: 'blue',
        variables: [
            'nombre_cliente',
            'apellido_cliente',
            'email_cliente',
            'telefono_cliente',
            'direccion_cliente',
            'ciudad_cliente',
            'pais_cliente',
            'codigo_postal',
            'fecha_nacimiento',
            'genero'
        ]
    },
    empresa: {
        icon: 'fa-building',
        color: 'green',
        variables: [
            'nombre_empresa',
            'email_empresa',
            'telefono_empresa',
            'web_empresa',
            'direccion_empresa',
            'logo_empresa',
            'facebook_empresa',
            'twitter_empresa',
            'instagram_empresa',
            'linkedin_empresa'
        ]
    },
    pedido: {
        icon: 'fa-shopping-cart',
        color: 'orange',
        variables: [
            'numero_pedido',
            'fecha_pedido',
            'total_pedido',
            'subtotal_pedido',
            'descuento',
            'impuestos',
            'envio',
            'estado_pedido',
            'productos',
            'cantidad_productos',
            'metodo_pago',
            'codigo_seguimiento',
            'fecha_entrega',
            'transportista'
        ]
    },
    producto: {
        icon: 'fa-box',
        color: 'purple',
        variables: [
            'nombre_producto',
            'descripcion_producto',
            'precio_producto',
            'imagen_producto',
            'categoria_producto',
            'stock_producto',
            'sku_producto'
        ]
    },
    fecha: {
        icon: 'fa-calendar',
        color: 'red',
        variables: [
            'fecha_actual',
            'año',
            'mes',
            'dia',
            'dia_semana',
            'hora',
            'fecha_completa',
            'timestamp'
        ]
    },
    marketing: {
        icon: 'fa-bullhorn',
        color: 'pink',
        variables: [
            'codigo_descuento',
            'porcentaje_descuento',
            'fecha_expiracion',
            'link_oferta',
            'banner_promocion',
            'texto_cta',
            'link_cta'
        ]
    },
    contenido: {
        icon: 'fa-file-alt',
        color: 'indigo',
        variables: [
            'titulo',
            'subtitulo',
            'contenido',
            'resumen',
            'introduccion',
            'conclusion',
            'firma',
            'postdata'
        ]
    },
    legal: {
        icon: 'fa-gavel',
        color: 'gray',
        variables: [
            'terminos_condiciones',
            'politica_privacidad',
            'aviso_legal',
            'link_baja',
            'texto_gdpr'
        ]
    }
};

// Estilos CSS predefinidos para emails
const emailStyles = {
    modern: `
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333;
            background: #f5f5f5;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #2c3e50; 
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 { color: #34495e; }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    `,
    classic: `
        body { 
            font-family: Georgia, serif; 
            line-height: 1.8; 
            color: #2c3e50;
        }
        .container { 
            max-width: 600px; 
            margin: 20px auto; 
            padding: 30px;
            border: 1px solid #d0d0d0;
        }
        h1 { 
            color: #1a1a1a; 
            font-size: 28px;
            text-align: center;
        }
        h2 { 
            color: #2c3e50; 
            font-size: 22px;
        }
        .button {
            display: inline-block;
            padding: 10px 25px;
            background: #2c3e50;
            color: white;
            text-decoration: none;
        }
    `,
    minimal: `
        body { 
            font-family: 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.5; 
            color: #000;
            background: white;
        }
        .container { 
            max-width: 500px; 
            margin: 40px auto; 
            padding: 20px;
        }
        h1 { 
            font-weight: 300;
            font-size: 32px;
            margin-bottom: 20px;
        }
        h2 { 
            font-weight: 400;
            font-size: 20px;
        }
        .button {
            display: inline-block;
            padding: 8px 20px;
            border: 2px solid #000;
            color: #000;
            text-decoration: none;
            transition: all 0.3s;
        }
        .button:hover {
            background: #000;
            color: white;
        }
    `,
    colorful: `
        body { 
            font-family: 'Comic Sans MS', cursive; 
            line-height: 1.6; 
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container { 
            max-width: 600px; 
            margin: 20px auto; 
            padding: 30px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 { 
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 36px;
        }
        .button {
            display: inline-block;
            padding: 15px 35px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
    `
};

// Snippets de código HTML reutilizables
const htmlSnippets = {
    header: {
        simple: `<header style="text-align: center; padding: 20px 0;">
            <img src="{{logo_empresa}}" alt="{{nombre_empresa}}" style="max-width: 200px;">
        </header>`,
        withMenu: `<header style="background: #333; color: white; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <img src="{{logo_empresa}}" alt="{{nombre_empresa}}" style="max-width: 150px;">
                <nav>
                    <a href="{{web_empresa}}" style="color: white; margin: 0 10px;">Inicio</a>
                    <a href="{{web_empresa}}/productos" style="color: white; margin: 0 10px;">Productos</a>
                    <a href="{{web_empresa}}/contacto" style="color: white; margin: 0 10px;">Contacto</a>
                </nav>
            </div>
        </header>`
    },
    footer: {
        simple: `<footer style="text-align: center; margin-top: 40px; padding: 20px; border-top: 1px solid #e0e0e0;">
            <p>&copy; {{año}} {{nombre_empresa}}. Todos los derechos reservados.</p>
        </footer>`,
        social: `<footer style="text-align: center; margin-top: 40px; padding: 20px; background: #f8f8f8;">
            <div style="margin-bottom: 20px;">
                <a href="{{facebook_empresa}}" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/32/733/733547.png" alt="Facebook"></a>
                <a href="{{twitter_empresa}}" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/32/733/733579.png" alt="Twitter"></a>
                <a href="{{instagram_empresa}}" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/32/733/733558.png" alt="Instagram"></a>
                <a href="{{linkedin_empresa}}" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/32/733/733561.png" alt="LinkedIn"></a>
            </div>
            <p>&copy; {{año}} {{nombre_empresa}}. Todos los derechos reservados.</p>
            <p style="font-size: 12px; color: #666;">
                <a href="{{link_baja}}" style="color: #666;">Darse de baja</a> | 
                <a href="{{politica_privacidad}}" style="color: #666;">Política de Privacidad</a>
            </p>
        </footer>`,
        complete: `<footer style="background: #2c3e50; color: white; padding: 40px 20px; margin-top: 40px;">
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px;">
                    <div>
                        <h3>Contacto</h3>
                        <p>{{direccion_empresa}}</p>
                        <p>Tel: {{telefono_empresa}}</p>
                        <p>Email: {{email_empresa}}</p>
                    </div>
                    <div>
                        <h3>Síguenos</h3>
                        <p>
                            <a href="{{facebook_empresa}}" style="color: white;">Facebook</a> | 
                            <a href="{{twitter_empresa}}" style="color: white;">Twitter</a> | 
                            <a href="{{instagram_empresa}}" style="color: white;">Instagram</a>
                        </p>
                    </div>
                </div>
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #34495e;">
                    <p>&copy; {{año}} {{nombre_empresa}}. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>`
    },
    buttons: {
        primary: `<a href="{{link_cta}}" style="display: inline-block; padding: 12px 30px; background: #3498db; color: white; text-decoration: none; border-radius: 5px;">{{texto_cta}}</a>`,
        secondary: `<a href="{{link_cta}}" style="display: inline-block; padding: 12px 30px; background: white; color: #3498db; border: 2px solid #3498db; text-decoration: none; border-radius: 5px;">{{texto_cta}}</a>`,
        success: `<a href="{{link_cta}}" style="display: inline-block; padding: 12px 30px; background: #2ecc71; color: white; text-decoration: none; border-radius: 5px;">{{texto_cta}}</a>`,
        danger: `<a href="{{link_cta}}" style="display: inline-block; padding: 12px 30px; background: #e74c3c; color: white; text-decoration: none; border-radius: 5px;">{{texto_cta}}</a>`
    },
    alerts: {
        info: `<div style="padding: 15px; background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 5px; color: #0c5460; margin: 20px 0;">
            <strong>Información:</strong> {{mensaje}}
        </div>`,
        warning: `<div style="padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; color: #856404; margin: 20px 0;">
            <strong>Aviso:</strong> {{mensaje}}
        </div>`,
        success: `<div style="padding: 15px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; color: #155724; margin: 20px 0;">
            <strong>¡Éxito!</strong> {{mensaje}}
        </div>`,
        error: `<div style="padding: 15px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; color: #721c24; margin: 20px 0;">
            <strong>Error:</strong> {{mensaje}}
        </div>`
    },
    tables: {
        products: `<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Producto</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Cantidad</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Precio</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">{{nombre_producto}}</td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #dee2e6;">{{cantidad}}</td>
                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dee2e6;">{{precio_producto}}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold;">{{total_pedido}}</td>
                </tr>
            </tfoot>
        </table>`
    }
};

// Exportar configuración para usar en el editor
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        templatePresets,
        variableCategories,
        emailStyles,
        htmlSnippets
    };
}