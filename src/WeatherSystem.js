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

  createSnow() {
    if (this.snowParticles) return;

    this.snowGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.snowCount * 3);
    const velocities = new Float32Array(this.snowCount * 2); // [vy, driftPhase]

    for (let i = 0; i < this.snowCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300; // x
      positions[i * 3 + 1] = Math.random() * 120 + 40; // y (di atas)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300; // z

      // salju jatuh lebih pelan + phase drift utk kiri/kanan
      velocities[i * 2] = Math.random() * 0.25 + 0.18; // vy
      velocities[i * 2 + 1] = Math.random() * Math.PI * 2; // phase
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

    // sedikit lebih terang daripada hujan, tapi tetap mendung
    this.adjustLighting(true); // reuse isDark=true untuk nuansa mendung
    // optional: tint temperatur dingin bisa ditambah via HemisphereLight jika mau
  }

  stopSnow() {
    if (!this.isSnowing) return;
    this.isSnowing = false;

    if (this.snowParticles) this.snowParticles.visible = false;

    // Kembalikan lighting normal hanya kalau tidak sedang hujan
    if (!this.isRaining) this.adjustLighting(false);
  }

  toggleSnow() {
    this.isSnowing ? this.stopSnow() : this.startSnow();
  }

  beginTemporarySnow() {
    // simpan state sebelumnya agar bisa dikembalikan
    this._savedState = {
      wasRaining: this.isRaining,
      wasSnowing: this.isSnowing,
    };

    // salju harus dominan → matikan hujan jika ada
    if (this.isRaining) this.stopRain();
    this.startSnow();
  }

  endTemporarySnow() {
    // kalau belum pernah override, abaikan
    if (!this._savedState) return;

    // stop salju dulu
    this.stopSnow();

    // restore ke sebelumnya
    const { wasRaining, wasSnowing } = this._savedState;
    if (wasRaining) this.startRain();
    if (wasSnowing) this.startSnow(); // kalau sebelumnya memang sudah salju aktif

    // jika tidak hujan & tidak salju → lighting normal
    if (!wasRaining && !wasSnowing) this.adjustLighting(false);

    this._savedState = null;
  }

  update(delta) {
    // === Rain update ===
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

    // === Snow update ===
    if (this.isSnowing && this.snowParticles) {
      const pos = this.snowGeometry.attributes.position.array;
      const vel = this.snowGeometry.attributes.velocity.array; // [vy, phase]
      for (let i = 0; i < this.snowCount; i++) {
        const vy = vel[i * 2];
        let phase = vel[i * 2 + 1];

        // jatuh pelan + goyangan kiri/kanan
        pos[i * 3 + 1] -= vy * 60 * delta;
        phase += 1.5 * delta; // update phase
        vel[i * 2 + 1] = phase;
        pos[i * 3] += Math.sin(phase) * 0.25; // drift X
        pos[i * 3 + 2] += Math.cos(phase) * 0.15; // drift Z

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
