<?php
header('Content-Type: application/json');
require_once 'config.php';

// Obtener datos del cuerpo de la solicitud
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validar datos básicos
if(empty($data['nombre']) || empty($data['contraseña']) || empty($data['direccion']) || empty($data['edad'])) {
    echo json_encode(['success' => false, 'message' => 'Todos los campos son requeridos']);
    exit;
}

try {
    $conn = getDBConnection();

    // Verificar si usuario existe
    $stmt = $conn->prepare("SELECT id_usuario FROM usuarios WHERE nombre = :nombre");
    $stmt->execute([':nombre' => $data['nombre']]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Nombre de usuario ya registrado']);
        exit;
    }

    // Validar edad
    $edad = (int)$data['edad'];
    if($edad < 1 || $edad > 120) {
        echo json_encode(['success' => false, 'message' => 'Edad no válida']);
        exit;
    }

    // Insertar nuevo usuario
    $stmt = $conn->prepare("INSERT INTO usuarios (nombre, contraseña, direccion, edad, esAdmin) 
                          VALUES (:nombre, :contraseña, :direccion, :edad, 0)");
    
    $result = $stmt->execute([
        ':nombre' => $data['nombre'],
        ':contraseña' => password_hash($data['contraseña'], PASSWORD_DEFAULT),
        ':direccion' => $data['direccion'],
        ':edad' => $edad
    ]);

    if($result) {
        echo json_encode(['success' => true, 'message' => 'Usuario registrado exitosamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al registrar usuario']);
    }
} catch(PDOException $e) {
    error_log('Error en register.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error en el servidor. Por favor intenta más tarde.']);
}
?>