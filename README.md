# 🎮 Retro Tetris — Game Documentation

A neon-drenched, retro-futurist Tetris game built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS 4**. Features CRT scanline effects, neon glow styling, and full mobile + desktop support.

---

## Table of Contents

- [How to Play](#how-to-play)
- [Controls](#controls)
- [Game Features](#game-features)
- [Scoring System](#scoring-system)
- [Tetrominos](#tetrominos)
- [Technical Details](#technical-details)
- [Running the Game](#running-the-game)

---

## How to Play

Tetris is a tile-matching puzzle game. Tetrominos (geometric shapes made of four square blocks) fall from the top of a **10 × 20 grid**. Your goal is to move and rotate the falling pieces so they form complete horizontal lines. Completed lines are cleared, earning you points. The game ends when pieces stack up and reach the top of the grid — no room for new pieces to spawn.

**Quick Start:**

1. The game starts automatically when the page loads.
2. Move and rotate pieces as they fall to fill horizontal lines.
3. Clear lines to score points and advance levels.
4. As your level increases, pieces fall faster.
5. The game is over when a new piece can't fit at the top of the grid.

---

## Controls

### Desktop (Keyboard)

| Key | Action |
|-----|--------|
| **← →** | Move piece left / right |
| **↑** | Rotate piece clockwise |
| **↓** | Soft drop (move piece down one row, +1 point per row) |
| **Space** | Hard drop (instantly drop piece to the lowest position, +2 points per row dropped) |
| **P** | Pause / Resume game |

### Mobile (Touch)

| Gesture | Action |
|---------|--------|
| **Swipe left** | Move piece left |
| **Swipe right** | Move piece right |
| **Swipe down** | Hard drop |
| **Swipe up** | Rotate piece clockwise |

### On-Screen Buttons (Mobile)

On smaller screens, the game displays touch-friendly control buttons:

- **←** — Move left
- **↻** — Rotate
- **→** — Move right
- **PAUSE / RESUME** — Toggle pause
- **DROP** — Hard drop
- **NEW GAME** — Reset and start a new game

Desktop also shows **PAUSE**, **HARD DROP**, and **NEW GAME** buttons below the grid.

---

## Game Features

### Core Gameplay
- **7 standard Tetrominos** — I, O, T, S, Z, J, L with classic shapes and colors
- **Next piece preview** — See the upcoming piece before it drops
- **Wall kicks** — Rotation attempts up to 5 horizontal offsets (0, -1, +1, -2, +2) so pieces can rotate near walls
- **Soft drop & hard drop** — Speed up play with incremental or instant drops
- **Pause / Resume** — Take a break anytime with the **P** key or pause button
- **Game over detection** — The game ends when a new piece spawns into an occupied cell

### Progressive Difficulty
- **Level system** — Every 10 lines cleared advances you one level
- **Increasing speed** — Drop interval starts at 1000ms and decreases by 100ms per level (minimum 100ms)
  - Level 1: 1000ms
  - Level 2: 900ms
  - Level 5: 600ms
  - Level 10: 100ms (max speed!)

### Visual Design
- **Retro-futurist aesthetic** — 80s synthwave / cyberpunk vibe
- **Neon glow effects** — Every piece type has its own glowing color with CSS box-shadow
- **CRT scanline overlay** — Animated scanlines across the entire screen for that vintage monitor feel
- **Retro fonts** — *Press Start 2P* for headings, *VT323* for body text
- **Responsive layout** — Desktop shows a side panel with controls; mobile shows compact controls below the grid

### Overlays
- **Game Over overlay** — Full-screen dark overlay showing final score with a "PLAY AGAIN" button
- **Pause overlay** — Full-screen dark overlay with a "RESUME" button

---

## Scoring System

Points are awarded based on how many lines you clear at once, multiplied by your current level:

| Lines Cleared | Base Points | Example (Level 3) |
|---------------|-------------|-------------------|
| 1 (Single) | 40 × level | 120 |
| 2 (Double) | 100 × level | 300 |
| 3 (Triple) | 300 × level | 900 |
| 4 (Tetris!) | 1200 × level | 3600 |

**Additional scoring:**
- **Soft drop:** +1 point per row dropped manually (↓ key)
- **Hard drop:** +2 points per row dropped instantly (Space / DROP button)

> **Tip:** Clearing 4 lines at once (a "Tetris") is worth 30× more than a single line at the same level. Stack wisely!

---

## Tetrominos

All 7 classic Tetris pieces with their neon colors:

| Piece | Shape | Color | Neon Glow |
|-------|-------|-------|-----------|
| **I** | ▬▬▬▬ (4 in a row) | Cyan `#00FFFF` | Cyan glow |
| **O** | ■■ (2×2 square) | Yellow `#FFFF00` | Yellow glow |
| **T** | ▼ T-shape | Purple `#A020F0` | Purple glow |
| **S** | ⌐ S-shape | Green `#00FF00` | Green glow |
| **Z** | ¬ Z-shape | Red `#FF0000` | Red glow |
| **J** | ⌐ J-shape | Blue `#0000FF` | Blue glow |
| **L** | ¬ L-shape | Orange `#FFA500` | Orange glow |

All pieces spawn centered horizontally at the top of the grid (y = 0).

---

## Technical Details

### Stack
- **Framework:** Next.js 16.2.6 (App Router)
- **UI Library:** React 19.2.4
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 with custom theme
- **Fonts:** Google Fonts (Press Start 2P, VT323)

### Architecture
- **Single-page app** — One component (`TetrisGame.tsx`) handles all game logic and rendering
- **Game loop** — Uses `requestAnimationFrame` for smooth, frame-accurate piece dropping
- **State management** — React `useState` and `useCallback` hooks for game state
- **Collision detection** — Grid-based collision checking against walls, floor, and locked pieces
- **Rotation** — Matrix rotation (90° clockwise) with wall-kick offsets for edge cases

### Key Files
| File | Purpose |
|------|---------|
| `app/components/TetrisGame.tsx` | Core game component — all logic, rendering, input handling |
| `app/page.tsx` | Page wrapper that renders TetrisGame |
| `app/layout.tsx` | Root layout with CRT scanline overlay class |
| `app/globals.css` | Theme variables, neon effects, cell styles, CRT animation |
| `DESIGN_SYSTEM.md` | Design system spec (retro-futurism style guide) |

### Color Palette
| Role | Hex |
|------|-----|
| Background | `#0F0F23` |
| Text | `#E2E8F0` |
| Primary | `#7C3AED` (neon purple) |
| Secondary | `#A78BFA` (light purple) |
| CTA | `#F43F5E` (neon rose) |

---

## Running the Game

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development

```bash
cd /path/to/tetris-game
npm install
npm run dev
```

The game runs at `http://localhost:3000` by default.

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

*Built with 💜 and neon glow.*
