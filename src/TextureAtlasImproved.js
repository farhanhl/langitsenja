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
    
    // Use a more efficient packing algorithm
    this.packer = new MaxRectsPacker(width, height, 2, true); // padding of 2px, allow rotation
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.generateMipmaps = false; // Disable mipmaps for better performance
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.minFilter = THREE.LinearFilter;
    
    // Track packed textures and their UV coordinates
    this.packedTextures = new Map(); // Maps original texture to atlas UV coords
    this.textureToCanvas = new Map(); // Maps texture to canvas for reference
  }

  // Improved packing algorithm
  addTexture(texture, name, width = 256, height = 256) {
    // Pack the rectangle
    const rect = this.packer.insert(width, height);
    
    if (!rect) {
      console.warn(`Could not pack texture ${name} in atlas`);
      return null;
    }

    // Draw texture to the atlas region
    if (texture.image) {
      this.context.drawImage(
        texture.image,
        0, 0, texture.image.width, texture.image.height,
        rect.x, rect.y, width, height
      );
    } else {
      // Draw a placeholder if no image
      this.context.fillStyle = '#808080';
      this.context.fillRect(rect.x, rect.y, width, height);
    }

    // Store UV coordinates for this packed texture
    const uvCoords = {
      uMin: rect.x / this.width,
      vMin: rect.y / this.height,
      uMax: (rect.x + width) / this.width,
      vMax: (rect.y + height) / this.height,
    };

    this.packedTextures.set(name, {
      ...uvCoords,
      rect: rect,
      originalTexture: texture
    });

    // Update the texture
    this.texture.needsUpdate = true;

    return uvCoords;
  }

  // Add multiple textures at once for better packing
  addMultipleTextures(textures) {
    // First, sort textures by area (largest first for better packing)
    const sortedTextures = textures.sort((a, b) => 
      (b.width * b.height) - (a.width * a.height)
    );
    
    const result = {};
    
    for (const tex of sortedTextures) {
      const uv = this.addTexture(tex.texture, tex.name, tex.width, tex.height);
      result[tex.name] = uv;
    }
    
    return result;
  }

  getUVCoords(name) {
    return this.packedTextures.get(name);
  }
  
  getAtlasTexture() {
    return this.texture;
  }

  dispose() {
    this.texture.dispose();
    this.packedTextures.clear();
  }
}

// Max Rects Bin Packer implementation for optimal texture packing
class MaxRectsPacker {
  constructor(width, height, padding = 0, allowRotation = false) {
    this.width = width;
    this.height = height;
    this.padding = padding;
    this.allowRotation = allowRotation;
    this.usedRects = [];
    this.freeRects = [
      { x: 0, y: 0, width: width, height: height }
    ];
  }

  insert(width, height) {
    const node = this.findPosition(width, height);
    if (node) {
      this.placeRect(node);
      return node;
    }
    return null;
  }

  findPosition(width, height) {
    let bestNode = null;
    let bestScore = Infinity;

    const rect = { width: width, height: height };
    // Try original orientation
    for (let i = 0; i < this.freeRects.length; i++) {
      const node = this.scoreRect(rect.width, rect.height, this.freeRects[i]);
      if (node.score < bestScore) {
        bestScore = node.score;
        bestNode = node;
      }
    }

    if (this.allowRotation) {
      // Try rotated orientation
      for (let i = 0; i < this.freeRects.length; i++) {
        const node = this.scoreRect(rect.height, rect.width, this.freeRects[i]);
        if (node.score < bestScore) {
          bestScore = node.score;
          bestNode = node;
          // Mark for rotation
          bestNode.rotated = true;
        }
      }
    }

    // Swap dimensions if rotated
    if (bestNode && bestNode.rotated) {
      [bestNode.width, bestNode.height] = [bestNode.height, bestNode.width];
    }

    return bestNode;
  }

  scoreRect(width, height, rect) {
    if (rect.width < width || rect.height < height) {
      return { score: Infinity, x: 0, y: 0 };
    }

    const score = rect.width * rect.height - width * height;
    return {
      score: score,
      x: rect.x,
      y: rect.y,
      width: width,
      height: height
    };
  }

  placeRect(node) {
    if (!node || node.score === Infinity) return;

    // Add the node to used rectangles
    this.usedRects.push({ ...node });

    // Split the free rectangle and add new free rectangles
    this.splitFreeRects(node);

    // Clean up the free rectangle list
    this.pruneFreeRects();
  }

  splitFreeRects(node) {
    for (let i = this.freeRects.length - 1; i >= 0; i--) {
      const freeRect = this.freeRects[i];
      if (this.rectIntersect(node, freeRect)) {
        // Remove the intersecting rectangle
        this.freeRects.splice(i, 1);

        // Add new rectangles for the remaining areas
        const newRects = this.splitRectByRect(freeRect, node);
        this.freeRects.push(...newRects);
      }
    }
  }

  rectIntersect(rectA, rectB) {
    return (
      rectA.x < rectB.x + rectB.width &&
      rectA.x + rectA.width > rectB.x &&
      rectA.y < rectB.y + rectB.height &&
      rectA.y + rectA.height > rectB.y
    );
  }

  splitRectByRect(rect, position) {
    const result = [];
    
    // Left part
    if (position.x > rect.x && position.x < rect.x + rect.width) {
      result.push({
        x: rect.x,
        y: rect.y,
        width: position.x - rect.x,
        height: rect.height
      });
    }

    // Right part
    if (position.x + position.width < rect.x + rect.width) {
      result.push({
        x: position.x + position.width,
        y: rect.y,
        width: rect.x + rect.width - (position.x + position.width),
        height: rect.height
      });
    }

    // Top part (only for non-overlapping areas)
    if (position.y > rect.y && position.y < rect.y + rect.height) {
      result.push({
        x: Math.max(rect.x, position.x),
        y: rect.y,
        width: Math.min(
          rect.x + rect.width - Math.max(rect.x, position.x),
          Math.max(position.x + position.width, rect.x + rect.width) - Math.max(rect.x, position.x)
        ),
        height: position.y - rect.y
      });
    }

    // Bottom part (only for non-overlapping areas)
    if (position.y + position.height < rect.y + rect.height) {
      result.push({
        x: Math.max(rect.x, position.x),
        y: position.y + position.height,
        width: Math.min(
          rect.x + rect.width - Math.max(rect.x, position.x),
          Math.max(position.x + position.width, rect.x + rect.width) - Math.max(rect.x, position.x)
        ),
        height: rect.y + rect.height - (position.y + position.height)
      });
    }

    return result;
  }

  pruneFreeRects() {
    this.freeRects = this.freeRects.filter((rect, i) => {
      for (let j = i + 1; j < this.freeRects.length; j++) {
        if (this.rectContains(this.freeRects[j], rect)) {
          return false;
        }
      }
      return true;
    });
  }

  rectContains(rectA, rectB) {
    return (
      rectA.x <= rectB.x &&
      rectA.y <= rectB.y &&
      rectA.x + rectA.width >= rectB.x + rectB.width &&
      rectA.y + rectB.height >= rectB.y + rectB.height
    );
  }
}