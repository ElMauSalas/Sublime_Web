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
            pass: "wdjd fmia shkt pdmt"
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

  // ✅ Ruta para cerrar sesión correctamente
  router.get("/logout", (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send("Error al cerrar sesión");
      }
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        sameSite: "lax"
      });
      res.sendStatus(200); // ✅ NO redirección para que no guarde cookie
    });
  });

  // Ruta para verificar si hay sesión activa
  router.get("/user-data", (req, res) => {
    if (req.session && req.session.user) {
      console.log("📦 Sesión activa:", req.session.user); // Agregado para depurar
      res.json({ success: true, user: req.session.user });
    } else {
      res.json({ success: false });
    }
  });


  // Ruta de login
router.post("/login", (req, res) => {
  const { usuario, contrasena } = req.body;

  const query = `SELECT id AS usuario_id, nombre, rol FROM usuarios WHERE usuario = ? AND contrasena = ?`;
  db.query(query, [usuario, contrasena], (err, results) => {
    if (err) {
      console.error("Error en el login:", err);
      return res.status(500).json({ success: false, message: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }

    const { usuario_id, nombre, rol } = results[0];
    req.session.user = { id: usuario_id, nombre, rol };

    res.json({ success: true, usuario_id, nombre, rol });
  });
});


  return router;
};
