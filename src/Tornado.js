import * as THREE from 'three';

export class Tornado {
  constructor(scene, cityData, npcManager) {
    this.scene = scene;
    this.cityData = cityData;
    this.npcManager = npcManager;
    this.group = null;
    this.active = false;
    this.position = { x: 0, z: -125 }; // Start dari tengah bawah
    this.targetPosition = { x: 0, z: 125 }; // Bergerak ke atas
    this.speed = 15; // Units per second
    this.rotationSpeed = 5; // Radians per second
    this.liftedObjects = [];
    this.debrisParticles = [];
    this.particleCount = 100;
    this.pullRadius = 25; // Radius untuk menarik objek
  }

  spawn() {
    if (this.active) return;

    this.active = true;
    this.createTornado();
    this.playWindSound();

    console.log('🌪️ TORNADO HAS SPAWNED! 🌪️');
  }

  createTornado() {
    this.group = new THREE.Group();

    // Create tornado funnel using multiple cones
    const tornadoLevels = 12;
    const cones = [];

    for (let i = 0; i < tornadoLevels; i++) {
      const baseRadius = 1 + i * 1.5;
      const topRadius = 0.5 + i * 1.3;
      const height = 5;

      const geometry = new THREE.CylinderGeometry(
        topRadius,
        baseRadius,
        height,
        16,
        1,
        true // Open ended
      );

      const material = new THREE.MeshStandardMaterial({
        color: 0x666666,
        transparent: true,
        opacity: 0.3 - i * 0.02,
        side: THREE.DoubleSide,
        wireframe: false
      });

      const cone = new THREE.Mesh(geometry, material);
      cone.position.y = i * 4.5;
      cone.rotation.y = i * 0.3; // Initial rotation offset
      this.group.add(cone);
      cones.push(cone);
    }

    this.cones = cones;

    // Create swirling debris particles
    this.createDebrisParticles();

    // Create dark cloud at top
    this.createStormCloud();

    // Position tornado
    this.group.position.set(this.position.x, 0, this.position.z);

    this.scene.add(this.group);

    // Add point light for dramatic effect
    this.tornadoLight = new THREE.PointLight(0x888888, 0.5, 50);
    this.tornadoLight.position.set(this.position.x, 30, this.position.z);
    this.scene.add(this.tornadoLight);
  }

  createDebrisParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];

    for (let i = 0; i < this.particleCount; i++) {
      // Random position in cylinder
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 15;
      const height = Math.random() * 50;

      positions.push(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );

      // Store initial velocities
      velocities.push({
        angle: angle,
        radius: radius,
        height: height,
        speed: Math.random() * 0.5 + 0.5
      });
    }

    particleGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x8b7355,
      size: 0.8,
      transparent: true,
      opacity: 0.8
    });

    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.particleVelocities = velocities;
    this.group.add(this.particles);
  }

  createStormCloud() {
    const cloudGroup = new THREE.Group();

    // Multiple spheres untuk efek cloud
    for (let i = 0; i < 8; i++) {
      const cloudGeometry = new THREE.SphereGeometry(
        5 + Math.random() * 3,
        16,
        16
      );
      const cloudMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        transparent: true,
        opacity: 0.6
      });

      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloud.position.set(
        (Math.random() - 0.5) * 15,
        55 + Math.random() * 3,
        (Math.random() - 0.5) * 15
      );
      cloudGroup.add(cloud);
    }

    this.group.add(cloudGroup);
    this.cloudGroup = cloudGroup;
  }

  update(delta) {
    if (!this.active || !this.group) return;

    // Move tornado
    const dx = this.targetPosition.x - this.position.x;
    const dz = this.targetPosition.z - this.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance > 1) {
      // Normalize and move
      const moveX = (dx / distance) * this.speed * delta;
      const moveZ = (dz / distance) * this.speed * delta;

      this.position.x += moveX;
      this.position.z += moveZ;
      this.group.position.set(this.position.x, 0, this.position.z);

      if (this.tornadoLight) {
        this.tornadoLight.position.set(this.position.x, 30, this.position.z);
      }

      // Rotate tornado cones
      if (this.cones) {
        this.cones.forEach((cone, i) => {
          cone.rotation.y += this.rotationSpeed * delta * (1 + i * 0.1);
        });
      }

      // Animate debris particles
      this.animateDebrisParticles(delta);

      // Cloud rotation
      if (this.cloudGroup) {
        this.cloudGroup.rotation.y += delta * 0.5;
      }

      // Pull objects
      this.pullNearbyObjects(delta);

      // Scare NPCs
      this.scareNearbyNPCs();
    } else {
      // Reached destination
      this.despawn();
    }
  }

  animateDebrisParticles(delta) {
    if (!this.particles) return;

    const positions = this.particles.geometry.attributes.position.array;

    for (let i = 0; i < this.particleCount; i++) {
      const vel = this.particleVelocities[i];
      const idx = i * 3;

      // Spiral motion
      vel.angle += delta * vel.speed;
      vel.height += delta * 15;

      // Reset if too high
      if (vel.height > 60) {
        vel.height = 0;
        vel.radius = Math.random() * 15;
      }

      // Update position
      positions[idx] = Math.cos(vel.angle) * vel.radius;
      positions[idx + 1] = vel.height;
      positions[idx + 2] = Math.sin(vel.angle) * vel.radius;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  pullNearbyObjects(delta) {
    // Pull small objects (cars, benches, etc.) - simplified for now
    // We'll lift NPCs and make them spin

    if (!this.npcManager || !this.npcManager.npcs) return;

    this.npcManager.npcs.forEach(npc => {
      if (!npc.mesh) return;

      const dx = npc.mesh.position.x - this.position.x;
      const dz = npc.mesh.position.z - this.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < this.pullRadius) {
        // Check if already lifted
        let liftedObj = this.liftedObjects.find(obj => obj.npc === npc);

        if (!liftedObj) {
          // Lift object
          liftedObj = {
            npc: npc,
            originalY: npc.mesh.position.y,
            angle: Math.atan2(dz, dx),
            height: 0,
            radius: distance
          };
          this.liftedObjects.push(liftedObj);
          console.log('🌪️ Tornado lifted an NPC!');
        }

        // Animate lifted object
        liftedObj.angle += delta * 3;
        liftedObj.height += delta * 10;
        liftedObj.radius = Math.max(2, liftedObj.radius - delta * 5);

        // Update position (spiral upward)
        npc.mesh.position.x = this.position.x + Math.cos(liftedObj.angle) * liftedObj.radius;
        npc.mesh.position.y = liftedObj.originalY + liftedObj.height;
        npc.mesh.position.z = this.position.z + Math.sin(liftedObj.angle) * liftedObj.radius;

        // Spin
        npc.mesh.rotation.y += delta * 5;
        npc.mesh.rotation.x += delta * 3;

        // If too high, drop it
        if (liftedObj.height > 50) {
          this.dropObject(liftedObj);
        }
      }
    });
  }

  dropObject(liftedObj) {
    const npc = liftedObj.npc;

    // Remove from lifted list
    const index = this.liftedObjects.indexOf(liftedObj);
    if (index > -1) {
      this.liftedObjects.splice(index, 1);
    }

    // Animate falling
    let fallSpeed = 0;
    const fallAnimation = () => {
      fallSpeed += 0.5;
      npc.mesh.position.y -= fallSpeed;
      npc.mesh.rotation.x += 0.2;
      npc.mesh.rotation.z += 0.15;

      if (npc.mesh.position.y > 0.5) {
        requestAnimationFrame(fallAnimation);
      } else {
        // Reset position
        npc.mesh.position.y = 0.5;
        npc.mesh.rotation.x = 0;
        npc.mesh.rotation.z = 0;
        console.log('🌪️ NPC dropped from tornado!');
      }
    };

    fallAnimation();
  }

  scareNearbyNPCs() {
    if (!this.npcManager || !this.npcManager.npcs) return;

    const scareRadius = 40;

    this.npcManager.npcs.forEach(npc => {
      if (!npc.mesh) return;

      const dx = npc.mesh.position.x - this.position.x;
      const dz = npc.mesh.position.z - this.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      // Only scare if not already lifted
      const isLifted = this.liftedObjects.some(obj => obj.npc === npc);

      if (distance < scareRadius && distance > this.pullRadius && !isLifted) {
        // Run away from tornado
        const fleeX = npc.mesh.position.x + (dx / distance) * 15;
        const fleeZ = npc.mesh.position.z + (dz / distance) * 15;

        npc.targetPosition = { x: fleeX, z: fleeZ };
        npc.speed = npc.walkSpeed * 3;
      }
    });
  }

  playWindSound() {
    // Placeholder for wind sound
    console.log('🌪️ WHOOOOOOSH!!!');
  }

  despawn() {
    if (!this.active) return;

    console.log('🌪️ Tornado has dissipated...');

    // Drop all lifted objects
    [...this.liftedObjects].forEach(obj => {
      this.dropObject(obj);
    });

    // Remove from scene
    if (this.group) {
      this.scene.remove(this.group);
      this.group = null;
    }

    if (this.tornadoLight) {
      this.scene.remove(this.tornadoLight);
      this.tornadoLight = null;
    }

    this.active = false;
    this.liftedObjects = [];
    this.position = { x: 0, z: -125 };
  }

  isActive() {
    return this.active;
  }
}
