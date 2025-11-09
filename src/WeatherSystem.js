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

    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = Math.random() * 100 + 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;

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

    this.rainMaterial = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.3,
      transparent: true,
      opacity: 0.6,
    });

    this.rainParticles = new THREE.Points(this.rainGeometry, this.rainMaterial);
    this.scene.add(this.rainParticles);
  }

  createSnow() {
    if (this.snowParticles) return;

    this.snowGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.snowCount * 3);
    const velocities = new Float32Array(this.snowCount * 2);
    for (let i = 0; i < this.snowCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = Math.random() * 120 + 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;

      velocities[i * 2] = Math.random() * 0.25 + 0.18;
      velocities[i * 2 + 1] = Math.random() * Math.PI * 2;
    }

    this.snowGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    this.snowGeometry.setAttribute(
      'velocity',
      new THREE.BufferAttribute(velocities, 2)
    );

    this.snowMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.55,
      transparent: true,
      opacity: 0.9,
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
