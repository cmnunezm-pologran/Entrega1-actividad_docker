CREATE DATABASE IF NOT EXISTS drone_store_db;
USE drone_store_db;

CREATE TABLE marcas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activa BOOLEAN DEFAULT true,
    fecha_fundacion DATE,
    pais_origen CHAR(3),
    calificacion DECIMAL(3,1),
    descripcion TEXT
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marca_id INT NOT NULL,
    modelo VARCHAR(150) NOT NULL,
    en_stock BOOLEAN DEFAULT true,
    fecha_lanzamiento DATE,
    codigo_serie CHAR(15),
    precio DECIMAL(10,2),
    FOREIGN KEY (marca_id) REFERENCES marcas(id)
);