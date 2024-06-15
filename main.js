const express = require("express");
const mysql = require('mysql2');
const app = express();
const port = 3000;
app.use(express.json());
const cors = require('cors');
const path = require('path');

// ------------- cors ----------------------
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
  res.sendFile(path.join(__dirname, 'public'));
});

// ------------ Usuarios ------------

app.post("/Registrar", (req, res) => {
  const { Usuario, Contrasena, Correo } = req.body;

  const sql = `INSERT INTO Usuario (Nombre, Contrasena, Correo, Codigo_administrador) VALUES (?, ?, ?, NULL)`;
  pool.query(sql, [Usuario, Contrasena, Correo], (err, results) => {

    if (err) {
      
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: "Usuario ya existe" });
      }
      return res.status(500).json({ error: "Error al crear el usuario" });

    }

  
    res.status(200).json({ message: "Usuario creado" });
  });
});


app.post("/Login", (req, res) => {
  const { Usuario, Contrasena } = req.body;

  const sql = `SELECT * FROM Usuario WHERE Nombre = ? AND Contrasena = ?`;
  pool.query(sql, [Usuario, Contrasena], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: "Usuario incorrecto" });
    }
    res.status(200).json({ Usuario: results[0].Nombre, Contrasena: results[0].Contrasena });
  });
});

// ------------ Bodegas ------------

app.get("/Obtener_Bodegas", (req, res) => {
  const { Correo_usuario } = req.query;

  const sql = `
    SELECT Bodega.ID, Bodega.Nombre, GROUP_CONCAT(Tag.Nombre) AS Tags
    FROM Bodega
    JOIN Categorisa ON Bodega.ID = Categorisa.Bodega_ID
    JOIN Tag ON Categorisa.Tag_ID = Tag.ID
    JOIN Administra ON Bodega.ID = Administra.Bodega_ID
    JOIN Usuario ON Administra.Usuario_ID = Usuario.ID
    WHERE Usuario.Correo = ?
    GROUP BY Bodega.Nombre
  `;
  pool.query(sql, [Correo_usuario], (err, results) => {
    if (err) {
      return res.status(401).json({ error: "Usuario incorrecto" });
    }
    res.status(200).json(results);
  });
});

app.post("/Crear_bodega", (req, res) => {
  const { Nombre_bodega, Correo_usuario, Lista_tags } = req.body;

  const userQuery = `SELECT ID FROM Usuario WHERE Correo = ?`;
  pool.query(userQuery, [Correo_usuario], (err, userResults) => {
    if (err || userResults.length === 0) {
      return res.status(401).json({ error: "Usuario incorrecto" });
    }

    const userId = userResults[0].ID;

    const bodegaQuery = `INSERT INTO Bodega (Nombre, Codigo_invitacion) VALUES (?, '1234')`;
    pool.query(bodegaQuery, [Nombre_bodega], (err, bodegaResults) => {
      if (err) {
        return res.status(500).json({ error: "Error al crear la bodega" });
      }

      const bodegaId = bodegaResults.insertId;

      const administraQuery = `INSERT INTO Administra (Tipo, Usuario_ID, Bodega_ID) VALUES ('Administrador', ?, ?)`;
      pool.query(administraQuery, [userId, bodegaId], (err) => {
        if (err) {
          return res.status(500).json({ error: "Error al asociar la bodega con el usuario" });
        }

        const tagQuery = `INSERT INTO Categorisa (Bodega_ID, Tag_ID) VALUES ?`;
        const tagValues = Lista_tags.map(tagId => [bodegaId, tagId]);

        pool.query(tagQuery, [tagValues], (err) => {
          if (err) {
            return res.status(500).json({ error: "Error al asociar etiquetas con la bodega" });
          }
          res.status(200).json({ message: "Bodega creada y asociada correctamente" });
        });
      });
    });
  });
});

app.post("/Crear_tag", (req, res) => {
  const { Nombre_tag, Correo_usuario } = req.body;

  const userQuery = `SELECT ID FROM Usuario WHERE Correo = ?`;
  pool.query(userQuery, [Correo_usuario], (err, userResults) => {
    if (err || userResults.length === 0) {
      return res.status(401).json({ error: "Usuario incorrecto" });
    }

    const userId = userResults[0].ID;

    const tagQuery = `INSERT INTO Tag (Nombre, Usuario) VALUES (?, ?)`;
    pool.query(tagQuery, [Nombre_tag, userId], (err) => {
      if (err) {
        return res.status(500).json({ error: "Error al crear la etiqueta" });
      }
      res.status(200).json({ message: "Etiqueta creada correctamente" });
    });
  });
});

app.get("/Obtener_tags", (req, res) => {
  const { Correo_usuario } = req.query;

  const sql = `
    SELECT Tag.Nombre
    FROM Tag
    JOIN Usuario ON Tag.Usuario = Usuario.ID
    WHERE Usuario.Correo = ?
  `;
  pool.query(sql, [Correo_usuario], (err, results) => {
    if (err) {
      return res.status(401).json({ error: "Usuario incorrecto" });
    }
    res.status(200).json(results);
  });
});

// ------------ Productos ------------
app.get('/Obtener_articulos', (req, res) => {
  const { Bodega_Nombre } = req.query;

  const sql = `
    SELECT Producto.*
    FROM Producto
    JOIN Guarda ON Producto.ID = Guarda.Producto_ID
    JOIN Bodega ON Guarda.Bodega_ID = Bodega.ID
    WHERE Bodega.Nombre = ?
  `;

  pool.query(sql, [Bodega_Nombre], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error al obtener los artículos' });
    }
    res.status(200).json(results);
  });
});


app.post('/Crear_Producto', (req, res) => {
  const { Nombre, Descripcion, Imagen, Precio, Codigo } = req.body;

  pool.query('INSERT INTO Producto (Nombre, Descripcion, Imagen, Precio, Codigo) VALUES (?, ?, ?, ?, ?)', 
  [Nombre, Descripcion, Imagen, Precio, Codigo], (error, results) => {
      if (error) {
          return res.status(500).json({ error: 'Error al crear el producto' });
      }
      res.status(200).json({ message: 'Producto creado con éxito' });
  });
});

app.get('/Obtener_Stock', (req, res) => {
  const { Producto_nombre, Bodega_Nombre } = req.query;

  pool.query(`
      SELECT Lote.Cantidad, Lote.Fecha_de_vencimiento, Lote.Fecha_de_llegada 
      FROM Lote 
      JOIN Producto ON Lote.Producto_ID = Producto.ID 
      JOIN Bodega ON Lote.Bodega_ID = Bodega.ID 
      WHERE Producto.Nombre = ? AND Bodega.Nombre = ?
  `, [Producto_nombre, Bodega_Nombre], (error, results) => {
      if (error) {
          return res.status(500).json({ error: 'Error al obtener el stock' });
      }
      res.status(200).json(results);
  });
});

app.post('/Añadir_Stock', (req, res) => {
  const { Cantidad, Fecha_vencimiento, Fecha_ingreso, Producto_nombre, Bodega_Nombre } = req.body;

  pool.query(`
      INSERT INTO Lote (Cantidad, Fecha_de_vencimiento, Fecha_de_llegada, Producto_ID, Bodega_ID) 
      VALUES (?, ?, ?, (SELECT ID FROM Producto WHERE Nombre = ?), (SELECT ID FROM Bodega WHERE Nombre = ?))
  `, [Cantidad, Fecha_vencimiento, Fecha_ingreso, Producto_nombre, Bodega_Nombre], (error, results) => {
      if (error) {
          return res.status(500).json({ error: 'Error al añadir el stock' });
      }
      res.status(200).json({ message: 'Stock añadido con éxito' });
  });
});

app.put('/Editar_Producto', (req, res) => {
  const { ID, Nombre, Descripcion, Imagen, Precio, Codigo } = req.body;

  pool.query('UPDATE Producto SET Nombre = ?, Descripcion = ?, Imagen = ?, Precio = ?, Codigo = ? WHERE ID = ?', 
  [Nombre, Descripcion, Imagen, Precio, Codigo, ID], (error, results) => {
      if (error) {
          return res.status(500).json({ error: 'Error al editar el producto' });
      }
      res.status(200).json({ message: 'Producto editado con éxito' });
  });
});

// ------------- Print del puerto -------------
app.listen(port, () => {
  console.log("Servidor escuchando en el puerto: " + port);
});

