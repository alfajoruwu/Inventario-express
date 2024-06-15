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
    ID INT PRIMARY KEY,
    Cantidad INT,
    Fecha_de_vencimiento DATE,
    Fecha_de_llegada DATE,
    Producto_ID INT,
    Bodega_ID INT
);

CREATE TABLE Producto (
    ID INT PRIMARY KEY,
    Nombre VARCHAR(255),
    Descripcion VARCHAR(255),
    Imagen VARCHAR(255),
    Precio DECIMAL(10, 2),
    Codigo VARCHAR(50)
);

CREATE TABLE Bodega (
    ID INT PRIMARY KEY,
    Nombre VARCHAR(255),
    Codigo_invitacion VARCHAR(50)
);

CREATE TABLE Guarda (
    ID INT PRIMARY KEY,
    Bodega_ID INT,
    Producto_ID INT
);

CREATE TABLE Compra (
    ID INT PRIMARY KEY,
    Cliente_ID INT,
    Cantidad INT,
    Usuario_ID INT,
    Lote_ID INT
);

CREATE TABLE Cliente (
    ID INT PRIMARY KEY,
    Nombre VARCHAR(255)
);

CREATE TABLE Boleta (
    ID INT PRIMARY KEY,
    Fecha DATE
);

CREATE TABLE Boleta_detalle (
    ID INT PRIMARY KEY,
    ID_compra INT,
    ID_Boleta INT
);

CREATE TABLE Usuario (
    ID INT PRIMARY KEY,
    Nombre VARCHAR(255),
    Contrasena VARCHAR(255),
    Correo VARCHAR(255),
    Codigo_administrador INT
);

CREATE TABLE Administra (
    Tipo VARCHAR(50),
    Usuario_ID INT,
    Bodega_ID INT
);

CREATE TABLE Categorisa (
    Bodega_ID INT,
    Tag_ID INT
);

CREATE TABLE Tag (
    ID INT PRIMARY KEY,
    Nombre VARCHAR(255),
    Usuario INT
);

-- Inserción de datos de ejemplo

INSERT INTO Lote (ID, Cantidad, Fecha_de_vencimiento, Fecha_de_llegada, Producto_ID, Bodega_ID) VALUES
(1, 32, '2024-09-06', '2024-06-14', 1, 1),
(2, 13, '2030-11-11', '2021-01-01', 1, 1);

INSERT INTO Producto (ID, Nombre, Descripcion, Imagen, Precio, Codigo) VALUES
(1, 'Articulo1', 'azul', 'base64', 5000, '1234512'),
(2, 'Articulo2', 'Verde', 'base64', 10000, '321312');

INSERT INTO Bodega (ID, Nombre, Codigo_invitacion) VALUES
(1, 'Bodega1', '1234'),
(2, 'Bodega2', '1234');

INSERT INTO Guarda (ID, Bodega_ID, Producto_ID) VALUES
(1, 1, 1),
(2, 1, 2);

INSERT INTO Compra (ID, Cliente_ID, Cantidad, Usuario_ID, Lote_ID) VALUES
(1, 2, 10, 2, 1),
(2, 1, 5, 1, 1);

INSERT INTO Cliente (ID, Nombre) VALUES
(1, 'Juana'),
(2, 'Pedro');

INSERT INTO Boleta (ID, Fecha) VALUES
(1, '2024-06-16'),
(2, '2024-06-16');

INSERT INTO Boleta_detalle (ID, ID_compra, ID_Boleta) VALUES
(1, 1, 1),
(2, 2, 1);

INSERT INTO Usuario (ID, Nombre, Contrasena, Correo, Codigo_administrador) VALUES
(1, 'alfajor', 'alfajor', 'alfajor@mail.com', 123),
(2, 'juan', 'juan', 'juan@mail.com', 321);

INSERT INTO Administra (Tipo, Usuario_ID, Bodega_ID) VALUES
('Administrador', 1, 1),
('Empleado', 2, 1);

INSERT INTO Categorisa (Bodega_ID, Tag_ID) VALUES
(1, 2),
(1, 2);

INSERT INTO Tag (ID, Nombre, Usuario) VALUES
(1, 'Electronica', 1),
(2, 'Verduras', 1);