/**
 * Texture Manager for optimizing texture loading and compression
 */
import * as THREE from 'three';

export class TextureManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.compressionSupport = this.checkCompressionSupport();
    this.textureCache = new Map();
    this.compressedTextureCache = new Map();
  }

  /**
   * Check which texture compression formats are supported
   */
  checkCompressionSupport() {
    const gl = this.renderer.getContext();
    return {
      s3tc: !!gl.getExtension('WEBGL_compressed_texture_s3tc') ||
             !!gl.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc') ||
             !!gl.getExtension('MOZ_WEBGL_compressed_texture_s3tc'),
      etc1: !!gl.getExtension('WEBGL_compressed_texture_etc1'),
      pvrtc: !!gl.getExtension('WEBGL_compressed_texture_pvrtc') ||
             !!gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc'),
      etc2: !!gl.getExtension('WEBGL_compressed_texture_etc'),
      astc: !!gl.getExtension('WEBGL_compressed_texture_astc')
    };
  }

  /**
   * Load and optimize a texture
   */
  loadTexture(src, options = {}) {
    const cacheKey = `${src}_${JSON.stringify(options)}`;
    
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey);
    }

    const texture = new THREE.TextureLoader().load(src, (tex) => {
      // Optimize texture properties for performance
      tex.generateMipmaps = false; // Disable mipmaps for better performance
      tex.anisotropy = Math.min(2, this.renderer.capabilities.getMaxAnisotropy()); // Reduced anisotropy
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearFilter; // Use linear filtering for better performance
      
      // Apply options
      if (options.wrapS !== undefined) tex.wrapS = options.wrapS;
      if (options.wrapT !== undefined) tex.wrapT = options.wrapT;
      if (options.repeat) {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(options.repeat.x, options.repeat.y);
      }
      
      // Set texture properties based on usage
      if (options.type === 'normal') {
        tex.flipY = false; // Normals don't need flipping
      }
    });

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  /**
   * Create a compressed texture if supported
   */
  createCompressedTexture(imageData, format, options = {}) {
    // Check if requested format is supported
    if (!this.compressionSupport[format]) {
      console.warn(`Texture compression format ${format} not supported`);
      // Fallback to regular texture
      return this.createOptimizedTexture(imageData, options);
    }

    // For now, return a regular texture with optimization
    // In a real implementation, this would create actual compressed textures
    const texture = new THREE.CanvasTexture(imageData.canvas || imageData);
    this.configureOptimizedTexture(texture, options);
    return texture;
  }

  /**
   * Create a regular optimized texture
   */
  createOptimizedTexture(image, options = {}) {
    const texture = new THREE.Texture(image);
    this.configureOptimizedTexture(texture, options);
    return texture;
  }

  /**
   * Configure texture with optimized settings
   */
  configureOptimizedTexture(texture, options = {}) {
    // Optimize texture properties for performance
    texture.generateMipmaps = false; // Mipmaps consume extra memory and may not be needed
    texture.anisotropy = Math.min(2, this.renderer.capabilities.getMaxAnisotropy()); // Reduce anisotropy for performance
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter; // Use linear filtering instead of trilinear
    
    // Apply options
    texture.wrapS = options.wrapS || THREE.ClampToEdgeWrapping;
    texture.wrapT = options.wrapT || THREE.ClampToEdgeWrapping;
    
    if (options.repeat) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(options.repeat.x, options.repeat.y);
    }
    
    // Update texture when needed
    texture.needsUpdate = true;
  }

  /**
   * Generate optimized texture from canvas
   */
  generateTextureFromCanvas(canvas, options = {}) {
    const texture = new THREE.CanvasTexture(canvas);
    this.configureOptimizedTexture(texture, options);
    return texture;
  }

  /**
   * Resize texture to power of 2 dimensions for better GPU performance
   */
  resizeTextureToPowerOfTwo(texture, maxDimension = 2048) {
    if (!texture.image || !texture.image.width || !texture.image.height) {
      return texture; // Can't resize if no image data
    }

    // Check if already power of 2
    const width = this.nextPowerOfTwo(Math.min(texture.image.width, maxDimension));
    const height = this.nextPowerOfTwo(Math.min(texture.image.height, maxDimension));

    // If dimensions are already correct, return as is
    if (width === texture.image.width && height === texture.image.height) {
      return texture;
    }

    // Create a canvas to resize the image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Draw the original image to the new canvas, resized
    ctx.drawImage(texture.image, 0, 0, width, height);

    // Create a new texture from the resized canvas
    const resizedTexture = new THREE.CanvasTexture(canvas);
    this.configureOptimizedTexture(resizedTexture, texture);
    
    // Dispose of the original texture if it was created by us
    texture.dispose?.();
    
    return resizedTexture;
  }

  /**
   * Get the next power of 2
   */
  nextPowerOfTwo(n) {
    let count = 1;
    while (count < n) count <<= 1;
    return count;
  }

  /**
   * Get texture compression info
   */
  getCompressionInfo() {
    return {
      supported: this.compressionSupport,
      renderer: `WebGL ${this.renderer.capabilities.version}`,
      maxAnisotropy: this.renderer.capabilities.getMaxAnisotropy()
    };
  }

  /**
   * Clear texture cache
   */
  clearCache() {
    for (const texture of this.textureCache.values()) {
      texture.dispose();
    }
    this.textureCache.clear();
    this.compressedTextureCache.clear();
  }
}