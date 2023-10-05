/*HAMBURGUESA*/
const cerrar = document.querySelector("#cerrar-hamburguesa");
const abrir = document.querySelector("#abrir-hamburguesa");
const hamburguesa = document.querySelector("#hamburguesa");

abrir.addEventListener("click", show);
cerrar.addEventListener("click", hide);

function show() {
    hamburguesa.classList.remove("hide");
}

function hide() {
    hamburguesa.classList.add("hide");
}