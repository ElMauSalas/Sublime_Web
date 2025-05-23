const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// Configuración de almacenamiento con nombre original
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // ← Usa el nombre original del archivo
  }
});

// Validación de tipo de archivo
const fileFilter = function (req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (.jpg, .jpeg, .png, .gif)"));
  }
};

// Inicializar multer con las validaciones
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

// Obtener todos los productos
router.get("/productos", (req, res) => {
  const query = "SELECT * FROM productos";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, data: results });
  });
});

// Agregar producto (solo admin)
router.post("/productos", upload.single("imagen"), (req, res) => {
  if (!req.session.user || req.session.user.rol !== "admin") {
    return res.status(403).json({ success: false, message: "Acceso denegado" });
  }

  const { nombre, descripcion, precio, cantidad, categoria } = req.body;
  const imagen = req.file ? `uploads/${req.file.originalname}` : null;

  const query = `INSERT INTO productos (nombre, descripcion, precio, cantidad, imagen, categoria)
                 VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(query, [nombre, descripcion, precio, cantidad, imagen, categoria], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

// Eliminar producto (solo admin)
router.delete("/productos/:id", (req, res) => {
  if (!req.session.user || req.session.user.rol !== "admin") {
    return res.status(403).json({ success: false, message: "Acceso denegado" });
  }

  const query = "DELETE FROM productos WHERE id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

module.exports = router;
