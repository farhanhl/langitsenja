import * as THREE from 'three';

export class WeatherSystem {
  constructor(scene) {
    this.scene = scene;
    this.isRaining = false;
    this.rainParticles = null;
    this.rainGeometry = null;
    this.rainMaterial = null;
    this.rainCount = 5000;
    this.isSnowing = false;
    this.snowParticles = null;
    this.snowGeometry = null;
    this.snowMaterial = null;
    this.snowCount = 2500;
    this._savedState = null;
  }

  createRain() {
    if (this.rainParticles) return;
    
    this.rainGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);
    const velocities = new Float32Array(this.rainCount);
    const offsets = new Float32Array(this.rainCount); // For better visual variation

    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = Math.random() * 100 + 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;

      velocities[i] = Math.random() * 0.5 + 0.5;
      offsets[i] = Math.random() * Math.PI * 2; // Phase offset for visual variety
    }

    this.rainGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    this.rainGeometry.setAttribute(
      'velocity',
      new THREE.BufferAttribute(velocities, 1)
    );
    this.rainGeometry.setAttribute(
      'offset',
      new THREE.BufferAttribute(offsets, 1)
    );

    // Use shader material for more efficient rendering
    this.rainMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xaaaaaa) },
        size: { value: 0.3 },
        time: { value: 0 }
      },
      vertexShader: `
        attribute float velocity;
        attribute float offset;
        uniform float time;
        uniform float size;
        
        varying float vAlpha;
        
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Calculate alpha based on velocity for visual effect
          vAlpha = 0.4 + 0.2 * velocity;
          
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;
        
        void main() {
          // Simplified circular shape to reduce calculations
          vec2 coord = gl_PointCoord - vec2(0.5);
          float distance = length(coord);
          
          // Only render if within the raindrop shape
          if (distance > 0.5) {
            discard;
          }
          
          // Calculate alpha based on distance from center for smooth edges
          float alpha = 1.0 - smoothstep(0.4, 0.5, distance);
          gl_FragColor = vec4(color, alpha * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.rainParticles = new THREE.Points(this.rainGeometry, this.rainMaterial);
    this.scene.add(this.rainParticles);
  }

  createSnow() {
    if (this.snowParticles) return;

    this.snowGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.snowCount * 3);
    const velocities = new Float32Array(this.snowCount * 2);
    const sizes = new Float32Array(this.snowCount); // Different sizes for snowflakes
    const offsets = new Float32Array(this.snowCount); // Phase offset for each snowflake
    
    for (let i = 0; i < this.snowCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = Math.random() * 120 + 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;

      velocities[i * 2] = Math.random() * 0.25 + 0.18; // Falling speed
      velocities[i * 2 + 1] = Math.random() * Math.PI * 2; // Starting phase
      sizes[i] = 0.4 + Math.random() * 0.4; // Size variation
      offsets[i] = Math.random() * Math.PI * 2; // Phase offset for individual movement
    }

    this.snowGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    this.snowGeometry.setAttribute(
      'velocity',
      new THREE.BufferAttribute(velocities, 2)
    );
    this.snowGeometry.setAttribute(
      'size',
      new THREE.BufferAttribute(sizes, 1)
    );
    this.snowGeometry.setAttribute(
      'offset',
      new THREE.BufferAttribute(offsets, 1)
    );

    // Use shader material for more efficient rendering and better visual effect
    this.snowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        time: { value: 0 }
      },
      vertexShader: `
        attribute float velocity;
        attribute float size;
        attribute float offset;
        uniform float time;
        
        varying float vAlpha;
        
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Calculate size with variation
          float adjustedSize = size * (0.8 + 0.15 * sin(offset + time * 2.0));
          
          // Calculate alpha for subtle flickering
          vAlpha = 0.7 + 0.15 * sin(offset + time);
          
          gl_PointSize = adjustedSize * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;
        
        void main() {
          // Simplified circular snowflake shape
          vec2 coord = gl_PointCoord - vec2(0.5);
          float distance = length(coord);
          
          // Only render if within the circular area
          if (distance > 0.5) {
            discard;
          }
          
          // Calculate alpha based on distance from center of the snowflake for smooth edges
          float alpha = 1.0 - smoothstep(0.4, 0.5, distance);
          gl_FragColor = vec4(color, alpha * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.snowParticles = new THREE.Points(this.snowGeometry, this.snowMaterial);
    this.scene.add(this.snowParticles);
  }

  startSnow() {
    if (this.isSnowing) return;
    this.isSnowing = true;
    this.createSnow();

    if (this.snowParticles) this.snowParticles.visible = true;

    this.adjustLighting(true);
  }

  stopSnow() {
    if (!this.isSnowing) return;
    this.isSnowing = false;
    if (this.snowParticles) this.snowParticles.visible = false;
    if (!this.isRaining) this.adjustLighting(false);
  }

  toggleSnow() {
    this.isSnowing ? this.stopSnow() : this.startSnow();
  }

  beginTemporarySnow() {
    this._savedState = {
      wasRaining: this.isRaining,
      wasSnowing: this.isSnowing,
    };
    if (this.isRaining) this.stopRain();
    this.startSnow();
  }

  endTemporarySnow() {
    if (!this._savedState) return;
    this.stopSnow();
    const { wasRaining, wasSnowing } = this._savedState;
    if (wasRaining) this.startRain();
    if (wasSnowing) this.startSnow();
    if (!wasRaining && !wasSnowing) this.adjustLighting(false);

    this._savedState = null;
  }

  update(delta) {
    // Update shader uniforms for visual effects
    if (this.isRaining && this.rainParticles && this.rainMaterial) {
      this.rainMaterial.uniforms.time.value = performance.now() / 1000;
    }
    
    if (this.isSnowing && this.snowParticles && this.snowMaterial) {
      this.snowMaterial.uniforms.time.value = performance.now() / 1000;
    }

    if (this.isRaining && this.rainParticles) {
      const pos = this.rainGeometry.attributes.position.array;
      const vel = this.rainGeometry.attributes.velocity.array;
      for (let i = 0; i < this.rainCount; i++) {
        pos[i * 3 + 1] -= vel[i] * 100 * delta;
        if (pos[i * 3 + 1] < 0) {
          pos[i * 3 + 1] = Math.random() * 50 + 50;
          pos[i * 3] = (Math.random() - 0.5) * 300;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 300;
        }
      }
      this.rainGeometry.attributes.position.needsUpdate = true;
      this.rainGeometry.attributes.velocity.needsUpdate = true; // Update velocity for shader
    }

    if (this.isSnowing && this.snowParticles) {
      const pos = this.snowGeometry.attributes.position.array;
      const vel = this.snowGeometry.attributes.velocity.array;
      for (let i = 0; i < this.snowCount; i++) {
        const vy = vel[i * 2];
        let phase = vel[i * 2 + 1];
        pos[i * 3 + 1] -= vy * 60 * delta;
        phase += 1.5 * delta;
        vel[i * 2 + 1] = phase;
        pos[i * 3] += Math.sin(phase) * 0.25;
        pos[i * 3 + 2] += Math.cos(phase) * 0.15;

        if (pos[i * 3 + 1] < 0.5) {
          pos[i * 3 + 1] = Math.random() * 120 + 40;
          pos[i * 3] = (Math.random() - 0.5) * 300;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 300;
          vel[i * 2 + 1] = Math.random() * Math.PI * 2;
        }
      }
      this.snowGeometry.attributes.position.needsUpdate = true;
      this.snowGeometry.attributes.velocity.needsUpdate = true; // Update velocity for shader
    }
  }

  startRain() {
    if (this.isRaining) {
      return;
    }

    this.isRaining = true;
    this.createRain();
    if (this.rainParticles) {
      this.rainParticles.visible = true;
    }
    this.adjustLighting(true);
  }

  stopRain() {
    if (!this.isRaining) {
      return;
    }
    this.isRaining = false;
    if (this.rainParticles) {
      this.rainParticles.visible = false;
    }

    this.adjustLighting(false);
  }

  toggleRain() {
    if (this.isRaining) {
      this.stopRain();
    } else {
      this.startRain();
    }
  }

  adjustLighting(isDark) {
    this.scene.traverse((object) => {
      if (object instanceof THREE.AmbientLight) {
        if (isDark) {
          object.intensity = 0.3;
        } else {
          object.intensity = 0.6;
        }
      }
      if (object instanceof THREE.DirectionalLight) {
        if (isDark) {
          object.intensity = 0.4;
        } else {
          object.intensity = 0.8;
        }
      }
    });
  }

  dispose() {
    if (this.rainGeometry) {
      this.rainGeometry.dispose();
    }
    if (this.rainMaterial) {
      this.rainMaterial.dispose();
    }
    if (this.rainParticles) {
      this.scene.remove(this.rainParticles);
    }
  }
}
