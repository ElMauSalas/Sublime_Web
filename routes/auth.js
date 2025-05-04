const express = require("express");
const nodemailer = require("nodemailer");

module.exports = (db) => {
  const router = express.Router();

  // Ruta para cambiar la contraseña y enviar confirmación por correo
  router.post("/cambiar-contrasena", (req, res) => {
    const { usuario, nuevaContrasena } = req.body;

    if (!usuario || !nuevaContrasena) {
      return res.status(400).json({ success: false, message: "Faltan datos." });
    }

    const queryUpdate = "UPDATE usuarios SET contrasena = ? WHERE usuario = ?";
    db.query(queryUpdate, [nuevaContrasena, usuario], (err, results) => {
      if (err) {
        console.error("❌ Error al cambiar la contraseña:", err);
        return res.status(500).json({ success: false, message: "Error interno del servidor." });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado." });
      }

      // Buscar email del usuario para enviar confirmación
      const queryEmail = "SELECT email FROM usuarios WHERE usuario = ?";
      db.query(queryEmail, [usuario], (err, results) => {
        if (err || results.length === 0) {
          return res.json({ success: true, message: "Contraseña actualizada, pero no se envió el correo." });
        }

        const destinatario = results[0].email;

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "maussp21@gmail.com",
            pass: "wdjd fmia shkt pdmt" // tu contraseña de aplicación de Gmail
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
            console.error("❌ Error al enviar el correo:", error);
            return res.json({ success: true, message: "Contraseña actualizada, pero error al enviar correo." });
          }

          return res.json({ success: true, message: "Contraseña actualizada y correo enviado." });
        });
      });
    });
  });

  return router;
};
