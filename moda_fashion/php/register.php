<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // Validación de datos
    if(empty($data['nombre']) || empty($data['contraseña']) || empty($data['direccion']) || empty($data['edad'])) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son requeridos']);
        exit;
    }

    if(strlen($data['nombre']) < 3) {
        echo json_encode(['success' => false, 'message' => 'El nombre debe tener al menos 3 caracteres']);
        exit;
    }

    if(strlen($data['contraseña']) < 6) {
        echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 6 caracteres']);
        exit;
    }

    $edad = (int)$data['edad'];
    if($edad < 12 || $edad > 120) {
        echo json_encode(['success' => false, 'message' => 'La edad debe estar entre 12 y 120 años']);
        exit;
    }

    $conn = getDBConnection();

    // Verificar si usuario existe
    $stmt = $conn->prepare("SELECT id_usuario FROM usuarios WHERE nombre = ?");
    $stmt->execute([$data['nombre']]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'El nombre de usuario ya está registrado']);
        exit;
    }

    // Insertar nuevo usuario
    $stmt = $conn->prepare("INSERT INTO usuarios (nombre, contraseña, direccion, edad) VALUES (?, ?, ?, ?)");
    $success = $stmt->execute([
        $data['nombre'],
        password_hash($data['contraseña'], PASSWORD_DEFAULT),
        $data['direccion'],
        $edad
    ]);

    if ($success) {
        echo json_encode(['success' => true, 'message' => 'Usuario registrado exitosamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al registrar el usuario']);
    }
} catch(PDOException $e) {
    error_log('Error en register.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error en el servidor. Por favor intenta más tarde.']);
}
?>