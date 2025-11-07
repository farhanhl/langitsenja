import * as THREE from 'three';

export class Player {
  constructor(scene, camera, cityData, gameManager) {
    this.scene = scene;
    this.camera = camera;
    this.cityData = cityData;
    this.gameManager = gameManager; // Added reference to game manager

    // Player properties
    this.position = new THREE.Vector3(0, 0.9, 5);
    this.velocity = new THREE.Vector3();
    this.speed = 5;
    this.sprintSpeed = 10;
    this.jumpSpeed = 8;
    this.gravity = -25;
    this.isOnGround = false;
    this.height = 1.8;

    // Camera properties
    this.cameraDistance = 8;
    this.cameraHeight = 3;
    this.cameraAngle = { horizontal: 0, vertical: 0.3 };
    this.mouseSensitivity = 0.002;

    // Input state
    this.keys = {};
    this.mouseMovement = { x: 0, y: 0 };
    this.isPointerLocked = false;

    // Create player mesh (Minecraft-style)
    this.createPlayerMesh();

    // Setup controls
    this.setupControls();

    // Set initial camera position
    this.updateCamera();
  }

  createPlayerMesh() {
    // Create a simple blocky character
    const group = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3498db });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xfdbcb4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    head.castShadow = true;
    group.add(head);

    // Arms
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

    // Legs
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
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.keys[e.code] = false;
    });

    // Mouse events for camera rotation
    document.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        document.body.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === document.body;
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        // Check if game is paused
        if (this.gameManager && this.gameManager.isPaused) {
          return; // Don't update camera when game is paused
        }

        this.cameraAngle.horizontal -= e.movementX * this.mouseSensitivity;
        this.cameraAngle.vertical -= e.movementY * this.mouseSensitivity;

        // Clamp vertical angle
        this.cameraAngle.vertical = Math.max(
          -Math.PI / 3,
          Math.min(Math.PI / 3, this.cameraAngle.vertical)
        );
      }
    });
  }

  update(delta) {
    // Check if game is paused
    if (this.gameManager && this.gameManager.isPaused) {
      return; // Don't update player movement when game is paused
    }

    // Handle movement
    const moveDirection = new THREE.Vector3();
    const isSprinting =
      this.keys['shift'] || this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    const currentSpeed = isSprinting ? this.sprintSpeed : this.speed;

    // WASD or Arrow keys
    if (this.keys['w'] || this.keys['arrowup']) moveDirection.z -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveDirection.z += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveDirection.x -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveDirection.x += 1;

    // Normalize and apply camera rotation
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      moveDirection.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.cameraAngle.horizontal
      );
    }

    // Apply horizontal movement
    this.velocity.x = moveDirection.x * currentSpeed;
    this.velocity.z = moveDirection.z * currentSpeed;

    // Apply gravity
    this.velocity.y += this.gravity * delta;

    // Jump
    if ((this.keys[' '] || this.keys['space']) && this.isOnGround) {
      this.velocity.y = this.jumpSpeed;
      this.isOnGround = false;
    }

    // Update position
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;

    // Map boundary check (prevent player from leaving the map)
    this.enforceMapBoundaries();

    // Ground collision
    const groundY = this.getGroundHeight(this.position.x, this.position.z);
    if (this.position.y <= groundY) {
      this.position.y = groundY;
      this.velocity.y = 0;
      this.isOnGround = true;
    } else {
      this.isOnGround = false;
    }

    // Building collision
    this.handleBuildingCollision();

    // Update mesh position and rotation
    this.mesh.position.copy(this.position);

    // Rotate player to face movement direction
    if (moveDirection.length() > 0) {
      // moveDirection is already rotated by camera angle, so just use it directly
      this.mesh.rotation.y = Math.atan2(moveDirection.x, moveDirection.z);
    }

    // Update camera
    this.updateCamera();
  }

  getGroundHeight(x, z) {
    // Default ground level - feet position of character
    return 0.9;
  }

  handleBuildingCollision() {
    if (!this.cityData || !this.cityData.buildings) return;

    const playerRadius = 0.5;

    for (const building of this.cityData.buildings) {
      const bBox = building.boundingBox;
      if (!bBox) continue;

      // Simple AABB collision
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
        // Push player out
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

  updateCamera() {
    // Calculate camera position based on player position and angles
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

    // Prevent camera from going below ground (minimum height of 1.0)
    const minCameraHeight = 1.0;
    if (this.camera.position.y < minCameraHeight) {
      this.camera.position.y = minCameraHeight;
    }

    // Look at player
    this.camera.lookAt(this.position.x, this.position.y + 1, this.position.z);
  }

  enforceMapBoundaries() {
    // Map boundaries (based on ground size of 187.5 units centered at 0,0)
    // So boundaries are from -93.75 to 93.75 in both X and Z dimensions
    const mapBoundary = 93; // A little less than 93.75 to account for player size

    // Clamp X position to stay within map boundaries
    this.position.x = Math.max(
      -mapBoundary,
      Math.min(mapBoundary, this.position.x)
    );

    // Clamp Z position to stay within map boundaries
    this.position.z = Math.max(
      -mapBoundary,
      Math.min(mapBoundary, this.position.z)
    );
  }

  getPosition() {
    return this.position.clone();
  }
}
