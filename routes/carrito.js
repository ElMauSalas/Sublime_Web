const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Asegúrate de que la ruta a tu config de BD sea correcta

// --- RUTA PARA OBTENER EL CARRITO (Tu código existente, está bien) ---
router.get('/:usuarioId', (req, res) => {
    const { usuarioId } = req.params;

    const query = `
        SELECT 
            c.producto_id,
            c.cantidad,
            c.talla, 
            p.nombre AS nombre_producto,
            p.precio,
            p.imagen,
            c.id AS carrito_id -- Es útil tener el id del carrito para futuras operaciones
        FROM carrito c
        JOIN productos p ON c.producto_id = p.id
        WHERE c.usuario_id = ?;
    `;

    db.query(query, [usuarioId], (err, results) => {
        if (err) {
            console.error("Error al obtener el carrito:", err);
            return res.status(500).json({ success: false, message: 'Error del servidor.' });
        }
        res.json({ success: true, carrito: results });
    });
});


// --- ✨ RUTA PARA AGREGAR PRODUCTOS (LA QUE FALTABA) ✨ ---
router.post('/agregar', (req, res) => {
    // Obtenemos los datos que envía el frontend (productos.js)
    const { usuario_id, producto_id, cantidad, talla } = req.body;

    // 1. Verificamos si ese producto (con esa talla específica) ya está en el carrito del usuario
    // Nota: El "(talla = ? OR (talla IS NULL AND ? IS NULL))" maneja productos con y sin talla.
    const checkQuery = "SELECT * FROM carrito WHERE usuario_id = ? AND producto_id = ? AND (talla = ? OR (talla IS NULL AND ? IS NULL))";

    db.query(checkQuery, [usuario_id, producto_id, talla, talla], (err, results) => {
        if (err) {
            console.error("Error al verificar el carrito:", err);
            return res.status(500).json({ success: false, message: "Error del servidor." });
        }

        if (results.length > 0) {
            // 2. Si el producto ya existe, actualizamos la cantidad (sumamos la nueva cantidad)
            const updateQuery = "UPDATE carrito SET cantidad = cantidad + ? WHERE id = ?";
            db.query(updateQuery, [cantidad, results[0].id], (err) => {
                if (err) {
                    console.error("Error al actualizar el carrito:", err);
                    return res.status(500).json({ success: false, message: "Error al actualizar." });
                }
                res.json({ success: true, message: "Cantidad actualizada en el carrito." });
            });
        } else {
            // 3. Si el producto no existe, lo insertamos como una nueva fila
            const insertQuery = "INSERT INTO carrito (usuario_id, producto_id, cantidad, talla) VALUES (?, ?, ?, ?)";
            db.query(insertQuery, [usuario_id, producto_id, cantidad, talla], (err) => {
                if (err) {
                    console.error("Error al insertar en el carrito:", err);
                    return res.status(500).json({ success: false, message: "Error al insertar." });
                }
                res.json({ success: true, message: "Producto agregado al carrito." });
            });
        }
    });
});


// --- RUTA PARA ELIMINAR DEL CARRITO (Tu código existente, está bien) ---
router.delete('/eliminar/:usuarioId/:productoId', (req, res) => {
    const { usuarioId, productoId } = req.params;
    const { cantidad } = req.body; // Cantidad a eliminar

    // Tu lógica de eliminación. Por ahora, asumo que quieres eliminar todas las unidades de un producto_id.
    // Si quieres eliminar una cantidad específica, la lógica debe ser más compleja (restar cantidad).
    const query = 'DELETE FROM carrito WHERE usuario_id = ? AND producto_id = ?';
    
    db.query(query, [usuarioId, productoId], (err, result) => {
        if (err) {
            console.error("Error al eliminar del carrito:", err);
            return res.status(500).json({ success: false, message: 'Error del servidor al eliminar.' });
        }
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Producto(s) eliminado(s) del carrito.' });
        } else {
            res.status(404).json({ success: false, message: 'No se encontró el producto en el carrito.' });
        }
    });
});


module.exports = router;