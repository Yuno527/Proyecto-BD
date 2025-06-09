<?php
// Iniciar sesión si no está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Limpiar cualquier salida anterior
ob_clean();

// Establecer headers
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

$response = [
    'logged_in' => false,
    'usuario' => null
];

// Log para depuración
error_log("=== Iniciando verificación de sesión ===");
error_log("Estado de la sesión: " . print_r($_SESSION, true));

// Verificar si existe la sesión y tiene los datos necesarios
if (isset($_SESSION['usuario']) && is_array($_SESSION['usuario'])) {
    error_log("Sesión encontrada: " . print_r($_SESSION['usuario'], true));
    
    // Verificar que el usuario tenga un rol definido y válido
    if (isset($_SESSION['usuario']['rol']) && !empty($_SESSION['usuario']['rol'])) {
        $rol = strtolower(trim($_SESSION['usuario']['rol']));
        
        // Verificar que el rol sea válido
        if ($rol === 'admin' || $rol === 'usuario') {
            $response['logged_in'] = true;
            $response['usuario'] = [
                'id_usuario' => $_SESSION['usuario']['id_usuario'],
                'nombre' => $_SESSION['usuario']['nombre'],
                'rol' => $rol
            ];
            
            error_log("Sesión verificada - Usuario: " . $response['usuario']['nombre'] . " Rol: " . $response['usuario']['rol']);
        } else {
            error_log("Error: Rol inválido en la sesión: " . $rol);
            session_unset();
            session_destroy();
        }
    } else {
        error_log("Error: Usuario sin rol definido en la sesión");
        session_unset();
        session_destroy();
    }
} else {
    error_log("No hay sesión de usuario activa");
    session_unset();
    session_destroy();
}

// Log de la respuesta final
error_log("Respuesta de verificar_sesion.php: " . json_encode($response));

echo json_encode($response);
exit;
?> 