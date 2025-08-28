/**
 * Reverse Pixelization Effect
 * Creates a 4-phase animation effect for images:
 * 1. Transparent background
 * 2. Average color fade-in
 * 3. Pixelization from large to small pixels
 * 4. Final image reveal
 * 
 * By default, the animation runs only once (runOnlyOnce: true).
 * Subsequent calls to startAnimation() will be ignored unless reset(true) is called.
 * 
 * @author CONCEPTFAB
 * @version 1.1.0
 */

export class PixelizationEffect {
  constructor(canvas, image, options = {}) {
    this.canvas = canvas;
    this.image = image;
    this.ctx = canvas.getContext('2d');
    
    // Configuration options with defaults
    this.options = {
      duration: options.duration || 4000,           // Total animation duration (ms)
      maxPixelSize: options.maxPixelSize || 128,     // Largest pixel size
      minPixelSize: options.minPixelSize || 2,      // Smallest pixel size
      phase1Duration: options.phase1Duration || 0.25,     // Transparent phase (0-25%)
      phase2Duration: options.phase2Duration || 0.25,     // Average color phase (25-50%)
      phase3Duration: options.phase3Duration || 0.375,    // Pixelization phase (50-87.5%)
      phase4Duration: options.phase4Duration || 0.125,    // Final reveal phase (87.5-100%)
      runOnlyOnce: options.runOnlyOnce !== undefined ? options.runOnlyOnce : true,  // Run only on first trigger
      ...options
    };
    
    // Internal state
    this.animationStarted = false;
    this.animationCompleted = false;
    this.averageColor = null;
    this.drawWidth = 0;
    this.drawHeight = 0;
    this.drawX = 0;
    this.drawY = 0;
    this.tempCanvas = null; // Reusable canvas for pixelation
    this.tempCtx = null;
    
    this.setupCanvas();
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
    
    // Create reusable temporary canvas
    this.tempCanvas = document.createElement('canvas');
    this.tempCtx = this.tempCanvas.getContext('2d');
    
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
   * Calculates the average color of the image (optimized)
   * @returns {string} RGB color string
   */
  calculateAverageColor() {
    if (this.averageColor) return this.averageColor;

    // Draw the image onto a 1x1 canvas to get the average color
    this.tempCtx.drawImage(this.image, 0, 0, 1, 1);

    const data = this.tempCtx.getImageData(0, 0, 1, 1).data;
    this.averageColor = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;

    return this.averageColor;
  }
  
  /**
   * Draws pixelated version of the image (optimized)
   * @param {number} pixelSize - Size of pixels
   */
  drawPixelatedImage(pixelSize) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (!this.drawWidth || !this.drawHeight) {
      this.calculateImageDimensions();
    }
    
    // Use the reusable temporary canvas
    const tempCanvas = this.tempCanvas;
    const tempCtx = this.tempCtx;
    
    const pixelatedWidth = Math.max(1, Math.floor(this.drawWidth / pixelSize));
    const pixelatedHeight = Math.max(1, Math.floor(this.drawHeight / pixelSize));
    
    tempCanvas.width = pixelatedWidth;
    tempCanvas.height = pixelatedHeight;
    
    // Draw the downscaled image to the temporary canvas
    tempCtx.drawImage(this.image, 0, 0, pixelatedWidth, pixelatedHeight);
    
    // Draw the upscaled, pixelated image to the main canvas
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(tempCanvas, this.drawX, this.drawY, this.drawWidth, this.drawHeight);
    this.ctx.imageSmoothingEnabled = true; // Reset for other operations
  }
  
  /**
   * Starts the pixelization animation
   * @returns {Promise} Promise that resolves when animation completes
   */
  startAnimation() {
    return new Promise((resolve) => {
      if (this.animationStarted) {
        resolve();
        return;
      }
      
      // If runOnlyOnce is enabled and animation was already completed, skip
      if (this.options.runOnlyOnce && this.animationCompleted) {
        resolve();
        return;
      }
      
      this.animationStarted = true;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / this.options.duration, 1);
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (progress <= this.options.phase1Duration) {
          // Phase 1: Transparent background
          this.canvas.style.opacity = '1';
          // Canvas remains clear during this phase
          
        } else if (progress <= this.options.phase1Duration + this.options.phase2Duration) {
          // Phase 2: Average color fades in
          this.canvas.style.opacity = '1';
          if (!this.drawWidth || !this.drawHeight) {
            this.calculateImageDimensions();
          }
          
          const colorFadeProgress = (progress - this.options.phase1Duration) / this.options.phase2Duration;
          const colorOpacity = colorFadeProgress;
          
          this.ctx.fillStyle = this.calculateAverageColor();
          this.ctx.globalAlpha = colorOpacity;
          this.ctx.fillRect(this.drawX, this.drawY, this.drawWidth, this.drawHeight);
          this.ctx.globalAlpha = 1;
          
        } else if (progress <= this.options.phase1Duration + this.options.phase2Duration + this.options.phase3Duration) {
          // Phase 3: Pixelated effect
          this.canvas.style.opacity = '1';
          const pixelPhaseStart = this.options.phase1Duration + this.options.phase2Duration;
          const pixelPhaseProgress = (progress - pixelPhaseStart) / this.options.phase3Duration;
          
          // Start with large pixels and go down to small pixels
          const pixelSize = Math.max(
            this.options.minPixelSize, 
            Math.floor(this.options.maxPixelSize * (1 - pixelPhaseProgress))
          );
          this.drawPixelatedImage(pixelSize);
          
        } else {
          // Phase 4: Final image reveal
          this.canvas.style.opacity = '1';
          this.drawPixelatedImage(1);
          
          if (progress >= 1) {
            // Animation complete - switch to HTML image
            this.canvas.style.opacity = '0';
            this.image.style.opacity = '1';
            this.animationStarted = false;
            this.animationCompleted = true;
            resolve();
            return;
          }
        }
        
        requestAnimationFrame(animate);
      };
      
      animate();
    });
  }
  
  /**
   * Resets the animation to initial state
   * @param {boolean} resetCompletedFlag - Whether to reset the completed flag (allows re-running if runOnlyOnce is true)
   */
  reset(resetCompletedFlag = false) {
    this.animationStarted = false;
    if (resetCompletedFlag) {
      this.animationCompleted = false;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.style.opacity = '1';
    this.image.style.opacity = '0';
  }
  
  /**
   * Stops the animation and shows the final image
   */
  complete() {
    this.animationStarted = false;
    this.animationCompleted = true;
    this.canvas.style.opacity = '0';
    this.image.style.opacity = '1';
  }
  
  /**
   * Destroys the effect and cleans up event listeners
   */
  destroy() {
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }
    this.reset();
  }
  
  /**
   * Updates animation options
   * @param {object} newOptions - New configuration options
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }
  
  /**
   * Gets current animation progress (0-1)
   * @returns {number} Animation progress
   */
  getProgress() {
    // This would need additional tracking in the animation loop
    // For now, return whether animation is running
    return this.animationStarted ? 0.5 : 0;
  }
}

/**
 * Factory function for easy creation of pixelization effects
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {HTMLImageElement} image - Image element
 * @param {object} options - Configuration options
 * @returns {PixelizationEffect} New effect instance
 */
export function createPixelizationEffect(canvas, image, options = {}) {
  return new PixelizationEffect(canvas, image, options);
}

// Default export for convenience
export default PixelizationEffect;