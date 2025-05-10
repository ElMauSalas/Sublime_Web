document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-agregar");
    const lista = document.getElementById("lista-productos");
  
    function cargarProductos() {
      fetch("/productos")
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            lista.innerHTML = "";
            data.data.forEach(prod => {
              const div = document.createElement("div");
              div.innerHTML = `
                <p><strong>${prod.nombre}</strong> - ${prod.categoria} - $${prod.precio}</p>
                <button data-id="${prod.id}">Eliminar</button>
                <hr>
              `;
              div.querySelector("button").addEventListener("click", () => eliminarProducto(prod.id));
              lista.appendChild(div);
            });
          }
        });
    }
  
    function eliminarProducto(id) {
      fetch(`/productos/${id}`, { method: "DELETE" })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert("Producto eliminado");
            cargarProductos();
          }
        });
    }
  
    form.addEventListener("submit", e => {
      e.preventDefault();
      const formData = new FormData(form);
      fetch("/productos", {
        method: "POST",
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert("Producto agregado");
            form.reset();
            cargarProductos();
          }
        });
    });
  
    cargarProductos();
  });
  