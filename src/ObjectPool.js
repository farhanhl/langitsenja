/**
 * Object Pool pattern to reuse objects instead of constantly creating/destroying them
 */
export class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    
    // Pre-populate the pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    // If pool is empty, create a new object
    return this.createFn();
  }

  release(object) {
    this.resetFn(object);
    this.pool.push(object);
  }

  resize(size) {
    const currentSize = this.pool.length;
    if (size > currentSize) {
      // Grow pool
      for (let i = currentSize; i < size; i++) {
        this.pool.push(this.createFn());
      }
    } else if (size < currentSize) {
      // Shrink pool
      this.pool = this.pool.slice(0, size);
    }
  }

  clear() {
    this.pool = [];
  }
}