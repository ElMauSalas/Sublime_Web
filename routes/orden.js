// routes/orden.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { enviarTicketDeCompra } = require('../services/emailService'); // Importamos nuestro servicio de correo

// 1. RUTA PARA CREAR UNA ORDEN ANTES DE IR A PAYPAL
router.post('/crear', (req, res) => {
    const { usuarioId } = req.body;

    // Primero, obtenemos el total del carrito para guardarlo en la orden
    const queryTotal = "SELECT SUM(p.precio * c.cantidad) AS total FROM carrito c JOIN productos p ON c.producto_id = p.id WHERE c.usuario_id = ?";
    db.query(queryTotal, [usuarioId], (err, result) => {
        if (err || result.length === 0) {
            return res.status(500).json({ success: false, message: 'Error al calcular total.' });
        }
        const total = result[0].total;

        // Insertamos la nueva orden en la tabla 'ordenes' con estado 'pendiente'
        const queryInsertOrden = "INSERT INTO ordenes (usuario_id, total, estado_pago) VALUES (?, ?, 'pendiente')";
        db.query(queryInsertOrden, [usuarioId, total], (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error al crear la orden.' });
            }
            const ordenId = result.insertId;
            res.json({ success: true, ordenId: ordenId });
        });
    });
});

// 2. RUTA WEBHOOK PARA RECIBIR NOTIFICACIONES DE PAYPAL (IPN)
// En tu PayPal Developer Dashboard, debes configurar esta URL: https://tu-dominio.com/orden/ipn-paypal
router.post('/ipn-paypal', async (req, res) => {
    console.log('--- Notificación de PayPal (IPN) Recibida ---');
    console.log(req.body);

    const { payment_status, custom, receiver_email } = req.body;
    const ordenId = custom; // El ID de nuestra orden que pasamos en el formulario

    // Aquí deberías añadir una verificación para asegurarte que la notificación es genuina de PayPal.
    // Por simplicidad, por ahora solo verificaremos el estado del pago.

    // Comprueba que el pago se completó y fue a tu cuenta de vendedor
    if (payment_status === 'Completed' && receiver_email === 'sb-di31p41232675@business.example.com') {
        
        // Actualizamos el estado de la orden en nuestra base de datos
        const queryUpdate = "UPDATE ordenes SET estado_pago = 'pagado' WHERE id = ?";
        db.query(queryUpdate, [ordenId], async (err) => {
            if (err) {
                console.error('Error al actualizar la orden:', err);
                return;
            }

            console.log(`Orden ${ordenId} marcada como pagada. Enviando ticket...`);

            // Obtenemos los datos necesarios para el ticket
            const queryDatos = `
                SELECT u.email, u.nombre AS nombreCliente, o.total, p.nombre AS nombre_producto, c.cantidad, c.talla, p.precio
                FROM ordenes o
                JOIN usuarios u ON o.usuario_id = u.id
                JOIN carrito c ON c.usuario_id = o.usuario_id
                JOIN productos p ON c.producto_id = p.id
                WHERE o.id = ?;
            `;

            db.query(queryDatos, [ordenId], (err, results) => {
                if (err || results.length === 0) {
                    console.error('Error al obtener datos para el ticket');
                    return;
                }

                const datosParaEmail = {
                    nombreCliente: results[0].nombreCliente,
                    total: results[0].total,
                    productos: results.map(r => ({
                        nombre_producto: r.nombre_producto,
                        cantidad: r.cantidad,
                        talla: r.talla,
                        precio: r.precio
                    }))
                };

                // Enviamos el correo
                enviarTicketDeCompra(results[0].email, datosParaEmail);

                // Una vez procesado el pedido, vaciamos el carrito del usuario
                db.query("DELETE FROM carrito WHERE usuario_id = ?", [results[0].usuario_id]);
            });
        });
    }

    // Respondemos a PayPal para que sepa que recibimos la notificación
    res.status(200).send('IPN Recibido');
});


module.exports = router;