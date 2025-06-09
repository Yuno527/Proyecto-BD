<?php
header('Content-Type: application/json');

session_start();

// Verificar si el usuario está autenticado
if (!isset($_SESSION['usuario'])) {
    echo json_encode(['success' => false, 'message' => 'No hay sesión activa']);
    exit;
}

// Obtener y validar datos
$raw_data = file_get_contents('php://input');
$data = json_decode($raw_data, true);

if (!$data || !isset($data['id_usuario']) || !isset($data['productos'])) {
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit;
}

try {
    // Conexión a la base de datos
    $conn = new PDO("mysql:host=localhost;dbname=moda_fashion", "root", "");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Preparar el JSON de productos
    $productos_json = json_encode($data['productos']);
    
    // Llamar al procedimiento almacenado
    $stmt = $conn->prepare("CALL procesar_pago(?, ?, @resultado)");
    $stmt->execute([$data['id_usuario'], $productos_json]);
    
    // Obtener el resultado
    $result = $conn->query("SELECT @resultado as resultado")->fetch(PDO::FETCH_ASSOC);
    
    if (strpos($result['resultado'], 'Error') !== false) {
        echo json_encode(['success' => false, 'message' => $result['resultado']]);
    } else {
        echo json_encode(['success' => true, 'message' => $result['resultado']]);
    }
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
?> 