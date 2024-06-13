const express = require("express");
const mysql = require('mysql2');
const app = express();
const port = 3000;
app.use(express.json()); 
const cors = require('cors');

// ------------- cors ----------------------

app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); 


// ------------- Conexion a la base de datos -------------
const pool = mysql.createPool({
  host: 'db',
  user: 'Backend',
  password: 'Backend',
  database: 'Ejemplo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ------------- Inicial -------------
app.get("/", (req, res) => {
  res.send(`<h1>¡Hola, este es un ejemplo de como puedes crear la documentacion!</h1>
  <p> Aquí están las rutas separadas por vistas </p>
  
  <!-- Vista login -->
  
  <input type="checkbox" id="collapse-toggle1">
  <label for="collapse-toggle1" class="collapse-btn boton"> Vista ejemplo</label>
  <div id="collapse-content1" class="collapse-content">
    
    <!-- Metodos de la vista -->
  
    <input type="checkbox" id="collapse-toggle2">
    <label for="collapse-toggle2" class="collapse-btn botonget">/login {metodo: get}</label>
    <div id="collapse-content2" class="collapse-content">
      <h3>Ruta</h3>
      <p>/login</p>
      <p>Metodo: GET</p>
      <h3>Descripcion</h3>
      <p>Ruta para hacer login</p>
      <h3>Parametros</h3>
      <p>{ Nombre: "String", Contraseña: "String"}</p>
      <h3>Respuesta</h3>
      <p> {error 401}(no encontro usuarios): Usuario o contraseña incorrectos</p>
      <p> {respuesta ok}:{"Nombre": "String","Contraseña": "String"} </p>
    </div>
  </div>
  <br/>
  
  
  <style>
    .boton {
      background-color: #ffac33;
      border: none;
      color: white;
      padding: 15px 32px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;
    }
  
    .botonget {
      background-color: #4CAF50;
      border: none;
      color: white;
      padding: 15px 32px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;
    }
  
    .botonpost {
      background-color: #008CBA;
      border: none;
      color: white;
      padding: 15px 32px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;
    }
    
    .collapse-content {
      display: none;
      margin-left: 20px; /* Indentación para los colapsables anidados */
    }
  
    input[type="checkbox"]:checked + .collapse-btn + .collapse-content {
      display: block;
    }
  </style>`);
});


// ------------ Rutas por vistas ------------

app.post('/ejemplo', (req, res) => {
  const { Nombre } = req.body;
  const sql = 'INSERT INTO Ejemplo (Nombre) VALUES (?)';
  pool.query(sql, [Nombre], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error.stack);
      res.status(500).send('Error al crear usuario');
      return;
    }
    res.status(201).send('Ejemplo creado exitosamente');
  });
});


app.get('/Obtener_Ejemplo/:Usuario_ID', (req, res) => {
  const { Usuario_ID } = req.params;
  
  const sql = 'SELECT * FROM Ejemplo WHERE Nombre = ?';
  pool.query(sql, [Usuario_ID], (error, results) => {
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
