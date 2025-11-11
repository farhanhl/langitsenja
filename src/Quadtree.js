/**
 * Quadtree - Spatial partitioning structure for efficient object queries
 * Optimized for 2D city layouts (X-Z plane)
 */

import * as THREE from 'three';

class QuadtreeNode {
  constructor(bounds, maxObjects = 10, maxLevels = 5, level = 0) {
    this.bounds = bounds; // { minX, minY, maxX, maxY } - representing X,Z coordinates
    this.maxObjects = maxObjects;
    this.maxLevels = maxLevels;
    this.level = level;
    this.objects = [];
    this.nodes = []; // Children: [NW, NE, SW, SE]
    this.divided = false;
  }

  /**
   * Subdivide the node into 4 quadrants
   */
  subdivide() {
    const { minX, minY, maxX, maxY } = this.bounds;
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    // Create 4 new quadrants
    const nwBounds = { minX: minX, minY: minY, maxX: midX, maxY: midY };
    const neBounds = { minX: midX, minY: minY, maxX: maxX, maxY: midY };
    const swBounds = { minX: minX, minY: midY, maxX: midX, maxY: maxY };
    const seBounds = { minX: midX, minY: midY, maxX: maxX, maxY: maxY };

    this.nodes = [
      new QuadtreeNode(
        nwBounds,
        this.maxObjects,
        this.maxLevels,
        this.level + 1
      ), // NW
      new QuadtreeNode(
        neBounds,
        this.maxObjects,
        this.maxLevels,
        this.level + 1
      ), // NE
      new QuadtreeNode(
        swBounds,
        this.maxObjects,
        this.maxLevels,
        this.level + 1
      ), // SW
      new QuadtreeNode(
        seBounds,
        this.maxObjects,
        this.maxLevels,
        this.level + 1
      ), // SE
    ];

    this.divided = true;
  }

  /**
   * Determine which quadrant a point belongs to
   */
  getIndex(point) {
    const { minX, minY, maxX, maxY } = this.bounds;
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const topQuadrant = point.y < midY;
    const bottomQuadrant = point.y >= midY;
    const leftQuadrant = point.x < midX;
    const rightQuadrant = point.x >= midX;

    // NW
    if (leftQuadrant && topQuadrant) {
      return 0;
    }
    // NE
    if (rightQuadrant && topQuadrant) {
      return 1;
    }
    // SW
    if (leftQuadrant && bottomQuadrant) {
      return 2;
    }
    // SE
    if (rightQuadrant && bottomQuadrant) {
      return 3;
    }

    return -1;
  }

  /**
   * Insert an object into the quadtree
   */
  insert(obj, position) {
    if (!this.divided) {
      // If we haven't divided yet and we're at capacity, subdivide
      if (
        this.objects.length >= this.maxObjects &&
        this.level < this.maxLevels
      ) {
        this.subdivide();

        // Move existing objects to child nodes
        for (let i = 0; i < this.objects.length; i++) {
          const existingObj = this.objects[i];
          const existingPos = new THREE.Vector3();
          existingObj.getWorldPosition
            ? existingObj.getWorldPosition(existingPos)
            : existingPos.copy(existingObj.position);

          const index = this.getIndex(existingPos);
          if (index !== -1) {
            this.nodes[index].insert(existingObj, existingPos);
          } else {
            // Object doesn't fit in a single quadrant, keep in this node
            continue;
          }
        }

        this.objects = []; // Clear objects from this node since they're now in children
      }
    }

    // If we've subdivided, try to insert into appropriate child node
    if (this.divided) {
      const index = this.getIndex(position);

      if (index !== -1) {
        this.nodes[index].insert(obj, position);
        return;
      }
    }

    // If the object doesn't fit in a single child or we haven't subdivided,
    // store in this node
    this.objects.push(obj);
  }

  /**
   * Retrieve potential objects that might intersect with a given bounds
   */
  retrieve(returnObjects, searchBounds) {
    const index = this.getIndexForBounds(searchBounds);

    if (index !== -1 && this.divided) {
      // If search bounds fit in a single quadrant, only search that quadrant
      this.nodes[index].retrieve(returnObjects, searchBounds);
    } else {
      // Otherwise, search all applicable quadrants and this node's objects
      for (let i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].intersectsBounds(searchBounds)) {
          this.nodes[i].retrieve(returnObjects, searchBounds);
        }
      }
    }

    // Add this node's objects
    for (let i = 0; i < this.objects.length; i++) {
      returnObjects.push(this.objects[i]);
    }
  }

  /**
   * Get which quadrant a bounds belongs to (for optimization)
   */
  getIndexForBounds(bounds) {
    const { minX, minY, maxX, maxY } = this.bounds;
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const topQuadrant = bounds.maxY < midY;
    const bottomQuadrant = bounds.minY >= midY;
    const leftQuadrant = bounds.maxX < midX;
    const rightQuadrant = bounds.minX >= midX;

    // NW
    if (leftQuadrant && topQuadrant) {
      return 0;
    }
    // NE
    if (rightQuadrant && topQuadrant) {
      return 1;
    }
    // SW
    if (leftQuadrant && bottomQuadrant) {
      return 2;
    }
    // SE
    if (rightQuadrant && bottomQuadrant) {
      return 3;
    }

    return -1; // Intersects multiple quadrants
  }

  /**
   * Check if bounds intersect with this node's bounds
   */
  intersectsBounds(bounds) {
    return !(
      bounds.minX > this.bounds.maxX ||
      bounds.maxX < this.bounds.minX ||
      bounds.minY > this.bounds.maxY ||
      bounds.maxY < this.bounds.minY
    );
  }

  /**
   * Clear all objects and child nodes
   */
  clear() {
    this.objects = [];
    this.nodes = [];
    this.divided = false;
  }

  /**
   * Count total objects in this node and all children
   */
  count() {
    let count = this.objects.length;
    if (this.divided) {
      for (const node of this.nodes) {
        count += node.count();
      }
    }
    return count;
  }

  /**
   * Return all objects in this node and children
   */
  getAllObjects() {
    let allObjects = [...this.objects];

    if (this.divided) {
      for (const node of this.nodes) {
        allObjects = allObjects.concat(node.getAllObjects());
      }
    }

    return allObjects;
  }
}

/**
 * Quadtree wrapper class for easier management
 */
export class Quadtree {
  constructor(worldBounds, maxObjects = 8, maxLevels = 6) {
    this.root = new QuadtreeNode(worldBounds, maxObjects, maxLevels);
  }

  /**
   * Insert an object into the quadtree
   */
  insert(object) {
    const position = new THREE.Vector3();
    object.getWorldPosition
      ? object.getWorldPosition(position)
      : position.copy(object.position);
    this.root.insert(object, position);
  }

  /**
   * Insert multiple objects
   */
  insertAll(objects) {
    for (const obj of objects) {
      this.insert(obj);
    }
  }

  /**
   * Retrieve potential objects within bounds
   */
  retrieve(searchBounds) {
    const objects = [];
    this.root.retrieve(objects, searchBounds);
    // Remove duplicates
    return [...new Set(objects)];
  }

  /**
   * Clear the entire quadtree
   */
  clear() {
    this.root.clear();
  }

  /**
   * Get total object count
   */
  count() {
    return this.root.count();
  }

  /**
   * Get all objects in the quadtree
   */
  getAllObjects() {
    return this.root.getAllObjects();
  }
}
