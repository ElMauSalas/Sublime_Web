document.getElementById("form-login").addEventListener("submit", function (e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const contrasena = document.getElementById("contraseña").value.trim();

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario, contrasena }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem("usuario_id", data.usuario_id);
            localStorage.setItem("nombreUsuario", data.nombre);

            const paginaAnterior = localStorage.getItem("paginaAnterior") || "index.html";
            window.location.href = paginaAnterior;
        } else {
            document.getElementById("mensaje").textContent = data.message;
        }
    })
    .catch(error => {
        console.error("Error al iniciar sesión:", error);
        document.getElementById("mensaje").textContent = "Error al iniciar sesión.";
    });
});
