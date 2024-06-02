const express = require("express");
const mysql = require('mysql2');
const app = express();
const port = 3000;

// ------------- Conexion a la base de datos -------------
const pool = mysql.createPool({
  host: 'db',
  user: 'alfajor',
  password: 'alfajor',
  database: 'inventario',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ------------- Inicial -------------
app.get("/", (req, res) => {
  res.send(`
  <h1>hola, este es el backend de inventario facilito</h1>
  <h2>estas son las rutas disponibles:</h2>
  <h3>get: /ejemplo_select: </h3>
  `);
});

// ------------- Rutas de ejemplo -------------
app.get('/ejemplo_select', (req, res) => {
  pool.query('SELECT * FROM uwu', (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error.stack);
      res.status(500).send('Error al obtener datos');
      return;
    }
    res.json(results);
  });
});


// ------------- Print del puerto -------------
app.listen(port, () => {
  console.log("Servidor escuchando en el puerto: " + port);
});
