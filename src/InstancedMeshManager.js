/**
 * Instanced Mesh Manager for optimizing repeated objects like traffic lights, benches, etc.
 */
import * as THREE from 'three';

export class InstancedMeshManager {
  constructor(scene) {
    this.scene = scene;
    this.instancedMeshes = new Map(); // Maps object type to instanced mesh
    this.instanceData = new Map(); // Maps object type to instance data
    this.animatedInstances = new Map(); // Maps animated object type to animation data
  }

  /**
   * Create an instanced mesh for objects of the same type
   * @param {string} type - Type identifier for the objects (e.g., 'trafficLight', 'bench')
   * @param {THREE.BufferGeometry} geometry - Shared geometry
   * @param {THREE.Material} material - Shared material
   * @param {number} maxCount - Maximum number of instances
   */
  createInstancedMesh(type, geometry, material, maxCount) {
    const instancedMesh = new THREE.InstancedMesh(geometry, material, maxCount);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // Will be updated every frame
    this.scene.add(instancedMesh);
    
    this.instancedMeshes.set(type, instancedMesh);
    this.instanceData.set(type, {
      count: 0,
      matrices: new Array(maxCount).fill(null).map(() => new THREE.Matrix4()),
      positions: new Array(maxCount).fill(null).map(() => new THREE.Vector3()),
      rotations: new Array(maxCount).fill(null).map(() => new THREE.Euler()),
      scales: new Array(maxCount).fill(null).map(() => new THREE.Vector3(1, 1, 1))
    });
    
    return instancedMesh;
  }

  /**
   * Add an instance to an instanced mesh
   */
  addInstance(type, position, rotation = new THREE.Euler(), scale = new THREE.Vector3(1, 1, 1)) {
    if (!this.instanceData.has(type)) {
      console.warn(`Instanced mesh for type ${type} not created yet`);
      return -1;
    }

    const data = this.instanceData.get(type);
    if (data.count >= data.matrices.length) {
      console.warn(`Maximum instances reached for type ${type}`);
      return -1;
    }

    const index = data.count;
    
    // Store instance data
    data.positions[index].copy(position);
    data.rotations[index].copy(rotation);
    data.scales[index].copy(scale);

    // Calculate and store transformation matrix
    const matrix = data.matrices[index];
    matrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
    
    // Update the instanced mesh
    const instancedMesh = this.instancedMeshes.get(type);
    instancedMesh.setMatrixAt(index, matrix);
    instancedMesh.count = data.count + 1;
    
    data.count++;
    
    return index;
  }

  /**
   * Update an instance's transform
   */
  updateInstance(type, index, position, rotation = null, scale = null) {
    if (!this.instanceData.has(type)) return;
    
    const data = this.instanceData.get(type);
    if (index >= data.count) return;

    // Update stored data
    if (position) data.positions[index].copy(position);
    if (rotation) data.rotations[index].copy(rotation);
    if (scale) data.scales[index].copy(scale);

    // Recalculate and update transformation matrix
    const matrix = data.matrices[index];
    matrix.compose(
      data.positions[index], 
      new THREE.Quaternion().setFromEuler(data.rotations[index]), 
      data.scales[index]
    );
    
    const instancedMesh = this.instancedMeshes.get(type);
    instancedMesh.setMatrixAt(index, matrix);
    instancedMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Remove an instance (by marking it as unused)
   */
  removeInstance(type, index) {
    if (!this.instanceData.has(type)) return;
    
    const data = this.instanceData.get(type);
    if (index >= data.count) return;

    // Move the last instance to the removed position to keep array compact
    if (index < data.count - 1) {
      const lastIndex = data.count - 1;
      
      // Copy last instance's data to the removed index
      data.positions[index].copy(data.positions[lastIndex]);
      data.rotations[index].copy(data.rotations[lastIndex]);
      data.scales[index].copy(data.scales[lastIndex]);
      
      // Recalculate and update transformation matrix
      const matrix = data.matrices[index];
      matrix.compose(
        data.positions[index], 
        new THREE.Quaternion().setFromEuler(data.rotations[index]), 
        data.scales[index]
      );
      
      const instancedMesh = this.instancedMeshes.get(type);
      instancedMesh.setMatrixAt(index, matrix);
    }

    data.count--;
    const instancedMesh = this.instancedMeshes.get(type);
    instancedMesh.count = data.count;
  }

  /**
   * Update all instances for a given type (useful for animations)
   */
  update(type) {
    if (!this.instanceData.has(type) || this.instanceData.get(type).count === 0) return;
    
    const instancedMesh = this.instancedMeshes.get(type);
    const data = this.instanceData.get(type);
    
    // This method can be overridden by specific implementations
    // For static objects like traffic lights, no update is needed
    // For animated objects like birds, we would update their matrices here
  }

  /**
   * Batch multiple similar objects into an instanced mesh
   */
  batchObjects(objects, type, maxCount = 1000) {
    if (!objects || objects.length === 0) return null;
    
    // Get geometry and material from the first object
    const firstObject = objects[0];
    if (!firstObject || !firstObject.geometry || !firstObject.material) {
      console.warn('Invalid object for batching:', firstObject);
      return null;
    }
    
    const geometry = firstObject.geometry;
    const material = firstObject.material;
    
    // Create the instanced mesh
    const instancedMesh = this.createInstancedMesh(type, geometry, material, maxCount);
    
    // Add each object as an instance
    for (const obj of objects) {
      const position = new THREE.Vector3();
      obj.getWorldPosition(position);
      
      const rotation = new THREE.Euler();
      obj.getWorldRotation().setEulerFromQuaternion(rotation);
      
      const scale = new THREE.Vector3();
      obj.getWorldScale(scale);
      
      this.addInstance(type, position, rotation, scale);
      
      // Remove the original object from the scene
      if (obj.parent) {
        obj.parent.remove(obj);
      }
    }
    
    return instancedMesh;
  }

  /**
   * Get the instanced mesh for a given type
   */
  getInstancedMesh(type) {
    return this.instancedMeshes.get(type);
  }

  /**
   * Get count of instances for a given type
   */
  getInstanceCount(type) {
    const data = this.instanceData.get(type);
    return data ? data.count : 0;
  }

  /**
   * Clear all instances for a type
   */
  clearType(type) {
    if (this.instancedMeshes.has(type)) {
      const instancedMesh = this.instancedMeshes.get(type);
      this.scene.remove(instancedMesh);
      instancedMesh.geometry.dispose();
      if (Array.isArray(instancedMesh.material)) {
        instancedMesh.material.forEach(mat => mat.dispose());
      } else {
        instancedMesh.material.dispose();
      }
      this.instancedMeshes.delete(type);
    }
    
    this.instanceData.delete(type);
  }

  /**
   * Create an animated instanced mesh for objects that move or change over time
   */
  createAnimatedInstancedMesh(type, geometry, material, maxCount, animationCallback) {
    const instancedMesh = new THREE.InstancedMesh(geometry, material, maxCount);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // Will be updated every frame
    this.scene.add(instancedMesh);
    
    this.instancedMeshes.set(type, instancedMesh);
    this.instanceData.set(type, {
      count: 0,
      matrices: new Array(maxCount).fill(null).map(() => new THREE.Matrix4()),
      positions: new Array(maxCount).fill(null).map(() => new THREE.Vector3()),
      rotations: new Array(maxCount).fill(null).map(() => new THREE.Euler()),
      scales: new Array(maxCount).fill(null).map(() => new THREE.Vector3(1, 1, 1))
    });
    
    // Set up animation data
    this.animatedInstances.set(type, {
      instancedMesh: instancedMesh,
      animationCallback: animationCallback,
      startTime: Date.now()
    });
    
    return instancedMesh;
  }

  /**
   * Update animated instances
   */
  updateAnimatedInstances(delta) {
    for (const [type, animData] of this.animatedInstances) {
      if (animData.animationCallback) {
        animData.animationCallback(animData.instancedMesh, this.instanceData.get(type), delta);
        animData.instancedMesh.instanceMatrix.needsUpdate = true;
      }
    }
  }

  /**
   * Dispose all instanced meshes
   */
  dispose() {
    for (const [type, instancedMesh] of this.instancedMeshes) {
      this.scene.remove(instancedMesh);
      instancedMesh.geometry.dispose();
      if (Array.isArray(instancedMesh.material)) {
        instancedMesh.material.forEach(mat => mat.dispose());
      } else {
        instancedMesh.material.dispose();
      }
    }
    
    this.instancedMeshes.clear();
    this.instanceData.clear();
    this.animatedInstances.clear();
  }
}