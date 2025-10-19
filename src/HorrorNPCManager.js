import * as THREE from 'three';

export class HorrorNPCManager {
  constructor(scene, npcManager) {
    this.scene = scene;
    this.npcManager = npcManager;
    this.isHorrorMode = false;
    this.originalNPCData = [];
  }

  transformToHorror() {
    if (this.isHorrorMode) return;

    console.log('🌙 TRANSFORMING TO HORROR MODE...');
    this.isHorrorMode = true;

    // Save original NPC data
    this.originalNPCData = [];

    // Transform each walking NPC
    this.npcManager.npcs.forEach((npc, index) => {
      if (npc.type === 'walking') {
        // Save original mesh
        this.originalNPCData.push({
          npc: npc,
          originalMesh: npc.mesh
        });

        // Remove original mesh
        this.scene.remove(npc.mesh);

        // Create horror NPC based on index
        const horrorType = index % 3; // 0: Ghost, 1: Zombie, 2: Monster
        let newMesh;

        switch (horrorType) {
          case 0:
            newMesh = this.createGhost();
            break;
          case 1:
            newMesh = this.createZombie();
            break;
          case 2:
            newMesh = this.createMonster();
            break;
        }

        // Copy position and rotation
        newMesh.position.copy(npc.mesh.position);
        newMesh.rotation.copy(npc.mesh.rotation);

        // Add to scene
        this.scene.add(newMesh);

        // Update NPC reference
        npc.mesh = newMesh;
        npc.isHorror = true;
        npc.horrorType = horrorType;

        // Add floating animation for ghosts
        if (horrorType === 0) {
          npc.floatOffset = Math.random() * Math.PI * 2;
        }
      }
    });

    console.log('👻 Horror transformation complete!');
  }

  createGhost() {
    const group = new THREE.Group();

    // Ghost body (translucent white sheet)
    const bodyGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      emissive: 0xaaaaff,
      emissiveIntensity: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75;
    group.add(body);

    // Ghost head (sphere)
    const headGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      emissive: 0xaaaaff,
      emissiveIntensity: 0.4
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.7;
    group.add(head);

    // Glowing eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 1.75, 0.35);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 1.75, 0.35);
    group.add(rightEye);

    // Wispy tail
    const tailGeometry = new THREE.ConeGeometry(0.3, 0.8, 8);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.y = -0.1;
    tail.rotation.x = Math.PI;
    group.add(tail);

    return group;
  }

  createZombie() {
    const group = new THREE.Group();

    // Zombie body (greenish, torn clothes)
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x556b2f,
      roughness: 0.9
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    group.add(body);

    // Zombie head (greenish skin)
    const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x6b8e23,
      roughness: 0.8
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    head.rotation.z = 0.1; // Tilted head
    group.add(head);

    // Glowing eyes
    const eyeGeometry = new THREE.CircleGeometry(0.1, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 1
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 1.55, 0.31);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 1.55, 0.31);
    group.add(rightEye);

    // Arms (hanging down)
    const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.6, 0.3, 0);
    leftArm.rotation.z = 0.3;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.6, 0.3, 0);
    rightArm.rotation.z = -0.3;
    group.add(rightArm);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.3, 0.9, 0.3);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.25, -0.45, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.25, -0.45, 0);
    group.add(rightLeg);

    return group;
  }

  createMonster() {
    const group = new THREE.Group();

    // Monster body (large, dark, scary)
    const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.6);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x330000,
      roughness: 0.9,
      emissive: 0x220000,
      emissiveIntensity: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75;
    group.add(body);

    // Monster head (large, menacing)
    const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x440000,
      roughness: 0.8
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.8;
    group.add(head);

    // Glowing red eyes
    const eyeGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 1.85, 0.41);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 1.85, 0.41);
    group.add(rightEye);

    // Horns
    const hornGeometry = new THREE.ConeGeometry(0.15, 0.5, 6);
    const hornMaterial = new THREE.MeshStandardMaterial({ color: 0x220000 });

    const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    leftHorn.position.set(-0.3, 2.3, 0);
    leftHorn.rotation.z = -0.3;
    group.add(leftHorn);

    const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    rightHorn.position.set(0.3, 2.3, 0);
    rightHorn.rotation.z = 0.3;
    group.add(rightHorn);

    // Large arms
    const armGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.7, 0.6, 0);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.7, 0.6, 0);
    group.add(rightArm);

    // Claws
    const clawGeometry = new THREE.ConeGeometry(0.15, 0.3, 4);
    const clawMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });

    for (let i = 0; i < 3; i++) {
      const leftClaw = new THREE.Mesh(clawGeometry, clawMaterial);
      leftClaw.position.set(-0.7 - 0.15 + i * 0.15, 0, 0);
      leftClaw.rotation.x = Math.PI;
      group.add(leftClaw);

      const rightClaw = new THREE.Mesh(clawGeometry, clawMaterial);
      rightClaw.position.set(0.7 - 0.15 + i * 0.15, 0, 0);
      rightClaw.rotation.x = Math.PI;
      group.add(rightClaw);
    }

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.35, 1, 0.35);
    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    leftLeg.position.set(-0.3, -0.5, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    rightLeg.position.set(0.3, -0.5, 0);
    group.add(rightLeg);

    // Scale up monster (make it bigger)
    group.scale.set(1.2, 1.2, 1.2);

    return group;
  }

  update(delta) {
    if (!this.isHorrorMode) return;

    // Animate horror NPCs
    this.npcManager.npcs.forEach((npc) => {
      if (npc.isHorror) {
        switch (npc.horrorType) {
          case 0: // Ghost - floating animation
            if (npc.floatOffset !== undefined) {
              npc.mesh.position.y = 0.9 + Math.sin(Date.now() * 0.002 + npc.floatOffset) * 0.3;
            }
            break;
          case 1: // Zombie - swaying arms
            // Add slight sway to arms if needed
            break;
          case 2: // Monster - breathing effect
            const breathScale = 1.2 + Math.sin(Date.now() * 0.003) * 0.05;
            npc.mesh.scale.set(breathScale, breathScale, breathScale);
            break;
        }
      }
    });
  }

  restoreNormal() {
    if (!this.isHorrorMode) return;

    console.log('☀️ RESTORING NORMAL NPCs...');

    // Restore original NPCs
    this.originalNPCData.forEach((data) => {
      this.scene.remove(data.npc.mesh);
      this.scene.add(data.originalMesh);
      data.npc.mesh = data.originalMesh;
      data.npc.isHorror = false;
      delete data.npc.horrorType;
      delete data.npc.floatOffset;
    });

    this.isHorrorMode = false;
    this.originalNPCData = [];

    console.log('✅ Normal NPCs restored!');
  }
}
