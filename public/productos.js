// Función para cargar los productos desde el servidor
function cargarProductos() {
    fetch("/productos")
        .then((response) => response.json())
        .then((data) => {
            console.log("Datos recibidos del servidor:", data); // Verifica los datos recibidos

            if (data.success) {
                const productosContainer = document.getElementById("productos-container");
                if (!productosContainer) {
                    console.error("No se encontró el contenedor #productos-container");
                    return;
                }

                console.log("Contenedor de productos encontrado:", productosContainer); // Verifica el contenedor

                productosContainer.innerHTML = ""; // Limpiar el contenedor

                // Verificar si el usuario ha iniciado sesión
                const usuarioId = localStorage.getItem("usuario_id"); // Cambia esto según cómo manejes la sesión

                // Recorrer los productos y agregarlos al contenedor
                data.data.forEach((producto) => {
                    console.log("Procesando producto:", producto); // Verifica cada producto

                    // Convertir el precio a número
                    const precio = parseFloat(producto.precio);

                    // Generar las opciones del menú desplegable según la cantidad disponible
                    let opcionesCantidad = "";
                    for (let i = 1; i <= producto.cantidad; i++) {
                        opcionesCantidad += `<option value="${i}">${i}</option>`;
                    }

                    // Generar el HTML del producto
                    const productoHTML = `
                        <div class="col-md-4 mb-4">
                            <div class="card h-100 producto-card">
                                <img src="/${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                                <div class="card-body">
                                    <h5 class="card-title">${producto.nombre}</h5>
                                    <p class="card-text">${producto.descripcion}</p>
                                    <p class="card-text">
                                        <strong>Precio:</strong> <span>$${precio.toFixed(2)}</span>
                                    </p>
                                    <p class="card-text">
                                        <strong>Cantidad disponible:</strong> <span>${producto.cantidad}</span>
                                    </p>
                                    ${usuarioId ? `
                                    <label for="cantidad-${producto.id}">Cantidad:</label>
                                    <select id="cantidad-${producto.id}" class="form-control mb-2 cantidad-producto">
                                        ${opcionesCantidad}
                                    </select>
                                    <button class="btn-agregar-carrito btn-login btn-nav" data-id="${producto.id}" data-nombre="${producto.nombre}" data-precio="${producto.precio}">
                                        Agregar al carrito
                                    </button>
                                    ` : `
                                    <p class="text-danger">Inicia sesión para agregar al carrito</p>
                                    `}
                                </div>
                            </div>
                        </div>
                    `;
                    productosContainer.innerHTML += productoHTML;
                });

                // Reasignar eventos a los botones después de generar el HTML
                if (usuarioId) {
                    const botonesAgregarCarrito = document.querySelectorAll(".btn-agregar-carrito");
                    botonesAgregarCarrito.forEach(boton => {
                        boton.addEventListener("click", function () {
                            const productoId = this.dataset.id;
                            const nombreProducto = this.dataset.nombre;
                            const precio = this.dataset.precio;

                            // Obtener la cantidad seleccionada
                            const cantidadInput = document.querySelector(`#cantidad-${productoId}`);
                            const cantidad = cantidadInput ? parseInt(cantidadInput.value) : 1;

                            // Crear el producto a agregar al carrito
                            const producto = {
                                usuario_id: usuarioId, // Asegúrate de enviar el usuario_id
                                producto_id: productoId,
                                nombre_producto: nombreProducto,
                                precio: parseFloat(precio),
                                cantidad: cantidad
                            };

                            console.log("Datos enviados al servidor:", producto);

                            // Enviar datos al servidor
                            fetch("/carrito/agregar", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(producto)
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        alert("Producto agregado al carrito");
                                        // Recargar la página para actualizar la cantidad disponible
                                        window.location.reload();
                                    } else {
                                        alert("Error al agregar al carrito");
                                    }
                                })
                                .catch(error => console.error("Error:", error));
                        });
                    });
                }
            } else {
                console.error("Error al cargar los productos:", data.message);
            }
        })
        .catch((error) => {
            console.error("Error al obtener los productos:", error);
        });
}

// Ejecutar la función al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    cargarProductos();

    // Verificar si el usuario ha iniciado sesión
    const usuarioId = localStorage.getItem("usuario_id");

    // Mostrar u ocultar el carrito en la barra de navegación
    const carritoNavItem = document.getElementById("carrito-nav-item");
    if (usuarioId) {
        // Si el usuario está logueado, mostrar el carrito
        if (carritoNavItem) {
            carritoNavItem.style.display = "block";
        }
    } else {
        // Si no está logueado, ocultar el carrito
        if (carritoNavItem) {
            carritoNavItem.style.display = "none";
        }
    }

    // Manejar el botón de inicio de sesión y registro
    const nombreUsuario = localStorage.getItem("nombreUsuario");

    if (nombreUsuario) {
        // Cambiar el botón de "Iniciar sesión" por el nombre del usuario
        const btnIniciarSesion = document.querySelector(".btn-login");
        if (btnIniciarSesion) {
            btnIniciarSesion.textContent = nombreUsuario;
            btnIniciarSesion.href = "#"; // Opcional: deshabilitar el enlace
        }

        // Cambiar el botón de "Registrarse" por "Cerrar sesión"
        const btnRegistrarse = document.querySelector(".btn-register");
        if (btnRegistrarse) {
            btnRegistrarse.textContent = "Cerrar sesión";
            btnRegistrarse.href = "#";
            btnRegistrarse.addEventListener("click", function () {
                // Eliminar el nombre del usuario de localStorage y recargar la página
                localStorage.removeItem("nombreUsuario");
                localStorage.removeItem("usuario_id");
                window.location.reload();
            });
        }
    }
});
