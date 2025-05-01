const express = require("express");
const nodemailer = require("nodemailer");

module.exports = (db) => {
  const router = express.Router();

  // CAMBIAR CONTRASEÑA Y ENVIAR CORREO DE CONFIRMACIÓN
  router.post("/cambiar-contrasena", (req, res) => {
    const { usuario, nuevaContrasena } = req.body;

    if (!usuario || !nuevaContrasena) {
      return res.status(400).json({ success: false, message: "Faltan datos." });
    }

    const queryUpdate = "UPDATE usuarios SET contraseña = ? WHERE usuario = ?";
    db.query(queryUpdate, [nuevaContrasena, usuario], (err, results) => {
      if (err) {
        console.error("Error al cambiar contraseña:", err);
        return res.status(500).json({ success: false, message: "Error interno del servidor." });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado." });
      }

      // Buscar el email del usuario
      const queryEmail = "SELECT email FROM usuarios WHERE usuario = ?";
      db.query(queryEmail, [usuario], (err, results) => {
        if (err || results.length === 0) {
          return res.json({ success: true, message: "Contraseña actualizada. No se pudo enviar correo." });
        }

        const destinatario = results[0].email;

        // Enviar correo de confirmación
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "maussp21@gmail.com", // 🔒 tu correo
            pass: "wdjd fmia shkt pdmt" // 🔒 contraseña de aplicación (no la normal)
          }
        });

        const mailOptions = {
          from: "maussp21@gmail.com",
          to: destinatario,
          subject: "Confirmación de cambio de contraseña",
          text: `Hola ${usuario}, tu contraseña ha sido actualizada correctamente.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error al enviar correo:", error);
            return res.json({ success: true, message: "Contraseña actualizada. Error al enviar correo." });
          }

          return res.json({ success: true, message: "Contraseña actualizada y correo enviado." });
        });
      });
    });
  });

  return router;
};
