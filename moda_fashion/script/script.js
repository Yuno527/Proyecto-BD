document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }

    // Mostrar info usuario
    const userNavItem = document.getElementById('userNavItem');
    userNavItem.innerHTML = `
        <div class="user-info">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.nombre)}&background=6a5acd&color=fff" alt="${usuario.nombre}">
            <span>${usuario.nombre}</span>
            <button class="logout-btn" id="logoutBtn">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        </div>
    `;

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
    });

    // Mostrar panel admin si es admin
    if (usuario.esAdmin) {
        document.getElementById('adminPanel').classList.remove('oculto');
    }

    // Cargar productos
    cargarProductos();

    // Cerrar modal
    document.getElementById('cerrarModal').addEventListener('click', function() {
        document.getElementById('modal').classList.remove('active');
    });

    // Funciones
    async function cargarProductos() {
        try {
            const response = await fetch('php/get_products.php');
            const productos = await response.json();
            mostrarProductos(productos);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar productos');
        }
    }

    function mostrarProductos(productos) {
        const contenedor = document.getElementById('contenedorRopa');
        contenedor.innerHTML = '';

        productos.forEach(producto => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'tarjeta';
            tarjeta.innerHTML = `
                <div class="producto-badge ${producto.stock > 0 ? 'en-stock' : 'sin-stock'}">
                    ${producto.stock > 0 ? 'Disponible' : 'Agotado'}
                </div>
                <img src="uploads/${producto.imagen}" alt="${producto.nombre}" loading="lazy">
                <div class="info">
                    <h4>${producto.nombre}</h4>
                    <p>${producto.descripcion.substring(0, 60)}...</p>
                    <span class="precio">$${parseFloat(producto.precio).toFixed(2)}</span>
                    <button class="ver-detalle" data-id="${producto.id_producto}">
                        <i class="fas fa-eye"></i> Ver Detalle
                    </button>
                    ${usuario.esAdmin ? `
                        <button class="eliminar-producto" data-id="${producto.id_producto}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    ` : ''}
                </div>
            `;
            contenedor.appendChild(tarjeta);
        });

        // Event listeners
        document.querySelectorAll('.ver-detalle').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                mostrarDetalleProducto(id);
            });
        });

        if (usuario.esAdmin) {
            document.querySelectorAll('.eliminar-producto').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    if (confirm('¿Eliminar este producto?')) {
                        eliminarProducto(id);
                    }
                });
            });
        }
    }

    async function mostrarDetalleProducto(id) {
        try {
            const response = await fetch(`php/get_product.php?id=${id}`);
            const producto = await response.json();
            
            document.getElementById('modalImg').src = `uploads/${producto.imagen}`;
            document.getElementById('modalNombre').textContent = producto.nombre;
            document.getElementById('modalDescripcion').textContent = producto.descripcion;
            document.getElementById('modalPrecio').textContent = `$${parseFloat(producto.precio).toFixed(2)}`;
            
            const addToCartBtn = document.getElementById('addToCart');
            if (producto.stock > 0) {
                addToCartBtn.style.display = 'block';
                addToCartBtn.onclick = () => agregarAlCarrito(producto.id_producto);
            } else {
                addToCartBtn.style.display = 'none';
            }
            
            document.getElementById('modal').classList.add('active');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar detalles');
        }
    }

    function agregarAlCarrito(id) {
        alert(`Producto ${id} añadido al carrito`);
        document.getElementById('modal').classList.remove('active');
    }

    async function eliminarProducto(id) {
        try {
            const response = await fetch('php/delete_product.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_producto: id })
            });
            const data = await response.json();
            if (data.success) {
                cargarProductos();
            } else {
                alert('Error al eliminar');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error en el servidor');
        }
    }

    // Formulario admin
    document.getElementById('formAgregar').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('nombre', document.getElementById('nombre').value);
        formData.append('descripcion', document.getElementById('descripcion').value);
        formData.append('precio', document.getElementById('precio').value);
        formData.append('stock', document.getElementById('stock').value);
        formData.append('id_categoria', document.getElementById('categoria').value);
        formData.append('imagen', document.getElementById('imagen').files[0]);

        try {
            const response = await fetch('php/add_product.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                alert('Producto agregado');
                this.reset();
                cargarProductos();
            } else {
                alert('Error: ' + (data.message || 'Error al agregar'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error en el servidor');
        }
    });
});