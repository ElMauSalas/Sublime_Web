const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const path = require("path");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");

const app = express();

// ======================== CONFIGURACIONES ========================

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "clave_secreta_segura",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax"
  }
}));

// ======================== CONEXIÓN BASE DE DATOS ========================

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "usuarios",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar con la base de datos:", err.stack);
    return;
  }
  console.log("✅ Conexión a la base de datos establecida.");
});

// ======================== RUTAS PERSONALIZADAS ========================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/user-data", (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.json({ success: false });
  }
});

app.get("/api/perfil/detalles", (req, res) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ success: false, message: "No autorizado" });
  }

  const usuarioId = req.session.user.id;
  const query = "SELECT nombre, usuario, email, telefono, rol FROM usuarios WHERE id = ?";

  db.query(query, [usuarioId], (err, results) => {
    if (err) {
      console.error("Error al obtener perfil:", err);
      return res.status(500).json({ success: false, message: "Error interno del servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({ success: true, perfil: results[0] });
  });
});

// ======================== IMPORTAR Y USAR RUTAS ========================

const productosRoutes = require("./routes/productos");
app.use("/", productosRoutes);

const carritoRoutes = require("./routes/carrito");
app.use("/carrito", carritoRoutes);

const contactoRoutes = require("./routes/contacto");
app.use("/", contactoRoutes);

const authRoutes = require("./routes/auth")(db);
app.use("/", authRoutes);

const recuperacionRoutes = require("./routes/recuperacion")(db);
app.use("/", recuperacionRoutes);

// ✅ NUEVA RUTA REGISTRO CON CONTRASEÑA ENCRIPTADA
const registerRoute = require("./routes/registerRoute")(db);
app.use("/register", registerRoute);

// En server.js
const ordenRoutes = require('./routes/orden');
app.use('/orden', ordenRoutes);

// ======================== INICIAR SERVIDOR ========================

app.listen(3000, () => {
  console.log("🚀 Servidor iniciado en http://localhost:3000");
});
