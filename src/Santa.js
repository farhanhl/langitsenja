import * as THREE from 'three';

export class Santa {
  constructor(scene, cityData, npcManager, weatherSystem, skySystem) {
    this.scene = scene;
    this.cityData = cityData;
    this.npcManager = npcManager;
    this.weatherSystem = weatherSystem;
    this.skySystem = skySystem;

    this.group = null;
    this.active = false;

    this.position = { x: 125, z: -125, y: 45 };
    this.targetPosition = { x: -125, z: 125, y: 45 };
    this.speed = 18;

    // Anim params
    this.bobCycle = 0;
    this.bellTimer = 0;
    this.giftTimer = 0;
    this.giftInterval = 2.2;
    this.snowTimer = 0;

    // Audio
    this.bellSound = new Audio('music/bell.mp3');
    this.bellSound.volume = 0.6;
    this.bellSound.loop = true;
    this.hohoSound = new Audio('music/hoho.mp3');
    this.hohoSound.volume = 0.7;

    // Lights
    this.headLamp = null;
    this.sleighGlow = null;

    // Refs
    this.reins = [];
    this.horses = [];
    this.santa = null;

    // Runtime
    this.droppedGifts = new Set();
    this.activeGifts = []; // Track active gifts for performance
  }

  spawn() {
    if (this.active) return;
    this.active = true;
    this.createSinterclass();
    this.playBell();
    this.playHoHo();

    // >>>> Aktifkan salju sementara
    if (this.weatherSystem) {
      this.weatherSystem.beginTemporarySnow();
    }

    // >>>> Ubah langit menjadi berwarna salju
    if (this.skySystem) {
      this.skySystem.transitionToSnowy();
    }

    console.log('🎅✨ SINTERCLASS IS FLYING IN!');
  }

  despawn() {
    if (!this.active) return;
    console.log('🎅✨ Sinterclass has left the skyline...');
    try {
      this.bellSound.pause();
    } catch {}
    if (this.weatherSystem) {
      this.weatherSystem.endTemporarySnow();
    }

    // >>>> Kembalikan langit ke keadaan semula sebelum Santa muncul
    if (this.skySystem) {
      this.skySystem.restoreOriginalState();
    }

    if (this.group) {
      this.scene.remove(this.group);
      this.group = null;
    }
    this.active = false;
    this.position = { x: -135, z: -135, y: 50 };
  }

  createSinterclass() {
    this.group = new THREE.Group();

    // ===== Sleigh (kereta) =====
    const sleigh = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(10, 2.5, 4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x8b0000,
      metalness: 0.1,
      roughness: 0.6,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.position.y = 2.2;
    sleigh.add(body);

    // Skis
    const skiGeo = new THREE.BoxGeometry(10, 0.3, 0.4);
    const skiMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.5,
      roughness: 0.3,
    });
    const leftSki = new THREE.Mesh(skiGeo, skiMat);
    leftSki.position.set(0, 0.3, -1.3);
    const rightSki = leftSki.clone();
    rightSki.position.z = 1.3;
    leftSki.castShadow = rightSki.castShadow = true;
    sleigh.add(leftSki, rightSki);

    // Backrest
    const backGeo = new THREE.BoxGeometry(3, 3, 4.2);
    const back = new THREE.Mesh(backGeo, bodyMat);
    back.position.set(-3.5, 3.3, 0);
    back.castShadow = true;
    sleigh.add(back);

    // Gift bag
    const bagGeo = new THREE.SphereGeometry(1.8, 12, 12);
    const bagMat = new THREE.MeshStandardMaterial({
      color: 0x703c00,
      roughness: 0.8,
    });
    const bag = new THREE.Mesh(bagGeo, bagMat);
    bag.position.set(-4.5, 4.2, 0);
    bag.castShadow = true;
    sleigh.add(bag);

    // ===== Santa (Sinterclass) =====
    const santa = new THREE.Group();
    // Body
    const sBody = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.4, 3, 8),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    sBody.position.set(0.5, 4.2, 0);
    sBody.castShadow = true;
    santa.add(sBody);
    // Head
    const sHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xffe0bd })
    );
    sHead.position.set(0.5, 5.8, 0);
    sHead.castShadow = true;
    santa.add(sHead);
    // Hat
    const hat = new THREE.Mesh(
      new THREE.ConeGeometry(0.8, 1.6, 8),
      new THREE.MeshStandardMaterial({ color: 0xdc143c })
    );
    hat.position.set(0.5, 6.8, 0);
    santa.add(hat);
    this.santa = santa;
    sleigh.add(santa);

    // ===== Horses (2 kuda) =====
    const makeHorse = () => {
      const horse = new THREE.Group();
      const hMat = new THREE.MeshStandardMaterial({
        color: 0x6b4f2a,
        roughness: 0.7,
      });
      // body
      const hBody = new THREE.Mesh(new THREE.BoxGeometry(4, 1.6, 1.2), hMat);
      hBody.position.y = 2.2;
      hBody.castShadow = true;
      horse.add(hBody);
      // head
      const hHead = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), hMat);
      hHead.position.set(2.4, 2.7, 0);
      hHead.castShadow = true;
      horse.add(hHead);
      // legs
      const legGeo = new THREE.BoxGeometry(0.3, 1.8, 0.3);
      for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(legGeo, hMat);
        leg.position.set(
          -1.5 + (i < 2 ? 0 : 2.8),
          1.0,
          i % 2 === 0 ? -0.4 : 0.4
        );
        leg.castShadow = true;
        horse.add(leg);
      }
      // harness lamp
      const lamp = new THREE.PointLight(0xffeeaa, 1.4, 30);
      lamp.position.set(2.9, 3.1, 0);
      horse.add(lamp);
      // bell (visual)
      const bell = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 6, 6),
        new THREE.MeshStandardMaterial({
          color: 0xd4af37,
          metalness: 0.8,
          roughness: 0.2,
        })
      );
      bell.position.set(2.9, 2.4, 0);
      horse.add(bell);
      return horse;
    };

    const horseLeft = makeHorse();
    const horseRight = makeHorse();
    horseLeft.position.set(7, 3.0, -1.8);
    horseRight.position.set(7, 3.0, 1.8);
    this.horses.push(horseLeft, horseRight);

    // ===== Reins (tali kekang)
    const reinMat = new THREE.MeshStandardMaterial({
      color: 0x3b2a1a,
      roughness: 0.9,
    });
    const makeRein = (z) => {
      const geo = new THREE.CylinderGeometry(0.05, 0.05, 7, 6);
      const rein = new THREE.Mesh(geo, reinMat);
      rein.position.set(3.5, 3.8, z);
      rein.rotation.z = Math.PI / 2;
      rein.castShadow = true;
      return rein;
    };
    const reinL = makeRein(-1.2);
    const reinR = makeRein(1.2);
    this.reins.push(reinL, reinR);

    // ===== Lights =====
    this.headLamp = new THREE.SpotLight(
      0xfff6d5,
      1.5,
      120,
      Math.PI / 8,
      0.4,
      1.2
    );
    this.headLamp.position.set(9, 7, 0);
    this.headLamp.target.position.set(20, 5, 0);
    sleigh.add(this.headLamp);
    sleigh.add(this.headLamp.target);

    this.sleighGlow = new THREE.PointLight(0xff2e2e, 1.2, 35);
    this.sleighGlow.position.set(0, 4.8, 0);
    sleigh.add(this.sleighGlow);

    // Group up
    const convoy = new THREE.Group();
    convoy.add(sleigh, horseLeft, horseRight, reinL, reinR);

    // Position & facing
    convoy.position.set(this.position.x, this.position.y, this.position.z);
    const dx = this.targetPosition.x - this.position.x;
    const dz = this.targetPosition.z - this.position.z;
    const angle = Math.atan2(dz, dx);
    // Make Santa face the direction of travel (towards target)
    convoy.rotation.y = 10; // Adding PI to make Santa face the right direction

    this.group = convoy;
    this.scene.add(this.group);
  }

  update(delta) {
    if (!this.active || !this.group) return;

    // Move towards target
    const dx = this.targetPosition.x - this.position.x;
    const dy = this.targetPosition.y - this.position.y;
    const dz = this.targetPosition.z - this.position.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist > 1) {
      const vx = (dx / dist) * this.speed * delta;
      const vy = (dy / dist) * this.speed * delta;
      const vz = (dz / dist) * this.speed * delta;

      this.position.x += vx;
      this.position.y += vy;
      this.position.z += vz;

      // Gentle bobbing & slight sway
      this.bobCycle += delta * 2.0;
      const bobY = Math.sin(this.bobCycle) * 1.2;
      const sway = Math.sin(this.bobCycle * 0.7) * 0.06;

      this.group.position.set(
        this.position.x,
        this.position.y + bobY,
        this.position.z
      );
      this.group.rotation.z = sway;

      // Animate horses’ legs subtly
      this.horses.forEach((h, i) => {
        h.rotation.x = Math.sin(this.bobCycle * 2 + i) * 0.08;
      });

      // Trail snow particles
      this.snowTimer += delta;
      if (this.snowTimer >= 0.05) {
        this.snowTimer = 0;
        this.spawnSnow(this.group.position);
      }

      this.giftTimer += delta;
      if (this.giftTimer >= this.giftInterval) {
        this.giftTimer = 0;
        this.dropGift();
      }

      // NPC reactions: wave/cheer
      this.cheerNearbyNPCs();
    } else {
      this.despawn();
    }

    // Update snowflakes
    this.updateSnowflakes(delta);

    // Update gifts
    this.updateGifts(delta);
  }

  dropGift() {
    const giftGeo = new THREE.BoxGeometry(0.8, 0.6, 0.8);
    const giftMat = new THREE.MeshStandardMaterial({
      color: 0x2e8b57,
      roughness: 0.6,
      metalness: 0.05,
    });
    const gift = new THREE.Mesh(giftGeo, giftMat);
    gift.position.copy(this.group.position);
    gift.position.y -= 1;
    gift.castShadow = true;
    this.scene.add(gift);

    // Add to active gifts array with physics properties
    const giftPhysics = {
      object: gift,
      velocity: {
        x: (Math.random() - 0.5) * 1.2,
        y: -2.0,
        z: (Math.random() - 0.5) * 1.2,
      },
      life: 0,
      bounces: 0,
      maxBounces: 3, // Limit number of bounces
    };

    this.activeGifts.push(giftPhysics);
  }

  spawnSnow(origin) {
    const count = 3; // Reduced from 6 to 3 to improve performance
    const geo = new THREE.SphereGeometry(0.06, 5, 5);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
    });
    for (let i = 0; i < count; i++) {
      const flake = new THREE.Mesh(geo, mat);
      flake.position.set(
        origin.x - 1.5 + Math.random() * 3,
        origin.y - 1 + Math.random() * 2,
        origin.z - 1.5 + Math.random() * 3
      );
      this.scene.add(flake);

      // Store reference to remove later
      flake.userData = { lifetime: 0, maxLifetime: 2.2 };

      // Instead of individual animation loops, use the main update loop
      // This will be handled in the update method
    }
  }

  spawnSparkle(pos) {
    const count = 8; // Reduced from 12 to 8 to improve performance
    const geo = new THREE.SphereGeometry(0.08, 6, 6);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xfff2a8,
      emissive: 0xffc400,
      emissiveIntensity: 0.9,
    });
    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(pos);
      this.scene.add(p);

      // Add to update system via userData
      p.userData = {
        sparkleVelocity: {
          x: (Math.random() - 0.5) * 2.2,
          y: Math.random() * 2.5 + 1.2,
          z: (Math.random() - 0.5) * 2.2,
        },
        lifetime: 0,
        maxLifetime: 0.6,
      };
    }

    // We'll update sparkles in updateSnowflakes since they use similar patterns
    // or add a separate updateSparkles method if needed
  }

  cheerNearbyNPCs() {
    if (!this.npcManager || !this.npcManager.npcs) return;
    const radius = 45;
    this.npcManager.npcs.forEach((npc) => {
      if (!npc.mesh) return;
      const dx = npc.mesh.position.x - this.group.position.x;
      const dz = npc.mesh.position.z - this.group.position.z;
      const d = Math.hypot(dx, dz);
      if (d < radius) {
        // NPC menoleh & melambai (approach: set target, slow walk; or call an animation flag if ada)
        npc.lookAtTarget = {
          x: this.group.position.x,
          z: this.group.position.z,
        };
        npc.speed = Math.min(npc.walkSpeed * 0.8, 2);
        // Jika ada API emote di npc: npc.playEmote('wave')
      }
    });
  }

  updateSnowflakes(delta) {
    // Update snowflakes and sparkles in the scene that belong to Santa
    this.scene.traverse((obj) => {
      if (obj.userData && obj.userData.lifetime !== undefined) {
        // Update the snowflake's lifetime
        obj.userData.lifetime += delta;

        // Update position
        obj.position.y -= 0.6;
        obj.position.x += Math.sin(obj.userData.lifetime * 3) * 0.05;
        obj.position.z += Math.cos(obj.userData.lifetime * 3) * 0.05;

        // Remove if lifetime exceeded or hit ground
        if (
          obj.userData.lifetime > obj.userData.maxLifetime ||
          obj.position.y <= 0
        ) {
          this.scene.remove(obj);
          if (obj.geometry) obj.geometry.dispose();
        }
      }

      // Handle sparkle updates
      if (obj.userData && obj.userData.sparkleVelocity !== undefined) {
        obj.userData.lifetime += delta;

        // Apply gravity to sparkle
        obj.userData.sparkleVelocity.y -= 9.8 * delta;

        // Update position
        obj.position.x += obj.userData.sparkleVelocity.x * delta * 60;
        obj.position.y += obj.userData.sparkleVelocity.y * delta * 60;
        obj.position.z += obj.userData.sparkleVelocity.z * delta * 60;

        // Remove when lifetime exceeded
        if (obj.userData.lifetime >= obj.userData.maxLifetime) {
          this.scene.remove(obj);
          if (obj.geometry) obj.geometry.dispose();
        }
      }
    });
  }

  updateGifts(delta) {
    for (let i = this.activeGifts.length - 1; i >= 0; i--) {
      const giftPhysics = this.activeGifts[i];
      const gift = giftPhysics.object;
      const velocity = giftPhysics.velocity;

      giftPhysics.life += delta;

      // Apply gravity
      velocity.y -= 9.8 * delta;

      // Update position
      gift.position.x += velocity.x * delta * 60; // Scale for proper speed
      gift.position.y += velocity.y * delta * 60;
      gift.position.z += velocity.z * delta * 60;

      // Rotate gift
      gift.rotation.y += 0.08;

      // Bounce on ground
      if (gift.position.y <= 0.5) {
        gift.position.y = 0.5;
        velocity.y *= -0.45; // Bounce with energy loss
        velocity.x *= 0.7; // Friction
        velocity.z *= 0.7;
        giftPhysics.bounces++;

        // If bouncing is minimal or max bounces reached, clean up
        if (
          Math.abs(velocity.y) < 0.5 ||
          giftPhysics.bounces >= giftPhysics.maxBounces
        ) {
          // Spawn sparkle then remove
          this.spawnSparkle(gift.position);
          this.scene.remove(gift);
          if (gift.geometry) gift.geometry.dispose();
          this.activeGifts.splice(i, 1);
          continue;
        }
      }

      // Remove if gift life is exceeded
      if (giftPhysics.life >= 6) {
        this.scene.remove(gift);
        if (gift.geometry) gift.geometry.dispose();
        this.activeGifts.splice(i, 1);
      }
    }
  }

  playBell() {
    try {
      this.bellSound.currentTime = 0;
      this.bellSound.play().catch(() => {});
    } catch (_) {}
  }

  playHoHo() {
    try {
      this.hohoSound.currentTime = 0;
      this.hohoSound.play().catch(() => {});
    } catch (_) {}
  }

  isActive() {
    return this.active;
  }
}
