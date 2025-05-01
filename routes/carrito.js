const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Asegúrate que apunta a tu archivo db.js

// ========== Agregar producto al carrito y actualizar stock ==========
router.post("/carrito/agregar", (req, res) => {
  const { usuario_id, producto_id, cantidad } = req.body;

  if (!usuario_id || !producto_id || !cantidad) {
    return res.status(400).json({ success: false, message: "Faltan datos para agregar al carrito." });
  }

  // Verificar stock disponible
  const queryCheckStock = "SELECT cantidad FROM productos WHERE id = ?";
  db.query(queryCheckStock, [producto_id], (err, results) => {
    if (err) {
      console.error("Error al verificar stock:", err);
      return res.status(500).json({ success: false, message: "Error interno al verificar stock." });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Producto no encontrado." });
    }

    const stockDisponible = results[0].cantidad;

    if (stockDisponible < cantidad) {
      return res.status(400).json({ success: false, message: "No hay suficiente stock disponible." });
    }

    // Insertar producto en carrito
    const queryInsertCarrito = "INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)";
    db.query(queryInsertCarrito, [usuario_id, producto_id, cantidad], (err) => {
      if (err) {
        console.error("Error al agregar producto al carrito:", err);
        return res.status(500).json({ success: false, message: "Error interno al agregar al carrito." });
      }

      // Actualizar stock
      const queryUpdateStock = "UPDATE productos SET cantidad = cantidad - ? WHERE id = ?";
      db.query(queryUpdateStock, [cantidad, producto_id], (err) => {
        if (err) {
          console.error("Error al actualizar stock:", err);
          return res.status(500).json({ success: false, message: "Error interno al actualizar stock." });
        }

        res.json({ success: true, message: "Producto agregado al carrito y stock actualizado." });
      });
    });
  });
});

// ========== Obtener productos del carrito ==========
router.get("/carrito/:usuario_id", (req, res) => {
  const { usuario_id } = req.params;

  const query = `
    SELECT c.producto_id, p.nombre AS nombre_producto, p.precio, c.cantidad, (p.precio * c.cantidad) AS total, p.imagen
    FROM carrito c
    JOIN productos p ON c.producto_id = p.id
    WHERE c.usuario_id = ?
  `;

  db.query(query, [usuario_id], (err, results) => {
    if (err) {
      console.error("Error al obtener carrito:", err);
      return res.status(500).json({ success: false, message: "Error interno al obtener carrito." });
    }
    res.json({ success: true, carrito: results });
  });
});

// ========== Eliminar cantidad específica del carrito y devolver stock ==========
router.delete("/carrito/eliminar/:usuario_id/:producto_id", (req, res) => {
  const { usuario_id, producto_id } = req.params;
  const { cantidad } = req.body; // Cantidad que quiero eliminar

  if (!usuario_id || !producto_id || !cantidad) {
    return res.status(400).json({ success: false, message: "Faltan datos para eliminar del carrito." });
  }

  // Verificar cantidad en carrito
  const queryCheckCarrito = "SELECT cantidad FROM carrito WHERE usuario_id = ? AND producto_id = ?";
  db.query(queryCheckCarrito, [usuario_id, producto_id], (err, results) => {
    if (err) {
      console.error("Error al consultar carrito:", err);
      return res.status(500).json({ success: false, message: "Error interno." });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Producto no encontrado en el carrito." });
    }

    const cantidadActual = results[0].cantidad;

    if (cantidad > cantidadActual) {
      return res.status(400).json({ success: false, message: "No puedes eliminar más cantidad de la que tienes en el carrito." });
    }

    if (cantidad === cantidadActual) {
      // Eliminar totalmente del carrito
      const queryDeleteCarrito = "DELETE FROM carrito WHERE usuario_id = ? AND producto_id = ?";
      db.query(queryDeleteCarrito, [usuario_id, producto_id], (err) => {
        if (err) {
          console.error("Error al eliminar del carrito:", err);
          return res.status(500).json({ success: false, message: "Error al eliminar del carrito." });
        }

        // Devolver al stock
        const queryUpdateStock = "UPDATE productos SET cantidad = cantidad + ? WHERE id = ?";
        db.query(queryUpdateStock, [cantidad, producto_id], (err) => {
          if (err) {
            console.error("Error al actualizar stock:", err);
            return res.status(500).json({ success: false, message: "Error al actualizar stock." });
          }

          res.json({ success: true, message: "Producto eliminado del carrito y stock actualizado." });
        });
      });
    } else {
      // Reducir cantidad en carrito
      const nuevaCantidad = cantidadActual - cantidad;
      const queryUpdateCarrito = "UPDATE carrito SET cantidad = ? WHERE usuario_id = ? AND producto_id = ?";
      db.query(queryUpdateCarrito, [nuevaCantidad, usuario_id, producto_id], (err) => {
        if (err) {
          console.error("Error al actualizar cantidad en carrito:", err);
          return res.status(500).json({ success: false, message: "Error al actualizar cantidad en carrito." });
        }

        // Devolver cantidad al stock
        const queryUpdateStock = "UPDATE productos SET cantidad = cantidad + ? WHERE id = ?";
        db.query(queryUpdateStock, [cantidad, producto_id], (err) => {
          if (err) {
            console.error("Error al actualizar stock:", err);
            return res.status(500).json({ success: false, message: "Error al actualizar stock." });
          }

          res.json({ success: true, message: "Cantidad reducida en carrito y stock actualizado." });
        });
      });
    }
  });
});

// ========== Vaciar todo el carrito de un usuario (OPCIONAL) ==========
router.delete("/carrito/vaciar/:usuario_id", (req, res) => {
  const { usuario_id } = req.params;

  if (!usuario_id) {
    return res.status(400).json({ success: false, message: "Falta usuario." });
  }

  // Obtener todos los productos del carrito
  const queryGetProductos = "SELECT producto_id, cantidad FROM carrito WHERE usuario_id = ?";
  db.query(queryGetProductos, [usuario_id], (err, results) => {
    if (err) {
      console.error("Error al consultar productos del carrito:", err);
      return res.status(500).json({ success: false, message: "Error interno." });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "No hay productos en el carrito." });
    }

    // Devolver stock
    results.forEach((item) => {
      const queryUpdateStock = "UPDATE productos SET cantidad = cantidad + ? WHERE id = ?";
      db.query(queryUpdateStock, [item.cantidad, item.producto_id], (err) => {
        if (err) console.error("Error actualizando stock al vaciar carrito:", err);
      });
    });

    // Eliminar todo el carrito
    const queryDeleteCarrito = "DELETE FROM carrito WHERE usuario_id = ?";
    db.query(queryDeleteCarrito, [usuario_id], (err) => {
      if (err) {
        console.error("Error al vaciar carrito:", err);
        return res.status(500).json({ success: false, message: "Error interno al vaciar carrito." });
      }

      res.json({ success: true, message: "Carrito vaciado y stock actualizado." });
    });
  });
});

module.exports = router;
