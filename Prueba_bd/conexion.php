<?php
$host = 'localhost';
$dbname = 'moda_fashion';
$username = 'root';
$password = '';

try {
    $conexion = new mysqli($host, $username, $password, $dbname);
    
    if ($conexion->connect_error) {
        throw new Exception("Error de conexión: " . $conexion->connect_error);
    }
    
    // Establecer el conjunto de caracteres
    $conexion->set_charset("utf8mb4");
    
} catch (Exception $e) {
    die("Error de conexión: " . $e->getMessage());
}
?> 