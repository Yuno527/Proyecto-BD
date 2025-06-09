<?php
header('Content-Type: application/json');


try {
    // Obtener el ID de la categoría de la URL
    $id_categoria = isset($_GET['id_categoria']) ? intval($_GET['id_categoria']) : 0;
    
    if ($id_categoria <= 0) {
        throw new Exception("ID de categoría no válido");
    }

    // Conexión a la base de datos
    $conn = new PDO("mysql:host=localhost;dbname=moda_fashion", "root", "");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Consulta para obtener productos de la categoría
    $stmt = $conn->prepare("SELECT * FROM productos WHERE id_categoriaFK = :id_categoria");
    $stmt->bindParam(':id_categoria', $id_categoria, PDO::PARAM_INT);
    $stmt->execute();
    
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'productos' => $productos
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 