import * as THREE from 'three';

export class WeatherSystem {
  constructor(scene) {
    this.scene = scene;
    this.isRaining = false;
    this.rainParticles = null;
    this.rainGeometry = null;
    this.rainMaterial = null;
    this.rainCount = 5000; // Number of rain drops
  }

  createRain() {
    if (this.rainParticles) return; // Already created

    console.log('🌧️ Creating rain particles...');

    // Create geometry for rain drops
    this.rainGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);
    const velocities = new Float32Array(this.rainCount);

    // Initialize rain drop positions
    for (let i = 0; i < this.rainCount; i++) {
      // Random position in a large area above the city
      positions[i * 3] = (Math.random() - 0.5) * 300; // X
      positions[i * 3 + 1] = Math.random() * 100 + 50; // Y (high up)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300; // Z

      // Random fall speed
      velocities[i] = Math.random() * 0.5 + 0.5;
    }

    this.rainGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    this.rainGeometry.setAttribute(
      'velocity',
      new THREE.BufferAttribute(velocities, 1)
    );

    // Create material for rain (thin white lines)
    this.rainMaterial = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.3,
      transparent: true,
      opacity: 0.6,
    });

    // Create particle system
    this.rainParticles = new THREE.Points(this.rainGeometry, this.rainMaterial);
    this.scene.add(this.rainParticles);

    console.log('✅ Rain particles created!');
  }

  startRain() {
    if (this.isRaining) {
      console.log('⚠️ Rain already active');
      return;
    }

    console.log('🌧️ Starting rain...');
    this.isRaining = true;

    // Create rain if not exists
    this.createRain();

    // Make rain visible
    if (this.rainParticles) {
      this.rainParticles.visible = true;
    }

    // Darken the sky (adjust ambient light)
    this.adjustLighting(true);

    console.log('✅ Rain started!');
  }

  stopRain() {
    if (!this.isRaining) {
      console.log('⚠️ Rain not active');
      return;
    }

    console.log('☀️ Stopping rain...');
    this.isRaining = false;

    // Hide rain particles
    if (this.rainParticles) {
      this.rainParticles.visible = false;
    }

    // Restore lighting
    this.adjustLighting(false);

    console.log('✅ Rain stopped!');
  }

  toggleRain() {
    if (this.isRaining) {
      this.stopRain();
    } else {
      this.startRain();
    }
  }

  adjustLighting(isDark) {
    // Find ambient light and adjust intensity
    this.scene.traverse((object) => {
      if (object instanceof THREE.AmbientLight) {
        if (isDark) {
          object.intensity = 0.3; // Darker during rain
        } else {
          object.intensity = 0.6; // Normal
        }
      }
      if (object instanceof THREE.DirectionalLight) {
        if (isDark) {
          object.intensity = 0.4; // Dimmer sun during rain
        } else {
          object.intensity = 0.8; // Normal
        }
      }
    });
  }

  update(delta) {
    if (!this.isRaining || !this.rainParticles) return;

    const positions = this.rainGeometry.attributes.position.array;
    const velocities = this.rainGeometry.attributes.velocity.array;

    // Update rain drop positions
    for (let i = 0; i < this.rainCount; i++) {
      // Fall down
      positions[i * 3 + 1] -= velocities[i] * 100 * delta; // Y position

      // Reset if below ground
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = Math.random() * 50 + 50; // Reset to top
        positions[i * 3] = (Math.random() - 0.5) * 300; // New X
        positions[i * 3 + 2] = (Math.random() - 0.5) * 300; // New Z
      }
    }

    // Mark as needs update
    this.rainGeometry.attributes.position.needsUpdate = true;
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
