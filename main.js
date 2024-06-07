const express = require("express");
const mysql = require('mysql2');
const app = express();
const port = 3000;
app.use(express.json()); 

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
  res.send(`<h1>¡Hola, este es el backend de Inventario Facilito!</h1>
  <p> Aquí están las rutas separadas por vistas </p>
  
  <!-- Vista login -->
  
  <input type="checkbox" id="collapse-toggle1">
  <label for="collapse-toggle1" class="collapse-btn boton"> Vista login</label>
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
  
  <!-- Vista Crear usuarios -->
  
  <input type="checkbox" id="collapse-toggle3">
  <label for="collapse-toggle3" class="collapse-btn boton"> Vista Crear usuarios</label>
  <div id="collapse-content3" class="collapse-content">
    
    <!-- Metodos de la vista -->
  
    <input type="checkbox" id="collapse-toggle4">
    <label for="collapse-toggle4" class="collapse-btn botonpost">/crear_usuario {metodo: post}</label>
    <div id="collapse-content4" class="collapse-content">
      <h3>Ruta</h3>
      <p>/crear_usuario</p>
      <p>Metodo: POST</p>
      <h3>Descripcion</h3>
      <p>Ruta para crear un usuario</p>
      <h3>Parametros</h3>
      <p>{ Nombre: "String", Correo: "String", Contraseña: "String"}</p>
      <h3>Respuesta</h3>
      <p> {error 500}(error al crear usuario): Error al crear usuario</p>
      <p> {respuesta ok}: Usuario creado exitosamente </p>
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

//    --------- login  ----------------------

app.get('/login', (req, res) => {
  const { Nombre, Contraseña } = req.body;
  // Usar ? como marcador de posición para los valores de la consulta
  const sql = 'SELECT Nombre, Contraseña FROM Usuario WHERE Nombre = ? and Contraseña = ?';
  console.log(req.body);
  
  pool.query(sql, [ Nombre,Contraseña], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error.stack);
      res.status(500).send('Error al obtener datos');
      return;
    }

    if (results.length === 0) {
      res.status(401).send('Usuario o contraseña incorrectos');
      return;
    }

    res.json(results);
  });
});

//    --------- Crear usuario ---------------

app.post('/crear_usuario', (req, res) => {
  const { Nombre, Correo, Contraseña } = req.body;
  const sql = 'INSERT INTO Usuario (Nombre, Correo, Contraseña) VALUES (?, ?, ?)';
  pool.query(sql, [Nombre, Correo, Contraseña], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error.stack);
      res.status(500).send('Error al crear usuario');
      return;
    }
    res.status(201).send('Usuario creado exitosamente');
  });
});

//    --------- Vista inventario ------------








// ------------- Print del puerto -------------
app.listen(port, () => {
  console.log("Servidor escuchando en el puerto: " + port);
});
