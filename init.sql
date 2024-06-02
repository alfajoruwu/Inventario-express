-- Create the database
CREATE DATABASE inventario;

-- Use the created database
USE inventario;

-- Create the user and grant privileges
CREATE USER 'alfajor'@'%' IDENTIFIED BY 'alfajor';
GRANT ALL PRIVILEGES ON *.* TO 'alfajor'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Create the tables
CREATE TABLE `Bodega` (
  `ID` int PRIMARY KEY,
  `Nombre` varchar(255),
  `Codigo_Invitacion` varchar(255)
);

CREATE TABLE `Producto` (
  `ID` int PRIMARY KEY,
  `Nombre` varchar(255),
  `Descripcion` text,
  `Imagen` varchar(255),
  `Precio` decimal(10, 2),
  `Codigo` varchar(255)
);

CREATE TABLE `Lote` (
  `ID` int PRIMARY KEY,
  `Cantidad` int,
  `Fecha_Vencimiento` date,
  `Fecha_de_llegada` date,
  `Producto_ID` int,
  FOREIGN KEY (`Producto_ID`) REFERENCES `Producto` (`ID`)
);

CREATE TABLE `Cliente` (
  `ID` int PRIMARY KEY,
  `Nombre` varchar(255)
);

CREATE TABLE `Tag` (
  `ID` int PRIMARY KEY,
  `Nombre` varchar(255)
);

CREATE TABLE `Usuario` (
  `ID` int PRIMARY KEY,
  `Nombre` varchar(255),
  `Contraseña` varchar(255),
  `Codigo_Administrador` varchar(255)
);

CREATE TABLE `Compra` (
  `ID` int PRIMARY KEY,
  `Fecha` date,
  `Cliente_ID` int,
  `Cantidad` int,
  `Usuario_ID` int,
  `Lote_ID` int,
  FOREIGN KEY (`Cliente_ID`) REFERENCES `Cliente` (`ID`),
  FOREIGN KEY (`Usuario_ID`) REFERENCES `Usuario` (`ID`),
  FOREIGN KEY (`Lote_ID`) REFERENCES `Lote` (`ID`)
);

CREATE TABLE `Categoriza` (
  `Bodega_ID` int,
  `Tag_ID` int,
  UNIQUE (`Bodega_ID`, `Tag_ID`),
  FOREIGN KEY (`Bodega_ID`) REFERENCES `Bodega` (`ID`),
  FOREIGN KEY (`Tag_ID`) REFERENCES `Tag` (`ID`)
);

CREATE TABLE `Almacena` (
  `ID` int PRIMARY KEY,
  `Bodega_ID` int,
  `Lote_ID` int,
  FOREIGN KEY (`Bodega_ID`) REFERENCES `Bodega` (`ID`),
  FOREIGN KEY (`Lote_ID`) REFERENCES `Lote` (`ID`)
);

CREATE TABLE `Administra` (
  `Usuario_ID` int,
  `Bodega_ID` int,
  `Tipo` varchar(255),
  UNIQUE (`Usuario_ID`, `Bodega_ID`),
  FOREIGN KEY (`Usuario_ID`) REFERENCES `Usuario` (`ID`),
  FOREIGN KEY (`Bodega_ID`) REFERENCES `Bodega` (`ID`)
);

-- Create indexes
CREATE UNIQUE INDEX `Categoriza_index_0` ON `Categoriza` (`Bodega_ID`, `Tag_ID`);
CREATE UNIQUE INDEX `Administra_index_1` ON `Administra` (`Usuario_ID`, `Bodega_ID`);
