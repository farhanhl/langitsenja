/**
 * Distance-based culling to hide objects that are too far from the player
 */
import * as THREE from 'three';

export class DistanceCuller {
  constructor(player, maxDistance = 200, fadeDistance = 180) {
    this.player = player;
    this.maxDistance = maxDistance;
    this.fadeDistance = fadeDistance; // Distance where objects start to fade
  }

  updateVisibility(objects) {
    if (!this.player || !objects) return;

    const playerPosition = this.player.position || this.player.mesh.position;
    
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];
      
      if (!object || !object.position) continue;
      
      const distance = playerPosition.distanceTo(object.position);
      
      if (distance > this.maxDistance) {
        // Object too far, make invisible
        object.visible = false;
      } else if (distance > this.fadeDistance) {
        // Apply fade effect for objects in fading region
        object.visible = true;
        // Fade materials gradually (if they support opacity)
        if (object.material) {
          this.applyFadeEffect(object, distance);
        }
      } else {
        // Within normal range, make visible
        object.visible = true;
        // Reset opacity if faded before
        this.resetOpacity(object);
      }
    }
  }
  
  applyFadeEffect(object, distance) {
    // Calculate fade factor (0 = fully faded, 1 = normal)
    const fadeRange = this.maxDistance - this.fadeDistance;
    const distanceFromFadeStart = distance - this.fadeDistance;
    const fadeFactor = 1 - (distanceFromFadeStart / fadeRange);
    
    // Apply fade to material if object has material(s)
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => {
          if (material.transparent !== true) {
            material.transparent = true;
          }
          material.opacity = Math.max(0.1, fadeFactor);
        });
      } else {
        if (object.material.transparent !== true) {
          object.material.transparent = true;
        }
        object.material.opacity = Math.max(0.1, fadeFactor);
      }
    }
  }
  
  resetOpacity(object) {
    // Reset opacity for objects in visible range
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => {
          if (material.opacity < 1) {
            material.opacity = 1;
          }
          if (material.transparent === true && this.isNonTransparentMaterial(material)) {
            material.transparent = false;
          }
        });
      } else {
        if (object.material.opacity < 1) {
          object.material.opacity = 1;
        }
        if (object.material.transparent === true && this.isNonTransparentMaterial(object.material)) {
          object.material.transparent = false;
        }
      }
    }
  }
  
  // Helper to determine if a material should remain non-transparent
  isNonTransparentMaterial(material) {
    // Check if original material should not be transparent
    return !(material.userData && material.userData.originslTransparent);
  }
}