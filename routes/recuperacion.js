const express = require("express");
const nodemailer = require("nodemailer");

module.exports = (db) => {
  const router = express.Router();

  // Solicitar código
  router.post("/recuperar", (req, res) => {
    const { email } = req.body;
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, results) => {
      if (err || results.length === 0) {
        return res.status(400).json({ success: false, message: "Correo no registrado." });
      }

      db.query("INSERT INTO codigos_recuperacion (email, codigo) VALUES (?, ?)", [email, codigo], (err2) => {
        if (err2) {
          return res.status(500).json({ success: false });
        }

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "maussp21@gmail.com",
            pass: "wdjd fmia shkt pdmt"
          }
        });

        const mailOptions = {
          from: "maussp21@gmail.com",
          to: email,
          subject: "Código de recuperación de contraseña",
          text: `Tu código de recuperación es: ${codigo}`
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            return res.status(500).json({ success: false });
          }

          res.json({ success: true, message: "Código enviado a tu correo." });
        });
      });
    });
  });

  // Verificar código
  router.post("/verificar-codigo", (req, res) => {
    const { email, codigo, nuevaContrasena } = req.body;

    db.query("SELECT * FROM codigos_recuperacion WHERE email = ? AND codigo = ? ORDER BY creado_en DESC LIMIT 1", [email, codigo], (err, results) => {
      if (err || results.length === 0) {
        return res.status(400).json({ success: false, message: "Código inválido o expirado." });
      }

      db.query("UPDATE usuarios SET contrasena = ? WHERE email = ?", [nuevaContrasena, email], (err2) => {
        if (err2) {
          return res.status(500).json({ success: false, message: "Error al actualizar la contraseña." });
        }

        res.json({ success: true, message: "Contraseña actualizada correctamente." });
      });
    });
  });

  return router;
};
