document.addEventListener("DOMContentLoaded", function () {
    const usuarioId = localStorage.getItem("usuario_id");

    if (!usuarioId) {
        console.error("Error: usuarioId no está definido. Asegúrate de que el usuario haya iniciado sesión.");
        alert("Debes iniciar sesión para ver el carrito.");
        window.location.href = "index.html"; // Redirige al inicio o a donde prefieras
        return;
    }

    console.log("Usuario ID:", usuarioId); // Log para depuración

    const carritoItems = document.getElementById("carrito-items");

    // Obtener los productos del carrito desde el servidor
    fetch(`/carrito/${usuarioId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const carrito = data.carrito;

                if (carrito.length === 0) {
                    carritoItems.innerHTML = `
                        <tr>
                            <td colspan="6" class="text-center">El carrito está vacío</td>
                        </tr>
                    `;
                    return;
                }

                carritoItems.innerHTML = ""; // Limpiar el contenido actual

                carrito.forEach(item => {
                    const precio = parseFloat(item.precio);
                    const total = (precio * item.cantidad).toFixed(2);

                    // Crear las opciones del menú desplegable para seleccionar la cantidad a eliminar
                    let opcionesCantidad = "";
                    for (let i = 1; i <= item.cantidad; i++) {
                        opcionesCantidad += `<option value="${i}">${i}</option>`;
                    }

                    const row = `
                        <tr>
                            <td>
                                <img src="${item.imagen}" alt="${item.nombre_producto}" class="img-fluid" style="max-width: 80px; border-radius: 8px;">
                            </td>
                            <td>${item.nombre_producto}</td>
                            <td>$${precio.toFixed(2)}</td>
                            <td>${item.cantidad}</td>
                            <td>$${total}</td>
                            <td>
                                <select class="form-select cantidad-eliminar" data-id="${item.producto_id}" style="width: auto;">
                                    ${opcionesCantidad}
                                </select>
                            </td>
                            <td>
                                <button class="btn btn-danger btn-sm eliminar-item" data-id="${item.producto_id}">
                                    <i class="fas fa-trash-alt"></i> Eliminar
                                </button>
                            </td>
                        </tr>
                    `;
                    carritoItems.innerHTML += row;
                });

                // Asignar eventos de eliminación a los botones
                const botonesEliminar = document.querySelectorAll(".eliminar-item");
                botonesEliminar.forEach(boton => {
                    boton.addEventListener("click", function () {
                        const productoId = this.dataset.id;
                        const selectCantidad = document.querySelector(`.cantidad-eliminar[data-id="${productoId}"]`);
                        const cantidad = parseInt(selectCantidad.value); // Obtener la cantidad seleccionada

                        if (!productoId || !usuarioId || !cantidad) {
                            console.error("Faltan datos para eliminar el producto:", { usuarioId, productoId, cantidad });
                            alert("No se puede eliminar el producto. Faltan datos.");
                            return;
                        }

                        // Confirmar antes de eliminar
                        if (confirm(`¿Estás seguro de que deseas eliminar ${cantidad} unidades de este producto del carrito?`)) {
                            console.log(`Eliminando producto con ID: ${productoId} para el usuario ID: ${usuarioId}, cantidad: ${cantidad}`); // Log para depuración

                            // Enviar solicitud para eliminar el producto del carrito
                            fetch(`/carrito/eliminar/${usuarioId}/${productoId}`, {
                                method: "DELETE",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({ cantidad }) // Enviar la cantidad eliminada
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        console.log(`Producto con ID ${productoId} eliminado correctamente`); // Log para depuración
                                        alert("Producto eliminado del carrito y devuelto a los productos disponibles.");
                                        // Recargar la página para reflejar los cambios
                                        window.location.reload();
                                    } else {
                                        alert("Error al eliminar el producto");
                                    }
                                })
                                .catch(error => console.error("Error:", error));
                        }
                    });
                });
            } else {
                carritoItems.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">El carrito está vacío</td>
                    </tr>
                `;
            }
        })
        .catch(error => console.error("Error al obtener el carrito:", error));
});
