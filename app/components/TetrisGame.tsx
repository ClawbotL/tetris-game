
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Define Tetromino shapes and colors
const SHAPES = {
  I: { shape: [[1, 1, 1, 1]], color: '#00f0f0' },
  O: { shape: [[1, 1], [1, 1]], color: '#f0f000' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f0a000' },
};

type ShapeKey = keyof typeof SHAPES;
type Position = { x: number; y: number };
type Tetromino = {
  shape: number[][];
  color: string;
  type: ShapeKey;
  pos: Position;
};

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;

const createEmptyGrid = () =>
  Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(null));

const randomTetromino = (): Tetromino => {
  const keys = Object.keys(SHAPES) as ShapeKey[];
  const type = keys[Math.floor(Math.random() * keys.length)];
  const { shape, color } = SHAPES[type];
  return {
    shape,
    color,
    type,
    pos: { x: Math.floor(GRID_WIDTH / 2) - Math.floor(shape[0].length / 2), y: 0 },
  };
};

const rotateMatrix = (matrix: number[][]) => {
  const result = [];
  for (let i = 0; i < matrix[0].length; i++) {
    const row = [];
    for (let j = matrix.length - 1; j >= 0; j--) {
      row.push(matrix[j][i]);
    }
    result.push(row);
  }
  return result;
};

const checkCollision = (
  grid: (string | null)[][],
  piece: Tetromino,
  offsetX = 0,
  offsetY = 0
) => {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x] !== 0) {
        const newX = piece.pos.x + x + offsetX;
        const newY = piece.pos.y + y + offsetY;
        if (
          newX < 0 ||
          newX >= GRID_WIDTH ||
          newY >= GRID_HEIGHT ||
          (newY >= 0 && grid[newY][newX])
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

export default function TetrisGame() {
  const [grid, setGrid] = useState<(string | null)[][]>(createEmptyGrid());
  const [currentPiece, setCurrentPiece] = useState<Tetromino>(randomTetromino());
  const [nextPiece, setNextPiece] = useState<Tetromino>(randomTetromino());
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const dropIntervalRef = useRef(1000);
  const lastDropTimeRef = useRef<number>(0);
  const requestRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastActionTimeRef = useRef(0);
  const actionCooldown = 100; // 100ms cooldown between actions to prevent double triggers

  const resetGame = useCallback(() => {
    setGrid(createEmptyGrid());
    setCurrentPiece(randomTetromino());
    setNextPiece(randomTetromino());
    setScore(0);
    setLinesCleared(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    dropIntervalRef.current = 1000;
    lastActionTimeRef.current = 0;
  }, []);

  const lockPiece = useCallback(() => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row]);
      currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0 && currentPiece.pos.y + y >= 0) {
            newGrid[currentPiece.pos.y + y][currentPiece.pos.x + x] = currentPiece.type;
          }
        });
      });

      // Clear lines
      let lines = 0;
      const clearedGrid = newGrid.filter(row => {
        if (row.every(cell => cell !== null)) {
          lines++;
          return false;
        }
        return true;
      });
      const finalGrid = [
        ...Array.from({ length: lines }, () => Array(GRID_WIDTH).fill(null)),
        ...clearedGrid,
      ];

      if (lines > 0) {
        setLinesCleared(prev => {
          const newLinesCleared = prev + lines;
          const newLevel = Math.floor(newLinesCleared / 10) + 1;
          setLevel(newLevel);
          dropIntervalRef.current = Math.max(100, 1000 - (newLevel - 1) * 100);
          setScore(prevScore => prevScore + [0, 40, 100, 300, 1200][lines] * level);
          return newLinesCleared;
        });
      }

      setCurrentPiece(nextPiece);
      setNextPiece(randomTetromino());

      // Check game over
      if (checkCollision(finalGrid, nextPiece)) {
        setGameOver(true);
      }

      return finalGrid;
    });
  }, [currentPiece, nextPiece, level]);

  const drop = useCallback(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < actionCooldown) return;
    lastActionTimeRef.current = now;
    
    if (!checkCollision(grid, currentPiece, 0, 1)) {
      setCurrentPiece(prev => ({ ...prev, pos: { ...prev.pos, y: prev.pos.y + 1 } }));
    } else {
      lockPiece();
    }
  }, [grid, currentPiece, lockPiece]);

  const hardDrop = useCallback(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < actionCooldown) return;
    lastActionTimeRef.current = now;
    
    let dropAmount = 0;
    while (!checkCollision(grid, currentPiece, 0, dropAmount + 1)) {
      dropAmount++;
    }
    // Update position first, then lock immediately
    setCurrentPiece(prev => ({ ...prev, pos: { ...prev.pos, y: prev.pos.y + dropAmount } }));
    setScore(prev => prev + dropAmount * 2);
    // Use setTimeout to let React update the state first before locking
    setTimeout(() => lockPiece(), 0);
  }, [grid, currentPiece, lockPiece]);

  const move = useCallback(
    (dir: number) => {
      const now = Date.now();
      if (now - lastActionTimeRef.current < actionCooldown) return;
      lastActionTimeRef.current = now;
      
      if (!checkCollision(grid, currentPiece, dir, 0)) {
        setCurrentPiece(prev => ({ ...prev, pos: { ...prev.pos, x: prev.pos.x + dir } }));
      }
    },
    [grid, currentPiece]
  );

  const rotate = useCallback(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < actionCooldown) return;
    lastActionTimeRef.current = now;
    
    const rotated = rotateMatrix(currentPiece.shape);
    const newPiece = { ...currentPiece, shape: rotated };
    // Wall kick
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!checkCollision(grid, { ...newPiece, pos: { ...newPiece.pos, x: newPiece.pos.x + kick } })) {
        setCurrentPiece({ ...newPiece, pos: { ...newPiece.pos, x: newPiece.pos.x + kick } });
        return;
      }
    }
  }, [grid, currentPiece]);

  const gameLoopRef = useRef<((time: number) => void) | null>(null);

  const gameLoop = useCallback(
    (time: number) => {
      if (gameOver || isPaused) {
        return;
      }

      if (time - lastDropTimeRef.current > dropIntervalRef.current) {
        drop();
        lastDropTimeRef.current = time;
      }

      requestRef.current = requestAnimationFrame(gameLoopRef.current!);
    },
    [gameOver, isPaused, drop]
  );

  // Keep ref in sync
  useEffect(() => {
    gameLoopRef.current = gameLoop;
  }, [gameLoop]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
        return;
      }
      if (isPaused) return;

      switch (e.key) {
        case 'ArrowLeft':
          move(-1);
          break;
        case 'ArrowRight':
          move(1);
          break;
        case 'ArrowDown':
          drop();
          setScore(prev => prev + 1);
          break;
        case 'ArrowUp':
          rotate();
          break;
        case ' ':
          hardDrop();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused, move, drop, hardDrop, rotate, score]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (gameOver || isPaused || !touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 30) {
        move(1);
      } else if (deltaX < -30) {
        move(-1);
      }
    } else {
      if (deltaY > 50) {
        hardDrop();
      } else if (deltaY > 20) {
        drop();
        setScore(prev => prev + 1);
      } else if (deltaY < -30) {
        rotate();
      }
    }
    touchStartRef.current = null;
  };

  // Render the grid with current piece
  const renderGrid = () => {
    const displayGrid = grid.map(row => [...row]);
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0 && currentPiece.pos.y + y >= 0) {
          displayGrid[currentPiece.pos.y + y][currentPiece.pos.x + x] = currentPiece.type;
        }
      });
    });

    return (
      <div className="grid gap-[2px] bg-background border-2 border-primary neon-border-primary p-2 rounded-lg" style={{ gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))`, width: 'min(350px, 90vw)' }}>
        {displayGrid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`w-full aspect-square tetris-cell rounded-sm ${cell ? `tetris-cell-filled-${cell}` : ''}`}
            />
          ))
        )}
      </div>
    );
  };

  const renderNextPiece = () => {
    const size = 4;
    const padding = size - nextPiece.shape.length;
    const padLeft = Math.floor(padding / 2);
    return (
      <div className="grid gap-[2px] bg-background border border-secondary p-3 rounded-lg" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
        {Array.from({ length: size }).map((_, y) =>
          Array.from({ length: size }).map((_, x) => {
            const cellY = y - padLeft;
            const cellX = x - padLeft;
            const cell =
              cellY >= 0 &&
              cellY < nextPiece.shape.length &&
              cellX >= 0 &&
              cellX < nextPiece.shape[0].length
                ? nextPiece.shape[cellY][cellX] ? nextPiece.type : 0
                : 0;
            return (
              <div
                key={`${x}-${y}`}
                className={`w-8 h-8 tetris-cell rounded-sm ${cell ? `tetris-cell-filled-${cell}` : ''}`}
              />
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F23] via-[#1A1A3E] to-[#0F0F23] text-foreground flex flex-col items-center justify-center p-4 relative">
      <div className="w-full max-w-7xl flex flex-col xl:flex-row gap-8 items-center justify-center">
        {/* Left Panel: Score, Level, Lines */}
        <div className="flex flex-col gap-4 w-full xl:w-auto">
          <div className="bg-background/80 backdrop-blur-sm border border-primary neon-border-primary p-6 rounded-xl text-center">
            <h2 className="font-press-start text-xs mb-3 neon-text-primary">SCORE</h2>
            <p className="font-vt323 text-5xl">{score}</p>
          </div>
          <div className="bg-background/80 backdrop-blur-sm border border-primary neon-border-primary p-6 rounded-xl text-center">
            <h2 className="font-press-start text-xs mb-3 neon-text-primary">LEVEL</h2>
            <p className="font-vt323 text-5xl">{level}</p>
          </div>
          <div className="bg-background/80 backdrop-blur-sm border border-primary neon-border-primary p-6 rounded-xl text-center">
            <h2 className="font-press-start text-xs mb-3 neon-text-primary">LINES</h2>
            <p className="font-vt323 text-5xl">{linesCleared}</p>
          </div>
        </div>

        {/* Main Game Area */}
        <div
          className="flex flex-col items-center gap-6 touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <h1 className="font-press-start text-3xl md:text-5xl neon-text-cta mb-2">TETRIS</h1>
          
          {/* Next Piece (Mobile top, Desktop here) */}
          <div className="flex flex-col items-center gap-2">
            <h2 className="font-press-start text-xs mb-1">NEXT</h2>
            {renderNextPiece()}
          </div>
          
          {renderGrid()}
          
          {/* Controls Buttons (for mobile/touch) */}
          <div className="mt-2 flex flex-col gap-3 w-full max-w-sm md:hidden">
            <div className="flex justify-center gap-8">
              <button
                className="game-button rounded-full w-16 h-16 flex items-center justify-center text-2xl touch-none shadow-lg"
                onClick={() => move(-1)}
                disabled={gameOver || isPaused}
              >
                ←
              </button>
              <button
                className="game-button rounded-full w-16 h-16 flex items-center justify-center text-2xl touch-none shadow-lg"
                onClick={rotate}
                disabled={gameOver || isPaused}
              >
                ↻
              </button>
              <button
                className="game-button rounded-full w-16 h-16 flex items-center justify-center text-2xl touch-none shadow-lg"
                onClick={() => move(1)}
                disabled={gameOver || isPaused}
              >
                →
              </button>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <button
                className="game-button rounded-lg px-6 py-3 touch-none shadow-lg"
                onClick={() => { setIsPaused(prev => !prev); }}
                disabled={gameOver}
              >
                {isPaused ? 'RESUME' : 'PAUSE'}
              </button>
              <button
                className="game-button rounded-lg px-6 py-3 touch-none shadow-lg"
                onClick={() => { drop(); setScore(prev => prev + 1); }}
                disabled={gameOver || isPaused}
              >
                ↓
              </button>
              <button
                className="game-button rounded-lg px-6 py-3 touch-none shadow-lg"
                onClick={hardDrop}
                disabled={gameOver || isPaused}
              >
                DROP
              </button>
            </div>
            <button
              className="game-button neon-border-cta rounded-lg px-8 py-4 mt-2 touch-none shadow-lg text-lg"
              onClick={resetGame}
            >
              NEW GAME
            </button>
          </div>
          
          {/* Desktop Controls */}
          <div className="hidden md:flex flex-col gap-4 mt-4">
            <div className="flex gap-6">
              <button
                className="game-button px-8 py-4 rounded-lg shadow-lg"
                onClick={() => { setIsPaused(prev => !prev); }}
                disabled={gameOver}
              >
                {isPaused ? 'RESUME' : 'PAUSE'}
              </button>
              <button
                className="game-button px-8 py-4 rounded-lg shadow-lg"
                onClick={hardDrop}
                disabled={gameOver || isPaused}
              >
                HARD DROP
              </button>
            </div>
            <button
              className="game-button neon-border-cta px-10 py-4 rounded-lg shadow-lg text-lg"
              onClick={resetGame}
            >
              NEW GAME
            </button>
          </div>
        </div>

        {/* Right Panel: Instructions */}
        <div className="bg-background/80 backdrop-blur-sm border border-secondary p-6 rounded-xl hidden xl:block">
          <h2 className="font-press-start text-xs mb-5 neon-text-primary">CONTROLS</h2>
          <ul className="space-y-4 text-xl">
            <li><strong>← →</strong> Move Left/Right</li>
            <li><strong>↑</strong> Rotate Piece</li>
            <li><strong>↓</strong> Soft Drop</li>
            <li><strong>SPACE</strong> Hard Drop</li>
            <li><strong>P</strong> Pause Game</li>
          </ul>
        </div>
      </div>

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-background/95 backdrop-blur-md border-2 border-cta neon-border-cta p-10 rounded-xl text-center">
            <h2 className="font-press-start text-3xl neon-text-cta mb-8">GAME OVER</h2>
            <p className="text-4xl mb-10">Final Score: <span className="font-bold text-cta">{score}</span></p>
            <button
              className="game-button neon-border-cta px-10 py-5 rounded-lg shadow-lg text-xl"
              onClick={resetGame}
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && !gameOver && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-background/95 backdrop-blur-md border-2 border-primary neon-border-primary p-10 rounded-xl text-center">
            <h2 className="font-press-start text-4xl neon-text-primary mb-8">PAUSED</h2>
            <button
              className="game-button px-10 py-5 rounded-lg shadow-lg text-xl"
              onClick={() => setIsPaused(false)}
            >
              RESUME
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

