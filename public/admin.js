// admin.js - CÓDIGO CORREGIDO
// Función global para botón Regresar 
function irYRecargar() {
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-agregar");
  const lista = document.getElementById("lista-productos");

  function cargarProductos() {
    fetch("/productos")
      .then(res => {
        if (!res.ok) throw new Error('La respuesta de la red no fue ok');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          lista.innerHTML = "";
          data.data.forEach(prod => {
            const div = document.createElement("div");
            div.innerHTML = `
              <p><strong>${prod.nombre}</strong> - ${prod.categoria} - $${prod.precio}</p>
              <p><em>Tallas: ${prod.tallas_disponibles || 'N/A'}</em></p>
              <button class="btn-eliminar btn btn-danger text-white" data-id="${prod.id}">Eliminar</button>
              <button class="btn-editar btn btn-primary text-white" data-id="${prod.id}">Editar</button>
              <hr>
            `;

            div.querySelector(".btn-eliminar").addEventListener("click", () => eliminarProducto(prod.id));
            div.querySelector(".btn-editar").addEventListener("click", () => confirmarEdicion(prod.id));

            lista.appendChild(div);
          });
        }
      })
      .catch(error => console.error('Error al cargar los productos:', error));
  }

  function eliminarProducto(id) {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/productos/${id}`, { method: "DELETE" })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              Swal.fire('¡Eliminado!', 'Producto eliminado correctamente.', 'success');
              cargarProductos();
            } else {
              Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
            }
          })
          .catch(() => Swal.fire('Error', 'Error del servidor.', 'error'));
      }
    });
  }

  function confirmarEdicion(id) {
    Swal.fire({
      title: 'Editar producto',
      text: '¿Deseas editar este producto?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = `/editar_producto.html?id=${id}`;
      }
    });
  }

  form.addEventListener("submit", e => {
    e.preventDefault();

    // ✨ CORRECCIÓN AQUÍ ✨
    // new FormData(form) ya recolecta todos los campos con un atributo "name",
    // incluyendo "tallas_disponibles". No necesitas agregarlo manualmente.
    const formData = new FormData(form);

    fetch("/productos", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          form.reset();
          Swal.fire('Agregado', 'Producto agregado correctamente.', 'success');
          cargarProductos();
        } else {
          Swal.fire('Error', 'No se pudo agregar el producto.', 'error');
        }
      })
      .catch(() => Swal.fire('Error', 'Error del servidor.', 'error'));
  });

  cargarProductos();
});