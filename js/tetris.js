// https://tetris.fandom.com/wiki/Tetris_Guideline

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

    // Comprueba las líneas que puede eliminar desde el fondo hasta la parte de arriba
    for (let row = playfield.length - 1; row >= 0; ) {
        if (playfield[row].every(cell => !!cell)) {

            // Elimina cada fila por encima de esta
            for (let r = row; r >= 0; r--) {
                for (let c = 0; c < playfield[r].length; c++) {
                    playfield[r][c] = playfield[r-1][c];
                }
            }
        }
        else {
            row--;
        }
    }
    //colocar variable para la siguiente ficha
    tetromino = getNextTetromino();
}

// Muestra la pantalla de final de juego
// Mejorar implementación input text
function showGameOver() {
    //@see https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
    cancelAnimationFrame(rAF);
    gameOver = true;

    input.type = "text";
    input.maxLength = 3;
    input.placeholder = "Escribe algo";
    input.style.position = "absolute";
    input.style.left = canvas.offsetLeft + "px";
    input.style.top = canvas.offsetTop + "px";
    input.opacity = 0;
    canvas.parentNode.appendChild(input);
    input.focus();



    contextPlayfield.fillStyle = 'grey';
    contextPlayfield.globalAlpha = 0.85;
    contextPlayfield.fillRect(0, canvas.height / 2 - 32, canvas.width, 90);

    contextPlayfield.globalAlpha = 1;
    contextPlayfield.fillStyle = 'white';
    contextPlayfield.font = '36px monospace';
    contextPlayfield.textAlign = 'center';
    contextPlayfield.textBaseline = 'middle';
    contextPlayfield.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    contextPlayfield.font = "20px monospace";
    contextPlayfield.fillText('Nickname:', canvas.width / 2 - 60, canvas.height / 2 + 35);

    let imageData = contextPlayfield.getImageData(0, 0, canvas.width, canvas.height);

    input.addEventListener("input", () => {
        contextPlayfield.putImageData(imageData, 0,0);
        contextPlayfield.fillStyle = 'white';
        contextPlayfield.font = "25px monospace";

        contextPlayfield.fillText(input.value.toUpperCase(), canvas.width / 2 + 15, canvas.height / 2 + 35);
    });
}

const canvas = document.getElementById('game');
// @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
const contextPlayfield = canvas.getContext('2d');
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

// bucle de juego
function loop() {
    //@see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame#examples
    rAF = requestAnimationFrame(loop);
    contextPlayfield.clearRect(0,0,canvas.width,canvas.height);

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
        if (++count > 35) {
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

// Inicia el Juego
rAF = requestAnimationFrame(loop);