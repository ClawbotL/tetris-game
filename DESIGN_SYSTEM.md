# Tetris Game UI Design System

## Design Philosophy
A clean, balanced, and modern take on the classic Tetris game. Focuses on readability, visual hierarchy, and pleasant gameplay experience.

## Color Palette

### Core Colors
| Role | Hex | Usage |
|------|-----|-------|
| **Background** | `#0F172A` | Main background gradient |
| **Background Dark** | `#020617` | Darker shade for gradient |
| **Foreground** | `#F8FAFC` | Primary text |
| **Primary** | `#6366F1` | Main actions, focus |
| **Primary Light** | `#818CF8` | Hover states |
| **Secondary** | `#10B981` | Success, alternate actions |
| **Secondary Light** | `#34D399` | Hover for secondary |
| **Accent** | `#F59E0B` | Highlights, important text |
| **Danger** | `#EF4444` | Game over, errors |

### Grid/Panel Colors
| Role | Hex | Usage |
|------|-----|-------|
| **Grid BG** | `#1E293B` | Background for grid cells |
| **Grid Border** | `#334155` | Cell borders |

### Tetromino Colors
| Piece | Hex | Color |
|-------|-----|-------|
| **I** | `#22D3EE` | Cyan |
| **O** | `#FACC15` | Yellow |
| **T** | `#A855F7` | Purple |
| **S** | `#34D399` | Green |
| **Z** | `#EF4444` | Red |
| **J** | `#3B82F6` | Blue |
| **L** | `#F97316` | Orange |

## Typography
- **Heading/Game Text**: Press Start 2P
- **Body/Stats**: VT323
- **Mood**: Retro yet clean, modern gaming feel

## Key Components

### Game Panel
- Semi-transparent background (`rgba(30, 41, 59, 0.7)`)
- Backdrop blur (10px)
- Subtle border (`rgba(99, 102, 241, 0.2)`)
- 12px border radius

### Buttons
- Base: Semi-transparent dark slate, 8px radius
- Primary: Gradient indigo, white text
- Accent: Gradient amber, white text
- Hover: Subtle elevation + shadow

### Grid Cells
- 2px border radius
- Subtle borders
- Soft inner shadows on filled pieces
- Transparent ghost pieces

## Layout
- Responsive 3-column on desktop
- Stacked on mobile
- Clean spacing between elements
- Visual hierarchy: Grid > Stats > Hold/Next

## Animations
- Smooth button transitions (0.15s)
- Row clear animation (0.25s)
- Subtle cell transitions
