const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');
const app = express();
require('dotenv').config();

app.set('port', 3000);

// Middleware
app.use(express.json()); // Para leer JSON desde el body

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a la base de datos
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
    console.error('Error al conectar a la base de datos:', err);

  } else {
    console.log('Conectado a la base de datos MySQL');
  }
});

// Ruta principal
app.get('/', (req, res) => {
});

// Ruta para procesar formulario
app.post('/api/formulario', (req, res) => {
  const { Nombre, Telefono, Email, Observaciones, UsoDatos } = req.body;

  if (!Nombre || !Telefono || !Email || !Observaciones) {
    return res.status(400).send("Por favor complete todos los campos.");
  }

  const sql = "INSERT INTO datos (Nombre, Telefono, Email) VALUES (?, ?, ?)";
  db.query(sql, [Nombre, Telefono, Email ? 1 : 0], (err, result) => {
    if (err) {
      console.error('Error al guardar:', err);
      return res.status(500).send("Error en el servidor al guardar los datos.");
    }
    res.send("Formulario guardado correctamente");
  });
});

// Iniciar el servidor
app.listen(app.get('port'), () => {
  console.log(`Aplicación en ejecución en el puerto ${app.get('port')}`);
});
