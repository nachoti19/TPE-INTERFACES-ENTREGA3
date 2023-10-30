class Tablero {
    
    constructor () {

    }

    draw () {
        console.log("dibujando tablero");
        context.fillStyle = "blue";
        //context.fillRect(width/4, height/4, width-width/4, height-height/4);
        context.fillRect(100, 100, 600, 600);
    }

}

class Ficha {

    constructor (posicionX, posicionY, radio, fill) {
        this.posicionX = posicionX;
        this.posicionY = posicionY;
        this.radio = radio;
        this.fill = fill;
    }

    setPosicionX (x) {
        this.posicionX = x;
    }

    getPosicionX () {
        return this.posicionX;
    }

    setPosicionY (y) {
        this.posicionY = y;
    }

    getPosicionY () {
        return this.posicionY;
    }

    draw () {
        //X, Y, RADIO, INICIO, FIN
        context.beginPath();
        context.arc(this.posicionX, this.posicionY, this.radio, 0, 2 * Math.PI);
        context.stroke();
        context.fillStyle = this.fill;
        context.fill();
        context.closePath();
    }

    isClicked (clickX, clickY) {
        let dx = Math.abs(clickX - this.posicionX);
        let dy = Math.abs(clickY - this.posicionY);
        //SI LAS COORDENADAS DEL CLICK ESTÁN ADENTRO DEL CÍCULO, RETORNA TRUE
        if (Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2)) <= this.radio) {
            return true;
        }
        //SINO, RETORNA FALSE
        return false;

    }

}

//CANVAS Y CONTEXT
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

//TABLERO Y FICHAS
let cantFichas = 21; //(POR JUGADOR)
let anchoTablero = 7;

//VARIABLES PARA EL CANVAS Y LAS FICHAS
let width = canvas.width;
let height = canvas.height;
let posicionX = 80;
let posicionY = 80;
let arregloFichas = [];

//SE DIBUJAN LAS FICHAS DEL JUGADOR UNO CON LOS VALORES POR DEFECTO
let fill = "yellow";
crearElementos(posicionX, posicionY, fill);

//SE CAMBIA EL COLOR Y LA POSICION X
fill = "red";
posicionX = width - posicionX * 2.65;

//SE DIBUJAN LAS FICHAS DEL JUGADOR DOS
crearElementos(posicionX, posicionY, fill);

let tablero;

//DIBUJAR FICHAS SOBRE EL CANVAS
function crearElementos (posicionX, posicionY, fill) {
    //SE CREA EL TABLERO
    let tablero = new Tablero();

    let X = posicionX;
    let Y = posicionY;
    //TRES COLUMNAS...
    for (i = 0; i < 3; i++) {
        //DE SIETE FICHAS CADA UNA...
        for (j = 0; j < 7; j++) {
            //SE CREA UNA FICHA
            let ficha = new Ficha(X, Y, 25, fill);
            //SE AGREGA AL ARREGLO DE FICHAS
            arregloFichas.push(ficha);
            //AUMENTA LA POSICION Y DE LA SIGUIENTE FICHA (MÁS ABAJO)
            Y += 60;
        }
        //CUANDO SE TERMINA DE DIBUJAR UNA COLUMNA DE FICHAS, AUMENTA LA POSICIÓN X (MÁS A LA DERECHA)
        X += 65;
        //Y REINICIA LA Y AL VALOR INICIAL
        Y = posicionY;
    }
    //UNA VEZ CREADAS LAS FICHAS, LLAMO AL MÉTODO DIBUJAR FICHAS
    dibujarFichas();
}

function dibujarFichas() {
    //BORRA EL CANVAS POR COMPLETO
    context.clearRect(0, 0, width, height);
    //SE DIBUJA EL TABLERO
    tablero.draw();
    //Y POR CADA FICHA DEL ARREGLO
    for (let ficha of arregloFichas) {
        //LA DIBUJA
        ficha.draw();
    }
}

let selectedFicha;
let isDragging = false;
let startX;
let startY;

//CUANDO SE APRIETA EL CLICK
let mouseDown = function(event) {
    //SE PREVIENE EL EVENTO DEFAULT
    event.preventDefault();
    //SE TOMAN LAS COORDENADAS DEL CURSOR
    let rect = canvas.getBoundingClientRect();
    startX = parseInt(event.clientX) - rect.left;
    startY = parseInt(event.clientY) - rect.top;
    //console.log("X: " + startX + " Y: " + startY);

    //POR CADA FICHA GUARDADA EN EL ARREGLO DE FICHAS...
    for (let ficha of arregloFichas) {
        //COMPRUEBA SI ALGUNA FUE CLICKEADA
        if (ficha.isClicked(startX, startY)) {
            //LA FICHA SE MARCA COMO SELECCIONADA, Y SE MARCA EN ESTADO "ARRASTANDO"
            isDragging = true;
            selectedFicha = ficha;
            return;
        }
    }
}

//CUANDO SE SUELTA EL CLICK
let mouseUp = function(event) {
    //SI NO SE ESTÁ ARRASTRANDO, RETORNA
    if (!isDragging) {
        return;
    }
    event.preventDefault();
    //SI SE ESTABA ARRASTRANDO, SE DEJA DE ARRASTRAR EN EL MOMENTO QUE SUELTA EL CLICK
    isDragging = false;
}

//CUANDO SE MUEVE EL MOUSE
let mouseMove = function(event) {
    if (!isDragging) return;
    else {
        //SI SE ESTÁ ARRASTRANDO SOBRE UNA FICHA...
        event.preventDefault();
        //SE TOMAN LAS COORDENADAS DEL CURSOR
        let rect = canvas.getBoundingClientRect();
        let mouseX = parseInt(event.clientX) - rect.left;
        let mouseY = parseInt(event.clientY) - rect.top;
        //SE RESTAN LAS COORDENADAS INICIALES A LAS COORDENADAS DEL CURSOR
        let dx = mouseX - startX;
        let dy = mouseY - startY;

        //SE CAMBIAN LAS COORDENADAS DE LA FICHA
        selectedFicha.setPosicionX(dx + selectedFicha.getPosicionX());
        selectedFicha.setPosicionY(dy + selectedFicha.getPosicionY());
        //SE DIBUJA LA FICHA
        dibujarFichas();
        //LAS POSICIONES DE INICIO SE ACTUALIZAN
        startX = mouseX;
        startY = mouseY;
    }
}

//EVENTOS DEL MOUSE
canvas.onmousedown = mouseDown;
canvas.onmouseup = mouseUp;
canvas.onmousemove = mouseMove;