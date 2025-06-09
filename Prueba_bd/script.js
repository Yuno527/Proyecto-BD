async function verificarAdminPanel() {
    console.log('verificarAdminPanel: Iniciando verificación de panel de administrador...');
    
    // Solo verificar en index.html
    if (!window.location.pathname.endsWith('index.html')) {
        console.log('verificarAdminPanel: No estamos en index.html, omitiendo verificación');
        return;
    }
    
    console.log('verificarAdminPanel: Document readyState antes de obtener adminPanel:', document.readyState);
    console.log('verificarAdminPanel: Intentando obtener el elemento #adminPanel...');
    const adminPanel = document.getElementById('adminPanel');
    console.log('verificarAdminPanel: Resultado de document.getElementById(\'adminPanel\'):', adminPanel);
    
    if (!adminPanel) {
        console.error('verificarAdminPanel: ERROR CRÍTICO: El elemento #adminPanel NO fue encontrado en el DOM.');
        console.log('verificarAdminPanel: Asegúrese de que index.html contenga <section id="adminPanel">...</section> y que script.js esté cargado después de este elemento.');
        return;
    }

    try {
        const response = await fetch('verificar_sesion.php');
        const data = await response.json();
        console.log('verificarAdminPanel: Respuesta completa de verificar_sesion.php:', data);

        if (data.logged_in && data.usuario.rol === 'admin') {
            adminPanel.classList.remove('oculto'); // Muestra el panel de administrador
            console.log('verificarAdminPanel: Panel de administrador mostrado.');

            // Asegurarse de que la sección de productos esté visible por defecto
            const productosSection = document.getElementById('productosSection');
            if (productosSection) {
                productosSection.style.display = 'block';
                console.log('verificarAdminPanel: Sección de productos mostrada.');
            }

            // Inicializar la navegación del administrador
            inicializarAdminNav();
            console.log('verificarAdminPanel: Navegación de administrador inicializada.');

        } else {
            adminPanel.classList.add('oculto'); // Oculta el panel de administrador
            console.log('verificarAdminPanel: Panel de administrador oculto - Usuario no es admin.');
        }
    } catch (error) {
        console.error('verificarAdminPanel: Error al verificar sesión:', error);
        adminPanel.classList.add('oculto'); // Oculta el panel en caso de error
    }
}

// Función para manejar la navegación del administrador
function inicializarAdminNav() {
    const navLinks = document.querySelectorAll('.admin-nav-link');
    const sections = document.querySelectorAll('.admin-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            sections.forEach(section => section.style.display = 'none');
            const targetSection = document.getElementById('productosSection');
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });
}

async function cargarEstadisticasCategorias() {
    try {
        const response = await fetch('estadisticas_categorias.php');
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error al obtener estadísticas');
        }

        const container = document.getElementById('estadisticasContainer');
        container.innerHTML = '';

        data.estadisticas.forEach(categoria => {
            const card = document.createElement('div');
            card.className = 'estadistica-card';
            card.innerHTML = `
                <h4><i class="fas fa-${getIconForCategory(categoria.categoria)}"></i> ${categoria.categoria}</h4>
                <div class="estadistica-info">
                    <div class="estadistica-item">
                        <span class="estadistica-label">Productos:</span>
                        <span class="estadistica-value productos">${categoria.total_productos}</span>
                    </div>
                    <div class="estadistica-item">
                        <span class="estadistica-label">Ventas:</span>
                        <span class="estadistica-value ventas">${categoria.total_ventas}</span>
                    </div>
                    <div class="estadistica-item">
                        <span class="estadistica-label">Unidades Vendidas:</span>
                        <span class="estadistica-value">${categoria.unidades_vendidas}</span>
                    </div>
                    <div class="estadistica-item">
                        <span class="estadistica-label">Total Ventas:</span>
                        <span class="estadistica-value">$${categoria.total_ventas_monto.toFixed(2)}</span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        const container = document.getElementById('estadisticasContainer');
        container.innerHTML = `
            <div class="estadistica-mensaje error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function getIconForCategory(categoria) {
    const icons = {
        'Camisetas': 'tshirt',
        'Pantalones': 'socks',
        'Vestidos': 'female',
        'Zapatos': 'shoe-prints'
    };
    return icons[categoria] || 'tag';
}

// Asegurarse de que estas funciones estén disponibles globalmente o se llamen en el contexto adecuado.
// Se mueven fuera del DOMContentLoaded principal para que puedan ser llamadas si es necesario.

// Función para cargar productos desde la API
async function cargarProductos() {
    try {
        const response = await fetch('get_product.php');
        if (!response.ok) {
            throw new Error('Error al cargar productos');
        }
        const productos = await response.json();
        mostrarProductos(productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        alert('Error al cargar los productos');
    }
}

// Mostrar productos en la página
function mostrarProductos(productos) {
    const contenedorRopa = document.getElementById('contenedorRopa');
    if (!contenedorRopa) return;
    
    contenedorRopa.innerHTML = '';
    
    productos.forEach(producto => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta';
        tarjeta.innerHTML = `
            <div class="producto-badge ${producto.stock > 0 ? 'en-stock' : 'sin-stock'}">
                ${producto.stock > 0 ? 'Disponible' : 'Agotado'}
            </div>
            <img src="uploads/${producto.imagen}" alt="${producto.nombre}" onerror="this.src='img/no-image.png'">
            <div class="info">
                <h4>${producto.nombre}</h4>
                <p>${producto.descripcion.substring(0, 60)}...</p>
                <span class="precio">$${parseFloat(producto.precio).toFixed(2)}</span>
                <button class="ver-detalle" data-id="${producto.id_producto}">
                    <i class="fas fa-eye"></i> Ver Detalle
                </button>
                ${(localStorage.getItem('usuario') && JSON.parse(localStorage.getItem('usuario')).rol === 'admin') ? `
                    <button class="eliminar-producto" data-id="${producto.id_producto}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                ` : ''}
            </div>
        `;
        
        contenedorRopa.appendChild(tarjeta);
    });

    // Event listeners para los botones
    document.querySelectorAll('.ver-detalle').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            mostrarDetalleProducto(productId);
        });
    });

    if (localStorage.getItem('usuario') && JSON.parse(localStorage.getItem('usuario')).rol === 'admin') {
        document.querySelectorAll('.eliminar-producto').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                    eliminarProducto(productId);
                }
            });
        });
    }
}

// Mostrar detalles del producto en modal
async function mostrarDetalleProducto(id) {
    try {
        const response = await fetch(`get_product.php?id=${id}`);
        if (!response.ok) {
            throw new Error('Error al obtener el producto');
        }
        const producto = await response.json();
        
        if (producto.error) {
            throw new Error(producto.error);
        }

        // Limpiar contenido anterior del modal
        const modalContent = document.querySelector('.modal-contenido');
        modalContent.innerHTML = `
            <span id="cerrarModal" class="cerrar">&times;</span>
            <img id="modalImg" src="uploads/${producto.imagen}" alt="${producto.nombre}" onerror="this.src='img/no-image.png'">
            <h3 id="modalNombre">${producto.nombre}</h3>
            <p id="modalDescripcion">${producto.descripcion}</p>
            <p class="precio" id="modalPrecio">$${parseFloat(producto.precio).toFixed(2)}</p>
            <p class="stock-info"><strong>Stock disponible:</strong> ${producto.stock} unidades</p>
            ${producto.stock > 0 ? 
                `<button id="addToCart" class="add-to-cart">
                    <i class="fas fa-shopping-cart"></i> Añadir al carrito
                </button>` : 
                `<button class="add-to-cart" disabled>Agotado</button>`
            }
        `;
        
        const modal = document.getElementById('modal');
        modal.classList.add('active');
        
        // Configurar botón de añadir al carrito
        const addToCartBtn = document.getElementById('addToCart');
        if (addToCartBtn && !addToCartBtn.disabled) {
            addToCartBtn.onclick = function() {
                // Asegurarse de que window.carrito esté inicializado
                if (window.carrito) {
                    window.carrito.agregarProducto({
                        id: producto.id_producto,
                        nombre: producto.nombre,
                        precio: parseFloat(producto.precio),
                        imagen: producto.imagen
                    });
                } else {
                    console.error('El objeto carrito no está inicializado.');
                    alert('Error: El carrito no está listo. Por favor, recargue la página.');
                }
            };
        }

        // Configurar botón de cerrar
        document.getElementById('cerrarModal').onclick = function() {
            modal.classList.remove('active');
        };

        // Cerrar modal al hacer clic fuera
        modal.onclick = function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        };

    } catch (error) {
        console.error('Error al cargar detalle del producto:', error);
        alert('Error al cargar los detalles del producto: ' + error.message);
    }
}


// Eliminar producto (admin)
async function eliminarProducto(id) {
    try {
        const response = await fetch('delete_product.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_producto: id })
        });
        
        const data = await response.json();
        if (data.success) {
            alert('Producto eliminado correctamente');
            await cargarProductos(); // Recargar productos después de eliminar
        } else {
            alert(data.message || 'Error al eliminar producto');
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar producto');
    }
}

// Función para iniciar sesión (estas funciones deben estar fuera del DOMContentLoaded)
async function login(event) {
    event.preventDefault();
    const nombre = document.getElementById('loginNombre').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, password })
        });

        const data = await response.json();
        
        if (data.success) {
            // Guardar información del usuario
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            // Redirigir a la página de inicio o recargar para aplicar cambios de UI
            window.location.href = 'index.html'; 
            
        } else {
            alert(data.message || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    }
}

// Bloque de código principal que se ejecuta al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar información del usuario en el header (se ejecuta en todas las páginas)
    const userNavItem = document.getElementById('userNavItem');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (userNavItem && usuario) {
        userNavItem.innerHTML = `
            <div class="user-info">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombre)}&background=6a5acd&color=fff" alt="${usuario.nombre}">
                <span>${usuario.nombre}</span>
                ${usuario.rol === 'admin' ? '<span class="admin-badge">Admin</span>' : ''}
                <button class="logout-btn" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        `;
        
        // Manejar cierre de sesión
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('usuario');
                window.location.href = 'login.html';
            });
        }
    } else if (userNavItem) {
        // Si no hay usuario logueado, mostrar opción de iniciar sesión/registrarse
        userNavItem.innerHTML = `
            <li class="nav__item">
                <a href="login.html" class="nav__link link--button">
                    <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
                </a>
            </li>
        `;
    }

    // Solo cargar productos y verificar panel de administrador si estamos en index.html
    if (window.location.pathname.endsWith('index.html')) {
        cargarProductos();
        verificarAdminPanel();

        // Agregar nuevo producto (admin)
        const formAgregar = document.getElementById('formAgregar');
        if (formAgregar && usuario && usuario.rol === 'admin') {
            formAgregar.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData();
                formData.append('nombre', document.getElementById('nombre').value);
                formData.append('descripcion', document.getElementById('descripcion').value);
                formData.append('precio', document.getElementById('precio').value);
                formData.append('stock', document.getElementById('stock').value);
                formData.append('id_categoria', document.getElementById('categoria').value);
                formData.append('imagen', document.getElementById('imagen').files[0]);

                try {
                    const response = await fetch('add_product.php', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await response.json();
                    if (data.success) {
                        alert('Producto agregado correctamente');
                        this.reset();
                        await cargarProductos(); // Recargar productos
                    } else {
                        alert(data.message || 'Error al agregar producto');
                    }
                } catch (error) {
                    console.error('Error al agregar producto:', error);
                    alert('Error al agregar producto');
                }
            });
        }
    }
});