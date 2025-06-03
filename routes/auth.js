const express = require("express");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

module.exports = (db) => {
  const router = express.Router();

  router.post("/cambiar-contrasena", async (req, res) => {
    const { usuario, nuevaContrasena } = req.body;

    if (!usuario || !nuevaContrasena) {
      return res.status(400).json({ success: false, message: "Faltan datos." });
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(nuevaContrasena, salt);

      const queryUpdate = "UPDATE usuarios SET contrasena = ? WHERE usuario = ?";
      db.query(queryUpdate, [hashedPassword, usuario], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Error interno." });
        if (results.affectedRows === 0) return res.status(404).json({ success: false, message: "Usuario no encontrado." });

        const queryEmail = "SELECT email FROM usuarios WHERE usuario = ?";
        db.query(queryEmail, [usuario], (err, results) => {
          if (err || results.length === 0) {
            return res.json({ success: true, message: "Contraseña actualizada, sin correo." });
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

          transporter.sendMail(mailOptions, () => {
            return res.json({ success: true, message: "Contraseña actualizada y correo enviado." });
          });
        });
      });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
  });

  router.get("/logout", (req, res) => {
    req.session.destroy(err => {
      if (err) return res.status(500).send("Error al cerrar sesión");
      res.clearCookie("connect.sid", { path: "/", httpOnly: true, sameSite: "lax" });
      res.sendStatus(200);
    });
  });

  router.get("/user-data", (req, res) => {
    if (req.session && req.session.user) {
      res.json({ success: true, user: req.session.user });
    } else {
      res.json({ success: false });
    }
  });

  router.post("/login", (req, res) => {
    const { usuario, contrasena } = req.body;

    const query = `SELECT id AS usuario_id, nombre, rol, contrasena FROM usuarios WHERE usuario = ?`;
    db.query(query, [usuario], async (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Error en el servidor" });
      if (results.length === 0) return res.status(401).json({ success: false, message: "Usuario no encontrado" });

      const { usuario_id, nombre, rol, contrasena: hashedPassword } = results[0];
      const coincide = await bcrypt.compare(contrasena, hashedPassword);

      if (!coincide) return res.status(401).json({ success: false, message: "Contraseña incorrecta" });

      req.session.user = { id: usuario_id, nombre, rol };
      res.json({ success: true, usuario_id, nombre, rol });
    });
  });

  return router;
};
