import * as THREE from 'three';

export class Player {
  constructor(scene, camera, cityData, gameManager, game) {
    this.scene = scene;
    this.camera = camera;
    this.cityData = cityData;
    this.gameManager = gameManager;
    this.game = game;

    this.position = new THREE.Vector3(0, 0.9, 5);
    this.velocity = new THREE.Vector3();
    this.speed = 5;
    this.sprintSpeed = 10;
    this.jumpSpeed = 8;
    this.gravity = -25;
    this.isOnGround = false;
    this.height = 1.8;
    this.originalSpeed = this.speed;
    this.originalSprintSpeed = this.sprintSpeed;
    this.originalJumpSpeed = this.jumpSpeed;

    this.cameraDistance = 6;
    this.cameraHeight = 4;
    this.cameraAngle = { horizontal: 0, vertical: 0.3 };
    this.mouseSensitivity = 0.002;

    this.keys = {};
    this.mouseMovement = { x: 0, y: 0 };
    this.isPointerLocked = false;

    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
    this.boundClick = this.onClick.bind(this);
    this.boundPointerLockChange = this.onPointerLockChange.bind(this);
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.createPlayerMesh();
    this.setupControls();
    this.updateCamera();
  }

  createPlayerMesh() {
    const group = new THREE.Group();

    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3498db });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xfdbcb4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    head.castShadow = true;
    group.add(head);

    const armGeometry = new THREE.BoxGeometry(0.3, 0.9, 0.3);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0x3498db });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.6, 0.6, 0);
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.6, 0.6, 0);
    rightArm.castShadow = true;
    group.add(rightArm);

    const legGeometry = new THREE.BoxGeometry(0.3, 0.9, 0.3);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.25, -0.45, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.25, -0.45, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    this.mesh = group;
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }

  setupControls() {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    document.addEventListener('click', this.boundClick);
    document.addEventListener('pointerlockchange', this.boundPointerLockChange);
    document.addEventListener('mousemove', this.boundMouseMove);
  }

  onKeyDown(e) {
    this.keys[e.key.toLowerCase()] = true;
    this.keys[e.code] = true;
  }

  onKeyUp(e) {
    this.keys[e.key.toLowerCase()] = false;
    this.keys[e.code] = false;
  }

  onClick() {
    if (!this.isPointerLocked) {
      document.body.requestPointerLock();
    }
  }

  onPointerLockChange() {
    this.isPointerLocked = document.pointerLockElement === document.body;
  }

  onMouseMove(e) {
    if (this.isPointerLocked) {
      if (this.gameManager && this.gameManager.isPaused) {
        return;
      }

      this.cameraAngle.horizontal -= e.movementX * this.mouseSensitivity;
      this.cameraAngle.vertical -= e.movementY * this.mouseSensitivity;

      this.cameraAngle.vertical = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 3, this.cameraAngle.vertical)
      );
    }
  }

  update(delta) {
    if (this.gameManager && this.gameManager.isPaused) {
      return;
    }

    const moveDirection = new THREE.Vector3();
    const isSprinting =
      this.keys['shift'] || this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    const currentSpeed = isSprinting ? this.sprintSpeed : this.speed;

    if (this.keys['w'] || this.keys['arrowup']) moveDirection.z -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveDirection.z += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveDirection.x -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveDirection.x += 1;

    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      moveDirection.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.cameraAngle.horizontal
      );
    }

    this.velocity.x = moveDirection.x * currentSpeed;
    this.velocity.z = moveDirection.z * currentSpeed;

    this.velocity.y += this.gravity * delta;

    if ((this.keys[' '] || this.keys['space']) && this.isOnGround) {
      this.velocity.y = this.jumpSpeed;
      this.isOnGround = false;
    }

    const movementX = this.velocity.x * delta;
    const movementZ = this.velocity.z * delta;
    const movementDistance = Math.sqrt(
      movementX * movementX + movementZ * movementZ
    );

    const playerRadius = 0.5;
    const maxStepSize = playerRadius * 0.9;

    if (movementDistance > maxStepSize) {
      const steps = Math.ceil(movementDistance / maxStepSize);
      const stepX = movementX / steps;
      const stepZ = movementZ / steps;

      for (let i = 0; i < steps; i++) {
        this.position.x += stepX;
        this.position.z += stepZ;

        this.enforceMapBoundaries();

        this.handleBuildingCollision();
      }
    } else {
      this.position.x += this.velocity.x * delta;
      this.position.z += this.velocity.z * delta;

      this.enforceMapBoundaries();
    }

    this.position.y += this.velocity.y * delta;

    const groundY = this.getGroundHeight(this.position.x, this.position.z);
    if (this.position.y <= groundY) {
      this.position.y = groundY;
      this.velocity.y = 0;
      this.isOnGround = true;
    } else {
      this.isOnGround = false;
    }

    this.handleBuildingCollision();

    this.mesh.position.copy(this.position);

    if (moveDirection.length() > 0) {
      this.mesh.rotation.y = Math.atan2(moveDirection.x, moveDirection.z);
    }

    this.updateCamera();
  }

  getGroundHeight(x, z) {
    return 0.9;
  }

  handleBuildingCollision() {
    if (!this.cityData) return;

    const playerRadius = 0.5;

    if (this.cityData.buildings) {
      for (const building of this.cityData.buildings) {
        const bBox = building.boundingBox;
        if (!bBox) continue;

        const closestX = Math.max(
          bBox.min.x,
          Math.min(this.position.x, bBox.max.x)
        );
        const closestZ = Math.max(
          bBox.min.z,
          Math.min(this.position.z, bBox.max.z)
        );

        const distX = this.position.x - closestX;
        const distZ = this.position.z - closestZ;
        const distanceSquared = distX * distX + distZ * distZ;

        if (distanceSquared < playerRadius * playerRadius) {
          const distance = Math.sqrt(distanceSquared);
          if (distance > 0) {
            const pushX = (distX / distance) * (playerRadius - distance);
            const pushZ = (distZ / distance) * (playerRadius - distance);
            this.position.x += pushX;
            this.position.z += pushZ;
          }
        }
      }
    }

    if (this.game && this.game.npcManager && this.game.npcManager.npcs) {
      for (const npc of this.game.npcManager.npcs) {
        if (npc.type !== 'walking' || !npc.mesh) continue;

        const distance = this.position.distanceTo(npc.mesh.position);
        const combinedRadius = playerRadius + 0.4;

        if (distance < combinedRadius) {
          const direction = new THREE.Vector3()
            .subVectors(this.position, npc.mesh.position)
            .normalize();
          const pushDistance = combinedRadius - distance;
          this.position.add(direction.multiplyScalar(pushDistance));
        }
      }
    }

    if (this.game && this.game.npcManager && this.game.npcManager.vehicleNPCs) {
      for (const vehicle of this.game.npcManager.vehicleNPCs) {
        if (!vehicle.mesh) continue;
        const distance = this.position.distanceTo(vehicle.mesh.position);
        const combinedRadius =
          playerRadius + (vehicle.type === 'car' ? 1.2 : 0.8);

        if (distance < combinedRadius) {
          const direction = new THREE.Vector3()
            .subVectors(this.position, vehicle.mesh.position)
            .normalize();

          const pushDistance = combinedRadius - distance;
          this.position.add(direction.multiplyScalar(pushDistance));
        }
      }
    }

    // Check collision with special NPCs (including FarhanHL)
    if (this.game && this.game.npcManager && this.game.npcManager.specialNPCs) {
      for (const specialNPC of this.game.npcManager.specialNPCs) {
        if (!specialNPC.mesh) continue;

        // Simple horizontal distance check first as optimization
        const horizontalDistance = Math.sqrt(
          Math.pow(this.position.x - specialNPC.mesh.position.x, 2) +
          Math.pow(this.position.z - specialNPC.mesh.position.z, 2)
        );

        if (horizontalDistance < (playerRadius + 0.4)) {
          // Check vertical overlap
          const playerBottom = this.position.y - 0.9;
          const playerTop = this.position.y + 0.9;
          const npcBottom = specialNPC.mesh.position.y - 0.9;  // Assuming NPC position.y is ~0.9
          const npcTop = specialNPC.mesh.position.y + 0.9;

          // Check if there's vertical overlap
          if (playerTop > npcBottom && playerBottom < npcTop) {
            // There's a 3D collision - push horizontally to resolve
            const direction = new THREE.Vector3()
              .subVectors(this.position, specialNPC.mesh.position)
              .setY(0)  // Only push horizontally
              .normalize();

            if (direction.length() > 0) {
              const pushDistance = (playerRadius + 0.4) - horizontalDistance;
              this.position.add(direction.multiplyScalar(pushDistance));
            }
          }
        }
      }
    }
  }

  updateCamera() {
    const offsetX =
      Math.sin(this.cameraAngle.horizontal) *
      this.cameraDistance *
      Math.cos(this.cameraAngle.vertical);
    const offsetY =
      this.cameraHeight +
      Math.sin(this.cameraAngle.vertical) * this.cameraDistance;
    const offsetZ =
      Math.cos(this.cameraAngle.horizontal) *
      this.cameraDistance *
      Math.cos(this.cameraAngle.vertical);

    this.camera.position.x = this.position.x + offsetX;
    this.camera.position.y = this.position.y + offsetY;
    this.camera.position.z = this.position.z + offsetZ;

    const minCameraHeight = 1.0;
    if (this.camera.position.y < minCameraHeight) {
      this.camera.position.y = minCameraHeight;
    }

    this.camera.lookAt(this.position.x, this.position.y + 1, this.position.z);
  }

  enforceMapBoundaries() {
    const playerRadius = 0.4;
    const xBoundary = 51 - playerRadius;
    const zBoundary = 93.75 - playerRadius;

    this.position.x = Math.max(
      -xBoundary,
      Math.min(xBoundary, this.position.x)
    );

    this.position.z = Math.max(
      -zBoundary,
      Math.min(zBoundary, this.position.z)
    );
  }

  getPosition() {
    return this.position.clone();
  }

  destroy() {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    document.removeEventListener('click', this.boundClick);
    document.removeEventListener(
      'pointerlockchange',
      this.boundPointerLockChange
    );
    document.removeEventListener('mousemove', this.boundMouseMove);

    if (this.mesh && this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }

  activateKangarooCheat() {
    this.jumpSpeed = this.originalJumpSpeed * 3;
  }

  deactivateKangarooCheat() {
    this.jumpSpeed = this.originalJumpSpeed;
  }

  activateFlashCheat() {
    this.speed = this.originalSpeed * 5;
    this.sprintSpeed = this.originalSprintSpeed * 5;
  }

  deactivateFlashCheat() {
    this.speed = this.originalSpeed;
    this.sprintSpeed = this.originalSprintSpeed;
  }
}
