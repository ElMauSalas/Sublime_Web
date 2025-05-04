document.getElementById("form-contacto").addEventListener("submit", function (event) {
    event.preventDefault();

    const form = document.getElementById("form-contacto");
    const formData = new FormData(form);

    fetch("/contacto", {
        method: "POST",
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById("mensaje-exito").classList.remove("d-none");
    })
    .catch(error => {
        console.error("Error al enviar el formulario:", error);
    });
});

const inputImagenes = document.getElementById("imagenes");
const preview = document.getElementById("preview");

inputImagenes.addEventListener("change", function () {
  preview.innerHTML = "";
  Array.from(this.files).forEach(file => {
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
});


