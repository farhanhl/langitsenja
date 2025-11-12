import * as THREE from 'three';

class QuadtreeNode {
  constructor(bounds, maxObjects = 10, maxLevels = 5, level = 0) {
    this.bounds = bounds;
    this.maxObjects = maxObjects;
    this.maxLevels = maxLevels;
    this.level = level;
    this.objects = [];
    this.nodes = [];
    this.divided = false;
  }

  subdivide() {
    const { minX, minY, maxX, maxY } = this.bounds;
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

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
      ),
      new QuadtreeNode(
        neBounds,
        this.maxObjects,
        this.maxLevels,
        this.level + 1
      ),
      new QuadtreeNode(
        swBounds,
        this.maxObjects,
        this.maxLevels,
        this.level + 1
      ),
      new QuadtreeNode(
        seBounds,
        this.maxObjects,
        this.maxLevels,
        this.level + 1
      ),
    ];

    this.divided = true;
  }

  getIndex(point) {
    const { minX, minY, maxX, maxY } = this.bounds;
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const topQuadrant = point.y < midY;
    const bottomQuadrant = point.y >= midY;
    const leftQuadrant = point.x < midX;
    const rightQuadrant = point.x >= midX;

    if (leftQuadrant && topQuadrant) {
      return 0;
    }

    if (rightQuadrant && topQuadrant) {
      return 1;
    }

    if (leftQuadrant && bottomQuadrant) {
      return 2;
    }

    if (rightQuadrant && bottomQuadrant) {
      return 3;
    }

    return -1;
  }

  insert(obj, position) {
    if (!this.divided) {
      if (
        this.objects.length >= this.maxObjects &&
        this.level < this.maxLevels
      ) {
        this.subdivide();
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
            continue;
          }
        }

        this.objects = [];
      }
    }

    if (this.divided) {
      const index = this.getIndex(position);

      if (index !== -1) {
        this.nodes[index].insert(obj, position);
        return;
      }
    }

    this.objects.push(obj);
  }

  retrieve(returnObjects, searchBounds) {
    const index = this.getIndexForBounds(searchBounds);

    if (index !== -1 && this.divided) {
      this.nodes[index].retrieve(returnObjects, searchBounds);
    } else {
      for (let i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].intersectsBounds(searchBounds)) {
          this.nodes[i].retrieve(returnObjects, searchBounds);
        }
      }
    }

    for (let i = 0; i < this.objects.length; i++) {
      returnObjects.push(this.objects[i]);
    }
  }

  getIndexForBounds(bounds) {
    const { minX, minY, maxX, maxY } = this.bounds;
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const topQuadrant = bounds.maxY < midY;
    const bottomQuadrant = bounds.minY >= midY;
    const leftQuadrant = bounds.maxX < midX;
    const rightQuadrant = bounds.minX >= midX;

    if (leftQuadrant && topQuadrant) {
      return 0;
    }

    if (rightQuadrant && topQuadrant) {
      return 1;
    }

    if (leftQuadrant && bottomQuadrant) {
      return 2;
    }

    if (rightQuadrant && bottomQuadrant) {
      return 3;
    }

    return -1;
  }

  intersectsBounds(bounds) {
    return !(
      bounds.minX > this.bounds.maxX ||
      bounds.maxX < this.bounds.minX ||
      bounds.minY > this.bounds.maxY ||
      bounds.maxY < this.bounds.minY
    );
  }

  clear() {
    this.objects = [];
    this.nodes = [];
    this.divided = false;
  }

  count() {
    let count = this.objects.length;
    if (this.divided) {
      for (const node of this.nodes) {
        count += node.count();
      }
    }
    return count;
  }

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

export class Quadtree {
  constructor(worldBounds, maxObjects = 8, maxLevels = 6) {
    this.root = new QuadtreeNode(worldBounds, maxObjects, maxLevels);
  }

  insert(object) {
    const position = new THREE.Vector3();
    object.getWorldPosition
      ? object.getWorldPosition(position)
      : position.copy(object.position);
    this.root.insert(object, position);
  }

  insertAll(objects) {
    for (const obj of objects) {
      this.insert(obj);
    }
  }

  retrieve(searchBounds) {
    const objects = [];
    this.root.retrieve(objects, searchBounds);
    // Remove duplicates
    return [...new Set(objects)];
  }

  clear() {
    this.root.clear();
  }

  count() {
    return this.root.count();
  }

  getAllObjects() {
    return this.root.getAllObjects();
  }
}
