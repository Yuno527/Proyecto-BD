<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if(empty($data['nombre']) || empty($data['contraseña'])) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son requeridos']);
        exit;
    }

    $conn = getDBConnection();

    $stmt = $conn->prepare("SELECT * FROM usuarios WHERE nombre = ?");
    $stmt->execute([$data['nombre']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($data['contraseña'], $user['contraseña'])) {
        unset($user['contraseña']);
        echo json_encode(['success' => true, 'usuario' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuario o contraseña incorrectos']);
    }
} catch(PDOException $e) {
    error_log('Error en login.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error en el servidor. Por favor intenta más tarde.']);
}
?>