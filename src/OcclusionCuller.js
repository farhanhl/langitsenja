/**
 * Efficient Occlusion Culler - Uses raycasting to hide objects blocked by buildings
 * Optimized for city environments with many buildings that can occlude other objects
 */
import * as THREE from 'three';

export class OcclusionCuller {
  constructor(camera, options = {}) {
    this.camera = camera;
    
    // Configuration options
    this.checkFrequency = options.checkFrequency || 2; // Check every 2 frames to save performance
    this.maxObjectsPerCheck = options.maxObjectsPerCheck || 30; // Max objects to check per frame
    this.occlusionDistance = options.occlusionDistance || 100; // Only check objects within this distance
    this.occluderMinSize = options.occluderMinSize || 2; // Only treat objects larger than this as occluders
    
    // Visibility tracking
    this.objectVisibilities = new Map();
    this.frameCounter = 0;
    
    // Occluder objects (buildings, large objects that block view)
    this.occluders = new Set();
    
    // Raycaster for occlusion testing
    this.raycaster = new THREE.Raycaster();
    this.tempVector = new THREE.Vector3();
  }

  /**
   * Add an object that can block other objects (occluder)
   */
  addOccluder(object) {
    if (this.isValidOccluder(object)) {
      this.occluders.add(object);
    }
  }

  /**
   * Check if an object is large enough to be an effective occluder
   */
  isValidOccluder(object) {
    // Check if object has sufficient size to be a meaningful occluder
    const bbox = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const minDimension = Math.min(Math.min(size.x, size.y), size.z);
    return minDimension >= this.occluderMinSize;
  }

  /**
   * Add an object that can be occluded
   */
  addObject(object) {
    this.objectVisibilities.set(object, {
      visible: true,
      lastCheckFrame: 0,
      bbox: new THREE.Box3().setFromObject(object),
      center: new THREE.Vector3()
    });
  }

  /**
   * Remove an object from occlusion tracking
   */
  removeObject(object) {
    this.objectVisibilities.delete(object);
  }

  /**
   * Set multiple objects to track for occlusion
   */
  setObjects(objects) {
    this.objectVisibilities.clear();
    for (const object of objects) {
      this.addObject(object);
    }
  }

  /**
   * Check if a position is occluded by any occluder objects between it and the camera
   */
  isPositionOccluded(position) {
    // Calculate direction from camera to position
    this.tempVector.subVectors(position, this.camera.position).normalize();
    
    // Set up the raycaster
    this.raycaster.set(this.camera.position, this.tempVector);
    
    // Check distance to make sure we only test nearby objects
    const distanceToCamera = this.camera.position.distanceTo(position);
    
    // Get all occluders to test against
    const occluderMeshes = [];
    this.occluders.forEach(occluder => {
      // Only consider occluders that are between camera and target
      const occluderPos = new THREE.Vector3();
      occluder.getWorldPosition(occluderPos);
      const distToOccluder = this.camera.position.distanceTo(occluderPos);
      
      // Only test occluders that are potentially in the path and closer than target
      if (distToOccluder < distanceToCamera + 10) { // +10 to account for occluder size
        if (occluder.isMesh) {
          occluderMeshes.push(occluder);
        } else {
          // For groups, add mesh children
          occluder.traverse(child => {
            if (child.isMesh) {
              occluderMeshes.push(child);
            }
          });
        }
      }
    });

    // Limit ray distance to the target position
    this.raycaster.far = distanceToCamera;

    // Perform intersection test
    const intersects = this.raycaster.intersectObjects(occluderMeshes, true);
    
    // If there are intersections closer than the target position, it's occluded
    for (const intersect of intersects) {
      if (intersect.distance < distanceToCamera - 0.5) { // Small margin to avoid precision issues
        return true; // Occluded by an object in between
      }
    }
    
    return false; // Not occluded
  }

  /**
   * Update occlusion information for tracked objects
   */
  update() {
    this.frameCounter++;
    
    // Only update occlusion information every few frames to save performance
    if (this.frameCounter % this.checkFrequency !== 0) {
      return;
    }

    // Update visibility for tracked objects - only check a subset per frame for performance
    const objectsToCheck = [];
    for (const [object, info] of this.objectVisibilities) {
      // Only check objects that are close enough and haven't been checked recently
      const distance = this.camera.position.distanceTo(object.position);
      if (distance <= this.occlusionDistance && 
          (this.frameCounter - info.lastCheckFrame >= this.checkFrequency)) {
        objectsToCheck.push({ object, info });
      }
    }

    // Limit number of objects to check per frame to maintain performance
    const objectsToCheckNow = objectsToCheck.slice(0, this.maxObjectsPerCheck);

    for (const { object, info } of objectsToCheckNow) {
      // Update bounding box and center position
      info.bbox.setFromObject(object);
      info.bbox.getCenter(info.center);

      // Check distance first (optimization)
      const distanceToCamera = this.camera.position.distanceTo(info.center);
      if (distanceToCamera > this.occlusionDistance) {
        // Still update the frame counter so it gets checked again when closer
        info.lastCheckFrame = this.frameCounter;
        continue;
      }

      // Check if center of object is occluded
      const isOccluded = this.isPositionOccluded(info.center);
      
      // Update visibility
      const previousVisibility = info.visible;
      info.visible = !isOccluded;
      info.lastCheckFrame = this.frameCounter;
      
      // Only update object visibility if it changed
      if (previousVisibility !== info.visible) {
        object.visible = info.visible;
      }
    }
  }

  /**
   * Force update visibility for a specific object
   */
  updateObjectVisibility(object) {
    if (!this.objectVisibilities.has(object)) return;
    
    const info = this.objectVisibilities.get(object);
    info.bbox.setFromObject(object);
    info.bbox.getCenter(info.center);
    
    const isOccluded = this.isPositionOccluded(info.center);
    const previousVisibility = info.visible;
    
    info.visible = !isOccluded;
    info.lastCheckFrame = this.frameCounter;
    
    if (previousVisibility !== info.visible) {
      object.visible = info.visible;
    }
  }

  /**
   * Get statistics about occlusion culling performance
   */
  getStats() {
    let visibleCount = 0;
    let occludedCount = 0;
    
    for (const info of this.objectVisibilities.values()) {
      if (info.visible) visibleCount++;
      else occludedCount++;
    }
    
    return {
      totalObjects: this.objectVisibilities.size,
      visible: visibleCount,
      occluded: occludedCount,
      checkFrequency: this.checkFrequency,
      maxObjectsPerCheck: this.maxObjectsPerCheck,
      occlusionDistance: this.occlusionDistance
    };
  }

  /**
   * Dispose of resources
   */
  dispose() {
    this.objectVisibilities.clear();
    this.occluders.clear();
  }

  /**
   * Set the objects that act as occluders (e.g., buildings, walls)
   */
  setOccluders(occluderObjects) {
    this.occluders.clear();
    for (const obj of occluderObjects) {
      this.addOccluder(obj);
    }
  }
}