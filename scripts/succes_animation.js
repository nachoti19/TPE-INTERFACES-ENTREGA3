/* ANIMACIÓN REGISTRO */
const crear = document.querySelector("#crear-cuenta");
const animacion = document.querySelector(".animacion");
const formulario = document.querySelector(".contenido-formulario");

crear.addEventListener("click", showAnimation);

function showAnimation() {
    formulario.classList.add("hide");

    animacion.classList.remove("hide");
    window.scroll(0, 0);

    setTimeout(function() {
        window.location.replace("index.html")
    }, 2000);
}