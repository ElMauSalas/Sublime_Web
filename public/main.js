document.addEventListener("DOMContentLoaded", function () {
    // Selectores para los elementos de la navbar
    const loginNavItem = document.getElementById('login-nav-item');
    const registerNavItem = document.getElementById('register-nav-item');
    const userProfileNavItem = document.getElementById('user-profile-nav-item');
    const logoutNavItem = document.getElementById('logout-nav-item');
    const carritoNavItem = document.getElementById('carrito-nav-item');
    const adminNavItem = document.getElementById('admin-nav-item');
    const carritoContador = document.querySelector('.carrito-contador'); // Opcional: para el contador

    function actualizarInterfazUsuario(userData) {
        if (userData && userData.id && userData.nombre) { // Usuario está logueado y tenemos datos básicos
            // Ocultar "Iniciar sesión" y "Registrarse"
            if (loginNavItem) loginNavItem.style.display = 'none';
            if (registerNavItem) registerNavItem.style.display = 'none';

            // Mostrar enlace al perfil con el nombre del usuario
            if (userProfileNavItem) {
                // El enlace al perfil debe llevar a perfil.html
                userProfileNavItem.innerHTML = `<a class="btn btn-nav" href="perfil.html">${userData.nombre}</a>`;
                userProfileNavItem.style.display = 'block'; // O 'list-item' o como se ajuste a tu CSS de navbar
            }

            // Mostrar botón de "Cerrar sesión"
            if (logoutNavItem) {
                logoutNavItem.style.display = 'block';
                const logoutLink = logoutNavItem.querySelector('a');
                if (logoutLink) {
                    // Asegurarse de que el evento de logout solo se añade una vez o se limpia
                    logoutLink.removeEventListener('click', handleLogout); // Prevenir múltiples listeners
                    logoutLink.addEventListener('click', handleLogout);
                }
            }

            // Mostrar botón del carrito
            if (carritoNavItem) {
                carritoNavItem.style.display = 'block'; // O 'list-item'
                // Aquí podrías añadir lógica para actualizar el contador del carrito si lo tienes
                // fetch(`/api/carrito/contador/${userData.id}`).then(...).then(data => {
                //     if (data.success && data.cantidad > 0) {
                //         if(carritoContador) {
                //            carritoContador.textContent = data.cantidad;
                //            carritoContador.style.display = 'inline-block';
                //         }
                //     } else if (carritoContador) {
                //         carritoContador.style.display = 'none';
                //     }
                // });
            }

            // Mostrar botón Admin si el usuario tiene el rol 'admin'
            if (adminNavItem) {
                if (userData.rol === 'admin') {
                    adminNavItem.style.display = 'block'; // O 'list-item'
                } else {
                    adminNavItem.style.display = 'none';
                }
            }

        } else { // Usuario NO está logueado
            if (loginNavItem) loginNavItem.style.display = 'block';
            if (registerNavItem) registerNavItem.style.display = 'block';
            if (userProfileNavItem) userProfileNavItem.style.display = 'none';
            if (logoutNavItem) logoutNavItem.style.display = 'none';
            if (carritoNavItem) carritoNavItem.style.display = 'none';
            if (adminNavItem) adminNavItem.style.display = 'none';
            if (carritoContador) carritoContador.style.display = 'none';
        }
    }

    function handleLogout(event) {
        event.preventDefault(); // Prevenir la navegación por defecto si es un enlace con href="#"
        fetch("/logout", { // Tu endpoint de backend para cerrar sesión
            method: "GET", // O POST, según tu backend
            credentials: "include" // Importante si usas cookies de sesión
        })
        .then(response => {
            // No es necesario esperar una respuesta JSON si /logout solo redirige o limpia sesión
            console.log("Logout solicitado al backend.");
            localStorage.removeItem("usuario_id");
            localStorage.removeItem("nombre_usuario"); // Si guardas más datos, elimínalos también
            localStorage.removeItem("user_rol");    // Ejemplo
            actualizarInterfazUsuario(null); // Actualizar la UI para estado no logueado
            window.location.href = "/"; // Redirigir a la página de inicio
        })
        .catch(error => {
            console.error("Error al cerrar sesión:", error);
            // Incluso si hay error, intenta limpiar el frontend
            localStorage.removeItem("usuario_id");
            localStorage.removeItem("nombre_usuario");
            actualizarInterfazUsuario(null);
            window.location.href = "/"; // O a login.html
        });
    }

    // Al cargar la página, verificar el estado de la sesión con el backend
    fetch("/user-data", { // Tu endpoint existente que devuelve datos del usuario si hay sesión
        method: "GET",
        credentials: "include"
    })
    .then(res => {
        if (!res.ok) { // Si el servidor responde con error (ej. 401, 500)
            console.warn("Respuesta no OK de /user-data, el usuario probablemente no está logueado o hay un error.");
            // Lanza un error para que lo capture el catch y se trate como no logueado
            throw new Error(`Status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        if (data.success && data.user) {
            // Guardar o refrescar datos en localStorage si es necesario (opcional)
            // localStorage.setItem("usuario_id", data.user.id);
            // localStorage.setItem("nombre_usuario", data.user.nombre);
            // localStorage.setItem("user_rol", data.user.rol); // Si tu endpoint /user-data lo devuelve
            actualizarInterfazUsuario(data.user);
        } else {
            // No hay sesión activa o los datos no son los esperados
            console.log("/user-data indicó que no hay usuario logueado o faltan datos.");
            localStorage.removeItem("usuario_id"); // Limpiar por si acaso
            localStorage.removeItem("nombre_usuario");
            actualizarInterfazUsuario(null);
        }
    })
    .catch(error => {
        console.error("Error al obtener datos de sesión (/user-data):", error);
        // Asumir que no hay sesión si hay un error de red o de servidor
        localStorage.removeItem("usuario_id");
        localStorage.removeItem("nombre_usuario");
        actualizarInterfazUsuario(null);
    });
});