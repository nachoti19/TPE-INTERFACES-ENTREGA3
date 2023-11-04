class Tablero {
    
    constructor (columnas, numeroGanador) {
        this.columnas = columnas;
        this.numeroGanador = numeroGanador;

        if (numeroGanador > 4) {
            this.columnas += this.numeroGanador - 4;
        }

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

        //TABLERO PLANO
        this.fill = "#161616";
        this.anchoTablero = 60 * this.columnas;
        this.altoTablero = canvas.height-canvas.height/2 - 16;
        this.coordXInicio = canvas.width/2 - this.anchoTablero/2
        this.coordYInicio = canvas.height/4;
    }

    getCasillas () {
        return this.casillas;
    }

    getColumnas () {
        return this.columnas;
    }

    draw () {
        context.fillStyle = this.fill;
        context.fillRect(this.coordXInicio, this.coordYInicio, this.anchoTablero, this.altoTablero);
        context.fillRect(this.coordXInicio-10, this.coordYInicio, 10, this.altoTablero)

        //TAMAÑO Y COORDENADAS DE LOS HUECOS DEL TABLERO
        let radio = 25;
        let X = this.coordXInicio + 25;
        let Y = this.coordYInicio + 40;
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
                    context.fillStyle = "#ffffff";
                    context.fill();
                
                //SE GUARDA LAS COORDENADAS DE ESE HUECO EN EL ARREGLO
                this.coordenadasCasillas[i][j] = X + "," + Y;
                X += 60;
            }
            //SE LLENA EL ARREGLO CON LAS COORDENADAS DE CADA HUECO DEL TABLERO
            triangulos = true;
            X = this.coordXInicio + 25;
            Y += 60;
        }   
    }

    comprobarEntrada(ficha) {
        //"HITBOX" DE LA PRIMER ENTRADA
        let entradaLeft = this.coordXInicio;
        let entradaTop = this.coordYInicio - 52;
        let entradaWidth = 47;
        let entradaHeight =  50;

        //POR CADA COLUMNA
        for (i = 0; i < this.columnas; i++){
            //COMPRUEBA SI LA FICHA ESTÁ EN LA "HITBOX" DE LAS ENTRADA
            if ((ficha.getPosicionX() > entradaLeft && ficha.getPosicionX() < entradaLeft + entradaWidth) &&
                (ficha.getPosicionY() > entradaTop && ficha.getPosicionY() < entradaTop + entradaHeight)) {
                    //SI ESTÁ EN UNA ENTRADA, SE MANDA EL NÚMERO DE COLUMNA Y LA FICHA
                    this.colocarFicha(i, ficha);
            }
            entradaLeft += 60;
        }
    }

    colocarFicha (columna, ficha) {
        //RECORRE LA COLUMNA SELECCIONADA DE ABAJO PARA ARRIBA
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
                //LA FICHA SE COLOCA EN EL TABLERO Y DEJA DE SER ARRASTRABLE
                ficha.setEnTablero(true);
                //SE ACTUALIZA EL CANVAS
                dibujarElementos();

                //SE CAMBIA EL TURNO AL OTRO JUGADOR
                this.cambiarTurno(ficha);
                //SE VERIFICA SI EL JUGADOR GANÓ (SE ENVÍA LA FICHA Y SUS COORDENADAS)
                this.verificarEstado(ficha, fila, columna);
                return;
            }
        }
    }

    verificarEstado (ficha, pos1, pos2) {
        let fila = pos1;
        let columna = pos2;
        
        let contadorDiagonal1 = 1;
        let contadorRectaHorizontal = 1;
        let contadorDiagonal2 = 1;
        let contadorRectaVertical = 1;
        let finBusqueda = false;
    
        //PRIMERO: DIAGONAL ARRIBA-DERECHA
        while (contadorDiagonal1 <= this.numeroGanador && !finBusqueda) {
            if ((fila-1 >= 0 && columna+1 < this.columnas) &&
                (this.casillas[fila-1][columna+1] != null) &&
                (ficha.getJugador() == this.casillas[fila-1][columna+1].getJugador())
                ) {
                //RESTA UNA POSICIÓN EN LA FILA
                fila--;
                //SUMA UNA POSICIÓN EN LA COLUMNA
                columna++;
                //SUMA UN CONTADOR DE FICHA
                contadorDiagonal1++;
            }
            else finBusqueda = true;
        }
        if (contadorDiagonal1 >= this.numeroGanador) {
            ficha.winner();
            return;
        }
        else {
            finBusqueda = false;
            fila = pos1;
            columna = pos2;
        }
    
        //SEGUNDO: RECTA-DERECHA
        while(contadorRectaHorizontal <= this.numeroGanador && !finBusqueda) {
            if ((columna+1 < this.columnas) &&
                (this.casillas[fila][columna+1] != null) &&
                (ficha.getJugador() == this.casillas[fila][columna+1].getJugador())
                ) {
                //SUMA UNA POSICIÓN EN LA COLUMNA
                columna++;
                //SUMA UN CONTADOR DE FICHA
                contadorRectaHorizontal++;
            }
            else finBusqueda = true;
        }
        if (contadorRectaHorizontal >= this.numeroGanador) {
            this.winner(this.casillas[fila][columna]);
            return;
        }
        else {
            finBusqueda = false;
            fila = pos1;
            columna = pos2;
        }
    
        //TERCERO: DIAGONAL ABAJO-DERECHA
        while(contadorDiagonal2 <= this.numeroGanador && !finBusqueda) {
            if ((fila+1 < 6 && columna+1 < this.columnas) &&
                (this.casillas[fila+1][columna+1] != null) &&
                (ficha.getJugador() == this.casillas[fila+1][columna+1].getJugador())
                ) {
                //SUMA UNA POSICIÓN EN LA FILA
                fila++;
                //SUMA UNA POSICIÓN EN LA COLUMNA
                columna++;
                //SUMA UN CONTADOR DE FICHA
                contadorDiagonal2++;
            }
            else finBusqueda = true;
        }
        if (contadorDiagonal2 >= this.numeroGanador) {
            this.winner(this.casillas[fila][columna]);
            return;
        }
        else {
            finBusqueda = false;
            fila = pos1;
            columna = pos2;
        }
    
        //CUARTO: RECTA-VERTICAL
        while(contadorRectaVertical <= this.numeroGanador && !finBusqueda) {
            if ((fila+1 < 6) &&
                (this.casillas[fila+1][columna] != null) &&
                (ficha.getJugador() == this.casillas[fila+1][columna].getJugador())
                ) {
                //SUMA UNA POSICIÓN EN LA FILA
                fila++;
                //SUMA UN CONTADOR DE FICHA
                contadorRectaVertical++;
            }
            else finBusqueda = true;
        }
        if (contadorRectaVertical >= this.numeroGanador) {
            console.log("ha ganao");
            this.winner(this.casillas[fila][columna]);
            return;
        }
        else {
            finBusqueda = false;
            fila = pos1;
            columna = pos2;
        }
    
        //QUINTO: DIAGONAL ABAJO-IZQUIERDA
        while(contadorDiagonal1 <= this.numeroGanador && !finBusqueda) {
            if ((fila + 1 < 6 && columna - 1 >= 0) &&
                (this.casillas[fila+1][columna-1] != null) &&
                (ficha.getJugador() == this.casillas[fila+1][columna-1].getJugador())
                ) {
                //SUMA UNA POSICIÓN EN LA FILA
                fila++;
                //RESTA UNA POSICIÓN EN COLUMNA
                columna--;
                //SUMA UN CONTADOR DE FICHA
                contadorDiagonal1++;
            }
            else finBusqueda = true;
        }
        if (contadorDiagonal1 >= this.numeroGanador) {
            this.winner(this.casillas[fila][columna]);
            return;
        }
        else {
            finBusqueda = false;
            fila = pos1;
            columna = pos2;
        }
    
        //SEXTO: RECTA HORIZONTAL-IZQUIERDA
        while(contadorRectaHorizontal <= this.numeroGanador && !finBusqueda) {
            if ((columna - 1 >= 0) &&
                (this.casillas[fila][columna-1] != null) &&
                (ficha.getJugador() == this.casillas[fila][columna-1].getJugador())
                ) {
                //RESTA UNA POSICIÓN EN LA COLUMNA
                columna--;
                //SUMA UN CONTADOR DE FICHA
                contadorRectaHorizontal++;
            }
            else finBusqueda = true;
        }
        if (contadorRectaHorizontal >= this.numeroGanador) {
            this.winner(this.casillas[fila][columna]);
            return;
        }
        else {
            finBusqueda = false;
            fila = pos1;
            columna = pos2;
        }
    
        //SÉPTIMO: DIAGONAL ARRIBA-IZQUIERDA
        while(contadorDiagonal2 <= this.numeroGanador && !finBusqueda) {
            if ((fila - 1 >= 0 && columna - 1 >= 0) &&
                (this.casillas[fila-1][columna-1] != null) &&
                (ficha.getJugador() == this.casillas[fila-1][columna-1].getJugador())
                ) {
                //RESTA UNA POSICIÓN EN LA COLUMNA
                columna--;
                //SUMA UN CONTADOR DE FICHA
                contadorDiagonal2++;
            }
            else finBusqueda = true;
        }
        if (contadorDiagonal2 >= this.numeroGanador) {
            this.winner(this.casillas[fila][columna]);
            return;
        }
        else {
            finBusqueda = false;
            fila = pos1;
            columna = pos2;
        }
        
        /*
        //PARA VER SI EL TABLERO ESTÁ VERIFICANDO BIEN LAS JUGADAS...
        console.log("nadie ganó en esta jugada");
        console.log("diagonal (1) : " + contadorDiagonal1);
        console.log("recta horizontal: " + contadorRectaHorizontal);
        console.log("diagonal (2): " + contadorDiagonal2);
        console.log("recta vertical: " + contadorRectaVertical);
        console.log("");
        */
        
    }

    cambiarTurno(ficha) {
        //RECORRE EL ARREGLO DE FICHAS
        for (let fichaDelArreglo of arregloFichas) {
            //SI ESA FICHA PERTENECE AL JUGADOR QUE ACABA DE REALIZAR UNA JUGADA, DEJA DE SER ARRASTRABLE
            if (fichaDelArreglo.getJugador() == ficha.getJugador()) fichaDelArreglo.setArrastrable(false);
        }

        //RECORRE NUEVAMENTE EL ARREGLO DE FICHAS
        for (let fichaDelArreglo of arregloFichas) {
            //SI ESA FICHA NO PERTENECE AL JUGADOR QUE ACABA DE REALIZAR UNA JUGADA, ES ARRASTRABLE NUEVAMENTE
            if (fichaDelArreglo.getJugador() != ficha.getJugador()) fichaDelArreglo.setArrastrable(true);
        }
    }

    winner (ficha) {
        let fillFicha = ficha.getFill();
        let i = 0;

        //CAMBIA EL COLOR DE LAS FICHAS DENTRO DEL TABLERO
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < this.columnas; j++) {
                if (this.casillas[i][j] != null) {
                    if (this.casillas[i][j].getJugador() != ficha.getJugador()) this.casillas[i][j].setFill("#d9d9d9");
                }
            }
        }

        //FICHAS QUE ESTÁN FUERA DEL TABLERO SE VUELVEN GRISES Y DEJAN DE SER ARRASTRABLES
        for (let i = 0; i < arregloFichas.length; i++) {
            if (!arregloFichas[i].isEnTablero()) {
                arregloFichas[i].setFill("#d9d9d9");
                arregloFichas[i].setArrastrable(false);
            }
        }

        dibujarElementos();
        
        context.font = "60px Arial";
        context.textAlign ="center"        
        context.fillStyle ="green";
        context.fillText("¡Ha ganado " + ficha.getJugador() + "!", width/2, 100);

        return;
    }

    vaciarTablero() {
        //SE VUELVE A LLENAR DE NULOS EL ARREGLO DE CASILLAS
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < this.columnas; j++) {
                this.casillas[i][j] = null;
            }
        }
    }

}

class Ficha {

    constructor (jugador, posicionX, posicionY, radio, fill) {
        this.jugador = jugador;
        this.posicionX = posicionX;
        this.posicionY = posicionY;
        this.radio = radio;
        this.fill = fill;
        this.image = new Image();
        this.image.src = fill;
        this.image.onload = () => this.draw();
        this.arrastrable = true;
        this.enTablero = false;
    }

    getJugador() {
        return this.jugador;
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

    setFill (fill) {
        this.fill = fill;
    }

    getFill () {
        return this.fill;
    }

    isArrastrable () {
        return this.arrastrable;
    }

    setArrastrable (estado) {
        this.arrastrable = estado;
    }

    isEnTablero () {
        return this.enTablero;
    }

    setEnTablero (estado) {
        this.enTablero = estado;
    }

    draw () {
        context.save();
        context.beginPath();
        context.arc(this.posicionX, this.posicionY, this.radio, 0, 2 * Math.PI);
        context.closePath();
        context.clip();
        context.drawImage(this.image, this.posicionX - this.radio, this.posicionY - this.radio, this.radio * 2, this.radio * 2);
        context.beginPath();
        context.arc(0, 0, 25, 0, Math.PI * 2, true);
        context.clip();
        context.closePath();
        context.restore();
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

let btnJugar = document.querySelector('#jugar');//Agarra el boton "jugar"
let bntConfig = document.querySelector('#config');//Agarra el boton "config"
let PantallaJuego = document.querySelector('.inicio-juego');//toma el div "pantalla-juego"
//cambia los estilos cuando se apreta el boton jugar

let fillJugador1;
let fillJugador2;
let tablero;
let jugador1 = "Jugador 1";
let jugador2 = "Jugador 2";

btnJugar.addEventListener('click', function(){
    //SI LAS OPCIONES ESTÁN VACÍAS
    if(fillJugador1 == null && fillJugador2 == null) {
        tablero = new Tablero(7, 4); //<------------------------------------------------------------------------------
        fillJugador1 = "./images/equipo1.png";
        crearFichas(jugador1, fillJugador1);
        posicionX = width - 80 * 2.65
        fillJugador2 = "./images/equipo2.png";
        crearFichas(jugador2, fillJugador2);

    }
    //SI NO ESTÁN VACÍAS
    else {
        tablero = new Tablero(7, XenLinea); //<------------------------------------------------------------------------------
        crearFichas(jugador1, fillJugador1);
        posicionX = width - 80 * 2.65
        //CREA FICHA JUGAR 2
        crearFichas(jugador2, fillJugador2);
        //RECORRO EL ARREGLO QUE TIENE ADENTRO LOS INPUTS
    }
    canvas.style.display = "block";
    PantallaJuego.style.display = "none";
});

//tomo los botones en sus respectivas varibles
let select = document.querySelector('#seleccionar');
let btnIzq = document.querySelector('#flecha-izq');
let btnDer = document.querySelector('#flecha-der');
let equipo1 = document.querySelector('#equipo1');
let equipo2 = document.querySelector('#equipo2');
let equipo3 = document.querySelector('#equipo3');
let tamanio = document.querySelector('.tamanio');
let opcion1 = document.querySelector('#check1');
let opcion2 = document.querySelector('#check2');
let opcion3 = document.querySelector('#check3');
let opciones = [opcion1, opcion2, opcion3];
//cambio los displays para cambiar de "pestaña"
bntConfig.addEventListener('click', function(){
    btnJugar.style.display = "none";
    bntConfig.style.display = "none";
    select.style.display = "block";
    btnDer.style.display = "block";
    btnIzq.style.display = "block";
    equipo1.style.display = "block";
    tamanio.style.display = "block";
    opcion1.style.display = "block";
    opcion2.style.display = "block";
    opcion3.style.display = "block";
});

//CARRUSEL
let listaEquipos = [equipo1, equipo2, equipo3];
let pos = 0;
let posA = 0;
const max = listaEquipos.length;

//Carrousel equipos inicio
btnIzq.addEventListener('click', function(){
    for(i = 0; i<listaEquipos.length;i++){
        listaEquipos[i].style.display = "none";
    }
    pos--;
    if(pos<0){
        pos = 2;
    }
    listaEquipos[pos].style.display = "block";
    posA = pos;
    return pos+1;
});

btnDer.addEventListener('click', function(){
    for(i = 0; i<listaEquipos.length;i++){
        listaEquipos[i].style.display = "none";
    }
    pos++;
    if(pos>2){
        pos = 0;
    }
    posA = pos;
    listaEquipos[pos].style.display = "block";
    return pos-1;
});
//Carrousel equipos fin

let XenLinea = 4;

select.addEventListener('click', function(){
    if(listaEquipos[posA] == equipo1){
        //TOMA LA IMAGEN DE LAS FICHAS DEL JUGADOR 1
        fillJugador1 = "./images/icono_insane.jpg";
        //TOMA LA IMAGEN DE LAS FICHAS DEL JUGADOR 2
        fillJugador2= "./images/equipo6.png";
    }
    if(listaEquipos[posA] == equipo2){
        fillJugador1 = "./images/equipo3.png";
        fillJugador2 = "./images/equipo4.png";
    }
    if(listaEquipos[posA] == equipo3){
        fillJugador1 = "./images/icono_insane.jpg";
        fillJugador2 = "./images/mclovin.jpg";
    }

    for(let i = 0; i<opciones.length; i++){
        //POR CADA OPCION, PREGUNTO SI ESTA SELECCIONADA
        if(opciones[i].checked){
            //SI LO ESTA, GUARDO EL VALOR DE ESE INPUT, EN UNA VARIABLE
            XenLinea = opciones[i].value;
        }
    }

    //tablero = new Tablero(7, XenLinea); //<------------------------------------------------------------------------------

    btnJugar.style.display = "block";
    bntConfig.style.display = "block";
    select.style.display = "none";
    btnDer.style.display = "none";
    btnIzq.style.display = "none";
    
    for(i = 0; i<listaEquipos.length;i++){
        listaEquipos[i].style.display = "none";
    }
    return pos = 0;
});

let cantFichas = 21; //(POR JUGADOR)
let arregloFichas = [];

//VARIABLES PARA EL CANVAS Y LAS FICHAS
let width = canvas.width;
let height = canvas.height;
//POSICIÓN INICIAL DE LA PRIMER FICHA
let posicionX = 90;
let posicionY = 160;
//ARREGLO DONDE SE GUARDAN TODAS LAS FICHAS

function crearFichas (jugador, fill) {
    let X = posicionX;
    let Y = posicionY;
    //TRES COLUMNAS...
    for (i = 0; i < 3; i++) {
        //DE SIETE FICHAS CADA UNA...
        for (j = 0; j < 7; j++) {
            //SE CREA UNA FICHA
            let ficha = new Ficha(jugador, X, Y, 25, fill);
            //SE AGREGA AL ARREGLO DE FICHAS
            //console.log(ficha);
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
    let img = new Image();
    img.src = "./images/8385556.jpg"
    img.onload = function () {
        context.drawImage(img, 0, 0);
    }
    //context.fillStyle = "#ffffff";
    //context.fillRect(0, 0, width, height);
    //DIBUJA EL TABLERO
    tablero.draw();

    //POR CADA FICHA DEL ARREGLO
    for (let ficha of arregloFichas) {
        //LA DIBUJA
        ficha.draw();
    }

    //BOTON REINICIAR
    context.fillStyle = "#161616";
    context.fillRect(width/2-40, 700, 80, 35);
    context.fillStyle = "#ffffff"
    context.font = "18px Arial";
    context.textAlign ="center"
    context.fillText("Reiniciar", width/2, 725);


    //ESCRIBE LOS JUGADORES SOBRE SUS FICHAS
    context.fillStyle = "#000000"
    context.font = "40px Arial";
    context.textAlign ="center"
    context.fillText(jugador1, 150, 80);
    context.fillText(jugador2, width-150, 80);
}

function restart() {
    let fichasJugador1 = [];
    let fichasJugador2 = [];
    let X = 90;
    let Y = posicionY;

    tablero.vaciarTablero();

    //SE LLENAN LOS ARREGLOS CON LAS FICHAS DE LOS JUGADORES
    for (let ficha of arregloFichas) {
        ficha.setArrastrable(true);
        ficha.setEnTablero(false);
        if (ficha.getJugador() == jugador1) fichasJugador1.push(ficha);
        else fichasJugador2.push(ficha);
    }

    //console.log("jugador 1: " + fichasJugador1.length + " jugador 2: " + fichasJugador2.length);

    //DIBUJA LAS FICHAS DEL JUGADOR UNO
    let contador = 0;
    for (let fichaJ1 of fichasJugador1) {
        if (contador < 7) {
            fichaJ1.setFill(fillJugador1);
            fichaJ1.setPosicionX(X);
            fichaJ1.setPosicionY(Y);
            contador++;
        }
        else {
            contador = 1;
            X += 65;
            Y = posicionY;
            fichaJ1.setFill(fillJugador1);
            fichaJ1.setPosicionX(X);
            fichaJ1.setPosicionY(Y);
        }
        Y += 60;
    }

    contador = 0;
    X = width - 80 * 2.65;
    Y = posicionY;
    //DIBUJA LAS FICHAS DEL JUGADOR DOS
    for (let fichaJ2 of fichasJugador2) {
        if (contador < 7) {
            fichaJ2.setFill(fillJugador2);
            fichaJ2.setPosicionX(X);
            fichaJ2.setPosicionY(Y);
            contador++;
        }
        else {
            contador = 1;
            X += 65;
            Y = posicionY;
            fichaJ2.setFill(fillJugador2);
            fichaJ2.setPosicionX(X);
            fichaJ2.setPosicionY(Y);
        }
        Y += 60;
    }

    dibujarElementos();

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

    if (startX > width/2-40 && startY > 700 &&
        startX < width/2+40 && startY > 35) restart();

    //POR CADA FICHA GUARDADA EN EL ARREGLO DE FICHAS...
    for (let ficha of arregloFichas) {
        //COMPRUEBA SI ALGUNA FUE CLICKEADA
        if (ficha.isClicked(startX, startY)) {
            //SI LA FICHA CLICKEADA ES ARRASTRABLE Y NO ESTÁ EN EL TABLERO
            if (ficha.isArrastrable() && !ficha.isEnTablero()) {
                //LA FICHA SE GUARDA EN UNA VARIABLE Y SE ENTRA EN ESTADO "ARRASTRANDO"
                isDragging = true;
                selectedFicha = ficha;
                return;
            }
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