document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está logueado
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }

    // Mostrar información del usuario en el header
    const userNavItem = document.getElementById('userNavItem');
    if (usuario) {
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
        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('usuario');
            window.location.href = 'login.html';
        });
    }

    // Mostrar panel de admin si el usuario es admin
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        if (usuario.rol === 'admin') {
            adminPanel.classList.remove('oculto');
        } else {
            adminPanel.classList.add('oculto');
        }
    }

    // Cargar productos desde la API
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
                    ${usuario.rol === 'admin' ? `
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

        if (usuario.rol === 'admin') {
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
            const producto = await response.json();
            
            document.getElementById('modalImg').src = `uploads/${producto.imagen}`;
            document.getElementById('modalNombre').textContent = producto.nombre;
            document.getElementById('modalDescripcion').textContent = producto.descripcion;
            document.getElementById('modalPrecio').textContent = `$${producto.precio.toFixed(2)}`;
            
            const modal = document.getElementById('modal');
            modal.classList.add('active');
            
            // Configurar botón de añadir al carrito
            const addToCartBtn = document.getElementById('addToCart');
            if (producto.stock > 0) {
                addToCartBtn.style.display = 'block';
                addToCartBtn.onclick = function() {
                    agregarAlCarrito(producto.id_producto);
                };
            } else {
                addToCartBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Error al cargar detalle del producto:', error);
        }
    }

    // Cerrar modal
    document.getElementById('cerrarModal').addEventListener('click', function() {
        document.getElementById('modal').classList.remove('active');
    });

    // Agregar producto al carrito
    function agregarAlCarrito(productId) {
        // Implementar lógica para agregar al carrito
        alert(`Producto ${productId} añadido al carrito`);
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
                await cargarProductos();
            } else {
                alert('Error al eliminar producto');
            }
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            alert('Error al eliminar producto');
        }
    }

    // Agregar nuevo producto (admin)
    const formAgregar = document.getElementById('formAgregar');
    if (formAgregar && usuario.rol === 'admin') {
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
                    await cargarProductos();
                } else {
                    alert(data.message || 'Error al agregar producto');
                }
            } catch (error) {
                console.error('Error al agregar producto:', error);
                alert('Error al agregar producto');
            }
        });
    }

    // Cargar productos al inicio
    cargarProductos();
});

// Función para iniciar sesión
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
            
            // Actualizar la interfaz
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('userInfo').style.display = 'block';
            document.getElementById('logoutBtn').style.display = 'block';
            
            // Mostrar información del usuario
            const userInfo = document.getElementById('userInfo');
            userInfo.innerHTML = `
                <p>Bienvenido, ${data.usuario.nombre}</p>
                ${data.usuario.rol === 'admin' ? '<span class="admin-badge">Admin</span>' : ''}
            `;
            
            // Mostrar panel de administrador si es admin
            if (data.usuario.rol === 'admin') {
                document.getElementById('adminPanel').style.display = 'block';
            } else {
                document.getElementById('adminPanel').style.display = 'none';
            }
            
            // Cargar productos
            await loadProducts();
            
            // Mostrar mensaje de éxito
            alert('Inicio de sesión exitoso');
        } else {
            alert(data.message || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
    }
}

// Función para agregar producto
async function addProduct(event) {
    event.preventDefault();
    
    // Verificar si el usuario es administrador
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (usuario.rol !== 'admin') {
        alert('No tienes permisos para agregar productos');
        return;
    }

    const formData = new FormData(document.getElementById('addProductForm'));
    
    try {
        const response = await fetch('add_product.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            alert('Producto agregado correctamente');
            document.getElementById('addProductForm').reset();
            await loadProducts();
        } else {
            alert(data.message || 'Error al agregar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar el producto');
    }
}