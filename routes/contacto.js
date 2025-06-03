const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/contacto", upload.array("imagenes", 15), (req, res) => {
    console.log(req.body);
    console.log(req.files);

    const { nombre, email, mensaje } = req.body;
    const imagenes = req.files;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: 'maussp21@gmail.com',
            pass: 'wdjd fmia shkt pdmt'
        }
    });

    const mailOptions = {
        from: email,
        to: "maussp21@gmail.com",
        subject: `Nuevo mensaje de ${nombre}`,
        text: `Nombre: ${nombre}\nCorreo: ${email}\nMensaje: ${mensaje}`,
        attachments: imagenes.map(file => ({
            filename: file.originalname,
            path: file.path
        }))
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error al enviar el correo:", error);
            return res.status(500).send("Error al enviar el mensaje.");
        }

        imagenes.forEach(img => {
            fs.unlink(img.path, err => {
                if (err) console.error("Error al eliminar imagen:", err);
            });
        });

        res.send("¡Gracias por contactarnos!");
    });
});

module.exports = router;
