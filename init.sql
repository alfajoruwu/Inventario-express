-- Create the database
CREATE DATABASE inventario;

-- Use the created database
USE inventario;

-- Create the user and grant privileges
CREATE USER 'alfajor'@'%' IDENTIFIED BY 'alfajor';
GRANT ALL PRIVILEGES ON *.* TO 'alfajor'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Creación de tablas

CREATE TABLE Lote (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Cantidad INT,
    Fecha_de_vencimiento DATE,
    Fecha_de_llegada DATE,
    Producto_ID INT,
    Bodega_ID INT
);

CREATE TABLE Producto (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(255),
    Descripcion VARCHAR(255),
    Imagen LONGBLOB,
    Precio DECIMAL(20, 2),
    Codigo VARCHAR(50)
);

CREATE TABLE Bodega (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(255),
    Codigo_invitacion VARCHAR(50),
    Codigo_invitacion_admin VARCHAR(50),
    UbicacionNombre VARCHAR(255),
    UbicacionLatitud DECIMAL(20, 17),
    UbicacionLongitud DECIMAL(20, 17)
);

CREATE TABLE Guarda (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Bodega_ID INT,
    Producto_ID INT
);

CREATE TABLE Compra (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Cliente_ID INT,
    Cantidad INT,
    Usuario_ID INT,
    Lote_ID INT
);

CREATE TABLE Cliente (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(255)
);

CREATE TABLE Boleta (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Fecha DATE
);

CREATE TABLE Boleta_detalle (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    ID_compra INT,
    ID_Boleta INT
);

CREATE TABLE Usuario (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(255),
    Contrasena VARCHAR(255),
    Correo VARCHAR(255),
    Codigo_administrador INT
);

CREATE TABLE Administra (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Tipo VARCHAR(50),
    Usuario_ID INT,
    Bodega_ID INT
);

CREATE TABLE Categorisa (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Bodega_ID INT,
    Tag_ID INT
);

CREATE TABLE Tag (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Nombre VARCHAR(255),
    Usuario INT
);

-- Inserción de datos de ejemplo

INSERT INTO Lote (Cantidad, Fecha_de_vencimiento, Fecha_de_llegada, Producto_ID, Bodega_ID) VALUES
(32, '2024-09-06', '2024-06-14', 1, 1),
(13, '2030-11-11', '2021-01-01', 1, 1);

INSERT INTO Producto (Nombre, Descripcion, Imagen, Precio, Codigo) VALUES
('Articulo1', 'azul', 'base64', 5000, '1234512'),
('Articulo2', 'Verde', 'base64', 10000, '321312');

INSERT INTO Bodega (Nombre, Codigo_invitacion, Codigo_invitacion_admin, UbicacionNombre, UbicacionLatitud, UbicacionLongitud) VALUES
('Bodega1', '1234', '4321', 'nombre1', -30.1112, 30.1231),
('Bodega2', '1235', '5321', 'nombre2', 31.1123, 34.12321);

INSERT INTO Guarda (Bodega_ID, Producto_ID) VALUES
(1, 1),
(2, 2);

INSERT INTO Compra (Cliente_ID, Cantidad, Usuario_ID, Lote_ID) VALUES
(2, 10, 2, 1),
(1, 5, 1, 1);

INSERT INTO Cliente (Nombre) VALUES
('Juana'),
('Pedro');

INSERT INTO Boleta (Fecha) VALUES
('2024-06-16'),
('2024-06-16');

INSERT INTO Boleta_detalle (ID_compra, ID_Boleta) VALUES
(1, 1),
(2, 1);

INSERT INTO Usuario (Nombre, Contrasena, Correo, Codigo_administrador) VALUES
('alfajor', 'alfajor', 'alfajor@mail.com', 123),
('juan', 'juan', 'juan@mail.com', 321);

INSERT INTO Administra (Tipo, Usuario_ID, Bodega_ID) VALUES
('Administrador', 1, 1),
('Empleado', 2, 1),
('Empleado', 1, 2);

INSERT INTO Categorisa (Bodega_ID, Tag_ID) VALUES
(1, 1),
(1, 2);

INSERT INTO Tag (Nombre, Usuario) VALUES
('Electronica', 1),
('Verduras', 1);
