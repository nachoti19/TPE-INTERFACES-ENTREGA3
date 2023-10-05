/* ANIMACIÓN CARGA INICIO */
window.onload = function(){
    const nav = document.querySelector(".navegacion");
    const body = document.querySelector(".cuerpo");
    const footer = document.querySelector(".pie");
    const animacion = document.querySelector(".contenedor-porcentaje");


    setTimeout(function() {
        nav.classList.remove("hide");
        body.classList.remove("hide");
        footer.classList.remove("hide");
        animacion.classList.add("hide");

    }, 4500);
};

CSS.registerProperty({
    name: "--p",
    syntax: "<integer>",
    initialValue: 0,
    inherits: true,
  });