import * as THREE from 'three';

export class UFO {
  constructor(scene, npcManager, gameManager) {
    this.scene = scene;
    this.npcManager = npcManager;
    this.gameManager = gameManager;
    this.isActive = false;
    this.isAbducting = false;
    this.mesh = null;
    this.beamLight = null;
    this.targetNPC = null;
    this.state = 'idle'; // idle, descending, abducting, ascending, hidden

    // UFO properties
    this.height = 80;
    this.descentHeight = 15;
    this.speed = 20;
    this.rotationSpeed = 1;

    // Input tracking for U-F-O code
    this.inputSequence = [];
    this.secretCode = ['u', 'f', 'o'];
    this.inputTimeout = null;

    this.createUFO();
    this.setupInputListener();
  }

  createUFO() {
    const group = new THREE.Group();

    // Main saucer body (disc shape)
    const saucerGeometry = new THREE.CylinderGeometry(3, 4, 1, 32);
    const saucerMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x444444,
      emissiveIntensity: 0.3,
    });
    const saucer = new THREE.Mesh(saucerGeometry, saucerMaterial);
    saucer.castShadow = true;
    group.add(saucer);

    // Cockpit dome (top)
    const domeGeometry = new THREE.SphereGeometry(
      1.5,
      16,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    const domeMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 0.5;
    group.add(dome);

    // Bottom disc
    const bottomGeometry = new THREE.CylinderGeometry(2, 2, 0.3, 32);
    const bottomMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.9,
      roughness: 0.1,
    });
    const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
    bottom.position.y = -0.65;
    group.add(bottom);

    // Colored lights around the saucer
    const lightColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const lightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
      const lightMaterial = new THREE.MeshStandardMaterial({
        color: lightColors[i % lightColors.length],
        emissive: lightColors[i % lightColors.length],
        emissiveIntensity: 1,
      });
      const light = new THREE.Mesh(lightGeometry, lightMaterial);
      light.position.set(Math.cos(angle) * 3.5, -0.3, Math.sin(angle) * 3.5);
      group.add(light);
    }

    // Position UFO high in the sky (hidden initially)
    group.position.set(0, this.height, 0);

    this.mesh = group;
    this.scene.add(this.mesh);

    // Create abduction beam (initially invisible)
    this.createBeam();
  }

  createBeam() {
    const beamGeometry = new THREE.CylinderGeometry(0.1, 3, 15, 32, 1, true);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    this.beamLight = new THREE.Mesh(beamGeometry, beamMaterial);
    this.beamLight.position.y = -8;
    this.mesh.add(this.beamLight);
  }

  setupInputListener() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();

      // Clear timeout if exists
      if (this.inputTimeout) {
        clearTimeout(this.inputTimeout);
      }

      // Add key to sequence
      this.inputSequence.push(key);

      // Keep only last 3 inputs
      if (this.inputSequence.length > 3) {
        this.inputSequence.shift();
      }

      // Check if sequence matches
      if (this.inputSequence.join('') === this.secretCode.join('')) {
        this.activateUFO();
        this.inputSequence = [];
      }

      // Reset sequence after 2 seconds of no input
      this.inputTimeout = setTimeout(() => {
        this.inputSequence = [];
      }, 2000);
    });
  }

  activateUFO() {
    if (this.isActive || this.state !== 'idle') {
      console.log('⚠️ UFO already active or busy. Current state:', this.state);
      return;
    }

    // Check if it's night time (game lost)
    if (this.gameManager && this.gameManager.gameState === 'lost') {
      console.log(
        '🌙 UFO cannot be summoned at night! Only horror creatures roam...'
      );
      this.showNotification('🌙 UFOs only appear during sunset...');
      return;
    }

    console.log('🛸 UFO ACTIVATED! Preparing for abduction...');
    this.isActive = true;
    this.state = 'descending';

    // Select random NPC to abduct (exclude special mission NPCs)
    const walkingNPCs = this.npcManager.npcs.filter(
      (npc) => npc.type === 'walking'
    );
    console.log('📊 Available walking NPCs:', walkingNPCs.length);

    if (walkingNPCs.length > 0) {
      const randomIndex = Math.floor(Math.random() * walkingNPCs.length);
      this.targetNPC = walkingNPCs[randomIndex];

      // FREEZE the NPC by setting speed to 0 and mark as being abducted
      this.targetNPC.originalSpeed = this.targetNPC.speed;
      this.targetNPC.speed = 0;
      this.targetNPC.isBeingAbducted = true; // Mark NPC so NPCManager won't update it

      // Position UFO above target
      this.mesh.position.x = this.targetNPC.mesh.position.x;
      this.mesh.position.y = this.height;
      this.mesh.position.z = this.targetNPC.mesh.position.z;

      console.log('🎯 Target NPC selected and FROZEN at position:', {
        x: this.targetNPC.mesh.position.x,
        y: this.targetNPC.mesh.position.y,
        z: this.targetNPC.mesh.position.z,
      });
    } else {
      console.warn('⚠️ No walking NPCs available for abduction!');
      this.state = 'idle';
      this.isActive = false;
      return;
    }

    // Show notification
    this.showNotification('🛸 ADA UFO DATANG!');
  }

  showNotification(message) {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 255, 0, 0.9);
      color: black;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 24px;
      font-weight: bold;
      z-index: 10000;
      animation: pulse 1s ease-in-out infinite;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  update(delta) {
    if (!this.mesh) return;

    // Always rotate UFO slowly
    this.mesh.rotation.y += this.rotationSpeed * delta;

    // State machine
    switch (this.state) {
      case 'descending':
        this.updateDescending(delta);
        break;
      case 'abducting':
        this.updateAbducting(delta);
        break;
      case 'ascending':
        this.updateAscending(delta);
        break;
    }
  }

  updateDescending(delta) {
    if (!this.targetNPC) {
      console.error('❌ No target NPC in descending state!');
      this.state = 'idle';
      this.isActive = false;
      return;
    }

    // Keep UFO centered above target NPC (in case NPC moves slightly)
    this.mesh.position.x = this.targetNPC.mesh.position.x;
    this.mesh.position.z = this.targetNPC.mesh.position.z;

    // Descend to abduction height
    const targetY = this.descentHeight;
    this.mesh.position.y -= this.speed * delta;

    // Gradually show beam
    if (this.beamLight.material.opacity < 0.4) {
      this.beamLight.material.opacity += delta * 0.5;
    }

    if (this.mesh.position.y <= targetY) {
      this.mesh.position.y = targetY;
      this.state = 'abducting';
      this.abductionStartTime = Date.now();
      console.log('✅ Reached target height. Starting abduction...');
      console.log('🎯 UFO position:', this.mesh.position);
      console.log('👤 NPC position:', this.targetNPC.mesh.position);
    }
  }

  updateAbducting(delta) {
    if (!this.targetNPC) {
      console.warn('⚠️ No target NPC in abducting state!');
      this.state = 'ascending';
      return;
    }

    // Keep UFO centered above target
    this.mesh.position.x = this.targetNPC.mesh.position.x;
    this.mesh.position.z = this.targetNPC.mesh.position.z;

    // Pulse beam
    this.beamLight.material.opacity = 0.3 + Math.sin(Date.now() * 0.005) * 0.1;

    // Lift NPC towards UFO
    const npcY = this.targetNPC.mesh.position.y;
    const targetY = this.mesh.position.y - 3;

    console.log(
      '🔍 NPC Y:',
      npcY.toFixed(2),
      '| Target Y:',
      targetY.toFixed(2)
    );

    if (npcY < targetY) {
      const liftAmount = this.speed * 0.3 * delta;
      this.targetNPC.mesh.position.y += liftAmount;
      console.log(
        '⬆️ Lifting NPC by',
        liftAmount.toFixed(3),
        'New Y:',
        this.targetNPC.mesh.position.y.toFixed(2)
      );

      // Rotate NPC while being abducted
      this.targetNPC.mesh.rotation.y += delta * 3;
    } else {
      // Abduction complete after 2 seconds at target height
      const elapsed = (Date.now() - this.abductionStartTime) / 1000;
      console.log('⏱️ Elapsed time:', elapsed.toFixed(1), 's');
      if (elapsed > 2) {
        console.log('✅ Abduction complete! Returning to mothership...');
        this.state = 'ascending';
      }
    }
  }

  updateAscending(delta) {
    // Ascend back to sky
    this.mesh.position.y += this.speed * delta;

    // Take NPC with UFO if exists
    if (this.targetNPC) {
      this.targetNPC.mesh.position.y += this.speed * delta;
    }

    // Fade out beam
    if (this.beamLight.material.opacity > 0) {
      this.beamLight.material.opacity -= delta * 0.5;
    }

    // When high enough, reset
    if (this.mesh.position.y >= this.height) {
      this.mesh.position.y = this.height;

      // Remove abducted NPC from scene
      if (this.targetNPC) {
        this.scene.remove(this.targetNPC.mesh);
        const index = this.npcManager.npcs.indexOf(this.targetNPC);
        if (index > -1) {
          this.npcManager.npcs.splice(index, 1);
        }
        console.log('👽 NPC has been abducted permanently!');
        this.showNotification('👽 UFO SUDAH MENCULIK ORANG!');
        this.targetNPC = null;
      }

      // Reset UFO
      this.state = 'idle';
      this.isActive = false;
      this.beamLight.material.opacity = 0;
    }
  }
}
