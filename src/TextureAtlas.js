/**
 * Texture Atlas manager for batching similar textured objects
 */
import * as THREE from 'three';

export class TextureAtlas {
  constructor(width = 2048, height = 2048) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    
    // Track occupied regions in the atlas
    this.regions = [];
    this.packedTextures = new Map(); // Maps original texture to atlas UV coords
  }

  // Simple packing algorithm (bottom-left to top-right)
  addTexture(texture, name, width, height) {
    // Find a suitable position in the atlas
    const region = this.findEmptyRegion(width, height);
    
    if (region) {
      // Draw texture to the atlas region
      this.context.drawImage(
        texture.image,
        0, 0, texture.image.width, texture.image.height,  // source
        region.x, region.y, width, height               // destination
      );
      
      // Store UV coordinates for this packed texture
      const uvCoords = {
        uMin: region.x / this.width,
        vMin: region.y / this.height,
        uMax: (region.x + width) / this.width,
        vMax: (region.y + height) / this.height,
      };
      
      this.packedTextures.set(name, {
        ...uvCoords,
        region: region
      });
      
      // Update the texture
      this.texture.needsUpdate = true;
      
      return uvCoords;
    }
    
    return null; // Could not fit in atlas
  }

  findEmptyRegion(width, height) {
    // Simple algorithm: scan from bottom left, row by row
    for (let y = 0; y <= this.height - height; y += 16) { // 16px grid alignment
      for (let x = 0; x <= this.width - width; x += 16) {
        if (this.isRegionEmpty(x, y, width, height)) {
          const region = { x, y, width, height };
          this.regions.push(region);
          return region;
        }
      }
    }
    return null; // No space found
  }

  isRegionEmpty(x, y, width, height) {
    // Check if the requested region overlaps with any existing region
    for (const region of this.regions) {
      if (!(x + width <= region.x || 
            region.x + region.width <= x || 
            y + height <= region.y || 
            region.y + region.height <= y)) {
        return false; // Overlap detected
      }
    }
    return true; // Region is empty
  }

  getUVCoords(name) {
    return this.packedTextures.get(name);
  }

  dispose() {
    this.texture.dispose();
  }
}