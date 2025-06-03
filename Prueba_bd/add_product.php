<?php
header('Content-Type: application/json'); // Debe ir al principio

$response = ['success' => false];

// Mostrar errores (solo para desarrollo)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Verificar si el usuario está autenticado y es administrador
session_start();
if (!isset($_SESSION['usuario'])) {
    $response['message'] = "No hay sesión activa";
    echo json_encode($response);
    exit;
}

// Verificar el rol del usuario
if ($_SESSION['usuario']['rol'] !== 'admin') {
    $response['message'] = "No tienes permisos para realizar esta acción. Solo los administradores pueden agregar productos.";
    echo json_encode($response);
    exit;
}

// Configuración de base de datos
$host = "localhost";
$db = "moda_fashion";
$user = "root";
$pass = "";
$conn = new mysqli($host, $user, $pass, $db);

// Verifica conexión
if ($conn->connect_error) {
    $response['message'] = "Error de conexión: " . $conn->connect_error;
    echo json_encode($response);
    exit;
}

// Verifica método POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        // Recibe y limpia datos
        $nombre = trim($_POST['nombre'] ?? '');
        $descripcion = trim($_POST['descripcion'] ?? '');
        $precio = floatval($_POST['precio'] ?? 0);
        $stock = intval($_POST['stock'] ?? 0);
        $id_categoria = intval($_POST['id_categoria'] ?? 0);

        // Verifica campos obligatorios
        if (!$nombre || !$descripcion || !$precio || !$stock || !$id_categoria) {
            $response['message'] = "Todos los campos son obligatorios";
            echo json_encode($response);
            exit;
        }

        // Procesar imagen
        $tmpName = $_FILES['imagen']['tmp_name'];
        $fileName = uniqid() . '_' . basename($_FILES['imagen']['name']);
        $rutaDestino = 'uploads/' . $fileName;

        // Verifica si carpeta uploads existe
        if (!is_dir('uploads')) {
            mkdir('uploads', 0777, true); // Crear carpeta si no existe
        }

        if (move_uploaded_file($tmpName, $rutaDestino)) {
            $stmt = $conn->prepare("INSERT INTO productos (nombre, descripcion, imagen, precio, stock, id_categoriaFK) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sssiii", $nombre, $descripcion, $fileName, $precio, $stock, $id_categoria);

            if ($stmt->execute()) {
                $response['success'] = true;
                $response['message'] = "Producto agregado correctamente";
            } else {
                $response['message'] = "Error en la base de datos: " . $stmt->error;
            }

            $stmt->close();
        } else {
            $response['message'] = "Error al mover la imagen. Verifica permisos de la carpeta 'uploads'";
        }
    } else {
        $response['message'] = 'No se recibió ninguna imagen válida';
    }
} else {
    $response['message'] = 'Método no permitido';
}

$conn->close();
echo json_encode($response);
?>
