console.log('--- CARGANDO carrito.js (VERSIÓN 9) ---');

class Carrito {
    constructor() {
        // Verificar si el usuario está autenticado
        this.verificarAutenticacion();
    }

    async verificarAutenticacion() {
        try {
            const response = await fetch('verificar_sesion.php');
            const data = await response.json();
            
            if (!data.logged_in) {
                // Si no está autenticado y está en la página del carrito, redirigir al login
                if (window.location.pathname.includes('carrito.html')) {
                    window.location.href = 'login.html';
                    return;
                }
                // Si no está en la página del carrito, deshabilitar funcionalidades
                this.deshabilitarFuncionalidades();
            } else {
                // Si está autenticado, inicializar el carrito
                this.actualizarContador();
            }
        } catch (error) {
            console.error('Error al verificar autenticación:', error);
            this.deshabilitarFuncionalidades();
        }
    }

    deshabilitarFuncionalidades() {
        // Deshabilitar botones de agregar al carrito
        document.querySelectorAll('.agregar-carrito').forEach(btn => {
            btn.disabled = true;
            btn.title = 'Inicia sesión para agregar al carrito';
        });
    }

    async agregarProducto(producto) {
        console.log('Intentando agregar producto:', producto);
        
        try {
            // Verificar autenticación antes de agregar
            const authResponse = await fetch('verificar_sesion.php');
            const authData = await authResponse.json();
            
            if (!authData.logged_in) {
                window.location.href = 'login.html';
                return false;
            }

            const response = await fetch('carrito_operations.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'agregar',
                    id_producto: producto.id,
                    cantidad: 1
                })
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            
            if (data.success) {
                console.log('Producto agregado exitosamente');
                this.actualizarContador();
                return true;
            } else {
                console.error('Error al agregar producto:', data.message);
                return false;
            }
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    }

    async eliminarProducto(id_carrito) {
        try {
            // Verificar autenticación antes de eliminar
            const authResponse = await fetch('verificar_sesion.php');
            const authData = await authResponse.json();
            
            if (!authData.logged_in) {
                window.location.href = 'login.html';
                return false;
            }

            const response = await fetch('carrito_operations.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'eliminar',
                    id_carrito: id_carrito
                })
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            
            if (data.success) {
                console.log('Producto eliminado exitosamente');
                this.actualizarContador();
                if (window.location.pathname.includes('carrito.html')) {
                    this.mostrarCarrito();
                }
                return true;
            } else {
                console.error('Error al eliminar producto:', data.message);
                return false;
            }
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    }

    async actualizarCantidad(id_carrito, cantidad) {
        try {
            // Verificar autenticación antes de actualizar
            const authResponse = await fetch('verificar_sesion.php');
            const authData = await authResponse.json();
            
            if (!authData.logged_in) {
                window.location.href = 'login.html';
                return false;
            }

            const response = await fetch('carrito_operations.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'actualizar',
                    id_carrito: id_carrito,
                    cantidad: cantidad
                })
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            
            if (data.success) {
                console.log('Cantidad actualizada exitosamente');
                this.actualizarContador();
                if (window.location.pathname.includes('carrito.html')) {
                    this.mostrarCarrito();
                }
                return true;
            } else {
                console.error('Error al actualizar cantidad:', data.message);
                return false;
            }
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    }

    async actualizarContador() {
        try {
            // Verificar autenticación antes de actualizar
            const authResponse = await fetch('verificar_sesion.php');
            const authData = await authResponse.json();
            
            if (!authData.logged_in) {
                return;
            }

            const response = await fetch('carrito_operations.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'obtener'
                })
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            
            if (data.success) {
                const contador = document.getElementById('carritoContador');
                if (contador) {
                    const totalItems = data.productos.reduce((total, producto) => total + producto.cantidad, 0);
                    contador.textContent = totalItems > 0 ? totalItems : '';
                    console.log('Contador actualizado:', totalItems);
                }
            } else {
                console.error('Error al obtener carrito:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async mostrarCarrito() {
        console.log('--- Intentando mostrar carrito (desde V9) ---');
        
        // Verificar autenticación antes de mostrar
        const authResponse = await fetch('verificar_sesion.php');
        const authData = await authResponse.json();
        
        if (!authData.logged_in) {
            window.location.href = 'login.html';
            return;
        }
        
        const contenedorCarrito = document.getElementById('productos-carrito');
        const carritoVacio = document.getElementById('carrito-vacio');
        const carritoResumen = document.getElementById('carrito-resumen');
        const totalCarrito = document.getElementById('total-carrito');

        if (!contenedorCarrito || !carritoVacio || !carritoResumen || !totalCarrito) {
            console.error('mostrarCarrito (V9): ERROR FATAL: Elementos del DOM no encontrados');
            return;
        }

        try {
            const response = await fetch('carrito_operations.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'obtener'
                })
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            
            if (!data.success) {
                throw new Error(data.message);
            }

            if (!data.productos || data.productos.length === 0) {
                contenedorCarrito.innerHTML = '';
                carritoVacio.style.display = 'flex';
                carritoResumen.style.display = 'none';
                return;
            }

            carritoVacio.style.display = 'none';
            carritoResumen.style.display = 'block';

            const html = data.productos.map(producto => `
                <div class="producto-carrito" data-id="${producto.id_carrito}">
                    <img src="uploads/${producto.imagen}" alt="${producto.nombre}" onerror="this.src='img/no-image.png'">
                    <div class="info-producto">
                        <h3>${producto.nombre}</h3>
                        <p class="precio">$${parseFloat(producto.precio).toFixed(2)}</p>
                    </div>
                    <div class="cantidad">
                        <button class="btn-cantidad" onclick="window.carrito.actualizarCantidad('${producto.id_carrito}', ${producto.cantidad - 1})">-</button>
                        <span>${producto.cantidad}</span>
                        <button class="btn-cantidad" onclick="window.carrito.actualizarCantidad('${producto.id_carrito}', ${producto.cantidad + 1})">+</button>
                    </div>
                    <button class="btn-eliminar" onclick="window.carrito.eliminarProducto('${producto.id_carrito}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');

            contenedorCarrito.innerHTML = html;
            
            const total = data.productos.reduce((sum, producto) => sum + (producto.precio * producto.cantidad), 0);
            totalCarrito.textContent = `$${total.toFixed(2)}`;
            
            console.log('mostrarCarrito (V9): Carrito mostrado correctamente. Total:', total);
        } catch (error) {
            console.error('Error al mostrar carrito:', error);
            contenedorCarrito.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error al cargar el carrito. Por favor, intente nuevamente.</p>
                </div>
            `;
        }
    }
}

// Inicializar el carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.carrito = new Carrito();
    
    // Si estamos en la página del carrito
    if (window.location.pathname.includes('carrito.html')) {
        window.carrito.mostrarCarrito();
    }
}); 