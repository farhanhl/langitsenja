import * as THREE from 'three';

export class Horeg {
  constructor(scene, cityData, npcManager, gameManager) {
    this.scene = scene;
    this.cityData = cityData;
    this.npcManager = npcManager;
    this.gameManager = gameManager;
    this.group = null;
    this.active = false;
    this.position = { x: 50, z: -15 };
    this.targetPosition = { x: -50, z: -15 };
    this.speed = 5;
    this.walkCycle = 0;
    this.rotationOffsetY = 0;
    this.scaleFactor = 0.58;
    this.destroyedBuildings = new Set();
    this.music = new Audio('music/horeg.mp3');
    this.music.volume = 0.75;
    this.music.loop = true;

    // Register audio element with game manager for centralized mute
    if (
      this.gameManager &&
      typeof this.gameManager.addAudioElement === 'function'
    ) {
      this.gameManager.addAudioElement(this.music);
    }

    this.lights = [];
    this.people = [];
    this.speakersGroup = null;
    this.beatTimer = 0;
    this.beatInterval = 0.6;
    this.shirtPalette = [
      0xff5252, 0xffa000, 0xffd54f, 0x66bb6a, 0x26a69a, 0x42a5f5, 0x7e57c2,
      0xec407a, 0x8d6e63, 0x90a4ae,
    ];
    this.pantsPalette = [
      0x263238, 0x37474f, 0x455a64, 0x5d4037, 0x6d4c41, 0x2e7d32, 0x1565c0,
      0x283593, 0x4e342e, 0x212121,
    ];
  }

  setRotationY(rad) {
    this.rotationOffsetY = rad;
    if (this.group) this.group.rotation.y += 0;
  }
  setScale(scale) {
    this.scaleFactor = scale;
    if (this.group) this.group.scale.set(scale, scale, scale);
  }

  spawn() {
    if (this.active) return;
    this.active = true;
    this.createHoregFloat();
    this.playMusic();
  }

  createHoregFloat() {
    this.group = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(14, 1, 8),
      new THREE.MeshStandardMaterial({
        color: 0x303030,
        metalness: 0.2,
        roughness: 0.7,
      })
    );
    base.position.set(0, 0.5, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    this.group.add(base);
    const wheelGeom = new THREE.CylinderGeometry(0.7, 0.7, 1, 20);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    [
      [-5.5, -3.0],
      [5.5, -3.0],
      [-5.5, 3.0],
      [5.5, 3.0],
    ].forEach(([x, z]) => {
      const w = new THREE.Mesh(wheelGeom, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.35, z);
      w.castShadow = true;
      this.group.add(w);
    });

    this.speakersGroup = new THREE.Group();
    const spMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.6,
      metalness: 0.1,
    });
    const grill = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0x000000,
      roughness: 1,
    });
    const W = 2.2,
      H = 2.2,
      D = 1.2,
      padX = 2.6,
      padY = 2.4,
      cols = 4,
      rows = 3;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const g = new THREE.Group();
        const box = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), spMat);
        box.castShadow = true;
        g.add(box);
        const woofer = new THREE.Mesh(
          new THREE.CylinderGeometry(0.7, 0.7, 0.15, 24),
          grill
        );
        woofer.rotation.x = Math.PI / 2;
        woofer.position.set(0, 0.3, D * 0.51);
        g.add(woofer);
        const tweeter = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 0.12, 20),
          grill
        );
        tweeter.rotation.x = Math.PI / 2;
        tweeter.position.set(0, -0.6, D * 0.51);
        g.add(tweeter);
        g.position.set(
          -((cols - 1) * padX) / 2 + c * padX,
          1 + r * padY + H / 2,
          0
        );
        this.speakersGroup.add(g);
      }
    }
    this.group.add(this.speakersGroup);

    [
      [-6, 4, 3],
      [6, 4, 3],
      [-6, 4, -3],
      [6, 4, -3],
    ].forEach(([x, y, z]) => {
      const light = new THREE.PointLight(0xffffff, 0.6, 30, 2.0);
      light.position.set(x, y, z);
      light.castShadow = true;
      this.group.add(light);
      this.lights.push(light);
    });

    [
      [-8, 2],
      [-8, -2],
      [8, 2],
      [8, -2],
      [-3, -5],
      [0, -5],
      [3, -5],
      [-3, 5],
      [0, 5],
      [3, 5],
    ].forEach(([x, z]) => this.people.push(this.createPerson(x, z)));

    this.group.position.set(this.position.x, 0, this.position.z);

    const angle = Math.atan2(
      this.targetPosition.z - this.position.z,
      this.targetPosition.x - this.position.x
    );
    this.group.rotation.y = -angle + Math.PI / 2 + this.rotationOffsetY;
    this.group.scale.set(this.scaleFactor, this.scaleFactor, this.scaleFactor);
    this.scene.add(this.group);
  }

  randomFrom(arr) {
    return arr[(Math.random() * arr.length) | 0];
  }

  createPerson(xOffset, zOffset) {
    const g = new THREE.Group();
    const shirtColor = this.randomFrom(this.shirtPalette);
    const pantsColor = this.randomFrom(this.pantsPalette);

    const shirtMat = new THREE.MeshStandardMaterial({
      color: shirtColor,
      roughness: 0.9,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: pantsColor,
      roughness: 0.9,
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xffdbac,
      roughness: 1,
    });

    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 1.8, 0.6),
      shirtMat
    );
    torso.position.y = 2.7;
    torso.castShadow = true;
    g.add(torso);

    const headM = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), skinMat);
    headM.position.y = 3.6;
    headM.castShadow = true;
    g.add(headM);

    const leftArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 1.2, 0.3),
      shirtMat
    );
    leftArm.position.set(-0.75, 2.4, 0);
    leftArm.castShadow = true;
    g.add(leftArm);
    const rightArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 1.2, 0.3),
      shirtMat
    );
    rightArm.position.set(0.75, 2.4, 0);
    rightArm.castShadow = true;
    g.add(rightArm);

    const leftLeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 1.4, 0.35),
      pantsMat
    );
    leftLeg.position.set(-0.3, 0.7, 0);
    leftLeg.castShadow = true;
    g.add(leftLeg);
    const rightLeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 1.4, 0.35),
      pantsMat
    );
    rightLeg.position.set(0.3, 0.7, 0);
    rightLeg.castShadow = true;
    g.add(rightLeg);

    g.position.set(xOffset, 0, zOffset);
    this.group.add(g);

    return { root: g, leftLeg, rightLeg, leftArm, rightArm };
  }

  update(delta) {
    if (!this.active || !this.group) return;
    if (delta > 1) delta = delta / 1000;

    const dx = this.targetPosition.x - this.position.x;
    const dz = this.targetPosition.z - this.position.z;
    const distance = Math.hypot(dx, dz);

    if (distance > 1) {
      const moveX = (dx / distance) * this.speed * delta;
      const moveZ = (dz / distance) * this.speed * delta;
      this.position.x += moveX;
      this.position.z += moveZ;
      this.group.position.set(this.position.x, 0, this.position.z);
      const angle = Math.atan2(
        this.targetPosition.z - this.position.z,
        this.targetPosition.x - this.position.x
      );
      this.group.rotation.y = -angle + Math.PI / 2 + this.rotationOffsetY;
      this.walkCycle += delta * 3;
      this.people.forEach((p) => {
        p.leftLeg.rotation.x = Math.sin(this.walkCycle) * 0.3;
        p.rightLeg.rotation.x = -Math.sin(this.walkCycle) * 0.3;
        p.leftArm.rotation.x = -Math.sin(this.walkCycle) * 0.25;
        p.rightArm.rotation.x = Math.sin(this.walkCycle) * 0.25;
      });

      this.beatTimer += delta;
      if (this.beatTimer >= this.beatInterval) {
        this.beatTimer = 0;
        // Optimized light flashing without setTimeout
        this.lights.forEach((l, i) => {
          l._flashEndTime = performance.now() + 120 + i * 30; // Flash duration
          l._originalIntensity = 0.6; // Store original intensity
        });
        if (this.speakersGroup) {
          this.speakersGroup._rotateStartTime = performance.now();
          this.speakersGroup._rotateEndTime = performance.now() + 120;
          this.speakersGroup._originalRotationY = this.speakersGroup.rotation.y;
          this.speakersGroup._targetRotationY =
            this.speakersGroup.rotation.y + 0.05;
        }
      }

      // Handle light flashing during the update loop
      const now = performance.now();
      this.lights.forEach((l) => {
        if (l._flashEndTime && now < l._flashEndTime) {
          l.intensity = 1.5; // Flashing state
        } else if (l._originalIntensity !== undefined) {
          l.intensity = l._originalIntensity; // Back to original
        }
      });

      // Handle speaker rotation during the update loop
      if (this.speakersGroup && this.speakersGroup._rotateEndTime) {
        if (now < this.speakersGroup._rotateEndTime) {
          // During rotation effect - maintain the rotation
          this.speakersGroup.rotation.y = this.speakersGroup._targetRotationY;
        } else {
          // Effect duration passed - return to original rotation
          this.speakersGroup.rotation.y = this.speakersGroup._originalRotationY;
        }
      }

      this.attractNearbyNPCs();
    } else {
      this.despawn();
    }
  }

  attractNearbyNPCs() {
    if (!this.npcManager || !this.npcManager.npcs) return;
    const attractRadius = 35,
      ringRadius = 10,
      maxAffectedNPCs = 20; // Limit number of NPCs affected to prevent performance issues

    let affectedCount = 0;
    for (const npc of this.npcManager.npcs) {
      if (affectedCount >= maxAffectedNPCs) break; // Limit processing

      if (!npc.mesh) continue;
      const dx = npc.mesh.position.x - this.position.x;
      const dz = npc.mesh.position.z - this.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance < attractRadius) {
        const angle = (affectedCount % 12) * ((2 * Math.PI) / 12); // Use affectedCount instead of i
        npc.targetPosition = {
          x: this.position.x + Math.cos(angle) * ringRadius,
          z: this.position.z + Math.sin(angle) * ringRadius,
        };
        npc.speed = (npc.walkSpeed || 2) * 1.2;
        npc.mesh.rotation.y += 0.02;
        affectedCount++;
      }
    }
  }

  playMusic() {
    try {
      this.music.currentTime = 0;
      this.music.play().catch(() => {});
    } catch {}
  }

  despawn() {
    if (!this.active) return;
    try {
      this.music.pause();
    } catch {}
    if (this.group) {
      this.scene.remove(this.group);
      this.group = null;
    }

    this.lights.forEach((l) => {
      delete l._flashEndTime;
      delete l._originalIntensity;
    });

    if (this.speakersGroup) {
      delete this.speakersGroup._rotateStartTime;
      delete this.speakersGroup._rotateEndTime;
      delete this.speakersGroup._originalRotationY;
      delete this.speakersGroup._targetRotationY;
    }

    this.people = [];
    this.lights = [];
    this.speakersGroup = null;
    this.active = false;
    this.position = { x: 50, z: -15 };
  }

  isActive() {
    return this.active;
  }
}
