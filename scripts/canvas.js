class Tablero {
    
    constructor (columnas) {
        this.columnas = columnas;
        //MATRIZ QUE CONTIENE LAS FICHAS
        this.casillas = new Array();
        //MATRIZ QUE CONTIENE LAS COORDENADAS EN EL CANVAS PARA CADA CASILLA
        this.coordenadasCasillas = new Array();

        //SE LLENAN LOS ARREGLOS CON NULOS
        for (let i = 0; i < 6; i++) {
            let fila = [];
            for (let j = 0; j < this.columnas; j++) {
                fila.push(null);
            }
            this.casillas.push(fila);
        }

        for (let i = 0; i < 6; i++) {
            let fila = [];
            for (let j = 0; j < this.columnas; j++) {
                fila.push(null);
            }
            this.coordenadasCasillas.push(fila);
        }
    }

    draw () {
        //TABLERO PLANO
        context.fillStyle = "blue";
        context.fillRect(width/4, height/4, width-width/2, height-height/2);

        //TAMAÑO Y COORDENADAS DE LOS HUECOS DEL TABLERO
        let radio = 25;
        let X = width/4 + 40;
        let Y = height/4 + 40;

        let triangulos = false;
        for (i = 0; i < 6; i++) {
            //HUECOS
            for (j = 0; j < this.columnas; j++) {
                //SI NO SE DIBUJARON TODOS LOS TRIÁNGULOS, SE DIBUJAN
                if (!triangulos) {
                    context.beginPath();
                    context.moveTo(X, Y-60);
                    context.lineTo(X-20, Y-90);
                    context.lineTo(X+20, Y-90);
                    context.closePath();

                    context.lineWidth = 2;
                    context.strokeStyle = '#666666';
                    context.stroke();
                }
                    //SE DIBUJA EL HUECO EN EL TABLERO
                    context.beginPath();
                    context.arc(X, Y, radio, 0, 2 * Math.PI);
                    context.fillStyle = "white";
                    context.fill();
                
                //SE GUARDA LAS COORDENADAS DE ESE HUECO EN EL ARREGLO
                this.coordenadasCasillas[i][j] = X + "," + Y;
                X += 60;
            }
            //SE LLENA EL ARREGLO CON LAS COORDENADAS DE CADA HUECO DEL TABLERO
            triangulos = true;
            X = width/4 + 40;
            Y += 60;
        }   
    }

    comprobarEntrada(ficha) {
        //"HITBOX" DE LA PRIMER ENTRADA
        let entradaLeft = 343;
        let entradaTop = 150;
        let entradaRight = 388;
        let entradaBottom =  185;

        //POR CADA COLUMNA
        for (i = 0; i < this.columnas; i++){
            //COMPRUEBA SI LA FICHA ESTÁ EN LA "HITBOX" DE LAS ENTRADA
            if ((ficha.getPosicionX() > entradaLeft && ficha.getPosicionX() < entradaRight) &&
                (ficha.getPosicionY() > entradaTop && ficha.getPosicionY() < entradaBottom)) {
                    //SI ESTÁ EN UNA ENTRADA, SE MANDA EL NÚMERO DE COLUMNA Y LA FICHA
                    this.colocarFicha(i, ficha);
            }
            entradaLeft += 60;
            entradaRight += 60;
        }
    }

    colocarFicha (columna, ficha) {
        //RECORRE LA COLUMNA INGRESADA DE ABAJO PARA ARRIBA
        for (let fila = 5; fila >= 0; fila--) {
            //SI LA CASILLA ESTÁ VACÍA
            if (this.casillas[fila][columna] == null) {
                //SE GUARDA LA FICHA EN ESA CASILLA
                this.casillas[fila][columna] = ficha;
                //SE OBTIENEN LAS COORDENADAS DE LA CASILLA
                let coordenadas = this.coordenadasCasillas[fila][columna].split(",");
                //SE ACTUALIZAN LAS COORDENADAS DE LA FICHA
                ficha.setPosicionX(coordenadas[0]);
                ficha.setPosicionY(coordenadas[1]);
                //SE ACTUALIZA EL CANVAS
                dibujarElementos();

                let fichas = 0;
                //RECORRO TODA LA MATRIZ DE CASILLAS
                for (let fila = 0; fila < 6; fila++) {
                    for (let columna = 0; columna < this.columnas; columna++) {
                        //SI HAY UNA FICHA EN UNA CASILLA...
                        if (this.casillas[fila][columna] != null) {
                            fichas++;
                        }
                    }
                }

                //SI HAY AL MENOS CUATRO FICHAS, VERIFICA EL ESTADO
                if (fichas <= 4) this.verificarEstado();
                return;
            }
        }
    }

    verificarEstado () {
        let contadorFichas = 0;
        let finBusqueda = false;

        //POR CADA POSICIÓN DEL TABLERO...
        for (let fila = 0; fila < 6; fila++) {
            for (let columna = 0; columna < this.columnas; columna++) {
                //VERIFICA QUE HAYA UNA FICHA 
                if (this.casillas[fila][columna] != null) {
                    //PRIMERO: DIAGONAL ARRIBA A LA DERECHA
                    while (contadorFichas < 4 && !finBusqueda) {
                        if ((fila-1 >= 0 && columna+1 < this.columnas) &&
                            (this.casillas[fila-1][columna+1] != null) &&
                            (this.casillas[fila][columna].getFill() == this.casillas[fila-1][columna+1].getFill())
                            ) {
                            //RESTA UNA POSICIÓN EN LA FILA
                            fila--;
                            //SUMA UNA POSICIÓN EN LA COLUMNA
                            columna++;
                            //SUMA UN CONTADOR DE FICHA
                            contadorFichas++;
                        }
                        else finBusqueda = true;
                    }
                    if (contadorFichas == 3) {
                        this.casillas[fila][columna].winner();
                        return;
                    }
                    else {
                        contadorFichas = 0;
                        finBusqueda = false;
                    }

                    //SEGUNDO: LÍNEA RECTA DERECHA
                    while(contadorFichas < 4 && !finBusqueda) {
                        if ((columna+1 < this.columnas) &&
                            (this.casillas[fila][columna+1] != null) &&
                            (this.casillas[fila][columna].getFill() == this.casillas[fila][columna+1].getFill())
                            ) {
                            //SUMA UNA POSICIÓN EN LA COLUMNA
                            columna++;
                            //SUMA UN CONTADOR DE FICHA
                            contadorFichas++;
                        }
                        else finBusqueda = true;
                    }
                    if (contadorFichas == 3) {
                        this.casillas[fila][columna].winner();
                        return;
                    }
                    else {
                        contadorFichas = 0;
                        finBusqueda = false;
                    }

                    //TERCERO: DIAGONAL ABAJO A LA DERECHA
                    while(contadorFichas < 4 && !finBusqueda) {
                        if ((fila+1 < 6 && columna+1 < this.columnas) &&
                            (this.casillas[fila+1][columna+1] != null) &&
                            (this.casillas[fila][columna].getFill() == this.casillas[fila+1][columna+1].getFill())
                            ) {
                            //SUMA UNA POSICIÓN EN LA FILA
                            fila++;
                            //SUMA UNA POSICIÓN EN LA COLUMNA
                            columna++;
                            //SUMA UN CONTADOR DE FICHA
                            contadorFichas++;
                        }
                        else finBusqueda = true;
                    }
                    if (contadorFichas == 3) {
                        this.casillas[fila][columna].winner();
                        return;
                    }
                    else {
                        contadorFichas = 0;
                        finBusqueda = false;
                    }

                    //CUARTO: LÍNEA RECTA ABAJO
                    while(contadorFichas < 4 && !finBusqueda) {
                        if ((fila+1 < 6) &&
                            (this.casillas[fila+1][columna] != null) &&
                            (this.casillas[fila][columna].getFill() == this.casillas[fila+1][columna].getFill())
                            ) {
                            //SUMA UNA POSICIÓN EN LA FILA
                            fila++;
                            //SUMA UN CONTADOR DE FICHA
                            contadorFichas++;
                        }
                        else finBusqueda = true;
                    }
                    if (contadorFichas == 3) {
                        this.casillas[fila][columna].winner();
                        return;
                    }
                    else {
                        contadorFichas = 0;
                        finBusqueda = false;
                    }

                    //QUINTO: DIAGONAL ABAJO IZQUIERDA
                    while(contadorFichas < 4 && !finBusqueda) {
                        if ((fila+1 < 6 && columna-1 >= 0) &&
                            (this.casillas[fila+1][columna-1] != null) &&
                            (this.casillas[fila][columna].getFill() == this.casillas[fila+1][columna-1].getFill())
                            ) {
                            //SUMA UNA POSICIÓN EN LA FILA
                            fila++;
                            //RESTA UNA POSICIÓN EN LA COLUMNA
                            columna--;
                            //SUMA UN CONTADOR DE FICHA
                            contadorFichas++;
                        }
                        else finBusqueda = true;
                    }
                    if (contadorFichas == 3) {
                        this.casillas[fila][columna].winner();
                        return;
                    }
                    else {
                        contadorFichas = 0;
                        finBusqueda = false;
                    }

                    //SEXTO: LÍNEA RECTA IZQUIERDA
                    while(contadorFichas < 4 && !finBusqueda) {
                        if ((columna-1 >= 0) &&
                            (this.casillas[fila][columna-1] != null) &&
                            (this.casillas[fila][columna].getFill() == this.casillas[fila][columna-1].getFill())
                            ) {
                            //RESTA UNA POSICIÓN EN LA COLUMNA
                            columna--;
                            //SUMA UN CONTADOR DE FICHA
                            contadorFichas++;
                        }
                        else finBusqueda = true;
                    }
                    if (contadorFichas == 3) {
                        this.casillas[fila][columna].winner();
                        return;
                    }
                    else {
                        contadorFichas = 0;
                        finBusqueda = false;
                    }

                    //SÉPTIMO: DIAGONAL ARRIBA IZQUIERDA
                    while(contadorFichas < 4 && !finBusqueda) {
                        if ((fila-1 >= 0 && columna-1 >= 0) &&
                            (this.casillas[fila-1][columna-1] != null) &&
                            (this.casillas[fila][columna].getFill() == this.casillas[fila-1][columna-1].getFill())
                            ) {
                            //RESTA UNA POSICIÓN EN LA FILA
                            fila++;
                            //RESTA UNA POSICIÓN EN LA COLUMNA
                            columna--;
                            //SUMA UN CONTADOR DE FICHA
                            contadorFichas++;
                        }
                        else finBusqueda = true;
                    }
                    if (contadorFichas == 3) {
                        this.casillas[fila][columna].winner();
                        return;
                    }
                    else {
                        contadorFichas = 0;
                        finBusqueda = false;
                    }
                }
            }
        }        

        
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

    getFill () {
        return this.fill;
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

    winner () {
        console.log("ganadorrrr");
    }

}

//CANVAS Y CONTEXT
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

//TABLERO Y FICHAS
//CREA EL TABLERO
let tablero = new Tablero(7);
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
crearFichas(posicionX, posicionY, fill);

//SE CAMBIA EL COLOR Y LA POSICION X
fill = "red";
posicionX = width - posicionX * 2.65;

//SE DIBUJAN LAS FICHAS DEL JUGADOR DOS
crearFichas(posicionX, posicionY, fill);

//DIBUJAR FICHAS SOBRE EL CANVAS
function crearFichas (posicionX, posicionY, fill) {
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
    dibujarElementos();
}

function dibujarElementos() {
    //BORRA EL CANVAS POR COMPLETO
    context.clearRect(0, 0, width, height);
    //DIBUJA EL TABLERO
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
    //CUANDO SE SUELTA LA FICHA, EL TABLERO COMPRUEBA SU POSICIÓN
    tablero.comprobarEntrada(selectedFicha);
}

//CUANDO SE MUEVE EL MOUSE
let mouseMove = function(event) {
    /*
    let rect = canvas.getBoundingClientRect();
    let a = parseInt(event.clientX) - rect.left;
    let b = parseInt(event.clientY) - rect.top;
    console.log ("X: " + a + " Y: " + b);
    */
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
        dibujarElementos();
        //LAS POSICIONES DE INICIO SE ACTUALIZAN
        startX = mouseX;
        startY = mouseY;
    }
}

//EVENTOS DEL MOUSE
canvas.onmousedown = mouseDown;
canvas.onmouseup = mouseUp;
canvas.onmousemove = mouseMove;