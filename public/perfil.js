document.addEventListener('DOMContentLoaded', function() {
    const userInfoContainer = document.getElementById('user-info-container');
    const userNombreElem = document.getElementById('user-nombre');
    const userUsuarioElem = document.getElementById('user-usuario');
    const userEmailElem = document.getElementById('user-email');
    const userTelefonoElem = document.getElementById('user-telefono');

    // Primero, verifica si hay información de usuario en localStorage (o en sesión del servidor)
    // Esto depende de cómo manejes el estado de login. Usaremos el mismo enfoque que en carrito.js
    const usuarioId = localStorage.getItem('usuario_id');
    const nombreUsuarioLogueado = localStorage.getItem('nombre_usuario'); // Si guardaste el nombre al hacer login

    if (!usuarioId) {
        alert('Debes iniciar sesión para ver tu perfil.');
        window.location.href = 'login.html'; // Redirigir a login si no hay sesión
        return;
    }

    // Opción 1: Mostrar datos básicos que podrías tener en localStorage (menos seguro para datos sensibles)
    // if (nombreUsuarioLogueado) userNombreElem.textContent = nombreUsuarioLogueado;
    // (Necesitarías guardar más datos en localStorage al hacer login para esto)

    // Opción 2: Hacer un fetch a un endpoint del backend para obtener los datos del usuario (Más seguro y completo)
    // Supongamos que tienes un endpoint en tu backend: /api/usuario/datos/${usuarioId}

    // Si tienes un endpoint /user-data como en tu server.js que devuelve user: {id, nombre, rol, etc.}
    fetch('/user-data') // Usando el endpoint que ya pareces tener en server.js
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos del usuario.');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.user) {
                const user = data.user;
                userNombreElem.textContent = user.nombre || 'No disponible';
                userUsuarioElem.textContent = user.usuario || 'No disponible'; // Si 'usuario' es el nombre de usuario
                userEmailElem.textContent = user.email || 'No disponible';
                userTelefonoElem.textContent = user.telefono || 'No disponible';

                // Necesitas asegurarte que tu endpoint /user-data (o uno nuevo) devuelva estos campos.
                // Tu actual /user-data en server.js devuelve: req.session.user que tiene id, nombre, rol.
                // Necesitarás modificarlo o crear un nuevo endpoint para obtener más detalles desde la BD.
            } else {
                // Si /user-data no devuelve todo, o falla:
                console.error('No se pudieron cargar los datos completos del usuario:', data.message);
                // Podrías intentar cargar datos parciales o mostrar un mensaje
                if (nombreUsuarioLogueado) userNombreElem.textContent = nombreUsuarioLogueado;
                // Llenar el resto con "No disponible" o un mensaje de error
                userUsuarioElem.textContent = 'No disponible';
                userEmailElem.textContent = 'Información no cargada';
                userTelefonoElem.textContent = 'No disponible';
                // alert('No se pudieron cargar todos los datos del perfil.');
            }
        })
        .catch(error => {
            console.error('Error en fetch para datos de perfil:', error);
            if (userInfoContainer) { // Chequeo extra
                userInfoContainer.innerHTML = '<p class="text-danger">Error al cargar la información del perfil. Por favor, intenta más tarde.</p>';
            }
        });
});

// En perfil.js, si usas el nuevo endpoint /api/perfil/detalles
fetch('/api/perfil/detalles')
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) { // No autorizado
                window.location.href = 'login.html';
            }
            throw new Error('Error al obtener los datos del perfil.');
        }
        return response.json();
    })
    .then(data => {
        if (data.success && data.perfil) {
            const perfil = data.perfil;
            userNombreElem.textContent = perfil.nombre || 'No disponible';
            userUsuarioElem.textContent = perfil.usuario || 'No disponible';
            userEmailElem.textContent = perfil.email || 'No disponible';
            userTelefonoElem.textContent = perfil.telefono || 'No disponible';
        } else {
            // ... manejo de error ...
        }
    })
    .catch(error => {
        // ... manejo de error ...
    });