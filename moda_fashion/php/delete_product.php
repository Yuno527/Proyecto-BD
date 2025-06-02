<?php
header('Content-Type: application/json');
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

try {
    $conn = getDBConnection();
    
    // Primero obtener info de la imagen para borrarla
    $stmt = $conn->prepare("SELECT imagen FROM productos WHERE id_producto = ?");
    $stmt->execute([$data['id_producto']]);
    $producto = $stmt->fetch();
    
    if ($producto) {
        // Borrar imagen
        $imagePath = "../uploads/" . $producto['imagen'];
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
        
        // Borrar producto
        $stmt = $conn->prepare("DELETE FROM productos WHERE id_producto = ?");
        $stmt->execute([$data['id_producto']]);
        
        echo json_encode(['success' => $stmt->rowCount() > 0]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Producto no encontrado']);
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>