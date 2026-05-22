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

// Calculate ghost piece position (where piece would land)
const getGhostPosition = (grid: (string | null)[][], piece: Tetromino) => {
  let dropAmount = 0;
  while (!checkCollision(grid, piece, 0, dropAmount + 1)) {
    dropAmount++;
  }
  return { ...piece.pos, y: piece.pos.y + dropAmount };
};

export default function TetrisGame() {
  const [grid, setGrid] = useState<(string | null)[][]>(createEmptyGrid());
  const [currentPiece, setCurrentPiece] = useState<Tetromino>(randomTetromino());
  const [nextPiece, setNextPiece] = useState<Tetromino>(randomTetromino());
  const [holdPiece, setHoldPiece] = useState<Tetromino | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [clearingRows, setClearingRows] = useState<number[]>([]);
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
    setHoldPiece(null);
    setCanHold(true);
    setScore(0);
    setLinesCleared(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    setClearingRows([]);
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

      // Find lines to clear
      const linesToClear: number[] = [];
      newGrid.forEach((row, y) => {
        if (row.every(cell => cell !== null)) {
          linesToClear.push(y);
        }
      });

      if (linesToClear.length > 0) {
        // Show clearing animation first
        setClearingRows(linesToClear);
        
        // Wait for animation before clearing lines
        setTimeout(() => {
          setGrid(prev => {
            const clearedGrid = prev.filter((_, y) => !linesToClear.includes(y));
            const finalGrid = [
              ...Array.from({ length: linesToClear.length }, () => Array(GRID_WIDTH).fill(null)),
              ...clearedGrid,
            ];
            return finalGrid;
          });
          
          setLinesCleared(prev => {
            const newLinesCleared = prev + linesToClear.length;
            const newLevel = Math.floor(newLinesCleared / 10) + 1;
            setLevel(newLevel);
            dropIntervalRef.current = Math.max(100, 1000 - (newLevel - 1) * 100);
            setScore(prevScore => prevScore + [0, 40, 100, 300, 1200][linesToClear.length] * level);
            return newLinesCleared;
          });
          
          setClearingRows([]);
        }, 250);
      }

      setCurrentPiece(nextPiece);
      setNextPiece(randomTetromino());
      setCanHold(true);

      // Check game over
      if (linesToClear.length === 0 && checkCollision(newGrid, nextPiece)) {
        setGameOver(true);
      }

      return newGrid;
    });
  }, [currentPiece, nextPiece, level]);

  const drop = useCallback(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < actionCooldown || clearingRows.length > 0) return;
    lastActionTimeRef.current = now;
    
    if (!checkCollision(grid, currentPiece, 0, 1)) {
      setCurrentPiece(prev => ({ ...prev, pos: { ...prev.pos, y: prev.pos.y + 1 } }));
    } else {
      lockPiece();
    }
  }, [grid, currentPiece, lockPiece, clearingRows]);

  const hardDrop = useCallback(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < actionCooldown || clearingRows.length > 0) return;
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
  }, [grid, currentPiece, lockPiece, clearingRows]);

  const move = useCallback(
    (dir: number) => {
      const now = Date.now();
      if (now - lastActionTimeRef.current < actionCooldown || clearingRows.length > 0) return;
      lastActionTimeRef.current = now;
      
      if (!checkCollision(grid, currentPiece, dir, 0)) {
        setCurrentPiece(prev => ({ ...prev, pos: { ...prev.pos, x: prev.pos.x + dir } }));
      }
    },
    [grid, currentPiece, clearingRows]
  );

  const rotate = useCallback(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < actionCooldown || clearingRows.length > 0) return;
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
  }, [grid, currentPiece, clearingRows]);

  const handleHold = useCallback(() => {
    if (!canHold || clearingRows.length > 0) return;
    
    if (holdPiece) {
      // Swap current and hold
      const temp = { ...currentPiece };
      setCurrentPiece({ ...holdPiece, pos: { x: Math.floor(GRID_WIDTH / 2) - Math.floor(holdPiece.shape[0].length / 2), y: 0 } });
      setHoldPiece(temp);
    } else {
      // Hold current piece, get new next piece
      setHoldPiece(currentPiece);
      setCurrentPiece(nextPiece);
      setNextPiece(randomTetromino());
    }
    setCanHold(false);
  }, [currentPiece, nextPiece, holdPiece, canHold, clearingRows]);

  const gameLoopRef = useRef<((time: number) => void) | null>(null);

  const gameLoop = useCallback(
    (time: number) => {
      if (gameOver || isPaused || clearingRows.length > 0) {
        return;
      }

      if (time - lastDropTimeRef.current > dropIntervalRef.current) {
        drop();
        lastDropTimeRef.current = time;
      }

      requestRef.current = requestAnimationFrame(gameLoopRef.current!);
    },
    [gameOver, isPaused, drop, clearingRows]
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
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setIsPaused(prev => !prev);
        return;
      }
      if (isPaused || clearingRows.length > 0) return;

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
        case 'c':
        case 'C':
          handleHold();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused, move, drop, hardDrop, rotate, score, handleHold, clearingRows]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (gameOver || isPaused || !touchStartRef.current || clearingRows.length > 0) return;
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

  // Render a single piece (for hold/next)
  const renderSmallPiece = (piece: Tetromino | null, size = 4) => {
    if (!piece) {
      return (
        <div className="grid gap-[2px] bg-background border border-secondary p-3 rounded-lg" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
          {Array.from({ length: size * size }).map((_, i) => (
            <div key={i} className="w-7 h-7 md:w-8 md:h-8 tetris-cell rounded-sm" />
          ))}
        </div>
      );
    }
    const padLeft = Math.floor((size - piece.shape[0].length) / 2);
    const padTop = Math.floor((size - piece.shape.length) / 2);
    return (
      <div className="grid gap-[2px] bg-background border border-secondary p-3 rounded-lg" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
        {Array.from({ length: size }).map((_, y) =>
          Array.from({ length: size }).map((_, x) => {
            const cellY = y - padTop;
            const cellX = x - padLeft;
            const cell =
              cellY >= 0 &&
              cellY < piece.shape.length &&
              cellX >= 0 &&
              cellX < piece.shape[0].length
                ? piece.shape[cellY][cellX] ? piece.type : 0
                : 0;
            return (
              <div
                key={`${x}-${y}`}
                className={`w-7 h-7 md:w-8 md:h-8 tetris-cell rounded-sm ${cell ? `tetris-cell-filled-${cell}` : ''}`}
              />
            );
          })
        )}
      </div>
    );
  };

  // Render the grid with current piece and ghost
  const renderGrid = () => {
    const displayGrid = grid.map(row => [...row]);
    const ghostPos = getGhostPosition(grid, currentPiece);
    
    // Draw ghost first
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0 && ghostPos.y + y >= 0) {
          if (!displayGrid[ghostPos.y + y][ghostPos.x + x]) {
            displayGrid[ghostPos.y + y][ghostPos.x + x] = `ghost-${currentPiece.type}`;
          }
        }
      });
    });
    
    // Draw current piece
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0 && currentPiece.pos.y + y >= 0) {
          displayGrid[currentPiece.pos.y + y][currentPiece.pos.x + x] = currentPiece.type;
        }
      });
    });

    return (
      <div className="grid gap-[2px] bg-background border-2 border-primary neon-border-primary p-2 rounded-lg" style={{ gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))`, width: 'min(280px, 90vw)' }}>
        {displayGrid.map((row, y) =>
          row.map((cell, x) => {
            const isClearing = clearingRows.includes(y);
            let cellClass = '';
            if (typeof cell === 'string' && cell.startsWith('ghost-')) {
              cellClass = `tetris-cell-ghost-${cell.replace('ghost-', '')}`;
            } else if (cell) {
              cellClass = `tetris-cell-filled-${cell}`;
            }
            return (
              <div
                key={`${x}-${y}`}
                className={`w-full aspect-square tetris-cell rounded-sm ${cellClass} ${isClearing ? 'tetris-cell-clearing' : ''}`}
              />
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#0A0A1A] via-[#151530] to-[#0A0A1A] text-foreground flex flex-col items-center justify-center p-2 md:p-4 relative overflow-hidden select-none">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-4 md:gap-8 items-center justify-center">
        {/* Left Panel: Hold Piece + Stats */}
        <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto">
          <div className="bg-background/85 backdrop-blur-md border border-secondary neon-border-secondary p-3 md:p-4 rounded-xl text-center flex-1 lg:flex-none">
            <h2 className="font-press-start text-[10px] md:text-xs mb-2 neon-text-secondary">HOLD</h2>
            {renderSmallPiece(holdPiece)}
          </div>
          <div className="flex flex-col gap-2 md:gap-3 flex-1 lg:flex-none">
            <div className="bg-background/85 backdrop-blur-md border border-primary neon-border-primary p-3 md:p-4 rounded-xl text-center">
              <h2 className="font-press-start text-[10px] md:text-xs mb-1 md:mb-2 neon-text-primary">SCORE</h2>
              <p className="font-vt323 text-3xl md:text-4xl lg:text-5xl">{score}</p>
            </div>
            <div className="bg-background/85 backdrop-blur-md border border-primary neon-border-primary p-3 md:p-4 rounded-xl text-center">
              <h2 className="font-press-start text-[10px] md:text-xs mb-1 md:mb-2 neon-text-primary">LEVEL</h2>
              <p className="font-vt323 text-3xl md:text-4xl lg:text-5xl">{level}</p>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div
          className="flex flex-col items-center gap-3 md:gap-4 touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <h1 className="font-press-start text-xl md:text-3xl lg:text-4xl neon-text-cta mb-1 md:mb-2">TETRIS</h1>
          
          {renderGrid()}
          
          {/* Controls Buttons (for mobile/touch) */}
          <div className="flex flex-col gap-2 md:gap-3 w-full max-w-xs">
            <div className="flex justify-center gap-4 md:gap-6">
              <button
                className="game-button rounded-full w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center text-xl md:text-2xl touch-none shadow-lg"
                onClick={() => move(-1)}
                onTouchStart={(e) => { e.preventDefault(); move(-1); }}
                disabled={gameOver || isPaused || clearingRows.length > 0}
              >
                ←
              </button>
              <button
                className="game-button rounded-full w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center text-xl md:text-2xl touch-none shadow-lg"
                onClick={rotate}
                onTouchStart={(e) => { e.preventDefault(); rotate(); }}
                disabled={gameOver || isPaused || clearingRows.length > 0}
              >
                ↻
              </button>
              <button
                className="game-button rounded-full w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center text-xl md:text-2xl touch-none shadow-lg"
                onClick={() => move(1)}
                onTouchStart={(e) => { e.preventDefault(); move(1); }}
                disabled={gameOver || isPaused || clearingRows.length > 0}
              >
                →
              </button>
            </div>
            <div className="flex justify-center gap-3 md:gap-4">
              <button
                className="game-button rounded-lg px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm touch-none shadow-lg"
                onClick={() => { setIsPaused(prev => !prev); }}
                onTouchStart={(e) => { e.preventDefault(); setIsPaused(prev => !prev); }}
                disabled={gameOver}
              >
                {isPaused ? 'RESUME' : 'PAUSE'}
              </button>
              <button
                className="game-button rounded-lg px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm touch-none shadow-lg"
                onClick={() => { drop(); setScore(prev => prev + 1); }}
                onTouchStart={(e) => { e.preventDefault(); drop(); setScore(prev => prev + 1); }}
                disabled={gameOver || isPaused || clearingRows.length > 0}
              >
                ↓
              </button>
              <button
                className="game-button rounded-lg px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm touch-none shadow-lg"
                onClick={handleHold}
                onTouchStart={(e) => { e.preventDefault(); handleHold(); }}
                disabled={gameOver || isPaused || clearingRows.length > 0 || !canHold}
              >
                HOLD
              </button>
              <button
                className="game-button rounded-lg px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm touch-none shadow-lg"
                onClick={hardDrop}
                onTouchStart={(e) => { e.preventDefault(); hardDrop(); }}
                disabled={gameOver || isPaused || clearingRows.length > 0}
              >
                DROP
              </button>
            </div>
            <button
              className="game-button neon-border-cta rounded-lg px-6 py-3 md:px-8 md:py-4 text-sm md:text-lg touch-none shadow-lg"
              onClick={resetGame}
              onTouchStart={(e) => { e.preventDefault(); resetGame(); }}
            >
              NEW GAME
            </button>
          </div>
        </div>

        {/* Right Panel: Next Piece + Lines + Instructions */}
        <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto">
          <div className="flex flex-col gap-2 md:gap-3 flex-1 lg:flex-none">
            <div className="bg-background/85 backdrop-blur-md border border-primary neon-border-primary p-3 md:p-4 rounded-xl text-center">
              <h2 className="font-press-start text-[10px] md:text-xs mb-1 md:mb-2 neon-text-primary">LINES</h2>
              <p className="font-vt323 text-3xl md:text-4xl lg:text-5xl">{linesCleared}</p>
            </div>
          </div>
          <div className="bg-background/85 backdrop-blur-md border border-secondary neon-border-secondary p-3 md:p-4 rounded-xl text-center flex-1 lg:flex-none">
            <h2 className="font-press-start text-[10px] md:text-xs mb-2 neon-text-secondary">NEXT</h2>
            {renderSmallPiece(nextPiece)}
          </div>
        </div>
      </div>

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-background/95 backdrop-blur-md border-2 border-cta neon-border-cta p-6 md:p-10 rounded-xl text-center">
            <h2 className="font-press-start text-2xl md:text-3xl neon-text-cta mb-6 md:mb-8">GAME OVER</h2>
            <p className="text-2xl md:text-4xl mb-6 md:mb-10">Final Score: <span className="font-bold text-cta">{score}</span></p>
            <button
              className="game-button neon-border-cta px-8 py-4 md:px-10 md:py-5 rounded-lg shadow-lg text-base md:text-xl"
              onClick={resetGame}
              onTouchStart={(e) => { e.preventDefault(); resetGame(); }}
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && !gameOver && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-background/95 backdrop-blur-md border-2 border-primary neon-border-primary p-6 md:p-10 rounded-xl text-center">
            <h2 className="font-press-start text-2xl md:text-4xl neon-text-primary mb-6 md:mb-8">PAUSED</h2>
            <button
              className="game-button px-8 py-4 md:px-10 md:py-5 rounded-lg shadow-lg text-base md:text-xl"
              onClick={() => setIsPaused(false)}
              onTouchStart={(e) => { e.preventDefault(); setIsPaused(false); }}
            >
              RESUME
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
