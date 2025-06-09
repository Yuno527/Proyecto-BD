<?php
session_start();
header('Content-Type: application/json');

require_once 'conexion.php';

// Verificar si el usuario está logueado
function verificarSesion() {
    if (!isset($_SESSION['usuario'])) {
        return ['success' => false, 'message' => 'Usuario no autenticado'];
    }
    return ['success' => true, 'id_usuario' => $_SESSION['usuario']['id_usuario']];
}

// Agregar producto al carrito
function agregarAlCarrito($id_producto, $cantidad) {
    $sesion = verificarSesion();
    if (!$sesion['success']) {
        return $sesion;
    }

    global $conexion;
    
    try {
        // Verificar si el producto existe
        $stmt = $conexion->prepare("SELECT id_producto FROM productos WHERE id_producto = ?");
        $stmt->bind_param("i", $id_producto);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            return ['success' => false, 'message' => 'Producto no encontrado'];
        }

        // Verificar si el producto ya está en el carrito
        $stmt = $conexion->prepare("SELECT id_carrito, cantidad FROM carrito 
                                  WHERE id_usuarioFK = ? AND id_productoFK = ?");
        $stmt->bind_param("ii", $sesion['id_usuario'], $id_producto);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Actualizar cantidad si el producto ya existe
            $row = $result->fetch_assoc();
            $nueva_cantidad = $row['cantidad'] + $cantidad;
            
            $stmt = $conexion->prepare("UPDATE carrito SET cantidad = ? 
                                      WHERE id_carrito = ?");
            $stmt->bind_param("ii", $nueva_cantidad, $row['id_carrito']);
        } else {
            // Insertar nuevo producto en el carrito
            $stmt = $conexion->prepare("INSERT INTO carrito (cantidad, id_usuarioFK, id_productoFK) 
                                      VALUES (?, ?, ?)");
            $stmt->bind_param("iii", $cantidad, $sesion['id_usuario'], $id_producto);
        }
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Producto agregado al carrito'];
        } else {
            return ['success' => false, 'message' => 'Error al agregar producto'];
        }
    } catch (Exception $e) {
        error_log("Error en agregarAlCarrito: " . $e->getMessage());
        return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
    }
}

// Obtener productos del carrito
function obtenerCarrito() {
    $sesion = verificarSesion();
    if (!$sesion['success']) {
        return $sesion;
    }

    global $conexion;
    
    try {
        $stmt = $conexion->prepare("
            SELECT c.id_carrito, c.cantidad, c.fecha_agr, 
                   p.id_producto, p.nombre, p.precio, p.imagen, p.stock
            FROM carrito c
            JOIN productos p ON c.id_productoFK = p.id_producto
            WHERE c.id_usuarioFK = ?
            ORDER BY c.fecha_agr DESC
        ");
        
        if (!$stmt) {
            error_log("Error en prepare: " . $conexion->error);
            return ['success' => false, 'message' => 'Error en la consulta'];
        }

        $stmt->bind_param("i", $sesion['id_usuario']);
        
        if (!$stmt->execute()) {
            error_log("Error en execute: " . $stmt->error);
            return ['success' => false, 'message' => 'Error al ejecutar la consulta'];
        }

        $result = $stmt->get_result();
        $productos = [];
        
        while ($row = $result->fetch_assoc()) {
            $productos[] = $row;
        }
        
        error_log("Productos encontrados: " . count($productos));
        return ['success' => true, 'productos' => $productos];
    } catch (Exception $e) {
        error_log("Error en obtenerCarrito: " . $e->getMessage());
        return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
    }
}

// Actualizar cantidad en el carrito
function actualizarCantidad($id_carrito, $cantidad) {
    $sesion = verificarSesion();
    if (!$sesion['success']) {
        return $sesion;
    }

    global $conexion;
    
    try {
        // Verificar que el carrito pertenece al usuario
        $stmt = $conexion->prepare("SELECT id_carrito FROM carrito 
                                  WHERE id_carrito = ? AND id_usuarioFK = ?");
        $stmt->bind_param("ii", $id_carrito, $sesion['id_usuario']);
        $stmt->execute();
        
        if ($stmt->get_result()->num_rows === 0) {
            return ['success' => false, 'message' => 'Carrito no encontrado'];
        }
        
        if ($cantidad <= 0) {
            // Eliminar producto si la cantidad es 0 o negativa
            $stmt = $conexion->prepare("DELETE FROM carrito WHERE id_carrito = ?");
            $stmt->bind_param("i", $id_carrito);
        } else {
            // Actualizar cantidad
            $stmt = $conexion->prepare("UPDATE carrito SET cantidad = ? WHERE id_carrito = ?");
            $stmt->bind_param("ii", $cantidad, $id_carrito);
        }
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Carrito actualizado'];
        } else {
            return ['success' => false, 'message' => 'Error al actualizar carrito'];
        }
    } catch (Exception $e) {
        error_log("Error en actualizarCantidad: " . $e->getMessage());
        return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
    }
}

// Eliminar producto del carrito
function eliminarDelCarrito($id_carrito) {
    $sesion = verificarSesion();
    if (!$sesion['success']) {
        return $sesion;
    }

    global $conexion;
    
    try {
        // Verificar que el carrito pertenece al usuario
        $stmt = $conexion->prepare("DELETE FROM carrito 
                                  WHERE id_carrito = ? AND id_usuarioFK = ?");
        $stmt->bind_param("ii", $id_carrito, $sesion['id_usuario']);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Producto eliminado del carrito'];
        } else {
            return ['success' => false, 'message' => 'Error al eliminar producto'];
        }
    } catch (Exception $e) {
        error_log("Error en eliminarDelCarrito: " . $e->getMessage());
        return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
    }
}

// Limpiar todo el carrito
function limpiarCarrito() {
    $sesion = verificarSesion();
    if (!$sesion['success']) {
        return $sesion;
    }

    global $conexion;
    
    try {
        $stmt = $conexion->prepare("DELETE FROM carrito WHERE id_usuarioFK = ?");
        $stmt->bind_param("i", $sesion['id_usuario']);
        
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Carrito limpiado correctamente'];
        } else {
            return ['success' => false, 'message' => 'Error al limpiar el carrito'];
        }
    } catch (Exception $e) {
        error_log("Error en limpiarCarrito: " . $e->getMessage());
        return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
    }
}

// Manejar las peticiones
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';
    
    error_log("Acción recibida: " . $action);
    error_log("Datos recibidos: " . print_r($data, true));
    
    switch ($action) {
        case 'agregar':
            echo json_encode(agregarAlCarrito($data['id_producto'], $data['cantidad']));
            break;
            
        case 'obtener':
            echo json_encode(obtenerCarrito());
            break;
            
        case 'actualizar':
            echo json_encode(actualizarCantidad($data['id_carrito'], $data['cantidad']));
            break;
            
        case 'eliminar':
            echo json_encode(eliminarDelCarrito($data['id_carrito']));
            break;
            
        case 'limpiar':
            echo json_encode(limpiarCarrito());
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }
}
?> 