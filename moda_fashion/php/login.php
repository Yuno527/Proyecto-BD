<?php
header('Content-Type: application/json');
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

try {
    $conn = getDBConnection();

    $stmt = $conn->prepare("SELECT * FROM usuarios WHERE nombre = ?");
    $stmt->execute([$data['nombre']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($data['contraseña'], $user['contraseña'])) {
        unset($user['contraseña']);
        echo json_encode(['success' => true, 'usuario' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
}
?>