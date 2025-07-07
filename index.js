const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MySQL Aiven
const db = mysql.createConnection({
  host: 'acaclud-cun-d6f0.j.aivencloud.com',
  port: 23395,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'defaultdb',
  ssl: {
    ca: fs.readFileSync('./public/file/ca.pem')
  }
});

db.connect(err => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
  } else {
    console.log('✅ Conectado a la base de datos MySQL en Aiven');
  }
});

// Página de inicio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '/Pages/index.html'));
});

// Ruta formulario contacto
app.post('/api/formulario', (req, res) => {
  const { Nombre, Telefono, Email, Observaciones, UsoDatos } = req.body;

  if (!Nombre || !Telefono || !Email || !Observaciones) {
    return res.status(400).send("Por favor complete todos los campos.");
  }

  const sql = `
    INSERT INTO datos (Nombre, Telefono, Email)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [Nombre, Telefono, Email, Observaciones, UsoDatos ? 1 : 0], (err) => {
    if (err) {
      console.error('❌ Error al guardar:', err);
      return res.status(500).send("Error al guardar los datos.");
    }
    res.send("✅ Formulario guardado correctamente");
  });
});

// Ruta login
app.post('/api/login', (req, res) => {
  console.log("ssd")
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Usuario y contraseña son obligatorios.");
  }

  const sql = "SELECT * FROM usuarios WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('❌ Error en el login:', err);
      return res.status(500).send("Error en el servidor.");
    }

    if (results.length === 0) {
      return res.status(401).send("Credenciales incorrectas.");
    }

    res.send("✅ Login exitoso");
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Aplicación en ejecución en el puerto ${PORT}`);
});
