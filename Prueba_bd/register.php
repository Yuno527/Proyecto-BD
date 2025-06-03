<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

// Conexión a la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "moda_fashion";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verificar si el usuario ya existe
    $stmt = $conn->prepare("SELECT * FROM usuarios WHERE nombre = :nombre");
    $stmt->bindParam(':nombre', $data['nombre']);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'El nombre de usuario ya existe']);
        exit;
    }

    // Insertar nuevo usuario (siempre como usuario normal)
    $stmt = $conn->prepare("INSERT INTO usuarios (nombre, contraseña, direccion, edad, rol) VALUES (:nombre, :password, :direccion, :edad, 'usuario')");
    $stmt->bindParam(':nombre', $data['nombre']);
    $stmt->bindParam(':password', $data['contraseña']);     
    $stmt->bindParam(':direccion', $data['direccion']);
    $stmt->bindParam(':edad', $data['edad']);
    $stmt->execute();

    echo json_encode(['success' => true, 'message' => 'Usuario registrado exitosamente']);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()]);
}
?>