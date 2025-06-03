<?php
header('Content-Type: application/json');

// Conexión a la base de datos
$conn = new PDO("mysql:host=localhost;dbname=moda_fashion", "root", "");
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $conn->query("SELECT * FROM productos");
$productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($productos);
?>