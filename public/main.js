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
    } else {
        const carritoNavItem = document.getElementById("carrito-nav-item");
        if (carritoNavItem) {
            carritoNavItem.style.display = "none";
        }
    }
});
