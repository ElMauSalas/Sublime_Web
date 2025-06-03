document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-contacto");
  const inputImagenes = document.getElementById("imagenes");
  const preview = document.getElementById("preview");
  const mensajeExito = document.getElementById("mensaje-exito");
  const botonAgregar = document.querySelector(".btn-secondary");

  let todasLasImagenes = [];

  // 🔄 Verifica sesión solo para mostrar u ocultar login/registro
  function verificarSesion() {
    fetch("/user-data", {
      method: "GET",
      credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
      const nav = document.querySelector(".navbar-nav");

      // Elimina todos los elementos dinámicos de sesión
      nav.querySelectorAll(".nav-item.user-dynamic").forEach(el => el.remove());

      if (!data.success) {
        // Si NO hay sesión: mostrar botones de login y registro
        const loginLi = document.createElement("li");
        loginLi.className = "nav-item user-dynamic";
        loginLi.innerHTML = `<a href="login.html" class="btn btn-login btn-nav">Iniciar sesión</a>`;

        const registerLi = document.createElement("li");
        registerLi.className = "nav-item user-dynamic";
        registerLi.innerHTML = `<a href="register.html" class="btn btn-register btn-nav">Registrarse</a>`;

        nav.appendChild(loginLi);
        nav.appendChild(registerLi);
      }
      // Si hay sesión, no mostrar nada adicional
    });
  }

  verificarSesion();
  window.addEventListener("focus", verificarSesion);
  setInterval(verificarSesion, 10000);

  // 🖼️ Manejo de imágenes
  inputImagenes.addEventListener("change", function () {
    const nuevas = Array.from(this.files);
    todasLasImagenes = todasLasImagenes.concat(nuevas);

    preview.innerHTML = "";
    todasLasImagenes.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.classList.add("img-thumbnail", "m-1");
        img.style.maxWidth = "120px";
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });

    this.value = "";
  });

  if (botonAgregar) {
    botonAgregar.addEventListener("click", () => {
      inputImagenes.click();
    });
  }

  // ✉️ Enviar formulario
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("nombre", document.getElementById("nombre").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("mensaje", document.getElementById("mensaje").value);

    todasLasImagenes.forEach(file => {
      formData.append("imagenes", file);
    });

    fetch("/contacto", {
      method: "POST",
      body: formData,
      credentials: "include"
    })
    .then(response => response.text())
    .then(data => {
      if (mensajeExito) {
        mensajeExito.classList.remove("d-none");
      }
      todasLasImagenes = [];
      preview.innerHTML = "";
      form.reset();
    })
    .catch(error => {
      console.error("Error al enviar el formulario:", error);
    });
  });
});
