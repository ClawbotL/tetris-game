'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Define Tetromino shapes and colors
const SHAPES = {
  I: { shape: [[1, 1, 1, 1]], color: '#22D3EE' },
  O: { shape: [[1, 1], [1, 1]], color: '#FACC15' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#A855F7' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#34D399' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#EF4444' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#3B82F6' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#F97316' },
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

  const gridRef = useRef(grid);
  const currentPieceRef = useRef(currentPiece);
  const nextPieceRef = useRef(nextPiece);
  const holdPieceRef = useRef(holdPiece);
  const scoreRef = useRef(score);
  const linesClearedRef = useRef(linesCleared);
  const levelRef = useRef(level);
  const isPausedRef = useRef(isPaused);
  const gameOverRef = useRef(gameOver);
  const clearingRowsRef = useRef(clearingRows);

  const dropIntervalRef = useRef(1000);
  const lastDropTimeRef = useRef<number>(0);
  const requestRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastActionTimeRef = useRef(0);
  const actionCooldown = 100;

  useEffect(() => {
    gridRef.current = grid;
    currentPieceRef.current = currentPiece;
    nextPieceRef.current = nextPiece;
    holdPieceRef.current = holdPiece;
    scoreRef.current = score;
    linesClearedRef.current = linesCleared;
    levelRef.current = level;
    isPausedRef.current = isPaused;
    gameOverRef.current = gameOver;
    clearingRowsRef.current = clearingRows;
  }, [grid, currentPiece, nextPiece, holdPiece, score, linesCleared, level, isPaused, gameOver, clearingRows]);

  const resetGame = useCallback(() => {
    const newGrid = createEmptyGrid();
    const newPiece = randomTetromino();
    const newNext = randomTetromino();
    setGrid(newGrid);
    setCurrentPiece(newPiece);
    setNextPiece(newNext);
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
    const grid = gridRef.current;
    const currentPiece = currentPieceRef.current;
    const nextPiece = nextPieceRef.current;
    const level = levelRef.current;

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row]);
      currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0 && currentPiece.pos.y + y >= 0) {
            newGrid[currentPiece.pos.y + y][currentPiece.pos.x + x] = currentPiece.type;
          }
        });
      });

      const linesToClear: number[] = [];
      newGrid.forEach((row, y) => {
        if (row.every(cell => cell !== null)) {
          linesToClear.push(y);
        }
      });

      if (linesToClear.length > 0) {
        setClearingRows(linesToClear);

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
            setScore(prevScore => prevScore + [0, 100, 300, 500, 800][linesToClear.length] * level);
            return newLinesCleared;
          });

          setClearingRows([]);
        }, 250);
      }

      setCurrentPiece(nextPiece);
      setNextPiece(randomTetromino());
      setCanHold(true);

      if (linesToClear.length === 0 && checkCollision(newGrid, nextPiece)) {
        setGameOver(true);
      }

      return newGrid;
    });
  }, []);

  const drop = useCallback(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < actionCooldown) return;
    if (isPausedRef.current || gameOverRef.current || clearingRowsRef.current.length > 0) return;
    lastActionTimeRef.current = now;

    const grid = gridRef.current;
    const currentPiece = currentPieceRef.current;

    if (!checkCollision(grid, currentPiece, 0, 1)) {
      setCurrentPiece(prev => ({ ...prev, pos: { ...prev.pos, y: prev.pos.y + 1 } }));
    } else {
      lockPiece();
    }
  }, [lockPiece]);

  const hardDrop = useCallback(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < actionCooldown) return;
    if (isPausedRef.current || gameOverRef.current || clearingRowsRef.current.length > 0) return;
    lastActionTimeRef.current = now;

    const grid = gridRef.current;
    const currentPiece = currentPieceRef.current;
    const score = scoreRef.current;

    let dropAmount = 0;
    while (!checkCollision(grid, currentPiece, 0, dropAmount + 1)) {
      dropAmount++;
    }
    setCurrentPiece(prev => ({ ...prev, pos: { ...prev.pos, y: prev.pos.y + dropAmount } }));
    setScore(score + dropAmount * 2);
    setTimeout(() => lockPiece(), 0);
  }, [lockPiece]);

  const move = useCallback((dir: number) => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < actionCooldown) return;
    if (isPausedRef.current || gameOverRef.current || clearingRowsRef.current.length > 0) return;
    lastActionTimeRef.current = now;

    const grid = gridRef.current;
    const currentPiece = currentPieceRef.current;

    if (!checkCollision(grid, currentPiece, dir, 0)) {
      setCurrentPiece(prev => ({ ...prev, pos: { ...prev.pos, x: prev.pos.x + dir } }));
    }
  }, []);

  const rotate = useCallback(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < actionCooldown) return;
    if (isPausedRef.current || gameOverRef.current || clearingRowsRef.current.length > 0) return;
    lastActionTimeRef.current = now;

    const grid = gridRef.current;
    const currentPiece = currentPieceRef.current;
    const rotated = rotateMatrix(currentPiece.shape);
    const newPiece = { ...currentPiece, shape: rotated };
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!checkCollision(grid, { ...newPiece, pos: { ...newPiece.pos, x: newPiece.pos.x + kick } })) {
        setCurrentPiece({ ...newPiece, pos: { ...newPiece.pos, x: newPiece.pos.x + kick } });
        return;
      }
    }
  }, []);

  const handleHold = useCallback(() => {
    if (!canHold || isPausedRef.current || gameOverRef.current || clearingRowsRef.current.length > 0) return;

    const currentPiece = currentPieceRef.current;
    const holdPiece = holdPieceRef.current;
    const nextPiece = nextPieceRef.current;

    if (holdPiece) {
      setHoldPiece({ ...currentPiece, pos: { x: Math.floor(GRID_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2), y: 0 } });
      setCurrentPiece({ ...holdPiece, pos: { x: Math.floor(GRID_WIDTH / 2) - Math.floor(holdPiece.shape[0].length / 2), y: 0 } });
    } else {
      setHoldPiece({ ...currentPiece, pos: { x: Math.floor(GRID_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2), y: 0 } });
      setCurrentPiece(nextPiece);
      setNextPiece(randomTetromino());
    }
    setCanHold(false);
  }, [canHold]);

  const gameLoop = useCallback(
    (time: number) => {
      if (gameOverRef.current || isPausedRef.current || clearingRowsRef.current.length > 0) {
        requestRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      if (time - lastDropTimeRef.current > dropIntervalRef.current) {
        drop();
        lastDropTimeRef.current = time;
      }

      requestRef.current = requestAnimationFrame(gameLoop);
    },
    [drop]
  );

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
      if (gameOverRef.current) return;
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setIsPaused(prev => !prev);
        return;
      }
      if (isPausedRef.current || clearingRowsRef.current.length > 0) return;

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
  }, [move, drop, hardDrop, rotate, handleHold]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (gameOverRef.current || isPausedRef.current || !touchStartRef.current || clearingRowsRef.current.length > 0) return;
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

  const renderSmallPiece = (piece: Tetromino | null, size = 4) => {
    return (
      <div className="grid gap-[1px] bg-slate-900/40 p-1.5 rounded-lg" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
        {Array.from({ length: size }).map((_, y) =>
          Array.from({ length: size }).map((_, x) => {
            if (!piece) {
              return <div key={`${x}-${y}`} className="w-5 h-5 tetris-cell" />;
            }
            const padLeft = Math.floor((size - piece.shape[0].length) / 2);
            const padTop = Math.floor((size - piece.shape.length) / 2);
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
                className={`w-5 h-5 tetris-cell rounded-sm ${cell ? `tetris-cell-filled-${cell}` : ''}`}
              />
            );
          })
        )}
      </div>
    );
  };

  const renderGrid = (gridWidth: string = 'min(260px, 88vw)') => {
    const displayGrid = grid.map(row => [...row]);
    if (level === 1) {
      const ghostPos = getGhostPosition(grid, currentPiece);
      currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0 && ghostPos.y + y >= 0) {
            if (!displayGrid[ghostPos.y + y][ghostPos.x + x]) {
              displayGrid[ghostPos.y + y][ghostPos.x + x] = `ghost-${currentPiece.type}`;
            }
          }
        });
      });
    }
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0 && currentPiece.pos.y + y >= 0) {
          displayGrid[currentPiece.pos.y + y][currentPiece.pos.x + x] = currentPiece.type;
        }
      });
    });

    return (
      <div className="grid gap-[1px] bg-slate-900/80 border border-slate-700/50 p-1 rounded-xl" style={{ gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))`, width: gridWidth }}>
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
    <div className="h-screen w-full flex flex-col items-center justify-between p-2 md:p-4 select-none overflow-hidden relative">
      {/* Mobile Layout */}
      <div className="flex flex-col gap-1 w-full items-center lg:hidden flex-1">
        <h1 className="font-press-start text-lg text-white text-glow-accent mb-1">TETRIS</h1>
        <div className="flex flex-row gap-2 w-full justify-center">
          <div className="flex flex-col gap-1 items-center">
            <div className="game-panel p-1.5 text-center">
              <h2 className="font-press-start text-[6px] mb-1 text-slate-400">HOLD</h2>
              {renderSmallPiece(holdPiece)}
            </div>
            <div className="game-panel p-1.5 text-center">
              <h2 className="font-press-start text-[6px] mb-0.5 text-slate-400">SCORE</h2>
              <p className="font-vt323 text-lg text-indigo-300 font-bold">{score.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 touch-none" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {renderGrid('min(260px, 88vw)')}
          </div>

          <div className="flex flex-col gap-1 items-center">
            <div className="game-panel p-1.5 text-center">
              <h2 className="font-press-start text-[6px] mb-1 text-slate-400">NEXT</h2>
              {renderSmallPiece(nextPiece)}
            </div>
            <div className="game-panel p-1.5 text-center">
              <h2 className="font-press-start text-[6px] mb-0.5 text-slate-400">LINES</h2>
              <p className="font-vt323 text-lg text-emerald-300 font-bold">{linesCleared}</p>
            </div>
            <div className="game-panel p-1.5 text-center">
              <h2 className="font-press-start text-[6px] mb-0.5 text-slate-400">LEVEL</h2>
              <p className="font-vt323 text-lg text-indigo-300 font-bold">{level}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full max-w-sm items-center mt-2">
          <div className="flex justify-center gap-6">
            <button
              className="game-button rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-4xl md:text-5xl touch-none"
              onClick={(e) => { e.preventDefault(); move(-1); }}
              onTouchStart={(e) => { e.preventDefault(); move(-1); }}
              disabled={gameOver || isPaused || clearingRows.length > 0}
            >
              ←
            </button>
            <button
              className="game-button rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-4xl md:text-5xl touch-none"
              onClick={(e) => { e.preventDefault(); rotate(); }}
              onTouchStart={(e) => { e.preventDefault(); rotate(); }}
              disabled={gameOver || isPaused || clearingRows.length > 0}
            >
              ↻
            </button>
            <button
              className="game-button rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-4xl md:text-5xl touch-none"
              onClick={(e) => { e.preventDefault(); move(1); }}
              onTouchStart={(e) => { e.preventDefault(); move(1); }}
              disabled={gameOver || isPaused || clearingRows.length > 0}
            >
              →
            </button>
          </div>

          <div className="flex justify-center gap-6">
            <button
              className="game-button px-12 py-6 md:px-16 md:py-8 text-[16px] md:text-[18px] touch-none"
              onClick={(e) => { e.preventDefault(); drop(); setScore(prev => prev + 1); }}
              onTouchStart={(e) => { e.preventDefault(); drop(); setScore(prev => prev + 1); }}
              disabled={gameOver || isPaused || clearingRows.length > 0}
            >
              ↓
            </button>
            <button
              className="game-button px-12 py-6 md:px-16 md:py-8 text-[16px] md:text-[18px] touch-none"
              onClick={(e) => { e.preventDefault(); handleHold(); }}
              onTouchStart={(e) => { e.preventDefault(); handleHold(); }}
              disabled={gameOver || isPaused || clearingRows.length > 0 || !canHold}
            >
              HOLD
            </button>
            <button
              className="game-button game-button-primary px-12 py-6 md:px-16 md:py-8 text-[16px] md:text-[18px] touch-none"
              onClick={(e) => { e.preventDefault(); hardDrop(); }}
              onTouchStart={(e) => { e.preventDefault(); hardDrop(); }}
              disabled={gameOver || isPaused || clearingRows.length > 0}
            >
              DROP
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-4 md:gap-8 items-center justify-center hidden lg:flex flex-1">
        <div className="flex flex-col gap-3 w-full lg:w-auto lg:order-1">
          <div className="game-panel p-2 md:p-3 text-center">
            <h2 className="font-press-start text-[7px] md:text-[8px] mb-1 text-slate-400">HOLD</h2>
            {renderSmallPiece(holdPiece)}
          </div>
          <div className="game-panel p-4 text-center">
            <h2 className="font-press-start text-[9px] md:text-[10px] mb-1 text-slate-400">SCORE</h2>
            <p className="font-vt323 text-3xl md:text-4xl text-indigo-300 font-bold">{score.toLocaleString()}</p>
          </div>
          <div className="game-panel p-4 text-center">
            <h2 className="font-press-start text-[9px] md:text-[10px] mb-1 text-slate-400">LEVEL</h2>
            <p className="font-vt323 text-3xl md:text-4xl text-indigo-300 font-bold">{level}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 md:gap-4 touch-none lg:order-2" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <h1 className="font-press-start text-xl md:text-2xl lg:text-3xl text-white text-glow-accent mb-1">TETRIS</h1>
          {renderGrid('min(320px, 95vw)')}
          <div className="flex flex-col gap-2 md:gap-3 w-full max-w-md mt-2">
            <div className="flex justify-center gap-6 md:gap-7">
              <button
                className="game-button rounded-full w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex items-center justify-center text-4xl md:text-5xl lg:text-6xl touch-none"
                onClick={(e) => { e.preventDefault(); move(-1); }}
                onTouchStart={(e) => { e.preventDefault(); move(-1); }}
                disabled={gameOver || isPaused || clearingRows.length > 0}
              >
                ←
              </button>
              <button
                className="game-button rounded-full w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex items-center justify-center text-4xl md:text-5xl lg:text-6xl touch-none"
                onClick={(e) => { e.preventDefault(); rotate(); }}
                onTouchStart={(e) => { e.preventDefault(); rotate(); }}
                disabled={gameOver || isPaused || clearingRows.length > 0}
              >
                ↻
              </button>
              <button
                className="game-button rounded-full w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex items-center justify-center text-4xl md:text-5xl lg:text-6xl touch-none"
                onClick={(e) => { e.preventDefault(); move(1); }}
                onTouchStart={(e) => { e.preventDefault(); move(1); }}
                disabled={gameOver || isPaused || clearingRows.length > 0}
              >
                →
              </button>
            </div>

            <div className="flex justify-center gap-6 md:gap-7">
              <button
                className="game-button px-12 py-6 md:px-16 md:py-8 text-[16px] md:text-[18px] lg:text-[20px] touch-none"
                onClick={(e) => { e.preventDefault(); drop(); setScore(prev => prev + 1); }}
                onTouchStart={(e) => { e.preventDefault(); drop(); setScore(prev => prev + 1); }}
                disabled={gameOver || isPaused || clearingRows.length > 0}
              >
                ↓
              </button>
              <button
                className="game-button px-12 py-6 md:px-16 md:py-8 text-[16px] md:text-[18px] lg:text-[20px] touch-none"
                onClick={(e) => { e.preventDefault(); handleHold(); }}
                onTouchStart={(e) => { e.preventDefault(); handleHold(); }}
                disabled={gameOver || isPaused || clearingRows.length > 0 || !canHold}
              >
                HOLD
              </button>
              <button
                className="game-button game-button-primary px-12 py-6 md:px-16 md:py-8 text-[16px] md:text-[18px] lg:text-[20px] touch-none"
                onClick={(e) => { e.preventDefault(); hardDrop(); }}
                onTouchStart={(e) => { e.preventDefault(); hardDrop(); }}
                disabled={gameOver || isPaused || clearingRows.length > 0}
              >
                DROP
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full lg:w-auto lg:order-3">
          <div className="game-panel p-2 md:p-3 text-center">
            <h2 className="font-press-start text-[7px] md:text-[8px] mb-1 text-slate-400">LINES</h2>
            <p className="font-vt323 text-3xl md:text-4xl text-emerald-300 font-bold">{linesCleared}</p>
          </div>
          <div className="game-panel p-2 md:p-3 text-center">
            <h2 className="font-press-start text-[7px] md:text-[8px] mb-1 text-slate-400">NEXT</h2>
            {renderSmallPiece(nextPiece)}
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="w-full absolute bottom-4 left-0 right-0 flex justify-center gap-6">
        <button
          className="game-button px-14 py-7 md:px-20 md:py-10 text-[16px] md:text-[20px] touch-none"
          onClick={(e) => { e.preventDefault(); setIsPaused(prev => !prev); }}
          onTouchStart={(e) => { e.preventDefault(); setIsPaused(prev => !prev); }}
          disabled={gameOver}
        >
          {isPaused ? 'RESUME' : 'PAUSE'}
        </button>
        <button
          className="game-button game-button-accent px-14 py-7 md:px-20 md:py-10 text-[16px] md:text-[20px] touch-none"
          onClick={(e) => { e.preventDefault(); resetGame(); }}
          onTouchStart={(e) => { e.preventDefault(); resetGame(); }}
        >
          NEW GAME
        </button>
      </div>

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="game-panel p-6 md:p-10 text-center border-2 border-red-500/30">
            <h2 className="font-press-start text-xl md:text-2xl text-red-400 mb-6 text-glow-accent">GAME OVER</h2>
            <p className="text-xl md:text-3xl mb-6 text-slate-300">Final Score: <span className="font-bold text-indigo-300">{score.toLocaleString()}</span></p>
            <button
              className="game-button game-button-accent px-14 py-7 md:px-20 md:py-10 text-[16px] md:text-[20px]"
              onClick={(e) => { e.preventDefault(); resetGame(); }}
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
          <div className="game-panel p-6 md:p-10 text-center border-2 border-indigo-500/30">
            <h2 className="font-press-start text-xl md:text-2xl text-indigo-300 mb-6 text-glow-primary">PAUSED</h2>
            <button
              className="game-button game-button-primary px-14 py-7 md:px-20 md:py-10 text-[16px] md:text-[20px]"
              onClick={(e) => { e.preventDefault(); setIsPaused(false); }}
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
