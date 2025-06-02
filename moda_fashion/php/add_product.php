<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    $conn = getDBConnection();
    
    // Subir imagen
    $targetDir = "../uploads/";
    $fileName = basename($_FILES["imagen"]["name"]);
    $targetFile = $targetDir . $fileName;
    move_uploaded_file($_FILES["imagen"]["tmp_name"], $targetFile);

    // Insertar producto
    $stmt = $conn->prepare("INSERT INTO productos (nombre, descripcion, imagen, precio, stock, id_categoriaFK) 
                            VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $_POST['nombre'],
        $_POST['descripcion'],
        $fileName,
        $_POST['precio'],
        $_POST['stock'],
        $_POST['id_categoria']
    ]);

    echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>