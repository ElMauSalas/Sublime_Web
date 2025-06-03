// routes/productos.js - NO NECESITA CAMBIOS
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// ========== Configuración de Multer ==========
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) cb(null, true);
    else cb(new Error("Solo se permiten imágenes"));
};

const upload = multer({ storage, fileFilter });

// ========== CRUD PRODUCTOS ==========

// Obtener todos los productos
router.get("/productos", (req, res) => {
    const query = "SELECT * FROM productos";
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Error del servidor." });
        res.json({ success: true, data: results });
    });
});

// Insertar nuevo producto
router.post("/productos", upload.single("imagen"), (req, res) => {
    const { nombre, descripcion, precio, cantidad, categoria, tallas_disponibles } = req.body;
    const imagen = req.file ? `uploads/${req.file.filename}` : null;

    const query = `
        INSERT INTO productos (nombre, descripcion, precio, cantidad, imagen, categoria, tallas_disponibles)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(
        query,
        [nombre, descripcion, precio, cantidad, imagen, categoria, tallas_disponibles],
        (err) => {
            if (err) {
                console.error("❌ Error al insertar producto:", err);
                return res.status(500).json({ success: false, message: "Error al insertar producto" });
            }
            console.log("✅ Producto insertado con éxito:", { nombre, tallas_disponibles });
            res.json({ success: true });
        }
    );
});

// Eliminar producto por ID
router.delete("/productos/:id", (req, res) => {
    const query = "DELETE FROM productos WHERE id = ?";
    db.query(query, [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Error al eliminar." });
        res.json({ success: true });
    });
});

// Obtener un producto por ID
router.get("/producto/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM productos WHERE id = ?";
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
        res.json(results[0]);
    });
});

// Actualizar producto
router.post("/producto/editar/:id", upload.single("imagen"), (req, res) => {
    const { nombre, descripcion, precio, cantidad, categoria, tallas_disponibles } = req.body;
    const id = req.params.id;

    let sql, valores;

    if (req.file) {
        const imagen = `uploads/${req.file.filename}`;
        sql = `
            UPDATE productos
            SET nombre=?, descripcion=?, precio=?, cantidad=?, categoria=?, imagen=?, tallas_disponibles=?
            WHERE id=?`;
        valores = [nombre, descripcion, precio, cantidad, categoria, imagen, tallas_disponibles, id];
    } else {
        sql = `
            UPDATE productos
            SET nombre=?, descripcion=?, precio=?, cantidad=?, categoria=?, tallas_disponibles=?
            WHERE id=?`;
        valores = [nombre, descripcion, precio, cantidad, categoria, tallas_disponibles, id];
    }

    db.query(sql, valores, (err) => {
        if (err) {
            console.error("❌ Error en UPDATE:", err);
            return res.status(500).json({ error: err.message });
        }
        console.log("✅ Producto actualizado:", { id, nombre, tallas_disponibles });
        res.json({ mensaje: "Producto actualizado correctamente" });
    });
});

module.exports = router;