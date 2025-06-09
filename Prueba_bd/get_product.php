<?php
header('Content-Type: application/json');

// Conexión a la base de datos
$conn = new PDO("mysql:host=localhost;dbname=moda_fashion", "root", "");
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Verificar si se solicita un producto específico
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM productos WHERE id_producto = ?");
    $stmt->execute([$id]);
    $producto = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($producto) {
        echo json_encode($producto);
    } else {
        echo json_encode(['error' => 'Producto no encontrado']);
    }
} else {
    // Si no hay ID, devolver todos los productos
    $stmt = $conn->query("SELECT * FROM productos");
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($productos);
}
?>