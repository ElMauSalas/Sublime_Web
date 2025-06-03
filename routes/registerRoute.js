const express = require("express");
const bcrypt = require("bcrypt");

module.exports = (db) => {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const { nombre, email, telefono, usuario, contrasena } = req.body;

    if (!nombre || !email || !telefono || !usuario || !contrasena) {
      return res.status(400).json({ success: false, message: "Todos los campos son obligatorios." });
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(contrasena, salt);

      const query = `
        INSERT INTO usuarios (nombre, email, telefono, usuario, contrasena)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(query, [nombre, email, telefono, usuario, hash], (err) => {
        if (err) {
          console.error("❌ Error al registrar:", err);
          return res.status(500).json({ success: false, message: "Error al registrar el usuario." });
        }

        res.json({ success: true, message: "Usuario registrado exitosamente." });
      });

    } catch (error) {
      console.error("❌ Error al encriptar:", error);
      res.status(500).json({ success: false, message: "Error en el servidor." });
    }
  });

  return router;
};
