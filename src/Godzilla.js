import * as THREE from 'three';

export class Godzilla {
  constructor(scene, cityData, npcManager) {
    this.scene = scene;
    this.cityData = cityData;
    this.npcManager = npcManager;
    this.group = null;
    this.active = false;
    this.position = { x: 125, z: -125 };
    this.targetPosition = { x: -125, z: 125 };
    this.speed = 8;
    this.destroyedBuildings = new Set();
    this.walkCycle = 0;
    this.roarTimer = 0;
    this.roarInterval = 3;
    this.leftLeg = null;
    this.rightLeg = null;
    this.leftArm = null;
    this.rightArm = null;
    this.tail = null;
    this.head = null;
    this.roarSound = new Audio('music/roar.mp3');
    this.roarSound.volume = 0.7;
  }

  spawn() {
    if (this.active) return;
    this.active = true;
    this.createGodzilla();
    this.playRoarSound();
  }

  createGodzilla() {
    this.group = new THREE.Group();
    const bodyGeometry = new THREE.BoxGeometry(6, 15, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d5016,
      roughness: 0.8,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 15;
    body.castShadow = true;
    this.group.add(body);
    const headGeometry = new THREE.BoxGeometry(4, 4, 5);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a6b1f,
      roughness: 0.7,
    });
    this.head = new THREE.Mesh(headGeometry, headMaterial);
    this.head.position.set(0, 24, 2);
    this.head.castShadow = true;
    this.group.add(this.head);
    const eyeGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1,
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-1, 24.5, 4);
    this.group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(1, 24.5, 4);
    this.group.add(rightEye);

    const jawGeometry = new THREE.BoxGeometry(3.5, 1.5, 4);
    const jaw = new THREE.Mesh(jawGeometry, headMaterial);
    jaw.position.set(0, 22.5, 2.5);
    jaw.castShadow = true;
    this.group.add(jaw);

    for (let i = 0; i < 6; i++) {
      const toothGeometry = new THREE.ConeGeometry(0.2, 0.6, 4);
      const toothMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
      tooth.position.set(-1.5 + i * 0.6, 23.3, 4);
      tooth.rotation.x = Math.PI;
      this.group.add(tooth);
    }

    const spikeGeometry = new THREE.ConeGeometry(0.8, 3, 4);
    const spikeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a3d0a,
      roughness: 0.9,
    });

    for (let i = 0; i < 5; i++) {
      const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
      spike.position.set(0, 18 + i * 1.5, -3 - i * 0.5);
      spike.rotation.x = -Math.PI / 6;
      spike.castShadow = true;
      this.group.add(spike);
    }

    const armGeometry = new THREE.BoxGeometry(2, 6, 2.5);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0x3a6b1f });

    this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
    this.leftArm.position.set(-4, 17, 1);
    this.leftArm.castShadow = true;
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
    this.rightArm.position.set(4, 17, 1);
    this.rightArm.castShadow = true;
    this.group.add(this.rightArm);

    const clawGeometry = new THREE.BoxGeometry(2.5, 1.5, 1.5);
    const clawMaterial = new THREE.MeshStandardMaterial({ color: 0x1a3d0a });

    const leftClaw = new THREE.Mesh(clawGeometry, clawMaterial);
    leftClaw.position.set(-4, 13.5, 1.5);
    leftClaw.castShadow = true;
    this.group.add(leftClaw);

    const rightClaw = new THREE.Mesh(clawGeometry, clawMaterial);
    rightClaw.position.set(4, 13.5, 1.5);
    rightClaw.castShadow = true;
    this.group.add(rightClaw);

    const legGeometry = new THREE.BoxGeometry(3, 12, 4);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5016 });

    this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    this.leftLeg.position.set(-2.5, 6, 0);
    this.leftLeg.castShadow = true;
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    this.rightLeg.position.set(2.5, 6, 0);
    this.rightLeg.castShadow = true;
    this.group.add(this.rightLeg);

    const footGeometry = new THREE.BoxGeometry(3.5, 2, 6);
    const footMaterial = new THREE.MeshStandardMaterial({ color: 0x1a3d0a });

    const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
    leftFoot.position.set(-2.5, 1, 1);
    leftFoot.castShadow = true;
    this.group.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
    rightFoot.position.set(2.5, 1, 1);
    rightFoot.castShadow = true;
    this.group.add(rightFoot);

    const tailGeometry = new THREE.ConeGeometry(2, 12, 6);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5016 });
    this.tail = new THREE.Mesh(tailGeometry, tailMaterial);
    this.tail.position.set(0, 12, -8);
    this.tail.rotation.x = Math.PI / 3;
    this.tail.castShadow = true;
    this.group.add(this.tail);

    this.group.position.set(this.position.x, 0, this.position.z);

    const angle = Math.atan2(
      this.targetPosition.z - this.position.z,
      this.targetPosition.x - this.position.x
    );
    this.group.rotation.y = -angle + Math.PI / 2;

    this.scene.add(this.group);
  }

  update(delta) {
    if (!this.active || !this.group) return;
    const dx = this.targetPosition.x - this.position.x;
    const dz = this.targetPosition.z - this.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance > 1) {
      const moveX = (dx / distance) * this.speed * delta;
      const moveZ = (dz / distance) * this.speed * delta;

      this.position.x += moveX;
      this.position.z += moveZ;
      this.group.position.set(this.position.x, 0, this.position.z);
      this.walkCycle += delta * 3;

      if (this.leftLeg && this.rightLeg) {
        this.leftLeg.rotation.x = Math.sin(this.walkCycle) * 0.3;
        this.rightLeg.rotation.x = -Math.sin(this.walkCycle) * 0.3;
      }

      if (this.leftArm && this.rightArm) {
        this.leftArm.rotation.x = -Math.sin(this.walkCycle) * 0.2;
        this.rightArm.rotation.x = Math.sin(this.walkCycle) * 0.2;
      }

      if (this.tail) {
        this.tail.rotation.y = Math.sin(this.walkCycle * 0.5) * 0.2;
      }

      if (this.head) {
        this.head.rotation.x = Math.sin(this.walkCycle * 0.5) * 0.05;
      }
      this.checkBuildingCollisions();
      this.scareNearbyNPCs();
      this.roarTimer += delta;
      if (this.roarTimer >= this.roarInterval) {
        this.roarTimer = 0;
        this.playRoarSound();
        this.roarAnimation();
      }
    } else {
      this.despawn();
    }
  }

  checkBuildingCollisions() {
    if (!this.cityData.buildings) return;

    const godzillaBox = new THREE.Box3().setFromObject(this.group);

    this.cityData.buildings.forEach((building, index) => {
      if (this.destroyedBuildings.has(index)) return;

      if (
        building.boundingBox &&
        godzillaBox.intersectsBox(building.boundingBox)
      ) {
        this.destroyBuilding(building, index);
      }
    });
  }

  destroyBuilding(building, index) {
    this.destroyedBuildings.add(index);
    const mesh = building.mesh;
    if (!mesh) return;

    let fallSpeed = 0;
    const destroyAnimation = () => {
      fallSpeed += 0.1;
      mesh.rotation.x += 0.05;
      mesh.rotation.z += 0.03;
      mesh.position.y -= fallSpeed;

      if (mesh.position.y > -20) {
        requestAnimationFrame(destroyAnimation);
      } else {
        this.scene.remove(mesh);
      }
    };

    destroyAnimation();
    this.createDebris(mesh.position);
  }

  createDebris(position) {
    const debrisCount = 20;
    const debrisGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const debrisMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
    });

    for (let i = 0; i < debrisCount; i++) {
      const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
      debris.position.copy(position);
      debris.position.y += Math.random() * 5;

      const velocity = {
        x: (Math.random() - 0.5) * 10,
        y: Math.random() * 8 + 5,
        z: (Math.random() - 0.5) * 10,
      };

      this.scene.add(debris);

      let time = 0;
      const animateDebris = () => {
        time += 0.016;
        velocity.y -= 9.8 * 0.016;
        debris.position.x += velocity.x * 0.016;
        debris.position.y += velocity.y * 0.016;
        debris.position.z += velocity.z * 0.016;

        debris.rotation.x += 0.1;
        debris.rotation.y += 0.1;

        if (debris.position.y > 0 && time < 3) {
          requestAnimationFrame(animateDebris);
        } else {
          this.scene.remove(debris);
        }
      };

      animateDebris();
    }
  }

  scareNearbyNPCs() {
    if (!this.npcManager || !this.npcManager.npcs) return;

    const scareRadius = 30;

    this.npcManager.npcs.forEach((npc) => {
      if (!npc.mesh) return;

      const dx = npc.mesh.position.x - this.position.x;
      const dz = npc.mesh.position.z - this.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < scareRadius) {
        const fleeX = npc.mesh.position.x + (dx / distance) * 10;
        const fleeZ = npc.mesh.position.z + (dz / distance) * 10;

        npc.targetPosition = { x: fleeX, z: fleeZ };
        npc.speed = npc.walkSpeed * 3;
      }
    });
  }

  roarAnimation() {
    if (!this.head) return;

    let tiltAmount = 0;
    const roarAnim = () => {
      tiltAmount += 0.05;
      this.head.rotation.x = Math.sin(tiltAmount * 3) * 0.3;

      if (tiltAmount < Math.PI) {
        requestAnimationFrame(roarAnim);
      } else {
        this.head.rotation.x = 0;
      }
    };

    roarAnim();
  }

  playRoarSound() {
    try {
      this.roarSound.currentTime = 0;
      this.roarSound.play().catch((err) => {});
    } catch (error) {}
  }

  despawn() {
    if (!this.active) return;
    if (this.group) {
      this.scene.remove(this.group);
      this.group = null;
    }

    this.active = false;
    this.destroyedBuildings.clear();
    this.position = { x: -125, z: -125 };
  }

  isActive() {
    return this.active;
  }
}
