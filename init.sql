CREATE USER 'alfajor'@'%' IDENTIFIED BY 'alfajor';
GRANT ALL PRIVILEGES ON *.* TO 'alfajor'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;


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
  `Precio` decimal,
  `Codigo` varchar(255)
);

CREATE TABLE `Lote` (
  `ID` int PRIMARY KEY,
  `Cantidad` int,
  `Fecha_Vencimiento` date,
  `Fecha_de_llegada` date,
  `Producto_ID` int
);

CREATE TABLE `Cliente` (
  `ID` int PRIMARY KEY,
  `Nombre` varchar(255)
);

CREATE TABLE `Tag` (
  `ID` int PRIMARY KEY,
  `Nombre` varchar(255)
);

CREATE TABLE `Compra` (
  `ID` int PRIMARY KEY,
  `Fecha` date,
  `Cliente_ID` int,
  `Cantidad` int,
  `Usuario_ID` int,
  `Lote_ID` int
);

CREATE TABLE `Usuario` (
  `ID` int PRIMARY KEY,
  `Nombre` varchar(255),
  `Contraseña` varchar(255),
  `Codigo_Administrador` varchar(255)
);

CREATE TABLE `Categoriza` (
  `Bodega_ID` int,
  `Tag_ID` int
);

CREATE TABLE `Almacena` (
  `ID` int PRIMARY KEY,
  `Bodega_ID` int,
  `Lote_ID` int
);

CREATE TABLE `Administra` (
  `Usuario_ID` int,
  `Bodega_ID` int,
  `Tipo` varchar(255)
);

CREATE UNIQUE INDEX `Categoriza_index_0` ON `Categoriza` (`Bodega_ID`, `Tag_ID`);

CREATE UNIQUE INDEX `Administra_index_1` ON `Administra` (`Usuario_ID`, `Bodega_ID`);

ALTER TABLE `Lote` ADD FOREIGN KEY (`Producto_ID`) REFERENCES `Producto` (`ID`);

ALTER TABLE `Compra` ADD FOREIGN KEY (`Cliente_ID`) REFERENCES `Cliente` (`ID`);

ALTER TABLE `Compra` ADD FOREIGN KEY (`Usuario_ID`) REFERENCES `Usuario` (`ID`);

ALTER TABLE `Compra` ADD FOREIGN KEY (`Lote_ID`) REFERENCES `Lote` (`ID`);

ALTER TABLE `Almacena` ADD FOREIGN KEY (`Bodega_ID`) REFERENCES `Bodega` (`ID`);

ALTER TABLE `Almacena` ADD FOREIGN KEY (`Lote_ID`) REFERENCES `Lote` (`ID`);

ALTER TABLE `Categoriza` ADD FOREIGN KEY (`Bodega_ID`) REFERENCES `Bodega` (`ID`);

ALTER TABLE `Categoriza` ADD FOREIGN KEY (`Tag_ID`) REFERENCES `Tag` (`ID`);

ALTER TABLE `Administra` ADD FOREIGN KEY (`Usuario_ID`) REFERENCES `Usuario` (`ID`);

ALTER TABLE `Administra` ADD FOREIGN KEY (`Bodega_ID`) REFERENCES `Bodega` (`ID`);
