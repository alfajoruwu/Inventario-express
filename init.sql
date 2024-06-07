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
  `ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Nombre` VARCHAR(255),
  `Codigo_Invitacion` VARCHAR(255)
);

CREATE TABLE `Producto` (
  `ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Nombre` VARCHAR(255),
  `Descripcion` TEXT,
  `Imagen` VARCHAR(255),
  `Precio` DECIMAL(10, 2),
  `Codigo` VARCHAR(255)
);

CREATE TABLE `Lote` (
  `ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Cantidad` INT,
  `Fecha_Vencimiento` DATE,
  `Fecha_de_llegada` DATE,
  `Producto_ID` INT,
  FOREIGN KEY (`Producto_ID`) REFERENCES `Producto` (`ID`)
);

CREATE TABLE `Cliente` (
  `ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Nombre` VARCHAR(255)
);

CREATE TABLE `Tag` (
  `ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Nombre` VARCHAR(255)
);

CREATE TABLE `Usuario` (
  `ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Nombre` VARCHAR(255),
  `Contraseña` VARCHAR(255),
  `Correo` VARCHAR(255),
  `Codigo_Administrador` VARCHAR(255)
);

CREATE TABLE `Compra` (
  `ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Fecha` DATE,
  `Cliente_ID` INT,
  `Cantidad` INT,
  `Usuario_ID` INT,
  `Lote_ID` INT,
  FOREIGN KEY (`Cliente_ID`) REFERENCES `Cliente` (`ID`),
  FOREIGN KEY (`Usuario_ID`) REFERENCES `Usuario` (`ID`),
  FOREIGN KEY (`Lote_ID`) REFERENCES `Lote` (`ID`)
);

CREATE TABLE `Categoriza` (
  `Bodega_ID` INT,
  `Tag_ID` INT,
  UNIQUE (`Bodega_ID`, `Tag_ID`),
  FOREIGN KEY (`Bodega_ID`) REFERENCES `Bodega` (`ID`),
  FOREIGN KEY (`Tag_ID`) REFERENCES `Tag` (`ID`)
);

CREATE TABLE `Almacena` (
  `ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Bodega_ID` INT,
  `Lote_ID` INT,
  FOREIGN KEY (`Bodega_ID`) REFERENCES `Bodega` (`ID`),
  FOREIGN KEY (`Lote_ID`) REFERENCES `Lote` (`ID`)
);

CREATE TABLE `Administra` (
  `Usuario_ID` INT,
  `Bodega_ID` INT,
  `Tipo` VARCHAR(255),
  UNIQUE (`Usuario_ID`, `Bodega_ID`),
  FOREIGN KEY (`Usuario_ID`) REFERENCES `Usuario` (`ID`),
  FOREIGN KEY (`Bodega_ID`) REFERENCES `Bodega` (`ID`)
);

-- Create indexes
CREATE UNIQUE INDEX `Categoriza_index_0` ON `Categoriza` (`Bodega_ID`, `Tag_ID`);
CREATE UNIQUE INDEX `Administra_index_1` ON `Administra` (`Usuario_ID`, `Bodega_ID`);
