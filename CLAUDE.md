# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-page website for CONCEPTFAB - a premium, cinematic web experience built with vanilla HTML, CSS, and JavaScript (no external frameworks). The site features interactive visual effects including pixelization animations and cursor-based paint effects.

## Architecture

### Core Structure
- `index.html` - Main HTML page with multi-section layout (sekcja1-8)
- `styles.css` - Complete CSS styling with CSS variables and responsive design
- `js/script.js` - Main application logic and effect initialization
- `js/pixelization-effect.js` - Reverse pixelization effect module
- `js/cursor-paint-effect.js` - Interactive cursor paint effect module

### Visual Effects System
The application uses two main canvas-based visual effects:

1. **Pixelization Effect** (`PixelizationEffect` class):
   - 4-phase animation: transparent → average color → pixelization → final image
   - Runs automatically on page load for section 1
   - Optimized canvas rendering with reusable temporary canvas

2. **Cursor Paint Effect** (`CursorPaintEffect` class):
   - Mouse-controlled image revealing with pixelization
   - Active in section 2 when user moves cursor
   - Performance optimized with canvas pooling and spatial grids

### Navigation System
- **Fullscreen Menu**: Hamburger menu with overlay navigation
- **Side Navigation**: Dot-based section navigation with tooltips
- **Scroll Spy**: Intersection Observer API for active section tracking
- **Section Management**: Automatic effect enabling/disabling based on visible section

## Development Commands

Since this is a vanilla web project with no build system:

- **Development**: Serve files with any static file server (e.g., `python -m http.server` or Live Server extension)
- **Testing**: Open `index.html` in browser directly or via local server
- **No build process**: Files are served directly as-is

## Key Implementation Details

### Effect Integration
Effects are managed through the main `handleSectionChange()` function in `script.js`:
- Section 1: Triggers pixelization effect
- Section 2: Enables cursor paint effect  
- Other sections: Disables active effects

### Performance Considerations
- Canvas pooling in cursor paint effect to reduce GC pressure
- Spatial grid collision detection for paint areas
- Optimized pixelization with reusable temporary canvases
- Intersection Observer for efficient scroll monitoring

### Responsive Design
- CSS variables for consistent scaling across viewport sizes
- Responsive layout adjustments via media queries
- Canvas effects automatically adapt to container dimensions

## File Organization

```
/
├── index.html          # Main page
├── styles.css          # All styling
├── js/
│   ├── script.js       # Main app logic
│   ├── pixelization-effect.js  # Pixelization effect class
│   └── cursor-paint-effect.js  # Cursor paint effect class
├── assets/
│   └── images/         # Image assets
└── documentation files # README, ref.md, etc.
```

## Common Development Tasks

- **Adding new sections**: Add section HTML with unique ID, update navigation links
- **Modifying effects**: Configure options in `script.js` effect initialization
- **Styling changes**: Use CSS variables in `:root` for consistent theming
- **Effect debugging**: Effects expose methods like `reset()`, `destroy()`, `updateOptions()`