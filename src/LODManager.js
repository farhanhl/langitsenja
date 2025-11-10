/**
 * Level of Detail (LOD) system to switch between detailed and simplified models based on distance
 */
import * as THREE from 'three';

export class LODManager {
  constructor(camera, player) {
    this.camera = camera;
    this.player = player;
    this.lodObjects = new Map(); // Maps objects to their LOD levels
    this.lodDistances = { 
      highDetail: 50,   // Distance threshold for high detail
      mediumDetail: 100, // Distance threshold for medium detail
      lowDetail: 150    // Distance threshold for low detail
    };
  }

  /**
   * Add an object to the LOD system with multiple detail levels
   * @param {THREE.Object3D} object - The object to manage
   * @param {Object} lodData - Object with different levels of geometry detail
   * @param {Object} lodData.high - High detail version
   * @param {Object} lodData.medium - Medium detail version  
   * @param {Object} lodData.low - Low detail version
   */
  addLODObject(object, lodData) {
    this.lodObjects.set(object, {
      object: object,
      lodData: lodData,
      currentLOD: 'high' // Start with highest detail
    });
  }

  /**
   * Update LOD based on distance from player/camera
   */
  update() {
    if (!this.player || !this.camera) return;

    const playerPos = this.player.position || (this.player.mesh ? this.player.mesh.position : new THREE.Vector3(0, 0, 0));

    this.lodObjects.forEach((data, object) => {
      const distance = playerPos.distanceTo(object.position);

      // Determine which LOD level to use based on distance
      let targetLOD = 'low'; // Default to lowest detail
      if (distance <= this.lodDistances.highDetail) {
        targetLOD = 'high';
      } else if (distance <= this.lodDistances.mediumDetail) {
        targetLOD = 'medium';
      } 

      // If LOD level changed, switch visibility
      if (data.currentLOD !== targetLOD && data.lodData[targetLOD]) {
        // Hide current LOD level
        if (data.lodData[data.currentLOD]) {
          if (Array.isArray(data.lodData[data.currentLOD])) {
            data.lodData[data.currentLOD].forEach(mesh => mesh.visible = false);
          } else {
            data.lodData[data.currentLOD].visible = false;
          }
        }

        // Show new LOD level
        if (Array.isArray(data.lodData[targetLOD])) {
          data.lodData[targetLOD].forEach(mesh => mesh.visible = true);
        } else {
          data.lodData[targetLOD].visible = true;
        }

        data.currentLOD = targetLOD;
      }
    });
  }

  /**
   * Create simplified version of an object based on reduction factor
   */
  createSimplifiedVersion(originalObject, reductionFactor = 0.5) {
    // Create a new object with simplified geometries
    const simplifiedObject = new THREE.Group();
    
    originalObject.traverse((child) => {
      if (child.isMesh) {
        // Create simplified geometry based on the type and reduction factor
        
        let newGeometry = child.geometry;
        const geo = child.geometry;
        
        if (geo instanceof THREE.CylinderGeometry) {
          // Create a cylinder with fewer segments
          const p = geo.parameters;
          newGeometry = new THREE.CylinderGeometry(
            p.radiusTop,
            p.radiusBottom,
            p.height,
            Math.max(6, Math.floor(p.radialSegments * reductionFactor)), // Fewer radial segments
            Math.max(1, Math.floor(p.heightSegments * reductionFactor)),  // Fewer height segments
            p.openEnded
          );
        } else if (geo instanceof THREE.SphereGeometry) {
          // Create a sphere with fewer segments
          const p = geo.parameters;
          newGeometry = new THREE.SphereGeometry(
            p.radius,
            Math.max(4, Math.floor(p.widthSegments * reductionFactor)),
            Math.max(3, Math.floor(p.heightSegments * reductionFactor))
          );
        } else if (geo instanceof THREE.TorusGeometry) {
          // Create a torus with fewer segments
          const p = geo.parameters;
          newGeometry = new THREE.TorusGeometry(
            p.radius,
            p.tube,
            Math.max(6, Math.floor(p.radialSegments * reductionFactor)),   // Fewer radial segments
            Math.max(8, Math.floor(p.tubularSegments * reductionFactor))  // Fewer tubular segments
          );
        }
        // For other types of geometry, we could implement more optimization techniques
        
        // Clone material
        let newMaterial = child.material;
        if (Array.isArray(child.material)) {
          newMaterial = child.material.map(m => m.clone());
        } else if (child.material) {
          newMaterial = child.material.clone();
        }
        
        // Create new mesh with simplified geometry
        const newMesh = new THREE.Mesh(newGeometry, newMaterial);
        
        // Copy transformations
        newMesh.position.copy(child.position);
        newMesh.rotation.copy(child.rotation);
        newMesh.scale.copy(child.scale);
        
        simplifiedObject.add(newMesh);
      } else if (child !== originalObject) {
        // For non-mesh objects, copy them if needed (e.g., lights, groups)
        const clonedChild = child.clone();
        clonedChild.position.copy(child.position);
        clonedChild.rotation.copy(child.rotation);
        clonedChild.scale.copy(child.scale);
        simplifiedObject.add(clonedChild);
      }
    });
    
    simplifiedObject.visible = false; // Initially hidden, visibility controlled by LOD system
    simplifiedObject.position.copy(originalObject.position);
    simplifiedObject.rotation.copy(originalObject.rotation);
    simplifiedObject.scale.copy(originalObject.scale);
    
    return simplifiedObject;
  }

  /**
   * Create multiple LOD versions of an object
   */
  createLODVersions(object) {
    const highLOD = object; // Use original object as high detail
    const mediumLOD = this.createSimplifiedVersion(object, 0.6); // 60% of original detail
    const lowLOD = this.createSimplifiedVersion(object, 0.3); // 30% of original detail

    // Initially show high detail version
    mediumLOD.visible = false;
    lowLOD.visible = false;
    // highLOD is already visible if it was before

    this.addLODObject(object, {
      high: highLOD,
      medium: mediumLOD, 
      low: lowLOD
    });

    return {
      high: highLOD,
      medium: mediumLOD,
      low: lowLOD
    };
  }

  /**
   * Dispose of LOD data
   */
  dispose() {
    this.lodObjects.clear();
  }
}