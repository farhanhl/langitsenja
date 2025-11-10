/**
 * Frustum Culling utility to avoid rendering objects outside camera view
 */
import * as THREE from 'three';

export class FrustumCuller {
  constructor(camera) {
    this.camera = camera;
    this.frustum = new THREE.Frustum();
    this.projectionMatrix = new THREE.Matrix4();
    this.modelViewMatrix = new THREE.Matrix4();
    this.boundingSphere = new THREE.Sphere();
  }

  updateFrustum() {
    this.projectionMatrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );
    this.frustum.setFromProjectionMatrix(this.projectionMatrix);
  }

  // Check if an object is visible without updating the frustum each time
  isVisible(object, threshold = 0) {
    // NOTE: Frustum must be updated externally to avoid recalculation for each object
    // Compute bounding sphere if it doesn't exist
    if (!object.geometry || !object.geometry.boundingSphere) {
      if (object.geometry && typeof object.geometry.computeBoundingSphere === 'function') {
        object.geometry.computeBoundingSphere();
      }
    }

    if (object.geometry && object.geometry.boundingSphere) {
      this.boundingSphere.copy(object.geometry.boundingSphere);
      this.boundingSphere.applyMatrix4(object.matrixWorld);

      return this.frustum.intersectsSphere(this.boundingSphere);
    } else {
      // Fallback: use position only
      const worldPosition = new THREE.Vector3();
      object.getWorldPosition(worldPosition);
      return this.frustum.containsPoint(worldPosition);
    }
  }

  cullObjects(objects) {
    // Update frustum once for all objects
    this.updateFrustum();
    const visibleObjects = [];

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];
      // Check visibility without updating frustum repeatedly
      if (this.checkObjectVisibility(object)) {
        visibleObjects.push(object);
        object.visible = true; // Ensure visible objects are shown
      } else {
        // Hide object if not visible
        object.visible = false;
      }
    }

    return visibleObjects;
  }
  
  // Separate function that checks visibility without updating the frustum again
  checkObjectVisibility(object) {
    // Compute bounding sphere if it doesn't exist
    if (!object.geometry || !object.geometry.boundingSphere) {
      if (object.geometry && typeof object.geometry.computeBoundingSphere === 'function') {
        object.geometry.computeBoundingSphere();
      }
    }

    if (object.geometry && object.geometry.boundingSphere) {
      this.boundingSphere.copy(object.geometry.boundingSphere);
      this.boundingSphere.applyMatrix4(object.matrixWorld);

      return this.frustum.intersectsSphere(this.boundingSphere);
    } else {
      // Fallback: use position only
      const worldPosition = new THREE.Vector3();
      object.getWorldPosition(worldPosition);
      return this.frustum.containsPoint(worldPosition);
    }
  }
}