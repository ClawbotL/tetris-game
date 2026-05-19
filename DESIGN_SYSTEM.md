## Design System: Tetris Game

### Pattern
- **Name:** Horizontal Scroll Journey
- **Conversion Focus:** Immersive product discovery. High engagement. Keep navigation visible.
- **CTA Placement:** Floating Sticky CTA or End of Horizontal Track
- **Color Strategy:** Continuous palette transition. Chapter colors. Progress bar #000000.
- **Sections:** 1. Intro (Vertical), 2. The Journey (Horizontal Track), 3. Detail Reveal, 4. Vertical Footer

### Style
- **Name:** Retro-Futurism
- **Keywords:** Vintage sci-fi, 80s aesthetic, neon glow, geometric patterns, CRT scanlines, pixel art, cyberpunk, synthwave
- **Best For:** Gaming, entertainment, music platforms, tech brands, artistic projects, nostalgic, cyberpunk
- **Performance:** ⚠ Moderate | **Accessibility:** ⚠ High contrast/strain

### Colors
| Role | Hex |
|------|-----|
| Primary | #7C3AED |
| Secondary | #A78BFA |
| CTA | #F43F5E |
| Background | #0F0F23 |
| Text | #E2E8F0 |

*Notes: Neon purple + rose action*

### Typography
- **Heading:** Press Start 2P
- **Body:** VT323
- **Mood:** pixel, retro, gaming, 8-bit, nostalgic, arcade
- **Best For:** Pixel art games, retro websites, creative portfolios
- **Google Fonts:** https://fonts.google.com/share?selection.family=Press+Start+2P|VT323
- **CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
```

### Key Effects
CRT scanlines (::before overlay), neon glow (text-shadow+box-shadow), glitch effects (skew/offset keyframes)

### Avoid (Anti-patterns)
- Minimalist design
- Static assets

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
