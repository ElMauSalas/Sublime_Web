/* ==========================
   FUNCIONES GENERALES
   ========================== */

/**
 * Función para desplazarse al inicio de la página.
 * Lleva al usuario al inicio de la página con un desplazamiento suave.
 */
function scrollToTop() {
    window.scrollTo({
        top: 0, // Posición vertical en píxeles (0 significa la parte superior de la página)
        behavior: 'smooth' // Habilita el desplazamiento suave
    });
}

/**
 * Función para habilitar desplazamiento suave en enlaces de anclaje.
 * Selecciona todos los enlaces que comienzan con "#" y les agrega un comportamiento personalizado.
 */
function enableSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Previene el comportamiento predeterminado del enlace

            // Obtiene el elemento objetivo al que apunta el enlace
            const target = document.querySelector(this.getAttribute('href'));

            // Define un desplazamiento adicional para compensar la altura de la barra de navegación fija
            const offset = 80; // Altura en píxeles de la barra de navegación (ajustar según sea necesario)

            // Calcula la posición del elemento objetivo menos el desplazamiento
            const targetPosition = target.offsetTop - offset;

            // Desplaza la página a la posición calculada con un efecto suave
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth' // Habilita el desplazamiento suave
            });
        });
    });
}

/* ==========================
   EVENTOS AL CARGAR LA PÁGINA
   ========================== */

document.addEventListener("DOMContentLoaded", function () {
    // Habilitar desplazamiento suave en enlaces de anclaje
    enableSmoothScroll();

    // Desplazamiento suave al hacer clic en el botón de "Inicio"
    const inicioButton = document.querySelector('a.nav-link[href="#inicio"]'); // Selector actualizado
    if (inicioButton) {
        inicioButton.addEventListener("click", function (e) {
            e.preventDefault(); // Previene el comportamiento predeterminado del enlace
            window.scrollTo({
                top: 0, // Desplazarse a la parte superior de la página
                behavior: 'smooth' // Habilitar desplazamiento suave
            });
        });
    }
});
