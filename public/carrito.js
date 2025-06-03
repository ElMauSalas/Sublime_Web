// public/carrito.js - CÓDIGO ACTUALIZADO
document.addEventListener("DOMContentLoaded", function () {
    const usuarioId = localStorage.getItem("usuario_id");

    if (!usuarioId) {
        alert("Debes iniciar sesión para ver el carrito.");
        window.location.href = "index.html";
        return;
    }

    const carritoItemsBody = document.getElementById("carrito-items");
    const finalizarCompraBtnPayPal = document.getElementById('finalizar-compra-paypal-btn');
    let datosDelCarritoParaPayPal = [];

    function cargarYRenderizarCarrito() {
        fetch(`/carrito/${usuarioId}`)
            .then(response => response.json())
            .then(data => {
                // ... (toda tu lógica para renderizar el carrito sigue igual)
                if (data.success) {
                    const carrito = data.carrito;
                    datosDelCarritoParaPayPal = [];

                    if (carrito.length === 0) {
                        carritoItemsBody.innerHTML = `<tr><td colspan="7" class="text-center">El carrito está vacío</td></tr>`;
                        finalizarCompraBtnPayPal.disabled = true;
                        return;
                    }

                    carritoItemsBody.innerHTML = "";
                    finalizarCompraBtnPayPal.disabled = false;

                    carrito.forEach(item => {
                        const precio = parseFloat(item.precio);
                        const cantidad = parseInt(item.cantidad);
                        const total = (precio * cantidad).toFixed(2);
                        const talla = item.talla || "N/A";

                        datosDelCarritoParaPayPal.push({
                            id_en_tu_bd: item.producto_id,
                            nombre_producto: `${item.nombre_producto} (Talla: ${talla})`,
                            cantidad: cantidad,
                            precio_unitario: precio.toFixed(2)
                        });

                        let opcionesCantidad = "";
                        for (let i = 1; i <= cantidad; i++) {
                            opcionesCantidad += `<option value="${i}">${i}</option>`;
                        }

                        const rowHtml = `
                            <tr>
                                <td><img src="${item.imagen}" alt="${item.nombre_producto}" class="img-fluid" style="max-width: 80px;"></td>
                                <td>${item.nombre_producto}</td>
                                <td>${talla}</td>
                                <td>$${precio.toFixed(2)}</td>
                                <td>${cantidad}</td>
                                <td>$${total}</td>
                                <td>
                                    <div class="input-group input-group-sm">
                                        <select class="form-control cantidad-eliminar" data-id="${item.producto_id}" style="width: auto;">
                                            ${opcionesCantidad}
                                        </select>
                                        <button class="btn btn-danger btn-sm eliminar-item ml-1" data-id="${item.producto_id}">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>`;
                        carritoItemsBody.innerHTML += rowHtml;
                    });

                    asignarEventosEliminar();
                } else {
                    carritoItemsBody.innerHTML = `<tr><td colspan="7" class="text-center">${data.message || "Error al cargar el carrito."}</td></tr>`;
                    finalizarCompraBtnPayPal.disabled = true;
                }
            })
            .catch(error => {
                console.error("Error:", error);
                carritoItemsBody.innerHTML = `<tr><td colspan="7" class="text-center">Error al cargar el carrito.</td></tr>`;
                finalizarCompraBtnPayPal.disabled = true;
            });
    }

    // ... (tus funciones asignarEventosEliminar y manejarEliminacion siguen igual)
    function asignarEventosEliminar() {
        const botonesEliminar = document.querySelectorAll(".eliminar-item");
        botonesEliminar.forEach(boton => {
            boton.removeEventListener("click", manejarEliminacion);
            boton.addEventListener("click", manejarEliminacion);
        });
    }

    function manejarEliminacion() {
        const productoId = this.dataset.id;
        const selectCantidad = document.querySelector(`.cantidad-eliminar[data-id="${productoId}"]`);
        const cantidadAEliminar = parseInt(selectCantidad.value);

        Swal.fire({
            title: '¿Eliminar producto?',
            text: `¿Eliminar ${cantidadAEliminar} unidad(es)?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        }).then(result => {
            if (result.isConfirmed) {
                fetch(`/carrito/eliminar/${usuarioId}/${productoId}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cantidad: cantidadAEliminar })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('Eliminado', 'Producto eliminado', 'success');
                        cargarYRenderizarCarrito();
                    } else {
                        Swal.fire('Error', data.message, 'error');
                    }
                });
            }
        });
    }
    
    // ✨ CAMBIO IMPORTANTE AQUÍ ✨
    if (finalizarCompraBtnPayPal) {
        finalizarCompraBtnPayPal.addEventListener("click", () => {
            if (datosDelCarritoParaPayPal.length === 0) return;

            // Antes de enviar, creamos la orden en nuestro sistema
            fetch('/orden/crear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId: usuarioId })
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    // Si la orden se crea, ahora redirigimos a PayPal
                    const form = document.createElement("form");
                    form.method = "post";
                    form.action = "https://www.sandbox.paypal.com/cgi-bin/webscr";

                    const base = {
                        cmd: "_cart",
                        upload: "1",
                        business: "sb-di31p41232675@business.example.com", // Tu email de vendedor de Sandbox
                        currency_code: "MXN",
                        return: `${window.location.origin}/pago-exitoso-paypal.html`, // Tu página de "Gracias"
                        cancel_return: `${window.location.origin}/carrito.html`,
                        // ✨ AÑADIMOS EL ID DE NUESTRA ORDEN PARA VINCULAR EL PAGO ✨
                        custom: data.ordenId 
                    };

                    for (const key in base) {
                        form.appendChild(createHiddenPaypalInput(key, base[key]));
                    }

                    datosDelCarritoParaPayPal.forEach((item, i) => {
                        const n = i + 1;
                        form.appendChild(createHiddenPaypalInput(`item_name_${n}`, item.nombre_producto));
                        form.appendChild(createHiddenPaypalInput(`amount_${n}`, item.precio_unitario));
                        form.appendChild(createHiddenPaypalInput(`quantity_${n}`, item.cantidad));
                        form.appendChild(createHiddenPaypalInput(`item_number_${n}`, item.id_en_tu_bd));
                    });

                    document.body.appendChild(form);
                    form.submit();
                } else {
                    Swal.fire('Error', 'No se pudo iniciar el proceso de pago.', 'error');
                }
            });
        });
    }

    function createHiddenPaypalInput(name, value) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        return input;
    }

    cargarYRenderizarCarrito();
});

//sb-yoj43s42136906@personal.example.com password:(eM%R]7L



