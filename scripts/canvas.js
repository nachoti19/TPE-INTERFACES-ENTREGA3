class Tablero {
    
    constructor (numeroGanador) {
        this.columnas = 7;
        this.filas = 6;
        this.numeroGanador = numeroGanador;

        if (numeroGanador > 4) {
            this.columnas += this.numeroGanador - 4;
            this.filas += this.numeroGanador - 4;
        }

        //MATRIZ QUE CONTIENE LAS FICHAS
        this.casillas = new Array();
        //MATRIZ QUE CONTIENE LAS COORDENADAS EN EL CANVAS PARA CADA CASILLA
        this.coordenadasCasillas = new Array();

        //SE LLENAN LOS ARREGLOS CON NULOS
        for (let i = 0; i < this.filas; i++) {
            let fila = [];
            for (let j = 0; j < this.columnas; j++) {
                fila.push(null);
            }
            this.casillas.push(fila);
        }

        for (let i = 0; i < this.filas; i++) {
            let fila = [];
            for (let j = 0; j < this.columnas; j++) {
                fila.push(null);
            }
            this.coordenadasCasillas.push(fila);
        }

        //TABLERO PLANO
        this.fill = "#161616";
        this.anchoTablero = 60 * this.columnas;
        this.altoTablero = 60 * this.filas;
        this.coordXInicio = canvas.width/2 - this.anchoTablero/2
        this.coordYInicio = canvas.height/4 - 30;
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
        context.fillRect(this.coordXInicio-10, this.coordYInicio, 10, this.altoTablero);
        context.fillRect(this.coordXInicio-10, this.coordYInicio-10, this.anchoTablero + 10, this.altoTablero)

        //TAMAÑO Y COORDENADAS DE LOS HUECOS DEL TABLERO
        let radio = 25;
        let X = this.coordXInicio + 25;
        let Y = this.coordYInicio + 25;
        let triangulos = false;

        for (i = 0; i < this.filas; i++) {
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
                    context.fillStyle = "grey";
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
        let entradaTop = this.coordYInicio - 62;
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
        for (let fila = this.filas-1; fila >= 0; fila--) {
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
            if ((fila+1 < this.filas && columna+1 < this.columnas) &&
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
            if ((fila+1 < this.filas) &&
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
            if ((fila + 1 < this.filas && columna - 1 >= 0) &&
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
        let imageFicha = ficha.getImage();

        //CAMBIA EL COLOR DE LAS FICHAS DENTRO DEL TABLERO
        for (let i = 0; i < this.filas; i++) {
            for (let j = 0; j < this.columnas; j++) {
                if (this.casillas[i][j] != null) {
                    if (this.casillas[i][j].getJugador() != ficha.getJugador()) this.casillas[i][j].setImage("./images/fillGris.png");
                }
            }
        }

        //FICHAS QUE ESTÁN FUERA DEL TABLERO SE VUELVEN GRISES Y DEJAN DE SER ARRASTRABLES
        for (let i = 0; i < arregloFichas.length; i++) {
            if (!arregloFichas[i].isEnTablero()) {
                arregloFichas[i].setImage("./images/fillGris.png");
                arregloFichas[i].setArrastrable(false);
            }
        }

        dibujarElementos();

        context.fillStyle="#ffffff";
        context.fillRect(0, 0, width, 100);
        
        context.font = "60px Arial";
        context.textAlign ="center"        
        context.fillStyle ="green";
        context.fillText("¡Ha ganado " + ficha.getJugador() + "!", width/2, 80);

        clearInterval(temporizador);

        return;
    }

    tie() {
        //LAS FICHAS DEJAN DE SER ARRASTRABLES
        for (let i = 0; i < arregloFichas.length; i++) {
            arregloFichas[i].setImage("./images/fillGris.png");
            arregloFichas[i].setArrastrable(false);
        }
        isDragging = false;
        dibujarElementos();
        
        context.font = "60px Arial";
        context.textAlign ="center"
        context.fillStyle ="#000000";
        context.fillText("Se acabó el tiempo", width/2, 80);
    }

    vaciarTablero() {
        //SE VUELVE A LLENAR DE NULOS EL ARREGLO DE CASILLAS
        for (let i = 0; i < this.filas; i++) {
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

    setImage(image) {
        this.image.src = image;
    }

    getImage() {
        return this.image.src;
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
let temporizador;
let tiempo;


btnJugar.addEventListener('click', function(){
    //SI LAS OPCIONES ESTÁN VACÍAS
    if(fillJugador1 == null && fillJugador2 == null) {
        tablero = new Tablero(4);
        fillJugador1 = "./images/equipo1.png";
        crearFichas(jugador1, fillJugador1);
        posicionX = width - 80 * 2.65
        fillJugador2 = "./images/equipo2.png";
        crearFichas(jugador2, fillJugador2);

    }
    //SI NO ESTÁN VACÍAS
    else {
        tablero = new Tablero(XenLinea);
        crearFichas(jugador1, fillJugador1);
        posicionX = width - 80 * 2.65
        //CREA FICHA JUGAR 2
        crearFichas(jugador2, fillJugador2);
    }
    canvas.style.display = "block";
    PantallaJuego.style.display = "none";

    
    iniciarTemporizador();

});

//tomo los botones en sus respectivas varibles
let select = document.querySelector('#seleccionar');
let btnIzqJ1 = document.querySelector('#flecha-izqJ1');
let btnDerJ1 = document.querySelector('#flecha-derJ1');
let btnIzqJ2 = document.getElementById('flecha-izqJ2');
let btnDerJ2 = document.querySelector('#flecha-derJ2');
//equipos jugador 1
let equipo1J1 = document.querySelector('#equipo1J1');
let equipo2J1 = document.querySelector('#equipo2J1');
let equipo3J1 = document.querySelector('#equipo3J1');
let equipo4J1 = document.querySelector('#equipo4J1');
let equipo5J1 = document.querySelector('#equipo5J1');
let equipo6J1 = document.querySelector('#equipo6J1');
//equipos jugador 2
let equipo1J2 = document.querySelector('#equipo1J2');
let equipo2J2 = document.querySelector('#equipo2J2');
let equipo3J2 = document.querySelector('#equipo3J2');
let equipo4J2 = document.querySelector('#equipo4J2');
let equipo5J2 = document.querySelector('#equipo5J2');
let equipo6J2 = document.querySelector('#equipo6J2');
//let tamanio = document.querySelector('.tamanio');
//CONFIGURACION TABLERO
let titulo = document.querySelector('.cantidad');
let opcion1 = document.querySelector('#check1');
let opcion2 = document.querySelector('#check2');
let opcion3 = document.querySelector('#check3');
let opcion4 = document.querySelector('#check4');
let txt = document.querySelectorAll("p.texto");
let config = document.querySelector('.select-equipos');
let opciones = [opcion1, opcion2, opcion3, opcion4];

//cambio los displays para cambiar de "pestaña"
bntConfig.addEventListener('click', function(){
    btnJugar.style.display = "none";
    bntConfig.style.display = "none";
    config.style.display = "flex";
    equipo1J1.style.display = "block";
    equipo1J2.style.display = "block";
    
    for(let i = 0; i<txt.length; i++){
        txt[i].style.display = "block";
    }

    for(let i = 0; i<opciones.length; i++){
        opciones[i].style.display = "block";
    }
    select.style.display = "block";
    titulo.style.display = "block";
});

//CARRUSEL
let equipoj1 = [equipo1J1, equipo2J1, equipo3J1, equipo4J1, equipo5J1, equipo6J1];
let equipoj2= [equipo1J2, equipo2J2, equipo3J2, equipo4J2, equipo5J2, equipo6J2];
let posj1 = 0;
let posj2 = 0;
let posAj1 = 0;
let posAj2 = 0;
const max = equipoj1.length;

//Carrousel equipos inicio
btnIzqJ1.addEventListener('click', () => correrIzqJ1(equipoj1));

function correrIzqJ1(equipo){
    for(i = 0; i<max;i++){
        equipo[i].style.display = "none";
    }
    posj1--;
    if(posj1<0){
        posj1 = max-1;
    }
    equipo[posj1].style.display = "block";
    posAj1 = posj1;
    return posj1+1;
}
btnIzqJ2.addEventListener('click', () => correrIzqJ2(equipoj2));
function correrIzqJ2(equipo){
    for(i = 0; i<max;i++){
        equipo[i].style.display = "none";
    }
    posj2--;
    if(posj2<0){
        posj2 = max-1;
    }
    equipo[posj2].style.display = "block";
    posAj2 = posj2;
    return posj2+1;
}
btnDerJ1.addEventListener('click', () => correrDerJ1(equipoj1));
function correrDerJ1(equipo){
    for(i = 0; i<max;i++){
        equipo[i].style.display = "none";
    }
    posj1++;
    if(posj1>max-1){
        posj1 = 0;
    }
    posAj1 = posj1;
    equipo[posj1].style.display = "block";
    console.log(posAj1);
    return posj1-1;
}
btnDerJ2.addEventListener('click', () => correrDerJ2(equipoj2));

function correrDerJ2(equipo){
    for(i = 0; i<max;i++){
        equipo[i].style.display = "none";
    }
    posj2++;
    if(posj2>max-1){
        posj2 = 0;
    }
    posAj2 = posj2;
    equipo[posj2].style.display = "block";
    return posj2-1;
}
//Carrousel equipos fin

let XenLinea = 4;
let direcionj1;


select.addEventListener('click', function(){

    let auxJ1 = equipoj1[posAj1].src;
    let auxJ2 = equipoj2[posAj2].src;
    for(let i = 0; i<equipoj1.length; i++){
        if(equipoj1[i].src == auxJ1){
            console.log("aa");
            fillJugador1 = auxJ1;
            console.log(fillJugador1);
        }
    }

    for(let i = 0; i<equipoj2.length; i++){
        if(equipoj2[i].src == auxJ2){
            console.log("aa");
            fillJugador2 = auxJ2;
            console.log(fillJugador2);
        }
    }

    for(let i = 0; i<opciones.length; i++){
        //POR CADA OPCION, PREGUNTO SI ESTA SELECCIONADA
        if(opciones[i].checked){
            //SI LO ESTA, GUARDO EL VALOR DE ESE INPUT, EN UNA VARIABLE
            XenLinea = opciones[i].value;
        }
    }

    btnJugar.style.display = "block";
    bntConfig.style.display = "block";
    titulo.style.display = "none";
    config.style.display = "none";
    select.style.display = "none";
    for(let i = 0; i<opciones.length; i++){
        opciones[i].style.display = "none";
    }
    for(i = 0; i<equipoj1.length;i++){
        equipoj1[i].style.display = "none";
    }
    for(i = 0; i<equipoj2.length;i++){
        equipoj2[i].style.display = "none";
    }
    for(let i = 0; i<txt.length; i++){
        txt[i].style.display = "none";
    }
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
    context.fillStyle = "grey";
    context.fillRect(0, 0, width, height);

    //DIBUJA EL TABLERO
    tablero.draw();

    //DIBUJA EL TEMPORIZADOR
    if (tiempo > 0) {
        context.fillStyle = "#000000"
        context.font = "40px Arial";
        context.textAlign ="center"
        context.fillText(tiempo, width/2, 80);
    }

    //POR CADA FICHA DEL ARREGLO
    for (let ficha of arregloFichas) {
        //LA DIBUJA
        ficha.draw();
    }

    //BOTON REINICIAR
    context.fillStyle = "#161616";
    context.fillRect(width/2-40, 750, 80, 35);
    context.fillStyle = "#ffffff"
    context.font = "18px Arial";
    context.textAlign ="center"
    context.fillText("Reiniciar", width/2, 775);


    //ESCRIBE LOS JUGADORES SOBRE SUS FICHAS
    context.fillStyle = "#000000"
    context.font = "40px Arial";
    context.textAlign ="center"
    context.fillText(jugador1, 150, 80);
    context.fillText(jugador2, width-150, 80);

}

function iniciarTemporizador() {
    tiempo = 60 * 3;
    temporizador = setInterval(function() {
        tiempo--;

        //DIBUJA EL TIEMPO ARRIBA DEL TABLERO
        dibujarElementos();

        //SI EL TIEMPO LLEGA A CERO, CORTA
        if (tiempo <= 0) {
            clearInterval(temporizador);
            tablero.tie();
        }

    }, 1000);
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

    //DIBUJA LAS FICHAS DEL JUGADOR UNO
    let contador = 0;
    for (let fichaJ1 of fichasJugador1) {
        if (contador < 7) {
            fichaJ1.setImage(fillJugador1);
            fichaJ1.setPosicionX(X);
            fichaJ1.setPosicionY(Y);
            contador++;
        }
        else {
            contador = 1;
            X += 65;
            Y = posicionY;
            fichaJ1.setImage(fillJugador1);
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
            fichaJ2.setImage(fillJugador2);
            fichaJ2.setPosicionX(X);
            fichaJ2.setPosicionY(Y);
            contador++;
        }
        else {
            contador = 1;
            X += 65;
            Y = posicionY;
            fichaJ2.setImage(fillJugador2);
            fichaJ2.setPosicionX(X);
            fichaJ2.setPosicionY(Y);
        }
        Y += 60;
    }

    clearInterval(temporizador);
    iniciarTemporizador();
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

    if (startX > width/2-40 && startY > 750 &&
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