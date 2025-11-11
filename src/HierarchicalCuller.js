/**
 * Hierarchical Culler - Uses spatial partitioning (quadtree) to efficiently cull objects
 * Divides the city into regions and only checks visibility for regions near the player
 */
import * as THREE from 'three';
import { Quadtree } from './Quadtree.js';

export class HierarchicalCuller {
  constructor(camera, options = {}) {
    this.camera = camera;
    
    // Configuration options
    this.regionSize = options.regionSize || 50; // Size of each region in world units
    this.visibilityDistance = options.visibilityDistance || 120; // Distance to show regions
    this.checkFrequency = options.checkFrequency || 1; // How often to update (every N frames)
    this.maxObjectsPerRegion = options.maxObjectsPerRegion || 10; // Max objects per quadtree cell
    this.maxQuadtreeLevels = options.maxQuadtreeLevels || 5; // Max levels in quadtree
    
    // Tracking
    this.frameCounter = 0;
    this.regionVisibility = new Map(); // Tracks which regions are visible
    this.regionObjects = new Map(); // Maps regions to their objects
    this.objectToRegion = new Map(); // Maps objects to their regions
    this.cameraPosition = new THREE.Vector3();
    
    // Quadtree for each region
    this.quadtrees = new Map();
    
    // Bounding boxes for regions
    this.regionBounds = new Map();
  }

  /**
   * Initialize the culling system with objects
   */
  initialize(objects) {
    // Clear existing data
    this.regionVisibility.clear();
    this.regionObjects.clear();
    this.objectToRegion.clear();
    this.quadtrees.clear();
    this.regionBounds.clear();
    
    // Calculate world bounds to set up regions
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    for (const obj of objects) {
      const position = new THREE.Vector3();
      obj.getWorldPosition ? obj.getWorldPosition(position) : position.copy(obj.position);
      
      if (position.x < minX) minX = position.x;
      if (position.x > maxX) maxX = position.x;
      if (position.z < minY) minY = position.z;
      if (position.z > maxY) maxY = position.z;
    }
    
    // Add padding to ensure all objects fit
    minX -= this.regionSize;
    maxX += this.regionSize;
    minY -= this.regionSize;
    maxY += this.regionSize;
    
    // Create regions and assign objects
    for (const obj of objects) {
      const position = new THREE.Vector3();
      obj.getWorldPosition ? obj.getWorldPosition(position) : position.copy(obj.position);
      
      const regionKey = this.getRegionKey(position.x, position.z);
      
      // Create region if it doesn't exist
      if (!this.regionObjects.has(regionKey)) {
        const regionBounds = this.getRegionBounds(regionKey);
        this.regionBounds.set(regionKey, regionBounds);
        
        // Create a quadtree for this region
        this.quadtrees.set(regionKey, new Quadtree(regionBounds, this.maxObjectsPerRegion, this.maxQuadtreeLevels));
      }
      
      // Add object to region
      if (!this.regionObjects.has(regionKey)) {
        this.regionObjects.set(regionKey, []);
      }
      this.regionObjects.get(regionKey).push(obj);
      this.objectToRegion.set(obj, regionKey);
      
      // Insert object into the region's quadtree
      const quadtree = this.quadtrees.get(regionKey);
      quadtree.insert(obj);
    }
  }

  /**
   * Get region key for coordinates
   */
  getRegionKey(x, z) {
    const regionX = Math.floor(x / this.regionSize);
    const regionZ = Math.floor(z / this.regionSize);
    return `${regionX},${regionZ}`;
  }

  /**
   * Get bounds for a region
   */
  getRegionBounds(regionKey) {
    const [regionX, regionZ] = regionKey.split(',').map(Number);
    return {
      minX: regionX * this.regionSize,
      minY: regionZ * this.regionSize,
      maxX: (regionX + 1) * this.regionSize,
      maxY: (regionZ + 1) * this.regionSize
    };
  }

  /**
   * Update culling based on camera position
   */
  update() {
    this.frameCounter++;
    
    // Only update every few frames to save performance
    if (this.frameCounter % this.checkFrequency !== 0) {
      return;
    }

    // Get current camera position
    this.camera.getWorldPosition(this.cameraPosition);
    
    // Determine which regions should be visible based on camera position
    const visibleRegions = this.getVisibleRegions(this.cameraPosition);
    
    // Update visibility for each region
    for (const [regionKey, objects] of this.regionObjects) {
      const shouldBeVisible = visibleRegions.has(regionKey);
      const wasVisible = this.regionVisibility.get(regionKey) || false;
      
      if (shouldBeVisible !== wasVisible) {
        // Region visibility changed
        this.setRegionVisibility(regionKey, shouldBeVisible);
        this.regionVisibility.set(regionKey, shouldBeVisible);
      }
    }
  }

  /**
   * Get regions that should be visible based on camera position
   */
  getVisibleRegions(cameraPosition) {
    const visibleRegions = new Set();
    
    // Calculate the radius in region units
    const regionsRadius = Math.ceil(this.visibilityDistance / this.regionSize);
    
    // Get the camera's current region
    const cameraRegionX = Math.floor(cameraPosition.x / this.regionSize);
    const cameraRegionZ = Math.floor(cameraPosition.z / this.regionSize);
    
    // Find all regions within the visibility radius
    for (let dx = -regionsRadius; dx <= regionsRadius; dx++) {
      for (let dz = -regionsRadius; dz <= regionsRadius; dz++) {
        const regionX = cameraRegionX + dx;
        const regionZ = cameraRegionZ + dz;
        const regionKey = `${regionX},${regionZ}`;
        
        // Check if this region is within the spherical distance
        const regionCenterX = (regionX + 0.5) * this.regionSize;
        const regionCenterZ = (regionZ + 0.5) * this.regionSize;
        
        const distance = Math.sqrt(
          Math.pow(regionCenterX - cameraPosition.x, 2) +
          Math.pow(regionCenterZ - cameraPosition.z, 2)
        );
        
        if (distance <= this.visibilityDistance) {
          visibleRegions.add(regionKey);
        }
      }
    }
    
    return visibleRegions;
  }

  /**
   * Set visibility for all objects in a region
   */
  setRegionVisibility(regionKey, visible) {
    const objects = this.regionObjects.get(regionKey) || [];
    
    for (const obj of objects) {
      obj.visible = visible;
    }
  }

  /**
   * Update visibility for a specific object
   */
  updateObjectVisibility(object) {
    const regionKey = this.objectToRegion.get(object);
    if (regionKey) {
      const isRegionVisible = this.regionVisibility.get(regionKey) || false;
      object.visible = isRegionVisible;
    }
  }

  /**
   * Add a new object to the culling system
   */
  addObject(object) {
    const position = new THREE.Vector3();
    object.getWorldPosition ? object.getWorldPosition(position) : position.copy(object.position);
    
    const regionKey = this.getRegionKey(position.x, position.z);
    
    // Create region if it doesn't exist
    if (!this.regionObjects.has(regionKey)) {
      const regionBounds = this.getRegionBounds(regionKey);
      this.regionBounds.set(regionKey, regionBounds);
      this.quadtrees.set(regionKey, new Quadtree(regionBounds, this.maxObjectsPerRegion, this.maxQuadtreeLevels));
    }
    
    // Add to region objects
    if (!this.regionObjects.has(regionKey)) {
      this.regionObjects.set(regionKey, []);
    }
    this.regionObjects.get(regionKey).push(object);
    this.objectToRegion.set(object, regionKey);
    
    // Add to quadtree
    const quadtree = this.quadtrees.get(regionKey);
    quadtree.insert(object);
  }

  /**
   * Remove an object from the culling system
   */
  removeObject(object) {
    const regionKey = this.objectToRegion.get(object);
    if (regionKey && this.regionObjects.has(regionKey)) {
      const objects = this.regionObjects.get(regionKey);
      const index = objects.indexOf(object);
      if (index !== -1) {
        objects.splice(index, 1);
      }
      this.objectToRegion.delete(object);
      
      // Also remove from quadtree if possible
      // (Our quadtree implementation doesn't have a remove method, so we'd need to rebuild)
      // For now, we'll just keep track of it, or reinitialize if needed frequently
    }
  }

  /**
   * Get statistics about the hierarchical culling
   */
  getStats() {
    let totalRegions = this.regionObjects.size;
    let visibleRegions = 0;
    let totalObjects = 0;
    let visibleObjects = 0;
    
    for (const [regionKey, isVisible] of this.regionVisibility) {
      if (isVisible) visibleRegions++;
      if (this.regionObjects.has(regionKey)) {
        const objects = this.regionObjects.get(regionKey);
        totalObjects += objects.length;
        if (isVisible) visibleObjects += objects.length;
      }
    }
    
    return {
      totalRegions,
      visibleRegions,
      regionsRadius: Math.ceil(this.visibilityDistance / this.regionSize),
      totalObjects,
      visibleObjects,
      visibilityDistance: this.visibilityDistance,
      regionSize: this.regionSize
    };
  }

  /**
   * Dispose of resources
   */
  dispose() {
    this.regionVisibility.clear();
    this.regionObjects.clear();
    this.objectToRegion.clear();
    this.quadtrees.clear();
    this.regionBounds.clear();
  }
}