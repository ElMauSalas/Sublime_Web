const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Enviar correo desde formulario de contacto
router.post("/contacto", (req, res) => {
  const { nombre, email, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ success: false, message: "Todos los campos son obligatorios." });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'maussp21@gmail.com',      // ⚠️ Aquí tu correo
      pass: 'wdjd fmia shkt pdmt'        // ⚠️ Contraseña de app, no la normal
    }
  });

  const mailOptions = {
    from: email,
    to: 'maussp21@gmail.com',          // ⚠️ Aquí tu correo receptor
    subject: `Nuevo mensaje de ${nombre}`,
    text: `Nombre: ${nombre}\nCorreo: ${email}\nMensaje: ${mensaje}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar correo:", error);
      return res.status(500).send("Error al enviar el mensaje.");
    }
    console.log("Correo enviado:", info.response);
    res.send("¡Gracias por contactarnos! Te responderemos pronto.");
  });
});

module.exports = router;
