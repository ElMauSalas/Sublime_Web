const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Obtener todos los productos
router.get("/productos", (req, res) => {
  const query = "SELECT * FROM productos";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener productos:", err);
      return res.status(500).json({ success: false, message: "Error al obtener productos." });
    }
    res.json({ success: true, data: results });
  });
});

module.exports = router;
