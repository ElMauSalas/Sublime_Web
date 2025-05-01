document.getElementById("form-contacto").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevenir envío tradicional

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const mensaje = document.getElementById("mensaje").value;

    fetch("/contacto", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre, email, mensaje })
    })
    .then(response => {
        if (response.ok) {
            document.getElementById("mensaje-exito").classList.remove("d-none");
            document.getElementById("form-contacto").reset();
        } else {
            alert("Hubo un error al enviar el mensaje.");
        }
    })
    .catch(error => {
        console.error("Error al enviar el formulario:", error);
        alert("Error al enviar el formulario.");
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const usuarioId = localStorage.getItem("usuario_id");
    const nombreUsuario = localStorage.getItem("nombreUsuario");

    const carritoNavItem = document.getElementById("carrito-nav-item");
    const btnIniciarSesion = document.querySelector(".btn-login");
    const btnRegistrarse = document.querySelector(".btn-register");

    if (usuarioId && nombreUsuario) {
        // Mostrar carrito
        if (carritoNavItem) carritoNavItem.style.display = "block";

        // Cambiar botón "Iniciar sesión" por el nombre
        if (btnIniciarSesion) {
            btnIniciarSesion.textContent = nombreUsuario;
            btnIniciarSesion.href = "#";
        }

        // Cambiar botón "Registrarse" por "Cerrar sesión"
        if (btnRegistrarse) {
            btnRegistrarse.textContent = "Cerrar sesión";
            btnRegistrarse.href = "#";
            btnRegistrarse.addEventListener("click", function () {
                localStorage.removeItem("nombreUsuario");
                localStorage.removeItem("usuario_id");
                window.location.reload();
            });
        }
    } else {
        // Ocultar carrito si no hay sesión
        if (carritoNavItem) carritoNavItem.style.display = "none";
    }
});
