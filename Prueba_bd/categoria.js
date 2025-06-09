document.addEventListener('DOMContentLoaded', function() {
    // Mapeo de páginas a IDs de categoría
    const categorias = {
        'camisetas.html': 1,
        'pantalones.html': 2,
        'vestidos.html': 3,
        'zapatos.html': 4
    };

    // Obtener la página actual
    const paginaActual = window.location.pathname.split('/').pop().toLowerCase();
    const idCategoria = categorias[paginaActual];

    if (!idCategoria) {
        console.error('No se pudo determinar la categoría');
        return;
    }

    // Inicializar el carrito (asumimos que init.js ya lo hizo como window.carrito)
    // window.carrito = inicializarCarrito(); // Comentado, init.js se encarga
    console.log('Categoria.js: Carrito inicializado como:', window.carrito);

    // Cargar productos de la categoría
    cargarProductos(idCategoria);
});

async function cargarProductos(idCategoria) {
    try {
        const response = await fetch(`get_productos_categoria.php?id_categoria=${idCategoria}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Error al cargar productos');
        }

        const contenedor = document.getElementById('contenedorRopa');
        if (!contenedor) return;
        
        contenedor.innerHTML = ''; // Limpiar contenedor

        if (data.productos.length === 0) {
            contenedor.innerHTML = `
                <div class="no-productos">
                    <i class="fas fa-box-open"></i>
                    <p>No hay productos disponibles en esta categoría</p>
                </div>
            `;
            return;
        }

        // Mostrar cada producto
        data.productos.forEach(producto => {
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
                    <div class="botones-producto">
                        <button class="ver-detalle" data-id="${producto.id_producto}">
                            <i class="fas fa-eye"></i> Ver Detalle
                        </button>
                        ${producto.stock > 0 ? `
                            <button class="agregar-carrito" 
                                data-id="${producto.id_producto}" 
                                data-nombre="${producto.nombre}" 
                                data-precio="${producto.precio}" 
                                data-imagen="${producto.imagen}">
                                <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
            contenedor.appendChild(tarjeta);
        });

        // Agregar event listeners para los botones
        document.querySelectorAll('.ver-detalle').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                mostrarDetalleProducto(productId);
            });
        });

        document.querySelectorAll('.agregar-carrito').forEach(btn => {
            btn.addEventListener('click', function() {
                const productoData = {
                    id: this.getAttribute('data-id'),
                    nombre: this.getAttribute('data-nombre'),
                    precio: parseFloat(this.getAttribute('data-precio')),
                    imagen: this.getAttribute('data-imagen')
                };
                
                console.log('Intentando agregar producto:', productoData);
                
                if (window.carrito && typeof window.carrito.agregarProducto === 'function' && window.carrito.agregarProducto(productoData)) {
                    console.log('Producto agregado exitosamente');
                    // Mostrar mensaje de éxito
                    const mensaje = document.createElement('div');
                    mensaje.className = 'mensaje-exito';
                    mensaje.innerHTML = `
                        <i class="fas fa-check-circle"></i>
                        <span>Producto agregado al carrito</span>
                    `;
                    document.body.appendChild(mensaje);
                    setTimeout(() => mensaje.remove(), 2000);
                } else {
                    console.error('Error al agregar producto al carrito o carrito no inicializado');
                }
            });
        });

    } catch (error) {
        console.error('Error:', error);
        const contenedor = document.getElementById('contenedorRopa');
        contenedor.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error al cargar los productos. Por favor, intente nuevamente.</p>
            </div>
        `;
    }
}

// Función para mostrar el detalle del producto
async function mostrarDetalleProducto(id) {
    try {
        const response = await fetch(`get_product.php?id=${id}`);
        const producto = await response.json();
        
        // Crear y mostrar el modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-contenido">
                <span class="cerrar">&times;</span>
                <img src="uploads/${producto.imagen}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p class="precio">$${parseFloat(producto.precio).toFixed(2)}</p>
                ${producto.stock > 0 ? 
                    `<button class="add-to-cart" 
                        data-id="${producto.id_producto}" 
                        data-nombre="${producto.nombre}" 
                        data-precio="${producto.precio}" 
                        data-imagen="${producto.imagen}">
                        <i class="fas fa-shopping-cart"></i> Añadir al carrito
                    </button>` :
                    `<button class="add-to-cart" disabled>Agotado</button>`
                }
            </div>
        `;

        document.body.appendChild(modal);

        // Cerrar modal
        modal.querySelector('.cerrar').addEventListener('click', () => {
            modal.remove();
        });

        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Agregar al carrito desde el modal
        const addToCartBtn = modal.querySelector('.add-to-cart');
        if (addToCartBtn && !addToCartBtn.disabled) {
            addToCartBtn.addEventListener('click', () => {
                const productoData = {
                    id: producto.id_producto,
                    nombre: producto.nombre,
                    precio: parseFloat(producto.precio),
                    imagen: producto.imagen
                };
                
                console.log('Intentando agregar producto desde modal:', productoData);
                
                if (window.carrito && typeof window.carrito.agregarProducto === 'function' && window.carrito.agregarProducto(productoData)) {
                    console.log('Producto agregado exitosamente desde modal');
                    modal.remove();
                    // Mostrar mensaje de éxito
                    const mensaje = document.createElement('div');
                    mensaje.className = 'mensaje-exito';
                    mensaje.innerHTML = `
                        <i class="fas fa-check-circle"></i>
                        <span>Producto agregado al carrito</span>
                    `;
                    document.body.appendChild(mensaje);
                    setTimeout(() => mensaje.remove(), 2000);
                } else {
                    console.error('Error al agregar producto al carrito desde modal o carrito no inicializado');
                }
            });
        }
    } catch (error) {
        console.error('Error al mostrar detalle del producto:', error);
        alert('Error al cargar el detalle del producto');
    }
}

// Función para cargar productos (originalmente en categoria.js, mantenida aquí para compatibilidad si es necesario)
// Si esta función está duplicada o no es necesaria debido a cargarProductos(idCategoria), se puede comentar o eliminar.
/*
async function cargarProductosOriginal() {
    try {
        const response = await fetch('get_products.php');
        const productos = await response.json();
        
        const contenedor = document.getElementById('contenedorRopa');
        if (!contenedor) return;

        contenedor.innerHTML = productos.map(producto => `
            <div class="producto">
                <img src="uploads/${producto.imagen}" alt="${producto.nombre}" onclick="mostrarDetalleProducto(${producto.id_producto})">
                <h3>${producto.nombre}</h3>
                <p class="precio">$${parseFloat(producto.precio).toFixed(2)}</p>
                ${producto.stock > 0 ? 
                    `<button class="add-to-cart" data-id="${producto.id_producto}" data-nombre="${producto.nombre}" data-precio="${producto.precio}" data-imagen="${producto.imagen}">
                        <i class="fas fa-shopping-cart"></i> Añadir al carrito
                    </button>` :
                    `<button class="add-to-cart" disabled>Agotado</button>`
                }
            </div>
        `).join('');

        // Agregar event listeners a los botones de añadir al carrito
        document.querySelectorAll('.add-to-cart:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                const productoData = {
                    id: btn.dataset.id,
                    nombre: btn.dataset.nombre,
                    precio: parseFloat(btn.dataset.precio),
                    imagen: btn.dataset.imagen
                };
                
                // Verificar que el objeto carrito y la función agregarProducto existan
                if (window.carrito && typeof window.carrito.agregarProducto === 'function') {
                     window.carrito.agregarProducto(productoData);
                     console.log('Producto agregado via cargarProductosOriginal:', productoData);
                     // Aquí iría la lógica para mostrar un mensaje de éxito en la página de categoría
                } else {
                     console.error('Error al agregar producto via cargarProductosOriginal o carrito no inicializado');
                     // Aquí iría la lógica para mostrar un mensaje de error en la página de categoría
                }
            });
        });
    } catch (error) {
        console.error('Error al cargar productos en cargarProductosOriginal:', error);
        const contenedor = document.getElementById('contenedorRopa');
        if (contenedor) {
             contenedor.innerHTML = '<p class="error">Error al cargar los productos</p>';
        }
    }
}

// Inicializar cuando el DOM esté listo (esto está duplicado con el listener principal arriba, se puede comentar si el listener principal es suficiente)
/*
document.addEventListener('DOMContentLoaded', () => {
    cargarProductosOriginal();
});
*/