<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    $conn = getDBConnection();
    $stmt = $conn->query("SELECT * FROM productos");
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($productos);
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>