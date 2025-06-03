document.getElementById("form-register").addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const usuario = document.getElementById("usuario").value.trim();
    const contrasena = document.getElementById("contraseña").value.trim();  

    if (!nombre || !email || !telefono || !usuario || !contrasena) {
        document.getElementById("mensaje").textContent = "Todos los campos son obligatorios.";
        document.getElementById("mensaje").classList.add("text-danger");
        return;
    }

    fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, email, telefono, usuario, contrasena }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success) {
            document.getElementById("mensaje").textContent = "Registro exitoso. Redirigiendo...";
            document.getElementById("mensaje").classList.remove("text-danger");
            document.getElementById("mensaje").classList.add("text-success");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } else {
            document.getElementById("mensaje").textContent = data.message;
            document.getElementById("mensaje").classList.add("text-danger");
        }
    })
    .catch((error) => {
        console.error("Error al registrar:", error);
        document.getElementById("mensaje").textContent = "Error al registrar el usuario.";
        document.getElementById("mensaje").classList.add("text-danger");
    });
});
