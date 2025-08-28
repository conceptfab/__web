/**
 * Cursor Paint Effect
 * Creates a cursor-based painting effect where image is revealed
 * in a circular area following the mouse cursor with pixelization:
 * - Image starts completely transparent
 * - Mouse movement reveals image in circular area (~100px)
 * - Progressive pixelization from large to small pixels in revealed area
 *
 * @author CONCEPTFAB
 * @version 1.0.0
 */

export class CursorPaintEffect {
  constructor(canvas, image, options = {}) {
    this.canvas = canvas;
    this.image = image;
    this.ctx = canvas.getContext('2d');

    // Configuration options with defaults
    this.options = {
      brushSize: options.brushSize || 100, // Size of paint brush/circle
      maxPixelSize: options.maxPixelSize || 32, // Largest pixel size
      minPixelSize: options.minPixelSize || 1, // Smallest pixel size
      pixelTransitionSpeed: options.pixelTransitionSpeed || 2000, // Time to go from max to min pixels (ms)
      fadeInSpeed: options.fadeInSpeed || 500, // Time for area to fade in (ms)
      enabled: options.enabled !== undefined ? options.enabled : true, // Effect enabled/disabled
      showCustomCursor: options.showCustomCursor !== undefined ? options.showCustomCursor : true, // Show custom cursor
      customCursorId: options.customCursorId || 'customCursor', // ID of custom cursor element
      ...options,
    };

    // Internal state
    this.isActive = false;
    this.mousePosition = { x: 0, y: 0 };
    this.revealedAreas = new Map(); // Track revealed areas with their timestamps
    this.completedAreas = new Map(); // Track completed/frozen areas (never re-render)
    this.permanentCanvas = null; // Canvas for permanent/completed areas
    this.drawWidth = 0;
    this.drawHeight = 0;
    this.drawX = 0;
    this.drawY = 0;
    this.animationFrameId = null;
    this.isDirty = false; // Track if render is needed
    this.lastRenderTime = 0;
    
    // Custom cursor
    this.customCursor = null;

    // Performance optimizations
    this.canvasPool = []; // Pool of reusable canvas elements
    this.pixelSizeCache = new Map(); // Cache computed pixel sizes
    this.maxPoolSize = 5;
    this.frameThrottle = 16; // ~60fps (16ms)

    // Pre-compute common values
    this.precomputeValues();

    this.setupCanvas();
    this.setupPermanentCanvas();
    this.setupCustomCursor();
    this.bindEvents();
  }

  /**
   * Sets up canvas dimensions and resize handling
   */
  setupCanvas() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();

    // Set canvas size to match container
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // Calculate image dimensions within container (same as CSS object-fit: cover)
    this.calculateImageDimensions();

    // Update canvas size on window resize
    const resizeHandler = () => {
      const newRect = container.getBoundingClientRect();
      this.canvas.width = newRect.width;
      this.canvas.height = newRect.height;
      this.calculateImageDimensions();
      
      // Resize permanent canvas too
      if (this.permanentCanvas) {
        this.permanentCanvas.width = newRect.width;
        this.permanentCanvas.height = newRect.height;
        // Re-render completed areas on resize
        this.renderCompletedAreas();
      }
    };

    window.addEventListener('resize', resizeHandler);

    // Store resize handler for cleanup
    this._resizeHandler = resizeHandler;
  }
  
  /**
   * Sets up permanent canvas for completed areas
   */
  setupPermanentCanvas() {
    this.permanentCanvas = document.createElement('canvas');
    this.permanentCanvas.width = this.canvas.width;
    this.permanentCanvas.height = this.canvas.height;
  }
  
  /**
   * Sets up custom cursor element
   */
  setupCustomCursor() {
    if (!this.options.showCustomCursor) return;
    
    this.customCursor = document.getElementById(this.options.customCursorId);
    if (this.customCursor) {
      this.updateCursorSize();
    }
  }

  /**
   * Pre-computes common values for better performance
   */
  precomputeValues() {
    // Pre-compute pixel sizes for smooth transitions
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const pixelSize = Math.max(
        this.options.minPixelSize,
        Math.floor(this.options.maxPixelSize * (1 - progress))
      );
      this.pixelSizeCache.set(progress.toFixed(3), pixelSize);
    }
  }

  /**
   * Gets a canvas from the pool or creates a new one
   */
  getCanvasFromPool(width, height) {
    let canvas = this.canvasPool.pop();
    if (!canvas) {
      canvas = document.createElement('canvas');
    }
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  /**
   * Returns a canvas to the pool for reuse
   */
  returnCanvasToPool(canvas) {
    if (this.canvasPool.length < this.maxPoolSize) {
      // Clear canvas before returning to pool
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.canvasPool.push(canvas);
    }
  }

  /**
   * Calculates image dimensions to match CSS object-fit: cover behavior
   */
  calculateImageDimensions() {
    if (!this.image.naturalWidth || !this.image.naturalHeight) return;

    const imageAspect = this.image.naturalWidth / this.image.naturalHeight;
    const canvasAspect = this.canvas.width / this.canvas.height;

    // Same logic as CSS object-fit: cover
    if (imageAspect > canvasAspect) {
      // Image is wider - fit to height, crop width
      this.drawHeight = this.canvas.height;
      this.drawWidth = this.canvas.height * imageAspect;
      this.drawX = (this.canvas.width - this.drawWidth) / 2;
      this.drawY = 0;
    } else {
      // Image is taller - fit to width, crop height
      this.drawWidth = this.canvas.width;
      this.drawHeight = this.canvas.width / imageAspect;
      this.drawX = 0;
      this.drawY = (this.canvas.height - this.drawHeight) / 2;
    }
  }

  /**
   * Updates custom cursor size based on brush size
   */
  updateCursorSize() {
    if (!this.customCursor) return;
    
    const size = this.options.brushSize;
    this.customCursor.style.width = `${size}px`;
    this.customCursor.style.height = `${size}px`;
  }
  
  /**
   * Updates custom cursor position
   */
  updateCursorPosition(clientX, clientY) {
    if (!this.customCursor) return;
    
    this.customCursor.style.left = `${clientX}px`;
    this.customCursor.style.top = `${clientY}px`;
  }
  
  /**
   * Shows custom cursor
   */
  showCursor() {
    if (!this.customCursor) return;
    this.customCursor.style.opacity = '1';
  }
  
  /**
   * Hides custom cursor
   */
  hideCursor() {
    if (!this.customCursor) return;
    this.customCursor.style.opacity = '0';
  }

  /**
   * Binds mouse events for paint effect
   */
  bindEvents() {
    this.canvas.addEventListener(
      'mouseenter',
      this.handleMouseEnter.bind(this)
    );
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener(
      'mouseleave',
      this.handleMouseLeave.bind(this)
    );
  }

  /**
   * Handles mouse enter event
   */
  handleMouseEnter(event) {
    if (!this.options.enabled) return;

    this.isActive = true;
    this.updateMousePosition(event);
    this.updateCursorPosition(event.clientX, event.clientY);
    this.showCursor();
    this.startAnimation();
  }

  /**
   * Handles mouse move event
   */
  handleMouseMove(event) {
    if (!this.options.enabled || !this.isActive) return;

    this.updateMousePosition(event);
    this.updateCursorPosition(event.clientX, event.clientY);
    this.addRevealedArea(this.mousePosition.x, this.mousePosition.y);
    this.isDirty = true; // Mark for re-render
  }

  /**
   * Handles mouse leave event
   */
  handleMouseLeave() {
    this.isActive = false;
    this.hideCursor();
    this.stopAnimation();
  }

  /**
   * Updates mouse position relative to canvas
   */
  updateMousePosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition.x = event.clientX - rect.left;
    this.mousePosition.y = event.clientY - rect.top;
  }

  /**
   * Adds a revealed area at the specified position
   */
  addRevealedArea(x, y) {
    const gridSize = Math.min(20, this.options.brushSize / 5); // Adaptive grid size
    const areaKey = `${Math.floor(x / gridSize)}_${Math.floor(y / gridSize)}`;

    // Don't add if area is already completed or currently revealing
    if (this.completedAreas.has(areaKey) || this.revealedAreas.has(areaKey)) {
      return;
    }
    
    // Additional check: prevent overlap with completed areas using distance
    const brushRadius = this.options.brushSize / 2;
    for (const completedArea of this.completedAreas.values()) {
      const distance = Math.sqrt(
        Math.pow(x - completedArea.x, 2) + Math.pow(y - completedArea.y, 2)
      );
      
      // If new area would significantly overlap with completed area, skip it
      if (distance < (brushRadius + completedArea.radius) * 0.3) {
        return;
      }
    }

    const now = Date.now();
    this.revealedAreas.set(areaKey, {
      x: x,
      y: y,
      startTime: now,
      radius: brushRadius,
    });

    // Cleanup old areas to prevent memory leaks
    if (this.revealedAreas.size > 1000) {
      // Limit to 1000 areas
      const cutoffTime =
        now -
        (this.options.pixelTransitionSpeed + this.options.fadeInSpeed + 1000);
      for (const [key, area] of this.revealedAreas) {
        if (area.startTime < cutoffTime) {
          this.revealedAreas.delete(key);
        }
      }
    }
  }

  /**
   * Renders completed areas to permanent canvas
   */
  renderCompletedAreas() {
    if (!this.permanentCanvas) return;
    
    const permCtx = this.permanentCanvas.getContext('2d');
    permCtx.clearRect(0, 0, this.permanentCanvas.width, this.permanentCanvas.height);
    
    // Draw all completed areas at full resolution (pixelSize = 1)
    this.completedAreas.forEach((area) => {
      permCtx.save();
      permCtx.beginPath();
      permCtx.arc(area.x, area.y, area.radius, 0, Math.PI * 2);
      permCtx.clip();
      permCtx.drawImage(this.image, this.drawX, this.drawY, this.drawWidth, this.drawHeight);
      permCtx.restore();
    });
  }

  /**
   * Draws pixelated image in circular area (optimized version)
   */
  drawPixelatedCircle(x, y, radius, pixelSize) {
    // Save context state
    this.ctx.save();

    // Create circular clipping path
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.clip();

    // Calculate the area to draw (only the circular region)
    const minX = Math.max(0, x - radius);
    const maxX = Math.min(this.canvas.width, x + radius);
    const minY = Math.max(0, y - radius);
    const maxY = Math.min(this.canvas.height, y + radius);

    if (pixelSize <= 1) {
      // Draw normal image for pixel size 1
      this.ctx.drawImage(
        this.image,
        this.drawX,
        this.drawY,
        this.drawWidth,
        this.drawHeight
      );
    } else {
      // Calculate pixelated dimensions
      const regionWidth = maxX - minX;
      const regionHeight = maxY - minY;
      const pixelatedWidth = Math.max(1, Math.floor(regionWidth / pixelSize));
      const pixelatedHeight = Math.max(1, Math.floor(regionHeight / pixelSize));

      // Use canvas pool instead of creating new canvas
      const tempCanvas = this.getCanvasFromPool(
        pixelatedWidth,
        pixelatedHeight
      );
      const tempCtx = tempCanvas.getContext('2d');

      // Calculate source coordinates in original image
      const sourceX =
        ((minX - this.drawX) / this.drawWidth) * this.image.naturalWidth;
      const sourceY =
        ((minY - this.drawY) / this.drawHeight) * this.image.naturalHeight;
      const sourceWidth =
        (regionWidth / this.drawWidth) * this.image.naturalWidth;
      const sourceHeight =
        (regionHeight / this.drawHeight) * this.image.naturalHeight;

      // Draw pixelated version
      tempCtx.drawImage(
        this.image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        pixelatedWidth,
        pixelatedHeight
      );

      // Draw pixelated result back to main canvas
      this.ctx.imageSmoothingEnabled = false;
      this.ctx.drawImage(tempCanvas, minX, minY, regionWidth, regionHeight);
      this.ctx.imageSmoothingEnabled = true;

      // Return canvas to pool
      this.returnCanvasToPool(tempCanvas);
    }

    // Restore context state
    this.ctx.restore();
  }

  /**
   * Renders all revealed areas with appropriate pixelization (optimized)
   */
  render() {
    // Only render if dirty
    if (!this.isDirty) return;

    // Clear main canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // First, draw the permanent canvas (completed areas)
    if (this.permanentCanvas) {
      this.ctx.drawImage(this.permanentCanvas, 0, 0);
    }

    const currentTime = Date.now();
    let hasAnimatingAreas = false;
    const completedThisFrame = [];

    // Draw all revealed areas that are still animating
    this.revealedAreas.forEach((area, key) => {
      const elapsed = currentTime - area.startTime;
      const progress = Math.min(elapsed / this.options.pixelTransitionSpeed, 1);
      const fadeProgress = Math.min(elapsed / this.options.fadeInSpeed, 1);

      // Check if area is fully completed
      if (progress >= 1 && fadeProgress >= 1) {
        // Move to completed areas
        completedThisFrame.push({ key, area });
        return;
      }

      // Use cached pixel size if available
      const progressKey = progress.toFixed(3);
      let pixelSize = this.pixelSizeCache.get(progressKey);
      if (pixelSize === undefined) {
        pixelSize = Math.max(
          this.options.minPixelSize,
          Math.floor(this.options.maxPixelSize * (1 - progress))
        );
      }

      // Track if there are still animating areas
      hasAnimatingAreas = true;

      this.ctx.globalAlpha = fadeProgress;
      this.drawPixelatedCircle(area.x, area.y, area.radius, pixelSize);
      this.ctx.globalAlpha = 1;
    });

    // Move completed areas to permanent canvas
    if (completedThisFrame.length > 0) {
      const permCtx = this.permanentCanvas.getContext('2d');
      
      completedThisFrame.forEach(({ key, area }) => {
        // Remove from active areas
        this.revealedAreas.delete(key);
        
        // Add to completed areas
        this.completedAreas.set(key, area);
        
        // Draw directly to permanent canvas
        permCtx.save();
        permCtx.beginPath();
        permCtx.arc(area.x, area.y, area.radius, 0, Math.PI * 2);
        permCtx.clip();
        permCtx.drawImage(this.image, this.drawX, this.drawY, this.drawWidth, this.drawHeight);
        permCtx.restore();
      });
      
      // Force re-render to show updated permanent canvas
      hasAnimatingAreas = true;
    }

    // Mark as clean, but keep dirty if areas are still animating
    this.isDirty = hasAnimatingAreas;
  }

  /**
   * Animation loop (optimized with throttling)
   */
  animate() {
    const now = Date.now();

    // Throttle to ~60fps
    if (now - this.lastRenderTime >= this.frameThrottle) {
      this.render();
      this.lastRenderTime = now;
    }

    if (this.isActive || this.isDirty) {
      this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }
  }

  /**
   * Starts the animation loop
   */
  startAnimation() {
    if (this.animationFrameId) return;
    this.animate();
  }

  /**
   * Stops the animation loop
   */
  stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Resets the effect to initial state
   */
  reset() {
    this.isActive = false;
    this.revealedAreas.clear();
    this.completedAreas.clear();
    this.isDirty = false;
    this.stopAnimation();
    this.hideCursor();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Clear permanent canvas
    if (this.permanentCanvas) {
      const permCtx = this.permanentCanvas.getContext('2d');
      permCtx.clearRect(0, 0, this.permanentCanvas.width, this.permanentCanvas.height);
    }

    // Clear canvas pool
    this.canvasPool.length = 0;
  }

  /**
   * Enables the effect
   */
  enable() {
    this.options.enabled = true;
  }

  /**
   * Disables the effect
   */
  disable() {
    this.options.enabled = false;
    this.reset();
  }

  /**
   * Updates effect options
   * @param {object} newOptions - New configuration options
   */
  updateOptions(newOptions) {
    const oldBrushSize = this.options.brushSize;
    const oldMaxPixelSize = this.options.maxPixelSize;
    const oldMinPixelSize = this.options.minPixelSize;
    
    this.options = { ...this.options, ...newOptions };
    
    // Recompute values if pixel-related options changed
    if (
      newOptions.maxPixelSize !== undefined ||
      newOptions.minPixelSize !== undefined ||
      oldMaxPixelSize !== this.options.maxPixelSize ||
      oldMinPixelSize !== this.options.minPixelSize
    ) {
      this.precomputeValues();
    }
    
    // If brush size changed, mark as dirty to reflect changes and update cursor
    if (newOptions.brushSize !== undefined && oldBrushSize !== this.options.brushSize) {
      this.isDirty = true;
      this.updateCursorSize();
    }
  }

  /**
   * Destroys the effect and cleans up event listeners
   */
  destroy() {
    this.disable();

    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }

    this.canvas.removeEventListener('mouseenter', this.handleMouseEnter);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);

    // Clean up caches and pools
    this.pixelSizeCache.clear();
    this.canvasPool.length = 0;
    this.revealedAreas.clear();
    this.completedAreas.clear();
    this.permanentCanvas = null;
  }

  /**
   * Gets the percentage of image revealed
   * @returns {number} Percentage revealed (0-100)
   */
  getRevealedPercentage() {
    // Simplified calculation - could be more accurate
    const totalPixels = this.canvas.width * this.canvas.height;
    const revealedPixels =
      this.revealedAreas.size *
      Math.PI *
      Math.pow(this.options.brushSize / 2, 2);
    return Math.min((revealedPixels / totalPixels) * 100, 100);
  }
}

/**
 * Factory function for easy creation of cursor paint effects
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {HTMLImageElement} image - Image element
 * @param {object} options - Configuration options
 * @returns {CursorPaintEffect} New effect instance
 */
export function createCursorPaintEffect(canvas, image, options = {}) {
  return new CursorPaintEffect(canvas, image, options);
}

// Default export for convenience
export default CursorPaintEffect;
