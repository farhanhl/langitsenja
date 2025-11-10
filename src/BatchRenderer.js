/**
 * Batch Renderer for combining similar objects into a single draw call
 */
import * as THREE from 'three';

export class BatchRenderer {
  constructor(scene) {
    this.scene = scene;
    this.batches = new Map(); // Group objects by material for batching
    this.instancedMeshes = []; // Track instanced meshes for updates
  }

  /**
   * Add an object to be considered for batching
   */
  addObject(object, groupName = 'default') {
    if (!this.batches.has(groupName)) {
      this.batches.set(groupName, []);
    }
    
    this.batches.get(groupName).push(object);
  }

  /**
   * Batch multiple similar objects into a single InstancedMesh
   */
  createBatch(groupName, options = {}) {
    const objects = this.batches.get(groupName);
    if (!objects || objects.length < 2) {
      return; // Need at least 2 objects to batch
    }

    // Group objects by material to create separate batches for different materials
    const materialGroups = new Map();
    
    for (const obj of objects) {
      // Get a unique key for the material
      const materialKey = this.getMaterialKey(obj.material || (obj.children && obj.children[0] ? obj.children[0].material : null));
      
      if (!materialGroups.has(materialKey)) {
        materialGroups.set(materialKey, []);
      }
      materialGroups.get(materialKey).push(obj);
    }

    // Create an InstancedMesh for each material group
    for (const [materialKey, groupObjects] of materialGroups) {
      if (groupObjects.length < 2) continue; // Need at least 2 for batching to be worthwhile

      // Use first object to get the geometry and material
      let baseGeometry = null;
      let baseMaterial = null;
      
      if (groupObjects[0].geometry && groupObjects[0].material) {
        baseGeometry = groupObjects[0].geometry;
        baseMaterial = groupObjects[0].material;
      } else if (groupObjects[0].children && groupObjects[0].children.length > 0) {
        baseGeometry = groupObjects[0].children[0].geometry;
        baseMaterial = groupObjects[0].children[0].material;
      }
      
      if (baseGeometry && baseMaterial) {
        // Create an InstancedMesh with the shared geometry and material
        const instancedMesh = new THREE.InstancedMesh(
          baseGeometry,
          baseMaterial,
          groupObjects.length
        );

        // Set the transformation matrices for each instance
        const matrix = new THREE.Matrix4();
        for (let i = 0; i < groupObjects.length; i++) {
          const obj = groupObjects[i];
          matrix.copy(obj.matrixWorld);
          instancedMesh.setMatrixAt(i, matrix);
        }
        
        instancedMesh.instanceMatrix.needsUpdate = true;
        instancedMesh.count = groupObjects.length;

        // Set position to origin since instances will be positioned individually via matrices
        instancedMesh.position.set(0, 0, 0);
        
        // Add to scene and remove originals
        this.scene.add(instancedMesh);
        
        // Store reference for updates
        this.instancedMeshes.push({
          mesh: instancedMesh,
          sourceObjects: groupObjects
        });

        // Remove original objects from the scene
        for (const obj of groupObjects) {
          if (obj.parent) {
            obj.parent.remove(obj);
          }
        }
      }
    }
  }

  /**
   * Get a unique key for a material
   */
  getMaterialKey(material) {
    if (!material) return 'undefined';
    
    if (Array.isArray(material)) {
      return material.map(m => m.uuid).join(',');
    }
    return material.uuid || 'unknown';
  }

  /**
   * Update the batched objects (for animated objects)
   */
  update() {
    // Update instance matrices if needed (typically not needed for static objects)
    // For dynamic objects that move, we would update their matrices here
  }

  /**
   * Clear all batches
   */
  clear() {
    // Dispose of instanced meshes and remove from scene
    for (const batch of this.instancedMeshes) {
      this.scene.remove(batch.mesh);
      batch.mesh.geometry.dispose();
      if (batch.mesh.material) {
        if (Array.isArray(batch.mesh.material)) {
          batch.mesh.material.forEach(mat => mat.dispose());
        } else {
          batch.mesh.material.dispose();
        }
      }
    }
    
    this.instancedMeshes = [];
    this.batches.clear();
  }
  
  /**
   * Batch similar objects automatically from the scene
   * This can be called during the build process to identify similar objects
   */
  autoBatchSimilarObjects(objects, similarityThreshold = 0.1) {
    // Group objects by similar properties (geometry, material, etc.)
    const groupedObjects = this.groupSimilarObjects(objects);
    
    // Create a batch for each group
    Object.keys(groupedObjects).forEach(groupName => {
      if (groupedObjects[groupName].length > 1) {
        this.createBatchForObjects(groupedObjects[groupName], groupName);
      }
    });
  }
  
  /**
   * Group similar objects together
   */
  groupSimilarObjects(objects) {
    const groups = {};
    
    objects.forEach(obj => {
      // Determine object type based on common characteristics
      let groupName = 'misc';
      
      // For simple grouping by material type
      const materialKey = this.getMaterialKey(obj.material || (obj.children && obj.children[0] ? obj.children[0].material : null));
      
      if (!groups[materialKey]) {
        groups[materialKey] = [];
      }
      groups[materialKey].push(obj);
    });
    
    return groups;
  }
  
  /**
   * Create a batch for a specific set of objects
   */
  createBatchForObjects(objects, groupName) {
    this.batches.set(groupName, objects);
    this.createBatch(groupName);
  }
}