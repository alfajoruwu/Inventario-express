const express = require("express");
const mysql = require('mysql2');
const app = express();
const port = 3000;
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json());

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
}).promise();

// --------------- aux ---------------------------

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function bufferToBase64(buffer) {
  const bufferData = Buffer.from(buffer, 'binary');
  const base64Image = bufferData.toString('base64');
  const decodedData = atob(base64Image);
  return decodedData
}

// ------------- Inicial -------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public'));
});

// ------------ Usuarios ------------

app.post("/Registrar", (req, res) => {
  const { Usuario, Contrasena, Correo } = req.body;
  const sql = `INSERT INTO Usuario (Nombre, Contrasena, Correo, Codigo_administrador) VALUES (?, ?, ?, ?)`;

  const codigo = getRandomInt(1000000,9999999)

  pool.query(sql, [Usuario, Contrasena, Correo,codigo], (err, results) => {

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
  const { Correo, Contrasena } = req.body;

  const sql = `SELECT * FROM Usuario WHERE Correo = ? AND Contrasena = ?`;
  pool.query(sql, [Correo, Contrasena], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: "Usuario incorrecto" });
    }
    res.status(200).json({ Usuario: results[0].Correo, Contrasena: results[0].Contrasena });
  });
});

app.get("/Obtener_Codigo_Administrador", (req, res) => {
  const { Correo_usuario } = req.query;

  if (!Correo_usuario) {
    return res.status(400).json({ error: "Correo_usuario is required" });
  }

  const sql = 'SELECT Codigo_administrador FROM Usuario WHERE Correo = ?';
  pool.query(sql, [Correo_usuario], (err, results) => {
    if (err) {
      console.error("Error in the query:", err);
      return res.status(500).json({ error: "Error in the server" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(200).json(results[0]);
  });
});

// ------------ Bodegas ------------

app.get("/Obtener_Bodegas", (req, res) => {
  const { Correo_usuario } = req.query;

  const sql = `
    SELECT Bodega.ID, Bodega.Nombre, GROUP_CONCAT(Tag.Nombre) AS Tags, Bodega.UbicacionNombre, Bodega.UbicacionLatitud, Bodega.UbicacionLongitud
    FROM Bodega
    JOIN Categorisa ON Bodega.ID = Categorisa.Bodega_ID
    JOIN Tag ON Categorisa.Tag_ID = Tag.ID
    JOIN Administra ON Bodega.ID = Administra.Bodega_ID
    JOIN Usuario ON Administra.Usuario_ID = Usuario.ID
    WHERE Usuario.Correo = ? AND Administra.Tipo = 'Administrador'
    GROUP BY Bodega.ID, Bodega.Nombre, Bodega.UbicacionNombre, Bodega.UbicacionLatitud, Bodega.UbicacionLongitud
  `;
  pool.query(sql, [Correo_usuario], (err, results) => {
    if (err) {
      return res.status(401).json({ error: "Usuario incorrecto" });
    }
    res.status(200).json(results);
  });
});

app.get("/Obtener_Bodegas_Invitado", (req, res) => {
  const { Correo_usuario } = req.query;

  if (!Correo_usuario) {
    return res.status(400).json({ error: "Correo_usuario is required" });
  }

  const sql = `
 SELECT 
  Bodega.ID, 
  Bodega.Nombre, 
  GROUP_CONCAT(Tag.Nombre) AS Tags, 
  Bodega.UbicacionNombre, 
  Bodega.UbicacionLatitud, 
  Bodega.UbicacionLongitud,
  Admin.Codigo_administrador
FROM 
  Bodega
JOIN 
  Categorisa ON Bodega.ID = Categorisa.Bodega_ID
JOIN 
  Tag ON Categorisa.Tag_ID = Tag.ID
JOIN 
  Administra AS Emp ON Bodega.ID = Emp.Bodega_ID
JOIN 
  Usuario AS EmpUser ON Emp.Usuario_ID = EmpUser.ID
LEFT JOIN
  (SELECT 
      Bodega_ID,
      Codigo_administrador
   FROM 
      Administra 
   JOIN 
      Usuario ON Administra.Usuario_ID = Usuario.ID
   WHERE 
      Administra.Tipo = 'Administrador') AS Admin 
ON Bodega.ID = Admin.Bodega_ID
WHERE 
  EmpUser.Correo = ? AND Emp.Tipo = 'Empleado'
GROUP BY 
  Bodega.ID, 
  Bodega.Nombre, 
  Admin.Codigo_administrador, 
  Bodega.UbicacionNombre, 
  Bodega.UbicacionLatitud, 
  Bodega.UbicacionLongitud;
  `;
  pool.query(sql, [Correo_usuario], (err, results) => {
    if (err) {
      console.error("Error in the query:", err);
      return res.status(500).json({ error: "Error in the server" });
    }
    res.status(200).json(results);
  });
});

app.post("/Crear_bodega", (req, res) => {
  const { Nombre_bodega, Correo_usuario, Lista_tags, UbicacionNombre, UbicacionLatitud, UbicacionLongitud } = req.body;

  // Verificación de parámetros
  if (!Nombre_bodega || !Correo_usuario || !Array.isArray(Lista_tags) || !UbicacionNombre || UbicacionLatitud == null || UbicacionLongitud == null) {
    return res.status(400).json({ error: "Datos insuficientes o incorrectos" });
  }

  const userQuery = `SELECT ID FROM Usuario WHERE Correo = ?`;
  pool.query(userQuery, [Correo_usuario], (err, userResults) => {
    if (err) {
      console.error("Error en la consulta del usuario:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    if (userResults.length === 0) {
      return res.status(401).json({ error: "Usuario incorrecto" });
    }

    const userId = userResults[0].ID;
  

    const randomInt1 = getRandomInt(1000000000000, 99999999999999);
    const randomInt2 = getRandomInt(1000000000000, 99999999999999);

    const bodegaQuery = `INSERT INTO Bodega (Nombre, Codigo_invitacion, Codigo_invitacion_admin , UbicacionNombre, UbicacionLatitud, UbicacionLongitud) VALUES (?,?, ?, ?, ?, ?)`;
    pool.query(bodegaQuery, [Nombre_bodega, randomInt1 ,randomInt2 ,UbicacionNombre, UbicacionLatitud, UbicacionLongitud], (err, bodegaResults) => {
      if (err) {
        console.error("Error al crear la bodega:", err);
        return res.status(500).json({ error: "Error al crear la bodega" });
      }

      const bodegaId = bodegaResults.insertId;

      const administraQuery = `INSERT INTO Administra (Tipo, Usuario_ID, Bodega_ID) VALUES ('Administrador', ?, ?)`;
      pool.query(administraQuery, [userId, bodegaId], (err) => {
        if (err) {
          console.error("Error al asociar la bodega con el usuario:", err);
          return res.status(500).json({ error: "Error al asociar la bodega con el usuario" });
        }

        const tagQuery = `INSERT INTO Categorisa (Bodega_ID, Tag_ID) VALUES ?`;
        const tagValues = Lista_tags.map(tagId => [bodegaId, tagId]);

        pool.query(tagQuery, [tagValues], (err) => {
          if (err) {
            console.error("Error al asociar etiquetas con la bodega:", err);
            return res.status(777).json({  message: "bodega sin tags" });
          }
          res.status(200).json({ message: "Bodega creada y asociada correctamente" });
        });
      });
    });
  });
});

app.get('/Obtener_codigo_invitacion_bodega', (req, res) => {
  const { Bodega_ID } = req.query;

  if (!Bodega_ID) {
    return res.status(400).json({ error: "Bodega_ID is required" });
  }
  const sql = 'SELECT Codigo_invitacion FROM Bodega WHERE ID = ?';
  pool.query(sql, [Bodega_ID], (err, results) => {
    if (err) {
      console.error("Error in the query:", err);
      return res.status(500).json({ error: "Error in the server" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Bodega not found" });
    }
    res.status(200).json(results[0]);
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

  if (!Correo_usuario) {
    return res.status(400).json({ error: "Correo de usuario es requerido" });
  }

  console.log("Correo_usuario recibido:", Correo_usuario);

  const sql = `
    SELECT Tag.Nombre, Tag.ID
    FROM Tag
    JOIN Usuario ON Tag.Usuario = Usuario.ID
    WHERE Usuario.Correo = ?
  `;
  pool.query(sql, [Correo_usuario], (err, results) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    console.log("Resultados de la consulta:", results);

    if (results.length === 0) {
      return res.status(404).json({ error: "No se encontraron tags para este usuario" });
    }
    res.status(200).json(results);
  });
});

app.post("/Agregar_Usuario_Invitado", (req, res) => {
  const { Correo_usuario, Codigo_invitacion } = req.body;

  if (!Correo_usuario || !Codigo_invitacion) {
    return res.status(400).json({ error: "Correo_usuario y Codigo_invitacion son requeridos" });
  }

  const usuarioQuery = 'SELECT ID FROM Usuario WHERE Correo = ?';
  pool.query(usuarioQuery, [Correo_usuario], (err, usuarioResults) => {
    if (err) {
      console.error("Error en la consulta del usuario:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    if (usuarioResults.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const usuarioId = usuarioResults[0].ID;

    const bodegaQuery = 'SELECT ID FROM Bodega WHERE Codigo_invitacion = ?';
    pool.query(bodegaQuery, [Codigo_invitacion], (err, bodegaResults) => {
      if (err) {
        console.error("Error en la consulta de la bodega:", err);
        return res.status(500).json({ error: "Error en el servidor" });
      }
      if (bodegaResults.length === 0) {
        return res.status(404).json({ error: "Bodega no encontrada" });
      }

      const bodegaId = bodegaResults[0].ID;

      const administraQuery = 'INSERT INTO Administra (Tipo, Usuario_ID, Bodega_ID) VALUES (?, ?, ?)';
      pool.query(administraQuery, ['Empleado', usuarioId, bodegaId], (err) => {
        if (err) {
          console.error("Error al asociar la bodega con el usuario:", err);
          return res.status(500).json({ error: "Error al asociar la bodega con el usuario" });
        }
        res.status(200).json({ message: "Usuario añadido como invitado correctamente" });
      });
    });
  });
});

// ------------ Productos ------------

app.get('/Obtener_articulos', (req, res) => {
  const { Bodega_ID } = req.query;

  const sql = `
  SELECT Producto.*, COALESCE(SUM(Lote.Cantidad), 0) AS Stock_Disponible
  FROM Producto
  JOIN Guarda ON Producto.ID = Guarda.Producto_ID
  LEFT JOIN Lote ON Producto.ID = Lote.Producto_ID AND Guarda.Bodega_ID = Lote.Bodega_ID
  WHERE Guarda.Bodega_ID = ?
  GROUP BY Producto.ID, Guarda.Bodega_ID
  `;

  pool.query(sql, [Bodega_ID], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error al obtener los artículos' });
    }
    const productosConStock = results.map(producto => {
      const imageBuffer = producto.Imagen;
      return {
        ...producto,
        Imagen: bufferToBase64(imageBuffer),
        Stock_Disponible: producto.Stock_Disponible  // Agregar el campo de stock disponible
      };
    });

    res.status(200).json(productosConStock);
  });
});

app.post('/Crear_Producto', (req, res) => {
  const { Nombre, Descripcion, Imagen, Precio, Codigo, Bodega_ID } = req.body;

  // Insertar el nuevo producto en la tabla Producto
  pool.query('INSERT INTO Producto (Nombre, Descripcion, Imagen, Precio, Codigo) VALUES (?, ?, ?, ?, ?)', 
  [Nombre, Descripcion, Imagen, Precio, Codigo], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error al crear el producto', message: error.message });
    }
      
      // Obtener el ID del producto recién insertado
      const productoId = results.insertId;

      // Insertar la asociación en la tabla Guarda
      pool.query('INSERT INTO Guarda (Bodega_ID, Producto_ID) VALUES (?, ?)', 
      [Bodega_ID, productoId], (error, results) => {
          if (error) {
              return res.status(500).json({ error: 'Error al asociar el producto con la bodega' });
          }
          res.status(200).json({ message: 'Producto creado y asociado con éxito' });
      });
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

app.post('/Anadir_Stock', (req, res) => {
  const { Cantidad, Fecha_vencimiento, Fecha_ingreso, Producto_nombre, Bodega_ID } = req.body;

  pool.query(`
    INSERT INTO Lote (Cantidad, Fecha_de_vencimiento, Fecha_de_llegada, Producto_ID, Bodega_ID) 
    VALUES (?, ?, ?, (SELECT ID FROM Producto WHERE Nombre = ?), ?)
  `, [Cantidad, Fecha_vencimiento, Fecha_ingreso, Producto_nombre, Bodega_ID], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta:', error);
      return res.status(500).json({ error: 'Error al añadir el stock' });
    }
    res.status(200).json({ message: 'Stock añadido con éxito' });
  });
});

app.get('/Obtener_Stock', (req, res) => {
  const { Producto_nombre, Bodega_ID } = req.query;

  pool.query(`
    SELECT Lote.ID, Lote.Cantidad, Lote.Fecha_de_vencimiento, Lote.Fecha_de_llegada 
    FROM Lote 
    WHERE Lote.Producto_ID = (
      SELECT ID FROM Producto WHERE Nombre = ?
    ) AND Lote.Bodega_ID = ?
  `, [Producto_nombre, Bodega_ID], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error al obtener el stock' });
    }
    res.status(200).json(results);
  });
});

app.put('/Editar_Stock', (req, res) => {
  const { ID, Cantidad, Fecha_vencimiento, Fecha_ingreso } = req.body;

  pool.query('UPDATE Lote SET Cantidad = ?, Fecha_de_vencimiento = ?, Fecha_de_llegada = ? WHERE ID = ?',
  [Cantidad, Fecha_vencimiento, Fecha_ingreso, ID], (error, results) => {
      if (error) {
          return res.status(500).json({ error: 'Error al editar el stock' });
      }
      res.status(200).json({ message: 'Stock editado con éxito' });
  });
});

// --------------- venta acc dock-----------------------
app.post('/vender', async (req, res) => {
  const { clienteId, items, correoUsuario, bodegaId } = req.body; // 'items' should be an array of { productoId, cantidad }

  const connection = await pool.getConnection();

  try {
    // Start a transaction
    await connection.beginTransaction();

    // Create a Boleta entry
    const [boletaResult] = await connection.query(
      `INSERT INTO Boleta (Fecha) VALUES (CURDATE())`
    );

    const boletaId = boletaResult.insertId;
    const ventas = [];

    // Process each item
    for (const item of items) {
      const { productoId, cantidad } = item;
      let remaining = cantidad;

      // Get batches of the product in the specified bodega, ordered by expiration date
      const [lotes] = await connection.query(
        `SELECT * FROM Lote 
         WHERE Producto_ID = ? AND Bodega_ID = ? AND Cantidad > 0 
         ORDER BY Fecha_de_vencimiento ASC`,
        [productoId, bodegaId]
      );

      for (const lote of lotes) {
        if (remaining <= 0) break;

        const ventaCantidad = Math.min(remaining, lote.Cantidad);
        remaining -= ventaCantidad;

        // Reduce the lot quantity
        await connection.query(
          `UPDATE Lote SET Cantidad = Cantidad - ? WHERE ID = ?`,
          [ventaCantidad, lote.ID]
        );

        // Create a Compra entry
        const [result] = await connection.query(
          `INSERT INTO Compra (Cliente_ID, Cantidad, Usuario_ID, Lote_ID)
           VALUES (?, ?, (SELECT ID FROM Usuario WHERE Correo = ?), ?)`,
          [clienteId, ventaCantidad, correoUsuario, lote.ID]
        );

        ventas.push(result.insertId);
      }

      if (remaining > 0) {
        // Rollback if there's not enough stock
        await connection.rollback();
        return res.status(400).json({ message: `Not enough stock for product ID ${productoId} in bodega ID ${bodegaId}` });
      }
    }

    // Create Boleta_detalle entries
    for (const compraId of ventas) {
      await connection.query(
        `INSERT INTO Boleta_detalle (ID_compra, ID_Boleta) VALUES (?, ?)`,
        [compraId, boletaId]
      );
    }

    // Commit transaction
    await connection.commit();

    res.status(200).json({ message: 'Sale completed successfully', boletaId });
  } catch (error) {
    // Rollback on error
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'An error occurred', error });
  } finally {
    // Release connection back to the pool
    connection.release();
  }
});

// --------------- estadisticas ----------------

// -------- expirar ---------

app.get('/bodega_productos_expirar', async (req, res) => {
  const { bodegaId } = req.query;

  if (!bodegaId) {
      return res.status(400).json({ error: 'Bodega ID is required' });
  }

  try {
      const sql = `
          SELECT 
              Producto.Nombre, 
              Lote.Fecha_de_vencimiento 
          FROM Lote
          JOIN Producto ON Lote.Producto_ID = Producto.ID
          WHERE Lote.Cantidad > 0 AND Lote.Bodega_ID = ?
          ORDER BY Lote.Fecha_de_vencimiento ASC
      `;
      const [results] = await pool.query(sql, [bodegaId]);
      res.status(200).json(results);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching products expiring soon' });
  }
});

app.get('/expirar_por_producto_bodega', async (req, res) => {
  const { productId, bodegaId } = req.query;

  if (!productId || !bodegaId) {
      return res.status(400).json({ error: 'Product ID and Bodega ID are required' });
  }

  try {
      const sql = `
          SELECT 
              Lote.ID AS Batch_ID,
              Lote.Fecha_de_llegada AS Date_Obtained,
              Lote.Fecha_de_vencimiento AS Expiration_Date,
              DATEDIFF(Lote.Fecha_de_vencimiento, CURDATE()) AS Days_Remaining,
              Lote.Cantidad AS Remaining_Quantity
          FROM Lote
          WHERE Lote.Producto_ID = ? AND Lote.Bodega_ID = ? AND Lote.Cantidad > 0
          ORDER BY Days_Remaining ASC
      `;
      const [results] = await pool.query(sql, [productId, bodegaId]);
      res.status(200).json(results);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching product details' });
  }
});

// -------- resumen general ------

app.get("/producto_mas_vendido", async (req, res) => {
  const { correoUsuario } = req.query;

  if (!correoUsuario) {
    return res.status(400).json({ error: "correoUsuario is required" });
  }

  try {
    // Obtener el userId a partir del correo del usuario
    const [userResults] = await pool.query(`
      SELECT ID AS Usuario_ID
      FROM Usuario
      WHERE Correo = ?
    `, [correoUsuario]);

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResults[0].Usuario_ID;

    // Obtener las bodegas administradas por el usuario
    const [bodegas] = await pool.query(`
      SELECT b.ID AS Bodega_ID
      FROM Administra a
      JOIN Bodega b ON a.Bodega_ID = b.ID
      WHERE a.Usuario_ID = ? AND a.Tipo = 'Administrador'
    `, [userId]);

    if (bodegas.length === 0) {
      return res.status(404).json({ error: "No bodegas found for this user" });
    }

    // Obtener el producto más vendido en las bodegas administradas por el usuario
    const [results] = await pool.query(`
      SELECT p.Nombre AS ProductName, SUM(c.Cantidad) AS TotalSold
      FROM Compra c
      JOIN Lote l ON c.Lote_ID = l.ID
      JOIN Producto p ON l.Producto_ID = p.ID
      WHERE l.Bodega_ID IN (?)
      GROUP BY p.ID
      ORDER BY TotalSold DESC
      LIMIT 1
    `, [bodegas.map(b => b.Bodega_ID).join(',')]);

    if (results.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Error in the query:", err);
    res.status(500).json({ error: "Error fetching best sold product" });
  }
});

app.get("/bodega_mas_activa", async (req, res) => {
  const { correoUsuario } = req.query;

  if (!correoUsuario) {
    return res.status(400).json({ error: "correoUsuario is required" });
  }

  try {
    // Obtener el userId a partir del correo del usuario
    const [userResults] = await pool.query(`
      SELECT ID AS Usuario_ID
      FROM Usuario
      WHERE Correo = ?
    `, [correoUsuario]);

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResults[0].Usuario_ID;

    // Obtener las bodegas administradas por el usuario
    const [bodegas] = await pool.query(`
      SELECT b.ID AS Bodega_ID
      FROM Administra a
      JOIN Bodega b ON a.Bodega_ID = b.ID
      WHERE a.Usuario_ID = ? AND a.Tipo = 'Administrador'
    `, [userId]);

    if (bodegas.length === 0) {
      return res.status(404).json({ error: "No bodegas found for this user" });
    }

    // Obtener la bodega más activa en función de la cantidad total vendida
    const [results] = await pool.query(`
      SELECT b.Nombre AS WineryName, SUM(c.Cantidad) AS TotalSold
      FROM Compra c
      JOIN Lote l ON c.Lote_ID = l.ID
      JOIN Bodega b ON l.Bodega_ID = b.ID
      WHERE l.Bodega_ID IN (?)
      GROUP BY b.ID
      ORDER BY TotalSold DESC
      LIMIT 1
    `, [bodegas.map(b => b.Bodega_ID).join(',')]);

    if (results.length === 0) {
      return res.status(404).json({ error: "No wineries found" });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Error in the query:", err);
    res.status(500).json({ error: "Error fetching most active winery" });
  }
});

app.get("/vendedor_mas_activo", async (req, res) => {
  const { correoUsuario } = req.query;

  if (!correoUsuario) {
    return res.status(400).json({ error: "correoUsuario is required" });
  }

  try {
    // Obtener el userId a partir del correo del usuario
    const [userResults] = await pool.query(`
      SELECT ID AS Usuario_ID
      FROM Usuario
      WHERE Correo = ?
    `, [correoUsuario]);

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResults[0].Usuario_ID;

    // Obtener las bodegas administradas por el usuario
    const [bodegas] = await pool.query(`
      SELECT b.ID AS Bodega_ID
      FROM Administra a
      JOIN Bodega b ON a.Bodega_ID = b.ID
      WHERE a.Usuario_ID = ? AND a.Tipo = 'Administrador'
    `, [userId]);

    if (bodegas.length === 0) {
      return res.status(404).json({ error: "No bodegas found for this user" });
    }

    // Obtener el vendedor más activo en las bodegas administradas por el usuario
    const [results] = await pool.query(`
      SELECT u.Nombre AS SellerName, SUM(c.Cantidad) AS TotalSold
      FROM Compra c
      JOIN Usuario u ON c.Usuario_ID = u.ID
      JOIN Lote l ON c.Lote_ID = l.ID
      WHERE l.Bodega_ID IN (?)
      GROUP BY u.ID
      ORDER BY TotalSold DESC
      LIMIT 1
    `, [bodegas.map(b => b.Bodega_ID).join(',')]);

    if (results.length === 0) {
      return res.status(404).json({ error: "No sellers found" });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Error in the query:", err);
    res.status(500).json({ error: "Error fetching best seller" });
  }
});

app.get("/producto_menos_vendido", async (req, res) => {
  const { correoUsuario } = req.query;

  if (!correoUsuario) {
    return res.status(400).json({ error: "correoUsuario is required" });
  }

  try {
    // Obtener el userId a partir del correo del usuario
    const [userResults] = await pool.query(`
      SELECT ID AS Usuario_ID
      FROM Usuario
      WHERE Correo = ?
    `, [correoUsuario]);

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResults[0].Usuario_ID;

    // Obtener las bodegas administradas por el usuario
    const [bodegas] = await pool.query(`
      SELECT b.ID AS Bodega_ID
      FROM Administra a
      JOIN Bodega b ON a.Bodega_ID = b.ID
      WHERE a.Usuario_ID = ? AND a.Tipo = 'Administrador'
    `, [userId]);

    if (bodegas.length === 0) {
      return res.status(404).json({ error: "No bodegas found for this user" });
    }

    // Obtener el producto menos vendido en las bodegas administradas por el usuario
    const [results] = await pool.query(`
      SELECT p.Nombre AS ProductName, COALESCE(SUM(c.Cantidad), 0) AS TotalSold
      FROM Producto p
      LEFT JOIN Lote l ON p.ID = l.Producto_ID
      LEFT JOIN Compra c ON l.ID = c.Lote_ID AND l.Bodega_ID IN (?)
      GROUP BY p.ID
      ORDER BY TotalSold ASC
      LIMIT 1
    `, [bodegas.map(b => b.Bodega_ID).join(',')]);

    if (results.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Error in the query:", err);
    res.status(500).json({ error: "Error fetching least sold product" });
  }
});

// --------- resumen por fecha  YYYY-MM-DD -------

app.get("/producto_mas_vendido_fecha", async (req, res) => {
  const { correoUsuario, startDate, endDate } = req.query;

  if (!correoUsuario || !startDate || !endDate) {
    return res.status(400).json({ error: "correoUsuario, startDate, and endDate are required" });
  }

  try {
    // Obtener el userId a partir del correo del usuario
    const [userResults] = await pool.query(`
      SELECT ID AS Usuario_ID
      FROM Usuario
      WHERE Correo = ?
    `, [correoUsuario]);

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResults[0].Usuario_ID;

    // Obtener las bodegas administradas por el usuario
    const [bodegas] = await pool.query(`
      SELECT b.ID AS Bodega_ID
      FROM Administra a
      JOIN Bodega b ON a.Bodega_ID = b.ID
      WHERE a.Usuario_ID = ? AND a.Tipo = 'Administrador'
    `, [userId]);

    if (bodegas.length === 0) {
      return res.status(404).json({ error: "No bodegas found for this user" });
    }

    // Obtener el producto más vendido en las bodegas administradas por el usuario dentro del rango de fechas
    const [results] = await pool.query(`
      SELECT p.Nombre AS ProductName, SUM(c.Cantidad) AS TotalSold
      FROM Compra c
      JOIN Lote l ON c.Lote_ID = l.ID
      JOIN Producto p ON l.Producto_ID = p.ID
      WHERE l.Bodega_ID IN (?)
      AND c.Fecha BETWEEN ? AND ?
      GROUP BY p.ID
      ORDER BY TotalSold DESC
      LIMIT 1
    `, [bodegas.map(b => b.Bodega_ID).join(','), startDate, endDate]);

    if (results.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Error in the query:", err);
    res.status(500).json({ error: "Error fetching best sold product" });
  }
});

app.get("/bodega_mas_activa_fecha", async (req, res) => {
  const { correoUsuario, startDate, endDate } = req.query;

  if (!correoUsuario || !startDate || !endDate) {
    return res.status(400).json({ error: "correoUsuario, startDate, and endDate are required" });
  }

  try {
    // Obtener el userId a partir del correo del usuario
    const [userResults] = await pool.query(`
      SELECT ID AS Usuario_ID
      FROM Usuario
      WHERE Correo = ?
    `, [correoUsuario]);

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResults[0].Usuario_ID;

    // Obtener las bodegas administradas por el usuario
    const [bodegas] = await pool.query(`
      SELECT b.ID AS Bodega_ID
      FROM Administra a
      JOIN Bodega b ON a.Bodega_ID = b.ID
      WHERE a.Usuario_ID = ? AND a.Tipo = 'Administrador'
    `, [userId]);

    if (bodegas.length === 0) {
      return res.status(404).json({ error: "No bodegas found for this user" });
    }

    // Obtener la bodega más activa en función de la cantidad total vendida dentro del rango de fechas
    const [results] = await pool.query(`
      SELECT b.Nombre AS WineryName, SUM(c.Cantidad) AS TotalSold
      FROM Compra c
      JOIN Lote l ON c.Lote_ID = l.ID
      JOIN Bodega b ON l.Bodega_ID = b.ID
      WHERE l.Bodega_ID IN (?)
      AND c.Fecha BETWEEN ? AND ?
      GROUP BY b.ID
      ORDER BY TotalSold DESC
      LIMIT 1
    `, [bodegas.map(b => b.Bodega_ID).join(','), startDate, endDate]);

    if (results.length === 0) {
      return res.status(404).json({ error: "No wineries found" });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Error in the query:", err);
    res.status(500).json({ error: "Error fetching most active winery" });
  }
});

app.get("/vendedor_mas_activo_fecha", async (req, res) => {
  const { correoUsuario, startDate, endDate } = req.query;

  if (!correoUsuario || !startDate || !endDate) {
    return res.status(400).json({ error: "correoUsuario, startDate, and endDate are required" });
  }

  try {
    // Obtener el userId a partir del correo del usuario
    const [userResults] = await pool.query(`
      SELECT ID AS Usuario_ID
      FROM Usuario
      WHERE Correo = ?
    `, [correoUsuario]);

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResults[0].Usuario_ID;

    // Obtener las bodegas administradas por el usuario
    const [bodegas] = await pool.query(`
      SELECT b.ID AS Bodega_ID
      FROM Administra a
      JOIN Bodega b ON a.Bodega_ID = b.ID
      WHERE a.Usuario_ID = ? AND a.Tipo = 'Administrador'
    `, [userId]);

    if (bodegas.length === 0) {
      return res.status(404).json({ error: "No bodegas found for this user" });
    }

    // Obtener el vendedor más activo en las bodegas administradas por el usuario dentro del rango de fechas
    const [results] = await pool.query(`
      SELECT u.Nombre AS SellerName, SUM(c.Cantidad) AS TotalSold
      FROM Compra c
      JOIN Usuario u ON c.Usuario_ID = u.ID
      JOIN Lote l ON c.Lote_ID = l.ID
      WHERE l.Bodega_ID IN (?)
      AND c.Fecha BETWEEN ? AND ?
      GROUP BY u.ID
      ORDER BY TotalSold DESC
      LIMIT 1
    `, [bodegas.map(b => b.Bodega_ID).join(','), startDate, endDate]);

    if (results.length === 0) {
      return res.status(404).json({ error: "No sellers found" });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Error in the query:", err);
    res.status(500).json({ error: "Error fetching best seller" });
  }
});

app.get("/producto_menos_vendido_fecha", async (req, res) => {
  const { correoUsuario, startDate, endDate } = req.query;

  if (!correoUsuario || !startDate || !endDate) {
    return res.status(400).json({ error: "correoUsuario, startDate, and endDate are required" });
  }

  try {
    // Obtener el userId a partir del correo del usuario
    const [userResults] = await pool.query(`
      SELECT ID AS Usuario_ID
      FROM Usuario
      WHERE Correo = ?
    `, [correoUsuario]);

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResults[0].Usuario_ID;

    // Obtener las bodegas administradas por el usuario
    const [bodegas] = await pool.query(`
      SELECT b.ID AS Bodega_ID
      FROM Administra a
      JOIN Bodega b ON a.Bodega_ID = b.ID
      WHERE a.Usuario_ID = ? AND a.Tipo = 'Administrador'
    `, [userId]);

    if (bodegas.length === 0) {
      return res.status(404).json({ error: "No bodegas found for this user" });
    }

    // Obtener el producto menos vendido en las bodegas administradas por el usuario dentro del rango de fechas
    const [results] = await pool.query(`
      SELECT p.Nombre AS ProductName, COALESCE(SUM(c.Cantidad), 0) AS TotalSold
      FROM Producto p
      LEFT JOIN Lote l ON p.ID = l.Producto_ID
      LEFT JOIN Compra c ON l.ID = c.Lote_ID AND l.Bodega_ID IN (?)
      AND c.Fecha BETWEEN ? AND ?
      GROUP BY p.ID
      ORDER BY TotalSold ASC
      LIMIT 1
    `, [bodegas.map(b => b.Bodega_ID).join(','), startDate, endDate]);

    if (results.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Error in the query:", err);
    res.status(500).json({ error: "Error fetching least sold product" });
  }
});

// ---------- resumen graficos --------


app.get("/Stock_en_bodega_espesifica", async (req, res) => {
  const { correoUsuario, bodegaId } = req.query;

  if (!correoUsuario || !bodegaId) {
    return res.status(400).json({ error: "correoUsuario and bodegaId are required" });
  }

  try {
    // Obtener el userId a partir del correo del usuario
    const [userResults] = await pool.query(`
      SELECT ID AS Usuario_ID
      FROM Usuario
      WHERE Correo = ?
    `, [correoUsuario]);

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResults[0].Usuario_ID;

    // Verificar si el usuario administra la bodega
    const [adminResults] = await pool.query(`
      SELECT 1
      FROM Administra
      WHERE Usuario_ID = ? AND Bodega_ID = ? AND Tipo = 'Administrador'
    `, [userId, bodegaId]);

    if (adminResults.length === 0) {
      return res.status(403).json({ error: "User does not manage this warehouse" });
    }

    // Obtener el stock actual en la bodega para los productos en la tabla Guarda
    const [results] = await pool.query(`
      SELECT p.Nombre AS ProductName, COALESCE(SUM(l.Cantidad), 0) AS Stock
      FROM Producto p
      INNER JOIN Guarda g ON p.ID = g.Producto_ID
      LEFT JOIN Lote l ON l.Producto_ID = p.ID AND l.Bodega_ID = g.Bodega_ID
      WHERE g.Bodega_ID = ?
      GROUP BY p.ID
    `, [bodegaId]);

    res.status(200).json(results);
  } catch (err) {
    console.error("Error in the query:", err);
    res.status(500).json({ error: "Error fetching stock data" });
  }
});

app.get("/ventas_por_bodega", async (req, res) => {
  const { correoUsuario } = req.query;

  if (!correoUsuario) {
    return res.status(400).json({ error: "correoUsuario is required" });
  }

  try {
    // Obtener el userId a partir del correo del usuario
    const [userResults] = await pool.query(`
      SELECT ID AS Usuario_ID
      FROM Usuario
      WHERE Correo = ?
    `, [correoUsuario]);

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResults[0].Usuario_ID;

    // Verificar las bodegas que administra el usuario
    const [adminResults] = await pool.query(`
      SELECT DISTINCT b.Nombre AS WarehouseName, COALESCE(SUM(c.Cantidad), 0) AS TotalSales
      FROM Administra a
      LEFT JOIN Bodega b ON a.Bodega_ID = b.ID
      LEFT JOIN Guarda g ON b.ID = g.Bodega_ID
      LEFT JOIN Lote l ON g.Producto_ID = l.Producto_ID
      LEFT JOIN Compra c ON l.ID = c.Lote_ID
      WHERE a.Usuario_ID = ? AND a.Tipo = 'Administrador'
      GROUP BY b.ID
    `, [userId]);

    res.status(200).json(adminResults);
  } catch (err) {
    console.error("Error in the query:", err);
    res.status(500).json({ error: "Error fetching warehouse sales data" });
  }
});

app.get("/ventas_producto_espesifico_tiempo", async (req, res) => {
  const { correoUsuario, bodegaId, productoId, startDate, endDate } = req.query;

  if (!correoUsuario || !bodegaId || !productoId || !startDate || !endDate) {
    return res.status(400).json({ error: "correoUsuario, bodegaId, productoId, startDate, and endDate are required" });
  }

  try {
    // Obtener el userId a partir del correo del usuario
    const [userResults] = await pool.query(`
      SELECT ID AS Usuario_ID
      FROM Usuario
      WHERE Correo = ?
    `, [correoUsuario]);

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResults[0].Usuario_ID;

    // Verificar si el usuario administra la bodega
    const [adminResults] = await pool.query(`
      SELECT 1
      FROM Administra
      WHERE Usuario_ID = ? AND Bodega_ID = ? AND Tipo = 'Administrador'
    `, [userId, bodegaId]);

    if (adminResults.length === 0) {
      return res.status(403).json({ error: "User does not manage this warehouse" });
    }

    // Obtener ventas históricas del producto
    const [results] = await pool.query(`
      SELECT DATE(b.Fecha) AS Date, COALESCE(SUM(c.Cantidad), 0) AS TotalSales
      FROM Producto p
      LEFT JOIN Guarda g ON p.ID = g.Producto_ID
      LEFT JOIN Lote l ON g.Bodega_ID = ? AND l.Producto_ID = p.ID
      LEFT JOIN Compra c ON l.ID = c.Lote_ID
      LEFT JOIN Boleta_detalle bd ON c.ID = bd.ID_compra
      LEFT JOIN Boleta b ON bd.ID_Boleta = b.ID
      WHERE p.ID = ? AND b.Fecha BETWEEN ? AND ?
      GROUP BY DATE(b.Fecha)
      ORDER BY DATE(b.Fecha)
    `, [bodegaId, productoId, startDate, endDate]);

    res.status(200).json(results);
  } catch (err) {
    console.error("Error in the query:", err);
    res.status(500).json({ error: "Error fetching historical sales data" });
  }
});

app.get("/ventas_por_bodega_fechas", async (req, res) => {
  const { correoUsuario, bodegaId, startDate, endDate } = req.query;

  if (!correoUsuario || !bodegaId || !startDate || !endDate) {
    return res.status(400).json({ error: "correoUsuario, bodegaId, startDate, and endDate are required" });
  }

  try {
    // Obtener el userId a partir del correo del usuario
    const [userResults] = await pool.query(`
      SELECT ID AS Usuario_ID
      FROM Usuario
      WHERE Correo = ?
    `, [correoUsuario]);

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResults[0].Usuario_ID;

    // Verificar si el usuario administra la bodega
    const [adminResults] = await pool.query(`
      SELECT 1
      FROM Administra
      WHERE Usuario_ID = ? AND Bodega_ID = ? AND Tipo = 'Administrador'
    `, [userId, bodegaId]);

    if (adminResults.length === 0) {
      return res.status(403).json({ error: "User does not manage this warehouse" });
    }

    // Obtener la venta de productos por bodega en el rango de fechas
    const [results] = await pool.query(`
      SELECT p.Nombre AS ProductName, COALESCE(SUM(COALESCE(c.Cantidad, 0)), 0) AS TotalSales
      FROM Producto p
      INNER JOIN Guarda g ON p.ID = g.Producto_ID AND g.Bodega_ID = ?
      LEFT JOIN Lote l ON g.Bodega_ID = l.Bodega_ID AND l.Producto_ID = p.ID
      LEFT JOIN Compra c ON l.ID = c.Lote_ID
      LEFT JOIN Boleta_detalle bd ON c.ID = bd.ID_compra
      LEFT JOIN Boleta b ON bd.ID_Boleta = b.ID AND b.Fecha BETWEEN ? AND ?
      GROUP BY p.ID
    `, [bodegaId, startDate, endDate]);

    res.status(200).json(results);
  } catch (err) {
    console.error("Error in the query:", err);
    res.status(500).json({ error: "Error fetching sales data" });
  }
});


// ------------- Print del puerto -------------
app.listen(port, () => {
  console.log("Servidor escuchando en el puerto: " + port);
});

