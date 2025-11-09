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
    this.state = 'idle';
    this.height = 80;
    this.descentHeight = 15;
    this.speed = 20;
    this.rotationSpeed = 1;
    this.inputSequence = [];
    this.secretCode = ['u', 'f', 'o'];
    this.inputTimeout = null;

    this.createUFO();
    this.setupInputListener();
  }

  createUFO() {
    const group = new THREE.Group();
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
    const bottomGeometry = new THREE.CylinderGeometry(2, 2, 0.3, 32);
    const bottomMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.9,
      roughness: 0.1,
    });
    const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
    bottom.position.y = -0.65;
    group.add(bottom);
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
    group.position.set(0, this.height, 0);
    this.mesh = group;
    this.scene.add(this.mesh);
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
      if (this.inputTimeout) {
        clearTimeout(this.inputTimeout);
      }
      this.inputSequence.push(key);
      if (this.inputSequence.length > 3) {
        this.inputSequence.shift();
      }
      if (this.inputSequence.join('') === this.secretCode.join('')) {
        this.activateUFO();
        this.inputSequence = [];
      }
      this.inputTimeout = setTimeout(() => {
        this.inputSequence = [];
      }, 2000);
    });
  }

  activateUFO() {
    if (this.isActive || this.state !== 'idle') {
      return;
    }

    if (this.gameManager && this.gameManager.gameState === 'lost') {
      this.showNotification('🌙 UFOs only appear during sunset...');
      return;
    }

    this.isActive = true;
    this.state = 'descending';

    const walkingNPCs = this.npcManager.npcs.filter(
      (npc) => npc.type === 'walking'
    );

    if (walkingNPCs.length > 0) {
      const randomIndex = Math.floor(Math.random() * walkingNPCs.length);
      this.targetNPC = walkingNPCs[randomIndex];

      this.targetNPC.originalSpeed = this.targetNPC.speed;
      this.targetNPC.speed = 0;
      this.targetNPC.isBeingAbducted = true;

      this.mesh.position.x = this.targetNPC.mesh.position.x;
      this.mesh.position.y = this.height;
      this.mesh.position.z = this.targetNPC.mesh.position.z;
    } else {
      this.state = 'idle';
      this.isActive = false;
      return;
    }
    this.showNotification('🛸 ADA UFO DATANG!');
  }

  showNotification(message) {
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
    this.mesh.rotation.y += this.rotationSpeed * delta;
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
      this.state = 'idle';
      this.isActive = false;
      return;
    }

    this.mesh.position.x = this.targetNPC.mesh.position.x;
    this.mesh.position.z = this.targetNPC.mesh.position.z;

    const targetY = this.descentHeight;
    this.mesh.position.y -= this.speed * delta;

    if (this.beamLight.material.opacity < 0.4) {
      this.beamLight.material.opacity += delta * 0.5;
    }

    if (this.mesh.position.y <= targetY) {
      this.mesh.position.y = targetY;
      this.state = 'abducting';
      this.abductionStartTime = Date.now();
    }
  }

  updateAbducting(delta) {
    if (!this.targetNPC) {
      this.state = 'ascending';
      return;
    }

    this.mesh.position.x = this.targetNPC.mesh.position.x;
    this.mesh.position.z = this.targetNPC.mesh.position.z;

    this.beamLight.material.opacity = 0.3 + Math.sin(Date.now() * 0.005) * 0.1;

    const npcY = this.targetNPC.mesh.position.y;
    const targetY = this.mesh.position.y - 3;

    if (npcY < targetY) {
      const liftAmount = this.speed * 0.3 * delta;
      this.targetNPC.mesh.position.y += liftAmount;
      this.targetNPC.mesh.rotation.y += delta * 3;
    } else {
      const elapsed = (Date.now() - this.abductionStartTime) / 1000;
      if (elapsed > 2) {
        this.state = 'ascending';
      }
    }
  }

  updateAscending(delta) {
    this.mesh.position.y += this.speed * delta;
    if (this.targetNPC) {
      this.targetNPC.mesh.position.y += this.speed * delta;
    }
    if (this.beamLight.material.opacity > 0) {
      this.beamLight.material.opacity -= delta * 0.5;
    }

    if (this.mesh.position.y >= this.height) {
      this.mesh.position.y = this.height;
      if (this.targetNPC) {
        this.scene.remove(this.targetNPC.mesh);
        const index = this.npcManager.npcs.indexOf(this.targetNPC);
        if (index > -1) {
          this.npcManager.npcs.splice(index, 1);
        }
        this.showNotification('👽 UFO SUDAH MENCULIK ORANG!');
        this.targetNPC = null;
      }

      this.state = 'idle';
      this.isActive = false;
      this.beamLight.material.opacity = 0;
    }
  }
}
