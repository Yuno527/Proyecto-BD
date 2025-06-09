<?php
header('Content-Type: application/json');
session_start();

// Verificar si el usuario está autenticado y es administrador
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'No tienes permisos para ver las estadísticas']);
    exit;
}

try {
    // Conexión a la base de datos
    $conn = new PDO("mysql:host=localhost;dbname=moda_fashion", "root", "");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Consulta para obtener estadísticas por categoría
    $query = "SELECT 
        c.id_categoria,
        c.nombre as categoria,
        CAST(COUNT(DISTINCT p.id_producto) AS UNSIGNED) as total_productos,
        CAST(COUNT(DISTINCT pa.id_pago) AS UNSIGNED) as total_ventas,
        CAST(COALESCE(SUM(dp.cantidad), 0) AS UNSIGNED) as unidades_vendidas,
        CAST(COALESCE(SUM(dp.subtotal), 0) AS DECIMAL(10,2)) as total_ventas_monto
    FROM categorias c
    LEFT JOIN productos p ON c.id_categoria = p.id_categoriaFK
    LEFT JOIN detalles_pago dp ON p.id_producto = dp.id_productoFK
    LEFT JOIN pagos pa ON dp.id_pagoFK = pa.id_pago
    GROUP BY c.id_categoria, c.nombre";
    
    $stmt = $conn->query($query);
    $estadisticas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convertir los valores numéricos a float/int
    foreach ($estadisticas as &$estadistica) {
        $estadistica['total_productos'] = (int)$estadistica['total_productos'];
        $estadistica['total_ventas'] = (int)$estadistica['total_ventas'];
        $estadistica['unidades_vendidas'] = (int)$estadistica['unidades_vendidas'];
        $estadistica['total_ventas_monto'] = (float)$estadistica['total_ventas_monto'];
    }
    
    echo json_encode([
        'success' => true,
        'estadisticas' => $estadisticas
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
    ]);
}
?> 