function cargarProductos() {
  fetch("/productos")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const contenedorTazas = document.getElementById("seccion-tazas");
        const contenedorRopa = document.getElementById("seccion-ropa");

        contenedorTazas.innerHTML = "";
        contenedorRopa.innerHTML = "";

        const usuarioId = localStorage.getItem("usuario_id");

        data.data.forEach((producto) => {
          const precio = parseFloat(producto.precio);

          let opcionesCantidad = "";
          for (let i = 1; i <= producto.cantidad; i++) {
            opcionesCantidad += `<option value="${i}">${i}</option>`;
          }

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
                ${
                  usuarioId
                    ? `
                <label for="cantidad-${producto.id}">Cantidad:</label>
                <select id="cantidad-${producto.id}" class="form-control mb-2 cantidad-producto">
                  ${opcionesCantidad}
                </select>
                <button class="btn-agregar-carrito btn-login btn-nav" data-id="${producto.id}" data-nombre="${producto.nombre}" data-precio="${producto.precio}">
                  Agregar al carrito
                </button>`
                    : `<p class="text-danger">Inicia sesión para agregar al carrito</p>`
                }
              </div>
            </div>
          </div>
          `;

          if (producto.categoria === "tazas") {
            contenedorTazas.innerHTML += productoHTML;
          } else if (producto.categoria === "ropa") {
            contenedorRopa.innerHTML += productoHTML;
          }
        });

        document.querySelectorAll(".filtro-seccion").forEach((input) => {
          input.addEventListener("input", () => {
            const targetId = input.getAttribute("data-target");
            const seccion = document.getElementById(targetId);
            const filtro = input.value.toLowerCase();
            seccion.querySelectorAll(".producto-card").forEach((card) => {
              const texto = card.innerText.toLowerCase();
              card.parentElement.style.display = texto.includes(filtro)
                ? "block"
                : "none";
            });
          });
        });

        if (usuarioId) {
          const botonesAgregarCarrito = document.querySelectorAll(".btn-agregar-carrito");
          botonesAgregarCarrito.forEach((boton) => {
            boton.addEventListener("click", function () {
              const productoId = this.dataset.id;
              const nombreProducto = this.dataset.nombre;
              const precio = this.dataset.precio;
              const cantidad = parseInt(document.querySelector(`#cantidad-${productoId}`).value) || 1;

              const producto = {
                usuario_id: usuarioId,
                producto_id: productoId,
                nombre_producto: nombreProducto,
                precio: parseFloat(precio),
                cantidad: cantidad
              };

              fetch("/carrito/agregar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(producto)
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.success) {
                    alert("Producto agregado al carrito");
                    window.location.reload();
                  } else {
                    alert("Error al agregar al carrito");
                  }
                })
                .catch((error) => console.error("Error:", error));
            });
          });
        }
      }
    })
    .catch((error) => {
      console.error("Error al obtener los productos:", error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  cargarProductos();

  const usuarioId = localStorage.getItem("usuario_id");
  const carritoNavItem = document.getElementById("carrito-nav-item");
  const adminBtn = document.getElementById("admin-nav-item");

  if (carritoNavItem) {
    carritoNavItem.style.display = usuarioId ? "block" : "none";
  }

  const nombreUsuario = localStorage.getItem("nombreUsuario");
  if (nombreUsuario) {
    const btnIniciar = document.querySelector(".btn-login");
    if (btnIniciar) {
      btnIniciar.textContent = nombreUsuario;
      btnIniciar.href = "#";
    }

    const btnRegistro = document.querySelector(".btn-register");
    if (btnRegistro) {
      btnRegistro.textContent = "Cerrar sesión";
      btnRegistro.href = "#";
      btnRegistro.addEventListener("click", () => {
        fetch("/logout", {
          method: "GET",
          credentials: "include"
        })
          .then(() => {
            localStorage.removeItem("nombreUsuario");
            localStorage.removeItem("usuario_id");
            window.location.href = "index.html";
          });
      });
    }
  }

  fetch("/user-data", {
    method: "GET",
    credentials: "include"
  })
    .then((res) => res.json())
    .then((data) => {
      if (adminBtn) {
        if (data.success && data.user && data.user.rol === "admin") {
          adminBtn.style.display = "inline-block";
        } else {
          adminBtn.style.display = "none";
        }
      }
    })
    .catch(() => {
      if (adminBtn) adminBtn.style.display = "none";
    });
});
