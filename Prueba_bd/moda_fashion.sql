-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 08-06-2025 a las 07:59:33
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `moda_fashion`
--

-- --------------------------------------------------------


-- tabla categorias


CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- insertamos las categorias

INSERT INTO `categorias` (`id_categoria`, `nombre`) VALUES
(1, 'Camisetas'),
(2, 'Pantalones'),
(3, 'Vestidos'),
(4, 'Zapatos'),
(5, 'Accesorios');

-- tabla usuarios

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `edad` int(11) NOT NULL,
  `rol` varchar(20) NOT NULL DEFAULT 'usuario',
  PRIMARY KEY (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- insertamos los usuarios

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `contraseña`, `direccion`, `edad`, `rol`) VALUES
(1, 'admin', 'admin123', 'Calle Principal 123', 30, 'admin'),
(2, 'emma', 'emma123', 'calle40', 20, 'usuario');

-- --------------------------------------------------------

-- tabla productos

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `id_categoriaFK` int(11) NOT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `id_categoriaFK` (`id_categoriaFK`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoriaFK`) REFERENCES `categorias` (`id_categoria`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `productos` (`id_producto`, `nombre`, `descripcion`, `imagen`, `precio`, `stock`, `id_categoriaFK`) VALUES
(5, 'Camisetas', 'es pequeña', '6845f960c81e5_real.jpeg', 30000.00, 17, 1),
(6, 'vestido verde', 'grande', '6845f97c7f142_vesti.webp', 40000.00, 7, 3),
(7, 'zapatos', 'talla 37', '6845fa5c94f24_tenis.jpeg', 60000.00, 27, 4),
(8, 'pantalones clasico', 'es muy bonita', '6845fa7bd17b0_clasico negro.jpg', 50000.00, 26, 2);

-- tabla pagos

CREATE TABLE `pagos` (
  `id_pago` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuarioFK` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `fecha_pago` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('pendiente','completado','cancelado') NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (`id_pago`),
  KEY `id_usuarioFK` (`id_usuarioFK`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`id_usuarioFK`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- tabla detalles_pago

CREATE TABLE `detalles_pago` (
  `id_detalle` int(11) NOT NULL AUTO_INCREMENT,
  `id_pagoFK` int(11) NOT NULL,
  `id_productoFK` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_pagoFK` (`id_pagoFK`),
  KEY `id_productoFK` (`id_productoFK`),
  CONSTRAINT `detalles_pago_ibfk_1` FOREIGN KEY (`id_pagoFK`) REFERENCES `pagos` (`id_pago`) ON DELETE CASCADE,
  CONSTRAINT `detalles_pago_ibfk_2` FOREIGN KEY (`id_productoFK`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- tabla carrito

CREATE TABLE `carrito` (
  `id_carrito` int(11) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `fecha_agr` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_usuarioFK` int(11) NOT NULL,
  `id_productoFK` int(11) NOT NULL,
  PRIMARY KEY (`id_carrito`),
  KEY `id_usuarioFK` (`id_usuarioFK`),
  KEY `id_productoFK` (`id_productoFK`),
  CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`id_usuarioFK`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `carrito_ibfk_2` FOREIGN KEY (`id_productoFK`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- procedimientos almacenados

--procedimiento para procesar el pago
DELIMITER $$ -- define el delimitador de la funcion
DROP PROCEDURE IF EXISTS `procesar_pago`$$ -- elimina el procedimiento si existe
CREATE PROCEDURE `procesar_pago` ( -- crea el procedimiento
    IN `p_id_usuario` INT, -- parametro de entrada para el id del usuario
    IN `p_productos` JSON, -- parametro de entrada para los productos
    OUT `p_resultado` VARCHAR(100) -- parametro de salida para el resultado
)
proc: BEGIN -- inicio del procedimiento
    DECLARE v_total DECIMAL(10,2) DEFAULT 0; 
    DECLARE v_id_pago INT; 
    DECLARE i INT DEFAULT 0; 
    DECLARE v_producto_count INT; 
    DECLARE v_id_producto INT; 
    DECLARE v_cantidad INT; 
    DECLARE v_precio DECIMAL(10,2); 
    DECLARE v_stock_actual INT; 
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION -- manejo de excepciones
    BEGIN -- inicio del manejo de excepciones
        ROLLBACK; -- rollback de la transaccion
        SET p_resultado = 'Error en la transacción'; -- seteo del resultado
    END;

    
    START TRANSACTION; -- inicio de la transaccion
    
    -- obtener el numero de productos en el JSON
    SET v_producto_count = JSON_LENGTH(p_productos);
    
    -- crear el registro de pago
    INSERT INTO pagos (id_usuarioFK, total, estado)
    VALUES (p_id_usuario, 0, 'pendiente');
    
    SET v_id_pago = LAST_INSERT_ID(); -- obtener el id del pago
        
    WHILE i < v_producto_count DO -- bucle para procesar cada producto
        -- Obtener datos del producto actual
        SET v_id_producto = JSON_EXTRACT(p_productos, CONCAT('$[', i, '].id_producto'));
        SET v_cantidad = JSON_EXTRACT(p_productos, CONCAT('$[', i, '].cantidad'));
        
        -- Verificar stock y obtener precio
        SELECT stock, precio INTO v_stock_actual, v_precio 
        FROM productos 
        WHERE id_producto = v_id_producto FOR UPDATE;
        
        IF v_stock_actual >= v_cantidad THEN -- si el stock es mayor o igual a la cantidad
            -- Calcular subtotal
            SET v_total = v_total + (v_precio * v_cantidad);
            
            -- Insertar detalle del pago
            INSERT INTO detalles_pago (id_pagoFK, id_productoFK, cantidad, precio_unitario, subtotal)
            VALUES (v_id_pago, v_id_producto, v_cantidad, v_precio, v_precio * v_cantidad);
            
            -- Actualizar stock
            UPDATE productos 
            SET stock = stock - v_cantidad 
            WHERE id_producto = v_id_producto;
        ELSE
            -- Cancelar transacción si no hay suficiente stock
            ROLLBACK;
            SET p_resultado = CONCAT('No hay suficiente stock disponible para el producto ID: ', v_id_producto);
            LEAVE proc;
        END IF;
        
        SET i = i + 1;
    END WHILE;
    
    -- Actualizar el total del pago
    UPDATE pagos SET total = v_total, estado = 'completado' WHERE id_pago = v_id_pago;
    
    -- Confirmar transaccion
    COMMIT;
    SET p_resultado = CONCAT('Pago procesado correctamente. Total: $', v_total);
END$$

-- Procedimiento para registrar un usuario
CREATE DEFINER=`root`@`localhost` PROCEDURE `registrar_usuario` (
    IN `p_nombre` VARCHAR(100), 
    IN `p_contraseña` VARCHAR(255), 
    IN `p_direccion` VARCHAR(255), 
    IN `p_edad` INT, 
    IN `p_rol` VARCHAR(20)
) 
BEGIN
    INSERT INTO usuarios (nombre, contraseña, direccion, edad, rol)
    VALUES (p_nombre, p_contraseña, p_direccion, p_edad, p_rol);
END$$

-- procedimiento para generar las estadisticas de las categorias

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_generar_estadisticas_categorias` ()   BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_id_categoria INT;
    DECLARE v_nombre VARCHAR(100);
    DECLARE v_total_unidades_vendidas INT;
    DECLARE v_promedio_ventas_por_producto DECIMAL(10,2);
    DECLARE v_stock_disponible INT;
    DECLARE v_productos_con_ventas INT;
    
    -- declararamos el cursor
    DECLARE cur_categorias CURSOR FOR 
        SELECT id_categoria, nombre 
        FROM categorias
        WHERE nombre != 'Accesorios';
    
    -- Declararamos exepciones
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- eliminamos la tabla temporal si existe
    DROP TEMPORARY TABLE IF EXISTS temp_estadisticas;
    CREATE TEMPORARY TABLE temp_estadisticas (
        id_categoria INT,
        nombre VARCHAR(100),
        total_unidades_vendidas INT,
        promedio_ventas_por_producto DECIMAL(10,2),
        stock_disponible INT
    );
    
    -- Abrir el cursor
    OPEN cur_categorias;
    
    -- Iniciar el loop
    read_loop: LOOP
        -- Obtener el siguiente registro
        FETCH cur_categorias INTO v_id_categoria, v_nombre;
        
        -- Salir del loop si no hay más registros
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Total de unidades vendidas por categoría
        SELECT COALESCE(SUM(pa.cantidad), 0)
        INTO v_total_unidades_vendidas
        FROM pagos pa
        JOIN productos pr ON pa.id_productosFK = pr.id_producto
        WHERE pr.id_categoriaFK = v_id_categoria;

        -- Promedio de ventas por producto en cada categoría
        SELECT COUNT(DISTINCT pr.id_producto)
        INTO v_productos_con_ventas
        FROM pagos pa
        JOIN productos pr ON pa.id_productosFK = pr.id_producto
        WHERE pr.id_categoriaFK = v_id_categoria;

        IF v_productos_con_ventas > 0 THEN
            SET v_promedio_ventas_por_producto = v_total_unidades_vendidas / v_productos_con_ventas;
        ELSE
            SET v_promedio_ventas_por_producto = 0;
        END IF;

        -- Stock disponible por categoría
        SELECT COALESCE(SUM(stock), 0)
        INTO v_stock_disponible
        FROM productos
        WHERE id_categoriaFK = v_id_categoria;
        
        -- Insertar resultados en la tabla temporal
        INSERT INTO temp_estadisticas (
            id_categoria, 
            nombre, 
            total_unidades_vendidas, 
            promedio_ventas_por_producto, 
            stock_disponible
        )
        VALUES (
            v_id_categoria, 
            v_nombre, 
            v_total_unidades_vendidas, 
            v_promedio_ventas_por_producto, 
            v_stock_disponible
        );
        
    END LOOP;
    
    -- Cerrar el cursor
    CLOSE cur_categorias;
    
    -- Seleccionar y retornar los resultados
    SELECT 
        id_categoria, 
        nombre, 
        total_unidades_vendidas, 
        promedio_ventas_por_producto, 
        stock_disponible
    FROM temp_estadisticas 
    ORDER BY nombre ASC; -- Ordenar por nombre de categoría
    
    -- Limpiar
    DROP TEMPORARY TABLE IF EXISTS temp_estadisticas;
END$$

DELIMITER ;


-- Triggers osea disparadores para manejo de stock


DELIMITER $$

-- Trigger para verificar stock antes de insertar un detalle de pago
CREATE TRIGGER verificar_stock_antes_pago -- creamos el trigger
BEFORE INSERT ON detalles_pago -- antes de insertar un detalle de pago
FOR EACH ROW -- para cada fila
BEGIN -- inicio del trigger
    DECLARE stock_disponible INT; 
    
    -- Obtener el stock actual del producto
    SELECT stock INTO stock_disponible
    FROM productos
    WHERE id_producto = NEW.id_productoFK;
    
    -- Verificar si hay suficiente stock
    IF stock_disponible < NEW.cantidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No hay suficiente stock disponible para realizar la compra';
    END IF;
END$$

-- Trigger para reducir stock después de insertar un detalle de pago
CREATE TRIGGER reducir_stock_despues_pago
AFTER INSERT ON detalles_pago
FOR EACH ROW
BEGIN
    -- Reducir el stock del producto
    UPDATE productos
    SET stock = stock - NEW.cantidad
    WHERE id_producto = NEW.id_productoFK;
END$$

-- Trigger para restaurar stock al eliminar un detalle de pago
CREATE TRIGGER restaurar_stock_al_eliminar_pago
BEFORE DELETE ON detalles_pago
FOR EACH ROW
BEGIN
    -- Restaurar el stock del producto
    UPDATE productos
    SET stock = stock + OLD.cantidad
    WHERE id_producto = OLD.id_productoFK;
END$$

-- Trigger para actualizar stock al modificar un detalle de pago
CREATE TRIGGER actualizar_stock_al_modificar_pago
BEFORE UPDATE ON detalles_pago
FOR EACH ROW
BEGIN
    DECLARE stock_disponible INT;
    
    -- Si la cantidad ha cambiado
    IF NEW.cantidad != OLD.cantidad THEN
        -- Obtener el stock actual del producto
        SELECT stock INTO stock_disponible
        FROM productos
        WHERE id_producto = NEW.id_productoFK;
        
        -- Verificar si hay suficiente stock para la nueva cantidad
        IF stock_disponible + OLD.cantidad < NEW.cantidad THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No hay suficiente stock disponible para la nueva cantidad';
        END IF;
        
        -- Actualizar el stock
        UPDATE productos
        SET stock = stock + OLD.cantidad - NEW.cantidad
        WHERE id_producto = NEW.id_productoFK;
    END IF;
END$$

DELIMITER ;


-- Vistas

-- Vista para mostrar el carrito del usuario con detalles de productos y usuario
CREATE OR REPLACE VIEW `vista_carrito_usuario` AS
SELECT c.id_carrito, c.cantidad, c.fecha_agr, 
       p.id_producto, p.nombre, p.precio, p.imagen,
       u.id_usuario, u.nombre as nombre_usuario
FROM carrito c
JOIN productos p ON c.id_productoFK = p.id_producto
JOIN usuarios u ON c.id_usuarioFK = u.id_usuario;

-- Vista para mostrar estadisticas de ventas por categoria
CREATE OR REPLACE VIEW `vista_estadisticas_categorias` AS
SELECT 
    c.id_categoria,
    c.nombre as categoria,
    COUNT(DISTINCT p.id_producto) as total_productos,
    COUNT(DISTINCT pa.id_pago) as total_ventas,
    SUM(dp.cantidad) as unidades_vendidas,
    SUM(dp.subtotal) as total_ventas_monto
FROM categorias c
LEFT JOIN productos p ON c.id_categoria = p.id_categoriaFK
LEFT JOIN detalles_pago dp ON p.id_producto = dp.id_productoFK
LEFT JOIN pagos pa ON dp.id_pagoFK = pa.id_pago
GROUP BY c.id_categoria, c.nombre;

-- Vista para mostrar el estado del stock de los productos
CREATE OR REPLACE VIEW `vista_productos_estado` AS
SELECT 
    p.id_producto,
    p.nombre,
    p.stock,
    CASE 
        WHEN p.stock > 10 THEN 'Suficiente'
        WHEN p.stock > 0 THEN 'Bajo'
        ELSE 'Agotado'
    END as estado_stock
FROM productos p;

-- Vista para mostrar estadisticas de compras por usuario
CREATE OR REPLACE VIEW `vista_ventas_usuarios` AS
SELECT 
    u.id_usuario,
    u.nombre as nombre_usuario,
    COUNT(DISTINCT p.id_pago) as total_compras,
    SUM(p.total) as total_gastado
FROM usuarios u
LEFT JOIN pagos p ON u.id_usuario = p.id_usuarioFK
GROUP BY u.id_usuario, u.nombre;

-- Vista para mostrar productos mas vendidos
CREATE OR REPLACE VIEW `vista_productos_mas_vendidos` AS
SELECT 
    p.id_producto,
    p.nombre,
    p.precio,
    SUM(dp.cantidad) as total_vendido,
    SUM(dp.subtotal) as total_ingresos
FROM productos p
JOIN detalles_pago dp ON p.id_producto = dp.id_productoFK
GROUP BY p.id_producto, p.nombre, p.precio
ORDER BY total_vendido DESC;

COMMIT;

