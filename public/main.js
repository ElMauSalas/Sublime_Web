document.addEventListener("DOMContentLoaded", function () {
  const usuarioId = localStorage.getItem("usuario_id");
  const nombreUsuario = localStorage.getItem("nombreUsuario");
  const btnIniciarSesion = document.querySelector(".btn-login");
  const btnRegistrarse = document.querySelector(".btn-register");
  const adminBtn = document.getElementById("admin-nav-item");
  const carritoBtn = document.getElementById("carrito-nav-item");

  if (usuarioId && nombreUsuario) {
    // Mostrar nombre del usuario en el botón de login
    if (btnIniciarSesion) {
      btnIniciarSesion.textContent = nombreUsuario;
      btnIniciarSesion.href = "#";
    }

    // Cambiar "Registrarse" por "Cerrar sesión"
    if (btnRegistrarse) {
      btnRegistrarse.textContent = "Cerrar sesión";
      btnRegistrarse.href = "#";

      btnRegistrarse.addEventListener("click", function () {
        // Cerrar sesión en el backend también
        fetch("/logout", {
          method: "GET",
          credentials: "include"
        })
          .then(() => {
            localStorage.removeItem("nombreUsuario");
            localStorage.removeItem("usuario_id");
            window.location.href = "/";
          });
      });
    }

    // Mostrar botón del carrito
    if (carritoBtn) {
      carritoBtn.style.display = "block";
    }
  }

  // Mostrar botón Admin si es admin (según sesión del servidor)
  fetch("/user-data", {
    method: "GET",
    credentials: "include"
  })
    .then(res => res.json())
    .then(data => {
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
