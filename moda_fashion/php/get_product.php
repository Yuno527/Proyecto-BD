<?php
header('Content-Type: application/json');
require_once 'config.php';

$id = $_GET['id'] ?? 0;

try {
    $conn = getDBConnection();
    $stmt = $conn->prepare("SELECT * FROM productos WHERE id_producto = ?");
    $stmt->execute([$id]);
    $producto = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($producto ?: ['error' => 'Producto no encontrado']);
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>