document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        Swal.fire("Error", "Producto no válido", "error").then(() => {
            window.location.href = "/admin.html";
        });
        return;
    }

    document.querySelector("#producto-id").value = id;

    // === 1. Cargar datos del producto ===
    fetch(`/producto/${id}`)
        .then(res => {
            if (!res.ok) throw new Error("Producto no encontrado");
            return res.json();
        })
        .then(producto => {
            document.querySelector('#nombre').value = producto.nombre;
            document.querySelector('#descripcion').value = producto.descripcion;
            document.querySelector('#precio').value = producto.precio;
            document.querySelector('#cantidad').value = producto.cantidad;
            document.querySelector('#categoria').value = producto.categoria;
            
            // ✨ CAMBIO AQUÍ: Rellenar el campo de tallas ✨
            document.querySelector('#tallas_disponibles').value = producto.tallas_disponibles || '';

            const imagenPreview = document.querySelector('#imagen-preview');
            imagenPreview.src = `/${producto.imagen}`;
            imagenPreview.alt = producto.nombre;
        })
        .catch(err => {
            console.error("❌ Error al cargar el producto:", err);
            Swal.fire("Error", "No se pudo cargar el producto.", "error").then(() => {
                window.location.href = "/admin.html";
            });
        });

    // === 2. Enviar formulario para actualizar ===
    const form = document.querySelector('#form-editar');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        fetch(`/producto/editar/${id}`, {
            method: 'POST',
            body: formData
        })
        .then(res => {
            if (!res.ok) throw new Error("Error en la actualización");
            return res.json();
        })
        .then(data => {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: data.mensaje || 'Producto actualizado correctamente',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                didClose: () => {
                    window.location.href = "/admin.html";
                }
            });
        })
        .catch(err => {
            console.error("❌ Error al actualizar producto:", err);
            Swal.fire("Error", "Hubo un error al actualizar el producto.", "error");
        });
    });
});