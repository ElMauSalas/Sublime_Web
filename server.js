const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const path = require("path");
const nodemailer = require("nodemailer");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");


const app = express();



// Configuraciones iniciales
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión
app.use(session({
  secret: "clave_secreta_segura",
  resave: false,
  saveUninitialized: true,
}));

// Conexión a la base de datos
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "usuarios",
});

db.connect((err) => {
  if (err) {
    console.error("Error al conectar con la base de datos: " + err.stack);
    return;
  }
  console.log("Conexión a la base de datos establecida.");
});

// ========= LOGIN =========
app.post("/login", (req, res) => {
  const { usuario, contrasena } = req.body;

  const query = `SELECT id AS usuario_id, nombre FROM usuarios WHERE usuario = ? AND contrasena = ?`;
  db.query(query, [usuario, contrasena], (err, results) => {
    if (err) {
      console.error("Error en el login:", err);
      return res.status(500).json({ success: false, message: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }

    const { usuario_id, nombre } = results[0];
    req.session.user = { id: usuario_id, nombre: nombre };

    res.json({ success: true, usuario_id, nombre });
  });
});

// ========= LOGOUT =========
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).send("Error al cerrar sesión");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

// ========= REGISTRO =========
app.post("/register", (req, res) => {
  const { nombre, email, telefono, usuario, contrasena } = req.body;

  if (!nombre || !email || !telefono || !usuario || !contrasena) {
    return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
  }

  const query = `INSERT INTO usuarios (nombre, email, telefono, usuario, contrasena) VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [nombre, email, telefono, usuario, contrasena], (err, results) => {
    if (err) {
      console.error("Error al registrar:", err);
      return res.status(500).json({ success: false, message: "Error al registrar el usuario" });
    }
    res.json({ success: true, message: "Usuario registrado exitosamente" });
  });
});

// ========= USER-DATA =========
app.get("/user-data", (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.json({ success: false });
  }
});

// ========= Página Principal =========
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ========= IMPORTAR Y USAR RUTAS DE PRODUCTOS =========
const productosRoutes = require("./routes/productos");
app.use("/", productosRoutes);

// ========= IMPORTAR Y USAR RUTAS DE CARRITO =========

const carritoRoutes = require("./routes/carrito");
app.use("/", carritoRoutes);

// ========= IMPORTAR Y USAR RUTAS DE CONTACTO =========
const contactoRoutes = require("./routes/contacto");
app.use("/", contactoRoutes);

// ========= IMPORTAR Y USAR RUTAS DE AUTH =========
const authRoutes = require("./routes/auth")(db);
app.use("/", authRoutes);

// ========= IMPORTAR Y USAR RUTAS DE RECUPERACION =========
const recuperacionRoutes = require("./routes/recuperacion")(db);
app.use("/", recuperacionRoutes);

// Iniciar servidor
app.listen(3000, () => {
  console.log("Servidor iniciado en http://localhost:3000");
});
