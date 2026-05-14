// Tetris Game Constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// Colors for each piece (index matches piece type)
const COLORS = [
    null,
    '#00f0f0', // I - Cyan
    '#0000f0', // J - Blue
    '#f0a000', // L - Orange
    '#f0f000', // O - Yellow
    '#00f000', // S - Green
    '#a000f0', // T - Purple
    '#f00000'  // Z - Red
];

// Tetromino shapes (each matrix is a piece)
const SHAPES = [
    [],
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]],                         // J
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]],                         // L
    [[0, 4, 4], [0, 4, 4], [0, 0, 0]],                         // O
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]],                         // S
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]],                         // T
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]]                          // Z
];

// Game State Variables
let board = [];
let currentPiece = null;
let holdPiece = null;
let canHold = true;
let nextPiece = null;
let score = 0;
let lines = 0;
let level = 1;
let isPaused = false;
let isGameOver = false;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let animationId = null;

// Canvas Elements
const gameCanvas = document.getElementById('game-canvas');
const holdCanvas = document.getElementById('hold-canvas');
const nextCanvas = document.getElementById('next-canvas');
const ctx = gameCanvas.getContext('2d');
const holdCtx = holdCanvas.getContext('2d');
const nextCtx = nextCanvas.getContext('2d');

// UI Elements
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const linesEl = document.getElementById('lines');
const finalScoreEl = document.getElementById('final-score');
const gameOverOverlay = document.getElementById('game-over-overlay');
const pauseOverlay = document.getElementById('pause-overlay');
const restartBtn = document.getElementById('restart-btn');
const themeToggle = document.getElementById('theme-toggle');
const leaderboardList = document.getElementById('leaderboard-list');

// Initialize the game board
function createBoard() {
    board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
}

// Create a new tetromino piece
function createPiece(type) {
    return {
        type: type,
        shape: SHAPES[type],
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2),
        y: 0
    };
}

// Generate a random piece type (1-7)
function randomPieceType() {
    return Math.floor(Math.random() * 7) + 1;
}

// Draw a single block on a canvas
function drawBlock(context, x, y, color, size) {
    context.fillStyle = color;
    context.fillRect(x * size, y * size, size - 1, size - 1);
    
    // Add a highlight effect
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(x * size, y * size, size - 1, size / 4);
    context.fillRect(x * size, y * size, size / 4, size - 1);
    
    // Add a shadow effect
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(x * size + size / 4, y * size + size - 1, size * 3 / 4, 1);
    context.fillRect(x * size + size - 1, y * size + size / 4, 1, size * 3 / 4);
}

// Draw the entire game board
function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Draw placed blocks
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(ctx, x, y, COLORS[board[y][x]], BLOCK_SIZE);
            }
        }
    }
}

// Draw a piece on a specific canvas
function drawPiece(piece, context, size, offsetX = 0, offsetY = 0) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(context, x + offsetX, y + offsetY, COLORS[value], size);
            }
        });
    });
}

// Draw the hold piece preview
function drawHold() {
    holdCtx.fillStyle = 'transparent';
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    if (holdPiece) {
        const offsetX = (holdCanvas.width / 25) - Math.floor(holdPiece.shape[0].length / 2);
        const offsetY = (holdCanvas.height / 25) - Math.floor(holdPiece.shape.length / 2);
        drawPiece(holdPiece, holdCtx, 25, offsetX, offsetY);
    }
}

// Draw the next piece preview
function drawNext() {
    nextCtx.fillStyle = 'transparent';
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (nextPiece) {
        const offsetX = (nextCanvas.width / 25) - Math.floor(nextPiece.shape[0].length / 2);
        const offsetY = (nextCanvas.height / 25) - Math.floor(nextPiece.shape.length / 2);
        drawPiece(nextPiece, nextCtx, 25, offsetX, offsetY);
    }
}

// Check for collisions
function collides(piece, offsetX = 0, offsetY = 0) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                let newX = piece.x + x + offsetX;
                let newY = piece.y + y + offsetY;
                
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Rotate a piece's matrix
function rotate(shape) {
    // Transpose the matrix
    const transposed = shape[0].map((_, i) => shape.map(row => row[i]));
    // Reverse each row to get clockwise rotation
    return transposed.map(row => row.reverse());
}

// Rotate the current piece if possible
function rotatePiece() {
    const rotatedShape = rotate(currentPiece.shape);
    const previousShape = currentPiece.shape;
    currentPiece.shape = rotatedShape;
    
    // Wall kick checks (try to move piece if rotation causes collision)
    let offset = 0;
    if (collides(currentPiece)) {
        offset = currentPiece.x > COLS / 2 ? -1 : 1;
    }
    
    if (collides(currentPiece, offset)) {
        offset *= 2;
        if (collides(currentPiece, offset)) {
            currentPiece.shape = previousShape;
        } else {
            currentPiece.x += offset;
        }
    }
}

// Merge the current piece into the board
function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                if (currentPiece.y + y < 0) {
                    gameOver();
                    return;
                }
                board[currentPiece.y + y][currentPiece.x + x] = value;
            }
        });
    });
}

// Clear completed lines and update score
function clearLines() {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++; // Check the same row again (since we shifted everything down)
        }
    }
    
    if (linesCleared > 0) {
        updateScore(linesCleared);
    }
}

// Update the score, lines, and level
function updateScore(linesCleared) {
    const points = [0, 100, 300, 500, 800];
    score += points[linesCleared] * level;
    lines += linesCleared;
    
    // Level up every 10 lines
    level = Math.floor(lines / 10) + 1;
    dropInterval = 1000 - (level - 1) * 100;
    if (dropInterval < 100) dropInterval = 100;
    
    scoreEl.textContent = score;
    levelEl.textContent = level;
    linesEl.textContent = lines;
}

// Handle holding/swapping a piece
function handleHold() {
    if (!canHold) return;
    canHold = false;
    
    if (!holdPiece) {
        holdPiece = createPiece(currentPiece.type);
        currentPiece = createPiece(nextPiece.type);
        nextPiece = createPiece(randomPieceType());
    } else {
        let temp = createPiece(holdPiece.type);
        holdPiece = createPiece(currentPiece.type);
        currentPiece = temp;
    }
    
    drawHold();
    drawNext();
}

// Hard drop the current piece
function hardDrop() {
    while (!collides(currentPiece, 0, 1)) {
        currentPiece.y++;
        score += 2;
    }
    scoreEl.textContent = score;
    mergePiece();
    clearLines();
    spawnPiece();
}

// Spawn a new piece
function spawnPiece() {
    currentPiece = createPiece(nextPiece.type);
    nextPiece = createPiece(randomPieceType());
    canHold = true;
    drawNext();
    
    if (collides(currentPiece)) {
        gameOver();
    }
}

// Game over
function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(animationId);
    finalScoreEl.textContent = score;
    gameOverOverlay.classList.remove('hidden');
    updateLeaderboard(score);
}

// Start a new game
function startGame() {
    isGameOver = false;
    isPaused = false;
    score = 0;
    lines = 0;
    level = 1;
    dropCounter = 0;
    dropInterval = 1000;
    holdPiece = null;
    canHold = true;
    
    scoreEl.textContent = score;
    levelEl.textContent = level;
    linesEl.textContent = lines;
    gameOverOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    
    createBoard();
    nextPiece = createPiece(randomPieceType());
    spawnPiece();
    drawHold();
    lastTime = performance.now();
    gameLoop();
}

// Toggle pause
function togglePause() {
    if (isGameOver) return;
    isPaused = !isPaused;
    
    if (isPaused) {
        pauseOverlay.classList.remove('hidden');
    } else {
        pauseOverlay.classList.add('hidden');
        lastTime = performance.now();
        gameLoop();
    }
}

// Update leaderboard
function updateLeaderboard(newScore) {
    let leaderboard = JSON.parse(localStorage.getItem('tetris-leaderboard') || '[]');
    leaderboard.push(newScore);
    leaderboard.sort((a, b) => b - a);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem('tetris-leaderboard', JSON.stringify(leaderboard));
    renderLeaderboard();
}

// Render leaderboard
function renderLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('tetris-leaderboard') || '[]');
    leaderboardList.innerHTML = leaderboard.map(score => `<li>${score}</li>`).join('');
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '☀️';
}

// Main game loop
function gameLoop(time = 0) {
    if (isPaused || isGameOver) return;
    
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    
    if (dropCounter > dropInterval) {
        if (!collides(currentPiece, 0, 1)) {
            currentPiece.y++;
        } else {
            mergePiece();
            clearLines();
            spawnPiece();
        }
        dropCounter = 0;
    }
    
    drawBoard();
    drawPiece(currentPiece, ctx, BLOCK_SIZE);
    
    animationId = requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', e => {
    if (isGameOver) return;
    
    if (e.key === 'p' || e.key === 'P') {
        togglePause();
        return;
    }
    
    if (isPaused) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            if (!collides(currentPiece, -1, 0)) currentPiece.x--;
            break;
        case 'ArrowRight':
            if (!collides(currentPiece, 1, 0)) currentPiece.x++;
            break;
        case 'ArrowDown':
            if (!collides(currentPiece, 0, 1)) {
                currentPiece.y++;
                score += 1;
                scoreEl.textContent = score;
                dropCounter = 0;
            }
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case ' ':
            hardDrop();
            break;
        case 'c':
        case 'C':
            handleHold();
            break;
    }
});

restartBtn.addEventListener('click', startGame);
themeToggle.addEventListener('click', toggleTheme);

// Initialize everything
renderLeaderboard();
startGame();
