/**
 * CityStreamer - Implements smart object streaming to load/unload city sections based on player position
 */
import * as THREE from 'three';

export class CityStreamer {
  constructor(scene, cityData, loadDistance = 100, unloadDistance = 120) {
    this.scene = scene;
    this.cityData = cityData;
    this.loadDistance = loadDistance;
    this.unloadDistance = unloadDistance;
    this.playerPosition = new THREE.Vector3(0, 0, 0);
    this.loadedChunks = new Map(); // Maps chunk keys to their objects
    this.chunkSize = 20; // Size of each chunk in world units
    this.chunkObjects = new Map(); // Maps chunk keys to all objects in that chunk
    this.chunkBounds = new Map(); // Maps chunk keys to bounding boxes
    this.pendingLoads = new Set();
    this.pendingUnloads = new Set();
    
    this.initializeChunks();
  }

  /**
   * Initialize the city into chunks
   */
  initializeChunks() {
    // Process all city objects into chunks
    this.processCityObjectsIntoChunks();
  }

  /**
   * Process all city objects into spatial chunks
   */
  processCityObjectsIntoChunks() {
    // Process buildings
    if (this.cityData.buildings) {
      this.cityData.buildings.forEach(building => {
        this.addObjectToChunk(building.mesh, 'building');
      });
    }

    // Process roads
    if (this.cityData.roads) {
      this.cityData.roads.forEach(road => {
        this.addObjectToChunk(road, 'road');
      });
    }

    // Process sidewalks
    if (this.cityData.sidewalks) {
      this.cityData.sidewalks.forEach(sidewalk => {
        this.addObjectToChunk(sidewalk, 'sidewalk');
      });
    }

    // Process any other static objects
    this.scene.traverse(child => {
      if (child.isMesh && !this.isPartOfChunkedObject(child)) {
        // Determine chunk based on position
        const chunkKey = this.getChunkKeyForPosition(child.position);
        if (!this.chunkObjects.has(chunkKey)) {
          this.chunkObjects.set(chunkKey, []);
        }
        this.chunkObjects.get(chunkKey).push({
          object: child,
          type: 'static'
        });
      }
    });
  }

  /**
   * Add an object to the appropriate chunk
   */
  addObjectToChunk(object, type) {
    // Get the object's position
    const position = new THREE.Vector3();
    object.getWorldPosition(position);
    
    // Determine which chunk this object belongs to
    const chunkKey = this.getChunkKeyForPosition(position);
    
    // Create chunk entry if it doesn't exist
    if (!this.chunkObjects.has(chunkKey)) {
      this.chunkObjects.set(chunkKey, []);
    }
    
    // Add object to chunk
    this.chunkObjects.get(chunkKey).push({
      object: object,
      type: type,
      boundingBox: this.calculateBoundingBox(object)
    });
  }

  /**
   * Calculate bounding box for an object
   */
  calculateBoundingBox(object) {
    const box = new THREE.Box3();
    if (object.geometry) {
      box.setFromObject(object);
    } else {
      // For groups, calculate from children
      object.traverse(child => {
        if (child.isMesh) {
          box.expandByObject(child);
        }
      });
    }
    return box;
  }

  /**
   * Get chunk key for a given position
   */
  getChunkKeyForPosition(position) {
    const chunkX = Math.floor(position.x / this.chunkSize);
    const chunkZ = Math.floor(position.z / this.chunkSize);
    return `${chunkX},${chunkZ}`;
  }

  /**
   * Get chunk coordinates from chunk key
   */
  getChunkCoordsFromKey(key) {
    const [x, z] = key.split(',').map(Number);
    return { x, z };
  }

  /**
   * Check if an object is part of a chunked object (like a building group)
   */
  isPartOfChunkedObject(object) {
    // Check if this object is part of any already chunked object
    for (const [chunkKey, objects] of this.chunkObjects) {
      for (const chunkedObj of objects) {
        if (object === chunkedObj.object || object.parent === chunkedObj.object) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Update streaming based on player position
   */
  update(playerPosition) {
    this.playerPosition.copy(playerPosition);
    
    // Determine which chunks should be loaded
    const chunksToLoad = this.getChunksInRange(this.playerPosition, this.loadDistance);
    const chunksToUnload = this.getChunksToUnload(this.playerPosition, this.unloadDistance);
    
    // Process unloads first
    this.processUnloads(chunksToUnload);
    
    // Then process loads
    this.processLoads(chunksToLoad);
  }

  /**
   * Get chunks that should be loaded based on player position and load distance
   */
  getChunksInRange(position, distance) {
    const chunks = new Set();
    const chunksNeeded = Math.ceil(distance / this.chunkSize);
    
    const playerChunkX = Math.floor(position.x / this.chunkSize);
    const playerChunkZ = Math.floor(position.z / this.chunkSize);
    
    for (let x = -chunksNeeded; x <= chunksNeeded; x++) {
      for (let z = -chunksNeeded; z <= chunksNeeded; z++) {
        const chunkX = playerChunkX + x;
        const chunkZ = playerChunkZ + z;
        const chunkKey = `${chunkX},${chunkZ}`;
        
        // Check if this chunk is within the required distance
        const chunkCenterX = (chunkX + 0.5) * this.chunkSize;
        const chunkCenterZ = (chunkZ + 0.5) * this.chunkSize;
        const distanceToChunk = Math.sqrt(
          Math.pow(chunkCenterX - position.x, 2) + 
          Math.pow(chunkCenterZ - position.z, 2)
        );
        
        if (distanceToChunk <= distance + this.chunkSize) {
          chunks.add(chunkKey);
        }
      }
    }
    
    return chunks;
  }

  /**
   * Get chunks that should be unloaded based on player position and unload distance
   */
  getChunksToUnload(position, distance) {
    const chunksToUnload = new Set();
    
    for (const [chunkKey, objects] of this.loadedChunks) {
      const { x: chunkX, z: chunkZ } = this.getChunkCoordsFromKey(chunkKey);
      const chunkCenterX = (chunkX + 0.5) * this.chunkSize;
      const chunkCenterZ = (chunkZ + 0.5) * this.chunkSize;
      
      const distanceToChunk = Math.sqrt(
        Math.pow(chunkCenterX - position.x, 2) + 
        Math.pow(chunkCenterZ - position.z, 2)
      );
      
      if (distanceToChunk > distance) {
        chunksToUnload.add(chunkKey);
      }
    }
    
    return chunksToUnload;
  }

  /**
   * Process chunk loads
   */
  processLoads(chunksToLoad) {
    for (const chunkKey of chunksToLoad) {
      if (!this.loadedChunks.has(chunkKey) && !this.pendingLoads.has(chunkKey)) {
        this.loadChunk(chunkKey);
      }
    }
  }

  /**
   * Process chunk unloads
   */
  processUnloads(chunksToUnload) {
    for (const chunkKey of chunksToUnload) {
      if (this.loadedChunks.has(chunkKey) && !this.pendingUnloads.has(chunkKey)) {
        this.unloadChunk(chunkKey);
      }
    }
  }

  /**
   * Load a chunk
   */
  loadChunk(chunkKey) {
    if (this.chunkObjects.has(chunkKey)) {
      this.pendingLoads.add(chunkKey);
      
      // Add objects to scene
      const objects = this.chunkObjects.get(chunkKey);
      const chunkObjects = [];
      
      for (const chunkObj of objects) {
        if (!chunkObj.object.parent) { // Only add if not already in scene
          this.scene.add(chunkObj.object);
          chunkObjects.push(chunkObj);
        }
      }
      
      this.loadedChunks.set(chunkKey, chunkObjects);
      this.pendingLoads.delete(chunkKey);
    }
  }

  /**
   * Unload a chunk
   */
  unloadChunk(chunkKey) {
    if (this.loadedChunks.has(chunkKey)) {
      this.pendingUnloads.add(chunkKey);
      
      // Remove objects from scene
      const chunkObjects = this.loadedChunks.get(chunkKey);
      for (const chunkObj of chunkObjects) {
        if (chunkObj.object.parent) {
          chunkObj.object.parent.remove(chunkObj.object);
        }
      }
      
      this.loadedChunks.delete(chunkKey);
      this.pendingUnloads.delete(chunkKey);
    }
  }

  /**
   * Get all currently loaded objects
   */
  getLoadedObjects() {
    const allObjects = [];
    for (const chunkObjects of this.loadedChunks.values()) {
      for (const chunkObj of chunkObjects) {
        allObjects.push(chunkObj.object);
      }
    }
    return allObjects;
  }

  /**
   * Get statistics about the streaming system
   */
  getStats() {
    return {
      totalChunks: this.chunkObjects.size,
      loadedChunks: this.loadedChunks.size,
      pendingLoads: this.pendingLoads.size,
      pendingUnloads: this.pendingUnloads.size,
      loadedObjects: this.getLoadedObjects().length
    };
  }

  /**
   * Dispose of all chunks and clean up
   */
  dispose() {
    // Unload all currently loaded chunks
    for (const chunkKey of this.loadedChunks.keys()) {
      this.unloadChunk(chunkKey);
    }
    
    this.loadedChunks.clear();
    this.chunkObjects.clear();
    this.chunkBounds.clear();
    this.pendingLoads.clear();
    this.pendingUnloads.clear();
  }
}