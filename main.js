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
  <title>Documentación del Backend de Inventario Facilito</title>
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
  </style>
</head>
<body>
  <h1>¡Hola, este es el backend de Inventario Facilito!</h1>
  <p> Aquí están las rutas separadas por vistas </p>

  <!-- Vista login -->
  <input type="checkbox" id="collapse-toggle1">
  <label for="collapse-toggle1" class="collapse-btn boton"> Vista login</label>
  <div id="collapse-content1" class="collapse-content">
    <!-- Metodos de la vista -->
    <input type="checkbox" id="collapse-toggle2">
    <label for="collapse-toggle2" class="collapse-btn botonpost">/login {metodo: post}</label>
    <div id="collapse-content2" class="collapse-content">
      <h3>Ruta</h3>
      <p>/login</p>
      <p>Metodo: POST</p>
      <h3>Descripcion</h3>
      <p>Ruta para hacer login</p>
      <h3>Parametros</h3>
      <p>{ Correo: "String", Contraseña: "String"}</p>
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

  <!-- Vista bodegas -->
  <input type="checkbox" id="collapse-toggle5">
  <label for="collapse-toggle5" class="collapse-btn boton"> Vista bodegas</label>
  <div id="collapse-content5" class="collapse-content">
    <!-- Metodos de la vista -->
    <input type="checkbox" id="collapse-toggle6">
    <label for="collapse-toggle6" class="collapse-btn botonget">/obtener_bodegas {metodo: get}</label>
    <div id="collapse-content6" class="collapse-content">
      <h3>Ruta</h3>
      <p>/obtener_bodegas/:Usuario_ID</p>
      <p>Metodo: GET</p>
      <h3>Descripcion</h3>
      <p>Ruta para obtener las bodegas de un usuario</p>
      <h3>Parametros</h3>
      <p>{ Usuario_ID: "Number"}</p>
      <h3>Respuesta</h3>
      <p> {error 500}(error al obtener datos): Error al obtener datos</p>
      <p> {respuesta ok}:{"ID": "Number","Nombre": "String"} </p>
    </div>
  </div>
  <br/>

  <!-- Vista Crear Bodegas -->
  <input type="checkbox" id="collapse-toggle7">
  <label for="collapse-toggle7" class="collapse-btn boton"> Vista Crear Bodegas</label>
  <div id="collapse-content7" class="collapse-content">
    <!-- Metodos de la vista -->
    <input type="checkbox" id="collapse-toggle8">
    <label for="collapse-toggle8" class="collapse-btn botonpost">/crear_bodega {metodo: post}</label>
    <div id="collapse-content8" class="collapse-content">
      <h3>Ruta</h3>
      <p>/crear_bodega</p>
      <p>Metodo: POST</p>
      <h3>Descripcion</h3>
      <p>Ruta para crear una bodega</p>
      <h3>Parametros</h3>
      <p>{ Nombre: "String", Usuario_ID: "Number", Tipo: "String"}</p>
      <h3>Respuesta</h3>
      <p> {error 500}(error al crear bodega): Error al crear bodega</p>
      <p> {respuesta ok}: Bodega creada exitosamente </p>
    </div>
  </div>
  <br/>

  <!-- Vista Tags -->
  <input type="checkbox" id="collapse-toggle9">
  <label for="collapse-toggle9" class="collapse-btn boton"> Vista Tags</label>
  <div id="collapse-content9" class="collapse-content">
    <!-- Metodos de la vista -->
    <input type="checkbox" id="collapse-toggle10">
    <label for="collapse-toggle10" class="collapse-btn botonpost">/crear_tag {metodo: post}</label>
    <div id="collapse-content10" class="collapse-content">
      <h3>Ruta</h3>
      <p>/crear_tag</p>
      <p>Metodo: POST</p>
      <h3>Descripcion</h3>
      <p>Ruta para crear un tag</p>
      <h3>Parametros</h3>
      <p>{ Nombre: "String"}</p>
      <h3>Respuesta</h3>
      <p> {error 500}(error al crear tag): Error al crear tag</p>
      <p> {respuesta ok}: Tag creado exitosamente </p>
    </div>
    <input type="checkbox" id="collapse-toggle11">
    <label for="collapse-toggle11" class="collapse-btn botonget">/obtener_tags {metodo: get}</label>
    <div id="collapse-content11" class="collapse-content">
      <h3>Ruta</h3>
      <p>/obtener_tags</p>
      <p>Metodo: GET</p>
      <h3>Descripcion</h3>
      <p>Ruta para obtener todos los tags</p>
      <h3>Parametros</h3>
      <p>Sin parámetros</p>
      <h3>Respuesta</h3>
      <p> {error 500}(error al obtener datos): Error al obtener datos</p>
      <p> {respuesta ok}: [{"ID": "Number","Nombre": "String"}] </p>
    </div>
  </div>
  <br/>

  <!-- Vista Crear Bodega con Tags -->
  <input type="checkbox" id="collapse-toggle12">
  <label for="collapse-toggle12" class="collapse-btn boton"> Vista Crear Bodega con Tags</label>
  <div id="collapse-content12" class="collapse-content">
    <!-- Metodos de la vista -->
    <input type="checkbox" id="collapse-toggle13">
    <label for="collapse-toggle13" class="collapse-btn botonpost">/crear_bodega_tags {metodo: post}</label>
    <div id="collapse-content13" class="collapse-content">
      <h3>Ruta</h3>
      <p>/crear_bodega_tags</p>
      <p>Metodo: POST</p>
      <h3>Descripcion</h3>
      <p>Ruta para crear una bodega con tags</p>
      <h3>Parametros</h3>
      <p>{ Nombre: "String", Usuario_ID: "Number", Tipo: "String", Tags: ["Number"]}</p>
      <h3>Respuesta</h3>
      <p> {error 500}(error al crear bodega): Error al crear bodega</p>
      <p> {respuesta ok}: Bodega creada exitosamente </p>
    </div>
  </div>
  <br/>

  <!-- Vista Obtener Bodegas por Tag y Usuario -->
  <input type="checkbox" id="collapse-toggle14">
  <label for="collapse-toggle14" class="collapse-btn boton"> Vista Obtener Bodegas por Tag y Usuario</label>
  <div id="collapse-content14" class="collapse-content">
    <!-- Metodos de la vista -->
    <input type="checkbox" id="collapse-toggle15">
    <label for="collapse-toggle15" class="collapse-btn botonget">/obtener_bodega_por_tag_y_usuario {metodo: get}</label>
    <div id="collapse-content15" class="collapse-content">
      <h3>Ruta</h3>
      <p>/obtener_bodega_por_tag_y_usuario/:Usuario_ID/:Tag_ID</p>
      <p>Metodo: GET</p>
      <h3>Descripcion</h3>
      <p>Ruta para obtener las bodegas por tag y usuario</p>
      <h3>Parametros</h3>
      <p>{ Usuario_ID: "Number", Tag_ID: "Number"}</p>
      <h3>Respuesta</h3>
      <p> {error 500}(error al obtener datos): Error al obtener datos</p>
      <p> {respuesta ok}: [{"ID": "Number","Nombre": "String"}] </p>
    </div>
  </div>
  <br/>

  <!-- Vista Crear Producto -->
  <input type="checkbox" id="collapse-toggle16">
  <label for="collapse-toggle16" class="collapse-btn boton"> Vista Crear Producto</label>
  <div id="collapse-content16" class="collapse-content">
    <!-- Metodos de la vista -->
    <input type="checkbox" id="collapse-toggle17">
    <label for="collapse-toggle17" class="collapse-btn botonpost">/crear_producto {metodo: post}</label>
    <div id="collapse-content17" class="collapse-content">
      <h3>Ruta</h3>
      <p>/crear_producto</p>
      <p>Metodo: POST</p>
      <h3>Descripcion</h3>
      <p>Ruta para crear un producto</p>
      <h3>Parametros</h3>
      <p>{ Nombre: "String", Descripcion: "String", Precio: "Number", Imagen: "String", Codigo: "String"}</p>
      <h3>Respuesta</h3>
      <p> {error 500}(error al crear producto): Error al crear producto</p>
      <p> {respuesta ok}: Producto creado exitosamente </p>
    </div>
  </div>
  <br/>

  <!-- Vista Ver Productos -->
  <input type="checkbox" id="collapse-toggle18">
  <label for="collapse-toggle18" class="collapse-btn boton"> Vista Ver Productos</label>
  <div id="collapse-content18" class="collapse-content">
    <!-- Metodos de la vista -->
    <input type="checkbox" id="collapse-toggle19">
    <label for="collapse-toggle19" class="collapse-btn botonget">/obtener_productos {metodo: get}</label>
    <div id="collapse-content19" class="collapse-content">
      <h3>Ruta</h3>
      <p>/obtener_productos</p>
      <p>Metodo: GET</p>
      <h3>Descripcion</h3>
      <p>Ruta para obtener todos los productos</p>
      <h3>Parametros</h3>
      <p>Sin parámetros</p>
      <h3>Respuesta</h3>
      <p> {error 500}(error al obtener datos): Error al obtener datos</p>
      <p> {respuesta ok}: [{"ID": "Number","Nombre": "String", "Descripcion": "String", "Precio": "Number", "Imagen": "String", "Codigo": "String"}] </p>
    </div>
  </div>
  <br/>
</body>
  
  `);
});

// ------------ Rutas por vistas ------------

// --------- login ----------------------
app.post('/login', (req, res) => {
  const { Correo, Contraseña } = req.body;
  const sql = 'SELECT Nombre, Contraseña FROM Usuario WHERE Correo = ? and Contraseña = ?';
  console.log(req.body);
  
  pool.query(sql, [Correo, Contraseña], (error, results) => {
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

// --------- Crear usuario ---------------
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

// --------- Vista bodegas ------------
app.get('/obtener_bodegas/:Usuario_ID', (req, res) => {
  const { Usuario_ID } = req.params;
  const sql = 'SELECT B.* FROM Bodega B JOIN Administra A ON B.ID = A.Bodega_ID WHERE A.Usuario_ID = ?';
  pool.query(sql, [Usuario_ID], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error.stack);
      res.status(500).send('Error al obtener datos');
      return;
    }
    res.json(results);
  });
});
// -------------- Vista Crear Bodegas --------------
app.post('/crear_bodega', (req, res) => {
  const { Nombre, Usuario_ID ,Tipo } = req.body;
  
  const sql = 'INSERT INTO Bodega (Nombre) VALUES (?);';
  pool.query(sql, [Nombre], (error, results) => {

    if (error) {
      console.error('Error al ejecutar la consulta:', error.stack);
      res.status(500).send('Error al crear bodega');
      return;
    }

    const bodegaId = results.insertId;
    const sqlInsertAdministra = 'INSERT INTO Administra (Usuario_ID, Bodega_ID, Tipo) VALUES (?, ?, ?);';
    console.log(bodegaId);  
    pool.query(sqlInsertAdministra, [Usuario_ID, bodegaId, Tipo], (error, results) => {
      if (error) {
        console.error('Error al ejecutar la consulta:', error.stack);
        res.status(500).send('Error al crear bodega');
        return;
      }
    });

    res.status(201).send('Bodega creada exitosamente');
  });
});

app.post('/crear_tag', (req, res) => {
  const { Nombre } = req.body;
  const sql = 'INSERT INTO Tag (Nombre) VALUES (?);';
  pool.query(sql, [Nombre], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error.stack);
      res.status(500).send('Error al crear tag');
      return;
    }
    res.status(201).send('Tag creado exitosamente');
  });
});

app.get('/obtener_tags', (req, res) => {
  const sql = 'SELECT * FROM Tag';
  pool.query(sql, (error,results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error.stack);
      res.status(500).send('Error al obtener datos');
      return;
    }
    res.json(results);
  });
});


app.post('/crear_bodega_tags', (req, res) => {
  const { Nombre, Usuario_ID, Tipo, Tags } = req.body;

  const sql = 'INSERT INTO Bodega (Nombre) VALUES (?);';
  pool.query(sql, [Nombre], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error.stack);
      res.status(500).send('Error al crear bodega');
      return;
    }

    const bodegaId = results.insertId;
    const sqlInsertAdministra = 'INSERT INTO Administra (Usuario_ID, Bodega_ID, Tipo) VALUES (?, ?, ?);';
    console.log(bodegaId);
    pool.query(sqlInsertAdministra, [Usuario_ID, bodegaId, Tipo], (error, results) => {
      if (error) {
        console.error('Error al ejecutar la consulta:', error.stack);
        res.status(500).send('Error al crear bodega');
        return;
      }
    });

    // Verificar si hay etiquetas y agregarlas a la tabla Categoriza si es necesario
    if (Tags && Tags.length > 0) {
      const tagValues = Tags.map(tag => [bodegaId, tag]);
      const sqlInsertTags = 'INSERT INTO Categoriza (Bodega_ID, Tag_ID) VALUES ?;';
      pool.query(sqlInsertTags, [tagValues], (error, results) => {
        if (error) {
          console.error('Error al ejecutar la consulta para añadir etiquetas:', error.stack);
          res.status(500).send('Error al crear bodega');
          return;
        }
      });
    }

    res.status(201).send('Bodega creada exitosamente');
  });
});

app.get('/obtener_bodega_por_tag_y_usuario/:Usuario_ID/:Tag_ID', (req, res) => {
  const { Usuario_ID, Tag_ID } = req.params;
  const sql = 'SELECT B.* FROM Bodega B JOIN Categoriza C ON B.ID = C.Bodega_ID WHERE C.Tag_ID = ? AND B.ID IN (SELECT Bodega_ID FROM Administra WHERE Usuario_ID = ?)';
  pool.query(sql, [Tag_ID, Usuario_ID], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error.stack);
      res.status(500).send('Error al obtener datos');
      return;
    }
    res.json(results);
  });
});





// -------------- Vista Crear Producto --------------

app.post('/crear_producto', (req, res) => {
  const { Nombre, Descripcion, Precio, Imagen,Codigo } = req.body;
  const sql = 'INSERT INTO Producto (Nombre, Descripcion, Precio, Imagen,Codigo) VALUES (?, ?, ?, ?, ?);';
  pool.query(sql, [Nombre, Descripcion, Precio, Imagen,Codigo], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error.stack);
      res.status(500).send('Error al crear producto');
      return;
    }
    res.status(201).send('Producto creado exitosamente');
  });
}
);

// -------------- Vista Ver Productos --------------

app.get('/obtener_productos', (req, res) => {
  const sql = 'SELECT * FROM Producto';
  pool.query(sql, (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error.stack);
      res.status(500).send('Error al obtener datos');
      return;
    }
    res.json(results);
  }
  );
}
);


// ------------- Print del puerto -------------
app.listen(port, () => {
  console.log("Servidor escuchando en el puerto: " + port);
});
