<?php
header('Content-Type: application/json');
session_start();

// Verificar si el usuario está autenticado y es administrador
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'No tienes permisos para realizar esta acción']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_producto'])) {
    echo json_encode(['success' => false, 'message' => 'ID de producto no proporcionado']);
    exit;
}

try {
    // Conexión a la base de datos
    $conn = new PDO("mysql:host=localhost;dbname=moda_fashion", "root", "");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Eliminar producto
    $stmt = $conn->prepare("DELETE FROM productos WHERE id_producto = :id");
    $stmt->bindParam(':id', $data['id_producto']);
    $stmt->execute();

    echo json_encode(['success' => $stmt->rowCount() > 0]);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error al eliminar el producto: ' . $e->getMessage()]);
}
?>