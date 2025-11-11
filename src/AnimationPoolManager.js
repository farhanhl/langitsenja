/**
 * Animation Pool Manager for recycling animation objects and preventing garbage collection
 */
export class AnimationPoolManager {
  constructor() {
    this.pools = new Map(); // Maps animation type to object pool
    this.activeAnimations = new Set(); // Currently active animations
  }

  /**
   * Initialize a pool for a specific animation type
   */
  initPool(type, createFn, resetFn, initialSize = 10) {
    if (!this.pools.has(type)) {
      this.pools.set(type, {
        available: [],
        createFn: createFn,
        resetFn: resetFn
      });
      
      // Pre-populate pool
      for (let i = 0; i < initialSize; i++) {
        const obj = createFn();
        this.pools.get(type).available.push(obj);
      }
    }
  }

  /**
   * Acquire an animation object from the pool
   */
  acquire(type) {
    const pool = this.pools.get(type);
    if (!pool) {
      console.warn(`Animation pool for type ${type} not initialized`);
      return null;
    }

    if (pool.available.length > 0) {
      const obj = pool.available.pop();
      this.activeAnimations.add(obj);
      return obj;
    } else {
      // Create new object if pool is empty
      const obj = pool.createFn();
      this.activeAnimations.add(obj);
      return obj;
    }
  }

  /**
   * Release an animation object back to the pool
   */
  release(type, obj) {
    const pool = this.pools.get(type);
    if (!pool) return;

    // Reset the object to initial state
    pool.resetFn(obj);
    
    this.activeAnimations.delete(obj);
    pool.available.push(obj);
  }

  /**
   * Create a precalculated animation sequence to reduce per-frame calculations
   */
  createPrecalculatedAnimation(target, property, keyframes, duration = 1000) {
    const sequence = {
      target,
      property,
      keyframes: [...keyframes],
      duration,
      startTime: 0,
      active: false,
      easing: 'linear',
      onUpdate: null
    };
    
    return sequence;
  }

  /**
   * Start a precalculated animation
   */
  startAnimation(animation, startTime = performance.now()) {
    animation.startTime = startTime;
    animation.active = true;
    return animation;
  }

  /**
   * Update all active animations
   */
  update(delta) {
    const now = performance.now();
    
    for (const animation of this.activeAnimations) {
      if (animation.active) {
        const elapsed = now - animation.startTime;
        const progress = Math.min(elapsed / animation.duration, 1.0);
        
        if (progress >= 1.0) {
          // Animation finished
          this.finishAnimation(animation);
        } else {
          // Update animation
          this.interpolateAnimation(animation, progress);
        }
      }
    }
  }

  /**
   * Interpolate animation values
   */
  interpolateAnimation(animation, progress) {
    if (animation.onUpdate) {
      animation.onUpdate(animation, progress);
      return;
    }

    // Simple interpolation for numeric properties
    if (animation.keyframes && animation.keyframes.length > 0) {
      const lastIndex = Math.floor(progress * (animation.keyframes.length - 1));
      const nextIndex = Math.min(lastIndex + 1, animation.keyframes.length - 1);
      
      if (lastIndex < animation.keyframes.length) {
        const frameProgress = (progress * (animation.keyframes.length - 1)) % 1;
        const currentValue = animation.keyframes[lastIndex];
        const nextValue = animation.keyframes[nextIndex];
        
        let interpolatedValue;
        
        if (typeof currentValue === 'number') {
          interpolatedValue = currentValue + (nextValue - currentValue) * frameProgress;
        } else if (Array.isArray(currentValue)) {
          // Array interpolation (e.g., [x, y, z])
          interpolatedValue = [];
          for (let i = 0; i < currentValue.length; i++) {
            interpolatedValue[i] = currentValue[i] + (nextValue[i] - currentValue[i]) * frameProgress;
          }
        } else if (typeof currentValue === 'object' && currentValue !== null) {
          // Object interpolation (e.g., {x, y, z})
          interpolatedValue = {};
          for (const prop in currentValue) {
            interpolatedValue[prop] = currentValue[prop] + (nextValue[prop] - currentValue[prop]) * frameProgress;
          }
        } else {
          interpolatedValue = currentValue;
        }
        
        // Apply the interpolated value to the target property
        if (animation.target && animation.property) {
          if (typeof interpolatedValue === 'object') {
            Object.assign(animation.target[animation.property], interpolatedValue);
          } else {
            animation.target[animation.property] = interpolatedValue;
          }
        }
      }
    }
  }

  /**
   * Finish an animation
   */
  finishAnimation(animation) {
    animation.active = false;
    
    // Apply final values
    if (animation.keyframes && animation.keyframes.length > 0) {
      const finalValue = animation.keyframes[animation.keyframes.length - 1];
      if (animation.target && animation.property) {
        if (typeof finalValue === 'object') {
          Object.assign(animation.target[animation.property], finalValue);
        } else {
          animation.target[animation.property] = finalValue;
        }
      }
    }
  }

  /**
   * Clean up finished animations
   */
  cleanup() {
    for (const animation of this.activeAnimations) {
      if (!animation.active) {
        this.activeAnimations.delete(animation);
      }
    }
  }

  /**
   * Clear all pools
   */
  clear() {
    this.pools.clear();
    this.activeAnimations.clear();
  }

  /**
   * Get pool statistics
   */
  getStats() {
    const stats = {};
    for (const [type, pool] of this.pools) {
      stats[type] = {
        available: pool.available.length,
        active: this.activeAnimations.size, // This is approximate
        total: pool.available.length
      };
    }
    return stats;
  }
}