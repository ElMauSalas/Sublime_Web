// services/emailService.js

const nodemailer = require('nodemailer');

// Configura el "transporter" (el servicio que envía el correo)
// Usa variables de entorno para no exponer tus credenciales en el código.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tu_correo@gmail.com', // Tu dirección de correo de Gmail
        pass: 'tu_contraseña_de_aplicacion' // La contraseña de 16 letras que generaste
    },
    tls: {
        rejectUnauthorized: false // Necesario para envíos desde localhost en algunos casos
    }
});

/**
 * Función para enviar un correo de confirmación de compra.
 * @param {string} destinatario - El email del cliente.
 * @param {object} datosCompra - Un objeto con los detalles de la compra (nombre, total, productos).
 */
async function enviarTicketDeCompra(destinatario, datosCompra) {
    // Plantilla HTML para el correo
    const htmlTicket = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
            <h1 style="color: #8a2be2;">¡Gracias por tu compra, ${datosCompra.nombreCliente}!</h1>
            <p>Hemos recibido tu pedido y lo estamos procesando. Aquí tienes un resumen de tu compra:</p>
            <hr>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="border-bottom: 1px solid #ddd; padding: 8px; text-align: left;">Producto</th>
                        <th style="border-bottom: 1px solid #ddd; padding: 8px; text-align: center;">Talla</th>
                        <th style="border-bottom: 1px solid #ddd; padding: 8px; text-align: right;">Precio</th>
                    </tr>
                </thead>
                <tbody>
                    ${datosCompra.productos.map(p => `
                        <tr>
                            <td style="padding: 8px;">${p.nombre_producto} (x${p.cantidad})</td>
                            <td style="padding: 8px; text-align: center;">${p.talla}</td>
                            <td style="padding: 8px; text-align: right;">$${(p.precio * p.cantidad).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <hr>
            <h2 style="text-align: right; color: #333;">Total: $${datosCompra.total.toFixed(2)} MXN</h2>
            <p style="text-align: center; font-size: 12px; color: #777;">
                Este es un correo de confirmación automático.
            </p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: '"Tu Tienda" <tu_correo@gmail.com>', // Nombre y correo del remitente
            to: destinatario,
            subject: 'Confirmación de tu compra en Tu Tienda',
            html: htmlTicket
        });
        console.log(`✅ Ticket de compra enviado a ${destinatario}`);
    } catch (error) {
        console.error(`❌ Error al enviar correo a ${destinatario}:`, error);
    }
}

module.exports = { enviarTicketDeCompra };