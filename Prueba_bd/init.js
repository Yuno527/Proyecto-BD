// Función para verificar si estamos en la página del carrito
function esPaginaCarrito() {
    return window.location.pathname.includes('carrito.html');
}

// Función para inicializar el carrito
function inicializarCarrito() {
    console.log('Inicializando carrito global...');
    return new Carrito();
}

// Inicializar el carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando carrito...');
    
    // Limpiar cualquier instancia previa del carrito
    if (window.carrito) {
        console.log('Limpiando instancia previa del carrito');
        delete window.carrito;
    }
    
    // Crear nueva instancia del carrito
    window.carrito = inicializarCarrito();
    
    // Si estamos en la página del carrito, mostrarlo con un retraso mayor
    if (esPaginaCarrito()) {
        console.log('En página de carrito, intentando mostrar con retraso mayor...');
        setTimeout(() => {
            if (window.carrito) {
                console.log('Retraso mayor terminado, mostrando carrito...');
                window.carrito.mostrarCarrito();
            } else {
                console.error('Carrito no inicializado después del retraso en página de carrito');
            }
        }, 500); // Retraso mayor de 500ms
    } else {
        // Si no estamos en la página del carrito, solo actualizar el contador
        console.log('No en página de carrito, actualizando contador...');
        if (window.carrito) {
            window.carrito.actualizarContador();
        }
    }
}); 