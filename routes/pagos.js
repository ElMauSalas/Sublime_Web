// En tu archivo routes/pagos.js

const express = require('express');
const router = express.Router();
require('dotenv').config({ path: '../.env' }); // Ajusta la ruta a .env si es necesario
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db'); // Tu configuración de conexión a la BD

router.post('/crear-sesion-checkout', async (req, res) => {
    const { items } = req.body; // Recibes: [{ id: 'ID_PRODUCTO_EN_TU_BD', quantity: N }, ...]

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'No hay ítems en la solicitud.' });
    }

    try {
        const line_items = await Promise.all(items.map(async (item) => {
            // 1. Obtener los detalles del producto (nombre, precio) DESDE TU BASE DE DATOS MySQL
            const [rows] = await db.promise().query('SELECT nombre, precio FROM productos WHERE id_producto = ?', [item.id]); // ¡AJUSTA "id_producto" y "precio" al nombre real de tus columnas!

            if (rows.length === 0) {
                throw new Error(`Producto con ID ${item.id} no encontrado en tu base de datos.`);
            }
            const productoDeTuBD = rows[0];

            // 2. Construir el objeto price_data
            return {
                price_data: {
                    currency: 'mxn', // O la moneda que uses (ej: 'usd')
                    product_data: {
                        name: productoDeTuBD.nombre,
                        // description: productoDeTuBD.descripcion, // Opcional
                        // images: [productoDeTuBD.url_imagen], // Opcional, si tienes URLs de imágenes
                    },
                    unit_amount: Math.round(productoDeTuBD.precio * 100), // Precio en centavos. Ej: 50.00 MXN se convierte en 5000
                },
                quantity: item.quantity,
            };
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items, // Aquí van los ítems con price_data
            mode: 'payment',
            success_url: `${process.env.YOUR_DOMAIN || 'http://localhost:3000'}/pago-exitoso.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.YOUR_DOMAIN || 'http://localhost:3000'}/carrito.html`,
        });

        res.json({ id: session.id });

    } catch (error) {
        console.error("Error creando sesión de Stripe con price_data:", error.message);
        res.status(500).json({ error: 'Error interno del servidor al procesar el pago.', error_details: error.message });
    }
});

module.exports = router;