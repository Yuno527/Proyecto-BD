const rolSelector = document.getElementById("rolSelector");
const adminPanel = document.getElementById("adminPanel");
const formAgregar = document.getElementById("formAgregar");
const contenedorRopa = document.getElementById("contenedorRopa");

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalNombre = document.getElementById("modalNombre");
const modalDescripcion = document.getElementById("modalDescripcion");
const cerrarModal = document.getElementById("cerrarModal");

let rolActual = "usuario";

// Cambiar visibilidad del panel de administrador
rolSelector.addEventListener("change", () => {
    rolActual = rolSelector.value;
    adminPanel.classList.toggle("oculto", rolActual !== "admin");
    mostrarTarjetas();
});

// Agregar nueva prenda
formAgregar.addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const descripcion = document.getElementById("descripcion").value;
    const imagenInput = document.getElementById("imagen");
    const imagen = imagenInput.files[0];

    const lector = new FileReader();
    lector.onload = function () {
        const urlImagen = lector.result;

        const prenda = {
            nombre,
            descripcion,
            imagen: urlImagen
        };

        guardarPrenda(prenda);
        formAgregar.reset();
        mostrarTarjetas();
    };

    if (imagen) {
        lector.readAsDataURL(imagen);
    }
});

// Guardar prenda en localStorage
function guardarPrenda(prenda) {
    const prendas = JSON.parse(localStorage.getItem("prendas")) || [];
    prendas.push(prenda);
    localStorage.setItem("prendas", JSON.stringify(prendas));
}

// Eliminar prenda
function eliminarPrenda(index) {
    const prendas = JSON.parse(localStorage.getItem("prendas")) || [];
    prendas.splice(index, 1);
    localStorage.setItem("prendas", JSON.stringify(prendas));
    mostrarTarjetas();
}

// Mostrar todas las tarjetas
function mostrarTarjetas() {
    contenedorRopa.innerHTML = "";
    const prendas = JSON.parse(localStorage.getItem("prendas")) || [];

    prendas.forEach((prenda, index) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta";

        const imagen = document.createElement("img");
        imagen.src = prenda.imagen;
        imagen.alt = prenda.nombre;
        imagen.addEventListener("click", () => mostrarModal(prenda));

        const info = document.createElement("div");
        info.className = "info";
        info.innerHTML = `<h4>${prenda.nombre}</h4><p>${prenda.descripcion}</p>`;

        tarjeta.appendChild(imagen);
        tarjeta.appendChild(info);

        // Si es administrador, mostrar botón de eliminar
        if (rolActual === "admin") {
            const btnEliminar = document.createElement("button");
            btnEliminar.textContent = "Eliminar";
            btnEliminar.style.margin = "10px";
            btnEliminar.style.background = "#e74c3c";
            btnEliminar.style.color = "#fff";
            btnEliminar.style.border = "none";
            btnEliminar.style.padding = "5px 10px";
            btnEliminar.style.cursor = "pointer";
            btnEliminar.addEventListener("click", () => eliminarPrenda(index));
            info.appendChild(btnEliminar);
        }

        contenedorRopa.appendChild(tarjeta);
    });
}

// Mostrar modal con detalles
function mostrarModal(prenda) {
    modalImg.src = prenda.imagen;
    modalNombre.textContent = prenda.nombre;
    modalDescripcion.textContent = prenda.descripcion;
    modal.classList.remove("oculto");
}

// Cerrar modal
cerrarModal.addEventListener("click", () => {
    modal.classList.add("oculto");
});

// Inicializar vista
mostrarTarjetas();
