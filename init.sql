-- Create the database
CREATE DATABASE Ejemplo;

-- Use the created database
USE Ejemplo;

-- Create the user and grant privileges
CREATE USER 'Backend'@'%' IDENTIFIED BY 'Backend';
GRANT ALL PRIVILEGES ON *.* TO 'Backend'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Create the tables
CREATE TABLE `Ejemplo` (
  `ID` INT AUTO_INCREMENT PRIMARY KEY,
  `Nombre` VARCHAR(255)
);
