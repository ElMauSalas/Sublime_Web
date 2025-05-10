document.addEventListener("DOMContentLoaded", function () {
    const nombreUsuario = localStorage.getItem("nombreUsuario");
  
    if (nombreUsuario) {
      const btnIniciarSesion = document.querySelector(".btn-login");
      if (btnIniciarSesion) {
        btnIniciarSesion.textContent = nombreUsuario;
        btnIniciarSesion.href = "#";
      }
  
      const btnRegistrarse = document.querySelector(".btn-register");
      if (btnRegistrarse) {
        btnRegistrarse.textContent = "Cerrar sesión";
        btnRegistrarse.href = "#";
        btnRegistrarse.addEventListener("click", function () {
          localStorage.removeItem("nombreUsuario");
          localStorage.removeItem("usuario_id");
          window.location.href = "/";
        });
      }
  
      const carritoNavItem = document.getElementById("carrito-nav-item");
      if (carritoNavItem) {
        carritoNavItem.style.display = "block";
      }
  
      // ✅ Verificar si el usuario es administrador y mostrar el botón Admin
      fetch("/user-data", {
        method: "GET",
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          console.log("✅ Datos del usuario:", data); // ← Te ayuda a depurar
          if (data.success && data.user.rol === "admin") {
            const adminItem = document.getElementById("admin-nav-item");
            if (adminItem) {
              adminItem.style.display = "block";
            }
          }
        })
        .catch(err => {
          console.error("❌ Error al obtener datos del usuario:", err);
        });
    } else {
      const carritoNavItem = document.getElementById("carrito-nav-item");
      if (carritoNavItem) {
        carritoNavItem.style.display = "none";
      }
    }
  });
  