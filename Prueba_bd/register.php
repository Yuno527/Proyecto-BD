<?php
header('Content-Type: application/json');



$response = ['success' => false];

// Obtener y validar datos
$raw_data = file_get_contents('php://input');
$data = json_decode($raw_data, true);


if (!$data) {
    $response['message'] = "No se recibieron datos o el formato es incorrecto";
    echo json_encode($response);
    exit;
}

// Validar campos requeridos
$required_fields = ['nombre', 'contraseña', 'direccion', 'edad'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || trim($data[$field]) === '') {
        $response['message'] = "El campo " . $field . " es requerido";
        echo json_encode($response);
        exit;
    }
}

// Validar edad
if (!is_numeric($data['edad']) || $data['edad'] < 1) {
    $response['message'] = "La edad debe ser un número válido mayor a 0";
    echo json_encode($response);
    exit;
}

try {
    // Configuración de la base de datos
    $host = "localhost";
    $dbname = "moda_fashion";
    $username = "root";
    $password = "";

    // Crear conexión PDO
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verificar si el usuario ya existe
    $stmt = $conn->prepare("SELECT * FROM usuarios WHERE nombre = :nombre");
    $stmt->execute(['nombre' => trim($data['nombre'])]);
    
    if ($stmt->rowCount() > 0) {
        $response['message'] = "El nombre de usuario ya existe";
        echo json_encode($response);
        exit;
    }

    // Asignar variables antes del bind
    $nombre = trim($data['nombre']);
    $contraseña = trim($data['contraseña']);
    $direccion = trim($data['direccion']);
    $edad = intval($data['edad']);
    $rol = 'usuario'; // Rol por defecto


    // Llamar al procedimiento almacenado para registrar el usuario
    $sql = "CALL registrar_usuario(?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $params = [$nombre, $contraseña, $direccion, $edad, $rol];
    if ($stmt->execute($params)) {
        $response['success'] = true;
        $response['message'] = "Usuario registrado exitosamente";
        $response['usuario'] = [
            'nombre' => $nombre,
            'direccion' => $direccion,
            'edad' => $edad,
            'rol' => $rol
        ];
    } else {
        $response['message'] = "No se pudo registrar el usuario: " . $error[2];
    }
} catch(PDOException $e) {
    $response['message'] = "Error en el servidor: " . $e->getMessage();
} catch(Exception $e) {
    $response['message'] = "Error inesperado: " . $e->getMessage();
}

echo json_encode($response);
?>