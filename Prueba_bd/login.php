<?php
header('Content-Type: application/json');
session_start();

// Mostrar errores (solo para desarrollo)
ini_set('display_errors', 1);
error_reporting(E_ALL);

$response = ['success' => false];

// Obtener datos del POST y mostrar para depuración
$raw_data = file_get_contents('php://input');
$data = json_decode($raw_data, true);

// Log para depuración
error_log("Datos recibidos: " . print_r($raw_data, true));

if (!$data) {
    $response['message'] = "No se recibieron datos o el formato es incorrecto";
    echo json_encode($response);
    exit;
}

$nombre = trim($data['nombre'] ?? '');
$password = trim($data['password'] ?? '');

// Log para depuración
error_log("Nombre: " . $nombre);
error_log("Password: " . $password);

if (empty($nombre) || empty($password)) {
    $response['message'] = "Por favor complete todos los campos";
    echo json_encode($response);
    exit;
}

try {
    $host = "localhost";
    $db = "moda_fashion";
    $user = "root";
    $pass = "";
    
    $conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Restaurar la consulta completa incluyendo el rol
    $stmt = $conn->prepare("SELECT id_usuario, nombre, contraseña, direccion, edad, rol FROM usuarios WHERE nombre = :nombre");
    $stmt->execute(['nombre' => $nombre]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Log para depuración
    error_log("Usuario encontrado: " . print_r($usuario, true));
    
    if ($usuario && $password === $usuario['contraseña']) {
        // Limpiar datos sensibles antes de guardar en sesión
        unset($usuario['contraseña']);
        
        // Guardar usuario en sesión
        $_SESSION['usuario'] = $usuario;
        
        $response['success'] = true;
        $response['message'] = "Inicio de sesión exitoso";
        $response['usuario'] = $usuario;
    } else {
        $response['message'] = "Usuario o contraseña incorrectos";
        $response['debug'] = [
            'usuario_encontrado' => !empty($usuario),
            'password_coincide' => $usuario && $password === $usuario['contraseña']
        ];
    }
} catch(PDOException $e) {
    $response['message'] = "Error de conexión: " . $e->getMessage();
    error_log("Error de base de datos: " . $e->getMessage());
}

echo json_encode($response);
?>
