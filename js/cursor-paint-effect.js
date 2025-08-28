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
      brushSize: options.brushSize || 100,          // Size of paint brush/circle
      maxPixelSize: options.maxPixelSize || 32,     // Largest pixel size
      minPixelSize: options.minPixelSize || 1,      // Smallest pixel size
      pixelTransitionSpeed: options.pixelTransitionSpeed || 2000, // Time to go from max to min pixels (ms)
      fadeInSpeed: options.fadeInSpeed || 500,      // Time for area to fade in (ms)
      enabled: options.enabled !== undefined ? options.enabled : true, // Effect enabled/disabled
      ...options
    };
    
    // Internal state
    this.isActive = false;
    this.mousePosition = { x: 0, y: 0 };
    this.revealedAreas = new Map(); // Track revealed areas with their timestamps
    this.drawWidth = 0;
    this.drawHeight = 0;
    this.drawX = 0;
    this.drawY = 0;
    this.animationFrameId = null;
    
    this.setupCanvas();
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
    };
    
    window.addEventListener('resize', resizeHandler);
    
    // Store resize handler for cleanup
    this._resizeHandler = resizeHandler;
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
   * Binds mouse events for paint effect
   */
  bindEvents() {
    this.canvas.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }
  
  /**
   * Handles mouse enter event
   */
  handleMouseEnter(event) {
    if (!this.options.enabled) return;
    
    this.isActive = true;
    this.updateMousePosition(event);
    this.startAnimation();
  }
  
  /**
   * Handles mouse move event
   */
  handleMouseMove(event) {
    if (!this.options.enabled || !this.isActive) return;
    
    this.updateMousePosition(event);
    this.addRevealedArea(this.mousePosition.x, this.mousePosition.y);
  }
  
  /**
   * Handles mouse leave event
   */
  handleMouseLeave() {
    this.isActive = false;
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
    const areaKey = `${Math.floor(x / 10)}_${Math.floor(y / 10)}`; // Grid-based areas
    
    if (!this.revealedAreas.has(areaKey)) {
      this.revealedAreas.set(areaKey, {
        x: x,
        y: y,
        startTime: Date.now(),
        radius: this.options.brushSize / 2
      });
    }
  }
  
  /**
   * Draws pixelated image in circular area
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
      this.ctx.drawImage(this.image, this.drawX, this.drawY, this.drawWidth, this.drawHeight);
    } else {
      // Create pixelated version
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      // Calculate pixelated dimensions
      const regionWidth = maxX - minX;
      const regionHeight = maxY - minY;
      const pixelatedWidth = Math.max(1, Math.floor(regionWidth / pixelSize));
      const pixelatedHeight = Math.max(1, Math.floor(regionHeight / pixelSize));
      
      tempCanvas.width = pixelatedWidth;
      tempCanvas.height = pixelatedHeight;
      
      // Calculate source coordinates in original image
      const sourceX = ((minX - this.drawX) / this.drawWidth) * this.image.naturalWidth;
      const sourceY = ((minY - this.drawY) / this.drawHeight) * this.image.naturalHeight;
      const sourceWidth = (regionWidth / this.drawWidth) * this.image.naturalWidth;
      const sourceHeight = (regionHeight / this.drawHeight) * this.image.naturalHeight;
      
      // Draw pixelated version
      tempCtx.drawImage(
        this.image,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, pixelatedWidth, pixelatedHeight
      );
      
      // Draw pixelated result back to main canvas
      this.ctx.imageSmoothingEnabled = false;
      this.ctx.drawImage(tempCanvas, minX, minY, regionWidth, regionHeight);
      this.ctx.imageSmoothingEnabled = true;
    }
    
    // Restore context state
    this.ctx.restore();
  }
  
  /**
   * Renders all revealed areas with appropriate pixelization
   */
  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const currentTime = Date.now();
    
    // Draw all revealed areas
    this.revealedAreas.forEach((area, key) => {
      const elapsed = currentTime - area.startTime;
      const progress = Math.min(elapsed / this.options.pixelTransitionSpeed, 1);
      
      // Calculate current pixel size (from max to min)
      const pixelSize = Math.max(
        this.options.minPixelSize,
        Math.floor(this.options.maxPixelSize * (1 - progress))
      );
      
      // Calculate fade-in alpha
      const fadeProgress = Math.min(elapsed / this.options.fadeInSpeed, 1);
      const alpha = fadeProgress;
      
      this.ctx.globalAlpha = alpha;
      this.drawPixelatedCircle(area.x, area.y, area.radius, pixelSize);
      this.ctx.globalAlpha = 1;
    });
  }
  
  /**
   * Animation loop
   */
  animate() {
    this.render();
    
    if (this.isActive) {
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
    this.stopAnimation();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
    this.options = { ...this.options, ...newOptions };
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
  }
  
  /**
   * Gets the percentage of image revealed
   * @returns {number} Percentage revealed (0-100)
   */
  getRevealedPercentage() {
    // Simplified calculation - could be more accurate
    const totalPixels = this.canvas.width * this.canvas.height;
    const revealedPixels = this.revealedAreas.size * Math.PI * Math.pow(this.options.brushSize / 2, 2);
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