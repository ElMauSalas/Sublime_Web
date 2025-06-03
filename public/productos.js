let esAdmin = false;

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

          let opcionesTallas = "";
          if (producto.tallas_disponibles) {
            const tallas = producto.tallas_disponibles.split(",").map(t => t.trim());
            tallas.forEach(talla => {
              opcionesTallas += `<option value="${talla}">${talla}</option>`;
            });
          }

          const productoHTML = `
            <div class="col-lg-4 col-md-6 mb-4 d-flex">
              <div class="card h-100 producto-card w-100">
                <img src="/${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                <div class="card-body">
                  <h5 class="card-title">${producto.nombre}</h5>
                  <p class="card-text">${producto.descripcion}</p>
                  <p class="card-text"><strong>Precio:</strong> <span>$${precio.toFixed(2)}</span></p>
                  <p class="card-text"><strong>Cantidad disponible:</strong> <span>${producto.cantidad}</span></p>
                </div>
                <div class="card-footer card-actions">
                  ${
                    producto.tallas_disponibles
                      ? `<div class="form-group">
                           <label for="talla-${producto.id}">Talla:</label>
                           <select id="talla-${producto.id}" class="form-control talla-producto">
                             ${opcionesTallas}
                           </select>
                         </div>`
                      : ""
                  }
                  ${
                    usuarioId
                      ? `<div class="form-group">
                           <label for="cantidad-${producto.id}">Cantidad:</label>
                           <select id="cantidad-${producto.id}" class="form-control cantidad-producto">
                             ${opcionesCantidad}
                           </select>
                         </div>
                         <button class="btn-agregar-carrito btn-primary btn-block" data-id="${producto.id}" data-nombre="${producto.nombre}" data-precio="${producto.precio}">
                           Agregar al carrito
                         </button>`
                      : `<p class="text-danger font-weight-bold">Inicia sesión para comprar</p>`
                  }
                  ${
                    esAdmin // Aquí se usa la variable esAdmin
                      ? `<button onclick="confirmarEdicion(${producto.id})" class="btn btn-secondary btn-block mt-2">Editar</button>`
                      : ""
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
            seccion.querySelectorAll(".col-lg-4").forEach((cardContainer) => {
              const texto = cardContainer.innerText.toLowerCase();
              cardContainer.style.display = texto.includes(filtro) ? "" : "none";
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
              const tallaElement = document.querySelector(`#talla-${productoId}`);
              const talla = tallaElement ? tallaElement.value : null;

              const producto = {
                usuario_id: usuarioId,
                producto_id: productoId,
                nombre_producto: nombreProducto,
                precio: parseFloat(precio),
                cantidad: cantidad,
                talla: talla
              };

              fetch("/carrito/agregar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(producto)
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.success) {
                    Swal.fire('Agregado', 'Producto añadido al carrito.', 'success');
                  } else {
                    Swal.fire('Error', 'No se pudo agregar al carrito.', 'error');
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

document.addEventListener("DOMContentLoaded", function () {
  // NO llamamos a cargarProductos() aquí directamente al inicio

  const usuarioId = localStorage.getItem("usuario_id");
  const carritoNavItem = document.getElementById("carrito-nav-item");
  const adminBtn = document.getElementById("admin-nav-item"); // El botón de "Admin" en la barra de navegación

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
            esAdmin = false; // Reseteamos esAdmin al cerrar sesión
            window.location.href = "index.html";
          });
      });
    }
  }

  // Obtenemos los datos del usuario y LUEGO cargamos los productos
  fetch("/user-data", {
    method: "GET",
    credentials: "include"
  })
    .then((res) => res.json())
    .then((data) => {
      if (adminBtn) { // Verificamos si el botón de admin en el NAV existe
        if (data.success && data.user && data.user.rol === "admin") {
          esAdmin = true; // Actualizamos la variable global
          adminBtn.style.display = "inline-block";
        } else {
          esAdmin = false; // Aseguramos que sea false si no es admin
          adminBtn.style.display = "none";
        }
      } else {
        esAdmin = false; // Si no hay botón de admin, no es admin
      }
    })
    .catch(() => {
      // Si hay un error al obtener datos del usuario, asumimos que no es admin
      esAdmin = false;
      if (adminBtn) adminBtn.style.display = "none";
    })
    .finally(() => {
      // ✨ CAMBIO IMPORTANTE: Llamamos a cargarProductos() AQUÍ ✨
      // Esto asegura que se ejecute DESPUÉS de que 'esAdmin' haya sido determinado.
      cargarProductos();
    });
});