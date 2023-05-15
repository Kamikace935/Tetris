// Recoge el parámetro recibido con el get en la URL
const searchParams = new URLSearchParams(window.location.search);
const difficulty = parseInt(searchParams.get("difficulty") || 0,10);

// Contiene los parametros de las diferentes dificultades
const difficulties = [
    [35, 15, 8],
    [120, 90, 60]
]

// https://tetris.fandom.com/wiki/Tetris_Guideline
let frames = difficulties[0][difficulty];
let score = 0;
let time = difficulties[1][difficulty];

// Genera una nueva secuencia de tetrominó
// @see https://tetris.fandom.com/wiki/Random_Generator
function generateSequence() {
    const bag = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

    while (bag.length) {
        const rand = Math.floor(Math.random() * (bag.length));
        const name = bag.splice(rand, 1)[0];
        tetrominoSequence.push(name);
    }
}

// Coge el siguiente tetromino de la secuencia
function getNextTetromino() {
    if (tetrominoSequence.length === 0) {
        generateSequence();
    }

    const name = tetrominoSequence.pop();
    const matrix = tetrominoes[name];

    // Las figuras I y O empiezan centradas, las demás en el centro-izquierda
    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

    // La figura I empieza en la fila 21 (-1), el resto desde la fila 22 (-2)
    const row = name === 'I' ? -1 : -2;

    return {
        name: name,      // Nombre de la figura
        matrix: matrix,  // La rotación actual de la matriz
        row: row,        // Fila actual (Inicia fuera de la pantalla)
        col: col         // Columna actual
    };
}

// Rotación de la matriz 90º
// @see https://codereview.stackexchange.com/a/186834
function rotate(matrix) {
    const N = matrix.length - 1;

    return matrix.map((row, i) =>
        row.map((val, j) => matrix[N - j][i])
    );
}

// Comprueba si el movimiento de la matriz es válido
function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] && (
                // Sobresale de los límites del juego
                cellCol + col < 0 ||
                cellCol + col >= playfield[0].length ||
                cellRow + row >= playfield.length ||
                // Colisión con otra figura
                playfield[cellRow + row][cellCol + col])
            ) {
                return false;
            }
        }
    }

    return true;
}

// Coloca el tetromino en el juego
function placeTetromino() {
    for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col]) {

                // Termina el juego si cualquier parte de una figura se sale de la pantalla
                if (tetromino.row + row < 0) {
                    return showGameOver();
                }

                playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
            }
        }
    }

    let count = 0;
    // Comprueba las líneas que puede eliminar desde el fondo hasta la parte de arriba
    for (let row = playfield.length - 1; row >= 0; ) {
        if (playfield[row].every(cell => !!cell)) {
            // Elimina cada fila por encima de esta
            for (let r = row; r >= 0; r--) {
                for (let c = 0; c < playfield[r].length; c++) {
                    playfield[r][c] = playfield[r-1][c];
                }
            //Método que pinta los puntos y otro que añada tiempo al cronómetro

            }
            count++;
        } else {
            row--;
        }
    }

    increaseMarkerAndTime(count);

    //colocar variable para la siguiente ficha
    tetromino = getNextTetromino();
}




// Muestra la pantalla de final de juego
// Mejorar implementación input text
function showGameOver() {
    //@see https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
    cancelAnimationFrame(rAF);
    //@see https://developer.mozilla.org/en-US/docs/Web/API/clearInterval
    clearInterval(timer);

    gameOver = true;

    input.type = "text";
    input.maxLength = 3;
    input.placeholder = "Type something";
    input.style.position = "absolute";
    input.style.left = canvasPlayfield.offsetLeft + "px";
    input.style.top = canvasPlayfield.offsetTop + "px";
    input.opacity = 0;
    canvasPlayfield.parentNode.appendChild(input);
    input.focus();

    contextPlayfield.fillStyle = 'grey';
    contextPlayfield.globalAlpha = 0.85;
    contextPlayfield.fillRect(0, canvasPlayfield.height / 2 - 32, canvasPlayfield.width, 90);

    contextPlayfield.globalAlpha = 1;
    contextPlayfield.fillStyle = 'white';
    contextPlayfield.font = '36px monospace';
    contextPlayfield.textAlign = 'center';
    contextPlayfield.textBaseline = 'middle';
    contextPlayfield.fillText('GAME OVER', canvasPlayfield.width / 2, canvasPlayfield.height / 2);
    contextPlayfield.font = "20px monospace";
    contextPlayfield.fillText('Nickname:', canvasPlayfield.width / 2 - 60, canvasPlayfield.height / 2 + 35);

    let imageData = contextPlayfield.getImageData(0, 0, canvasPlayfield.width, canvasPlayfield.height);

    input.addEventListener("input", () => {
        contextPlayfield.putImageData(imageData, 0,0);
        contextPlayfield.fillStyle = 'white';
        contextPlayfield.font = "25px monospace";

        contextPlayfield.fillText(input.value.toUpperCase(), canvasPlayfield.width / 2 + 15, canvasPlayfield.height / 2 + 35);
    });

    // Añadir eventListener en el documento para que guarde el resultado con un intro
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            let ranking = JSON.parse(localStorage.getItem('Ranking')) || [];
            ranking.push(getScore());
            localStorage.setItem('Ranking', JSON.stringify(ranking));
            window.location.href = "index.html";
        }
    })
}

// Recoge toda la información de la partida del jugador y la devuelve como un objeto
function getScore() {
    let nick
    if (input.value === "") {
        nick = "Unknonw";
    }else  {
        nick = input.value.toUpperCase();
    }

    return {
        nick: nick,
        score: score,
        time: formatTime(time),
        difficulty: difficulty
    }
}

const canvasPlayfield = document.getElementById('game');
const canvasTimer = document.getElementById("timer");
const canvasScore = document.getElementById("score");

// @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
const contextPlayfield = canvasPlayfield.getContext('2d');
const contextTimer = canvasTimer.getContext('2d');
const contextScore = canvasScore.getContext('2d');
const input = document.createElement("input");
const grid = 32;
const tetrominoSequence = [];

// Mantiene un seguimiento de lo que hay en cada celda del juego usando un array bidimensional
// La pantalla es de 10x20 con una fila sobresaliente por la parte superior
const playfield = [];

// Rellena el tablero
for (let row = -2; row < 20; row++) {
    playfield[row] = [];

    for (let col = 0; col < 10; col++) {
        playfield[row][col] = 0;
    }
}

// Como formar cada tetromino
// @see https://tetris.fandom.com/wiki/SRS
const tetrominoes = {
    'I': [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],
    'J': [
        [1,0,0],
        [1,1,1],
        [0,0,0],
    ],
    'L': [
        [0,0,1],
        [1,1,1],
        [0,0,0],
    ],
    'O': [
        [1,1],
        [1,1],
    ],
    'S': [
        [0,1,1],
        [1,1,0],
        [0,0,0],
    ],
    'Z': [
        [1,1,0],
        [0,1,1],
        [0,0,0],
    ],
    'T': [
        [0,1,0],
        [1,1,1],
        [0,0,0],
    ]
};

// Color de cada tetromino
const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
};

let count = 0;
let tetromino = getNextTetromino();
let rAF = null;  // Mantiene un seguimiento de los frames de animación para poder cancelarlo
let gameOver = false;

// Aumenta los puntos y el tiempo restante por las líneas eliminadas
function increaseMarkerAndTime(lines) {
    const points = [40,100,300,1200];
    const extraTime = [10,15,20,30];

    if (lines > 0) {
        score += (points[lines-1] * (difficulty + 1));
        time += extraTime[lines-1];
    }

    contextScore.clearRect(0,0,canvasScore.width,canvasScore.height);
    contextScore.globalAlpha = 1;
    contextScore.fillStyle = 'white';
    contextScore.font = '25px monospace';
    contextScore.textAlign = 'center';
    contextScore.textBaseline = 'middle';
    contextScore.fillText(score, canvasScore.width / 2, canvasScore.height / 2);
}

// bucle de juego
function loop() {
    //@see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame#examples
    rAF = requestAnimationFrame(loop);
    contextPlayfield.clearRect(0,0,canvasPlayfield.width,canvasPlayfield.height);

    // Crea el tablero
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            if (playfield[row][col]) {
                const name = playfield[row][col];
                contextPlayfield.fillStyle = colors[name];

                // Crea 1px más pequeño que la cuadricula para crear un efecto de cuadrícula
                contextPlayfield.fillRect(col * grid, row * grid, grid-1, grid-1);
            }
        }
    }

    // Crea el tetromino activo
    if (tetromino) {

        // El tetromino cae cada 35 Frames
        if (++count > frames) {
            tetromino.row++;
            count = 0;

            // Coloca la pieza si colisiona contra algo
            if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                tetromino.row--;
                placeTetromino();
            }
        }

        contextPlayfield.fillStyle = colors[tetromino.name];

        for (let row = 0; row < tetromino.matrix.length; row++) {
            for (let col = 0; col < tetromino.matrix[row].length; col++) {
                if (tetromino.matrix[row][col]) {

                    // Crea el tablero 1px más pequeño que la cuadricula para crear el efecto de cuadrícula
                    contextPlayfield.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
                }
            }
        }
    }
}

// Escucha los eventos del teclado para mover el tetromino activo
document.addEventListener('keydown', function(e) {
    if (gameOver) return;

    // Teclas direccionales izquierda y derecha (movimiento)
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const col = e.key === "ArrowLeft"
            ? tetromino.col - 1
            : tetromino.col + 1;

        if (isValidMove(tetromino.matrix, tetromino.row, col)) {
            tetromino.col = col;
        }
    }

    // Tecla direccional arriba (rotar figura)
    if (e.key === "ArrowUp") {
        const matrix = rotate(tetromino.matrix);
        if (isValidMove(matrix, tetromino.row, tetromino.col)) {
            tetromino.matrix = matrix;
        }
    }

    // Tecla direccional abajo (acelerar caída)
    if(e.key === "ArrowDown") {
        const row = tetromino.row + 1;

        if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
            tetromino.row = row - 1;

            placeTetromino();
            return;
        }

        tetromino.row = row;
    }
});

function formatTime(seconds) {
    // Calcula las horas, los minutos y los segundos restantes de los segundos dados
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 36000) / 60);
    let remainingSeconds = seconds % 60;

    //@see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
    // Otorga formato a los digitos para que siempre se vean en dos digitos
    let formattedHours = hours.toString().padStart(2, '0');
    let formattedMinutes = minutes.toString().padStart(2, '0');
    let formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

//Crea la cuenta atras
function countDown() {
    time --;
    let timer = formatTime(time);

    contextTimer.clearRect(0,0,canvasTimer.width,canvasTimer.height);
    contextTimer.globalAlpha = 1;
    contextTimer.fillStyle = 'white';
    contextTimer.font = '25px monospace';
    contextTimer.textAlign = 'center';
    contextTimer.textBaseline = 'middle';
    contextTimer.fillText(timer, canvasTimer.width / 2, canvasTimer.height / 2);

    if (time === 0) {
        showGameOver()
    }
}

//@see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
// Inicia el Juego
rAF = requestAnimationFrame(loop);

//@see https://developer.mozilla.org/en-US/docs/Web/API/setInterval#examples
//Inicia el temporizador
const timer = setInterval(countDown, 1000);

// Inicia el contador de puntos
increaseMarkerAndTime(0);