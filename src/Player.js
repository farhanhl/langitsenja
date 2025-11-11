import * as THREE from 'three';

export class Player {
  constructor(scene, camera, cityData, gameManager, game) {
    this.scene = scene;
    this.camera = camera;
    this.cityData = cityData;
    this.gameManager = gameManager; // Added reference to game manager
    this.game = game; // Added reference to main game instance to access NPC manager

    // Player properties
    this.position = new THREE.Vector3(0, 0.9, 5);
    this.velocity = new THREE.Vector3();
    this.speed = 5;
    this.sprintSpeed = 10;
    this.jumpSpeed = 8;
    this.gravity = -25;
    this.isOnGround = false;
    this.height = 1.8;
    
    // Store original values for cheat modifications
    this.originalSpeed = this.speed;
    this.originalSprintSpeed = this.sprintSpeed;
    this.originalJumpSpeed = this.jumpSpeed;

    // Camera properties
    this.cameraDistance = 6;
    this.cameraHeight = 4;
    this.cameraAngle = { horizontal: 0, vertical: 0.3 };
    this.mouseSensitivity = 0.002;

    // Input state
    this.keys = {};
    this.mouseMovement = { x: 0, y: 0 };
    this.isPointerLocked = false;

    // Store bound event handlers for proper removal
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
    this.boundClick = this.onClick.bind(this);
    this.boundPointerLockChange = this.onPointerLockChange.bind(this);
    this.boundMouseMove = this.onMouseMove.bind(this);

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
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    // Mouse events for camera rotation
    document.addEventListener('click', this.boundClick);
    document.addEventListener('pointerlockchange', this.boundPointerLockChange);
    document.addEventListener('mousemove', this.boundMouseMove);
  }

  // Bound event handlers for proper removal
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

    // Calculate intended movement
    const movementX = this.velocity.x * delta;
    const movementZ = this.velocity.z * delta;
    const movementDistance = Math.sqrt(movementX * movementX + movementZ * movementZ);
    
    // If the movement is too large for a single frame, subdivide it
    // This prevents tunneling through buildings at high speeds
    const playerRadius = 0.5;
    const maxStepSize = playerRadius * 0.9; // Keep steps slightly smaller than player radius
    
    if (movementDistance > maxStepSize) {
      // Calculate how many steps we need to subdivide the movement
      const steps = Math.ceil(movementDistance / maxStepSize);
      const stepX = movementX / steps;
      const stepZ = movementZ / steps;
      
      // Move in smaller steps to prevent tunneling
      for (let i = 0; i < steps; i++) {
        this.position.x += stepX;
        this.position.z += stepZ;
        
        // Map boundary check
        this.enforceMapBoundaries();
        
        // Check collision after each small step
        this.handleBuildingCollision();
      }
    } else {
      // Normal movement for slower speeds
      this.position.x += this.velocity.x * delta;
      this.position.z += this.velocity.z * delta;
      
      // Map boundary check
      this.enforceMapBoundaries();
    }
    
    // Handle vertical movement (Y-axis) separately
    this.position.y += this.velocity.y * delta;
    
    // Ground collision
    const groundY = this.getGroundHeight(this.position.x, this.position.z);
    if (this.position.y <= groundY) {
      this.position.y = groundY;
      this.velocity.y = 0;
      this.isOnGround = true;
    } else {
      this.isOnGround = false;
    }
    
    // Final collision check
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
    if (!this.cityData) return;

    const playerRadius = 0.5;

    // Check collision with buildings
    if (this.cityData.buildings) {
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
          // Push player out from collision
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

    // Check collision with NPCs (walking NPCs)
    if (this.game && this.game.npcManager && this.game.npcManager.npcs) {
      for (const npc of this.game.npcManager.npcs) {
        if (npc.type !== 'walking' || !npc.mesh) continue;
        
        // Calculate distance between player and NPC
        const distance = this.position.distanceTo(npc.mesh.position);
        const combinedRadius = playerRadius + 0.4; // NPC has roughly 0.4 collision radius
        
        if (distance < combinedRadius) {
          // Calculate the direction vector from NPC to player
          const direction = new THREE.Vector3().subVectors(this.position, npc.mesh.position).normalize();
          
          // Push player away from NPC
          const pushDistance = combinedRadius - distance;
          this.position.add(direction.multiplyScalar(pushDistance));
        }
      }
    }

    // Check collision with vehicle NPCs (motorcycles and cars)
    if (this.game && this.game.npcManager && this.game.npcManager.vehicleNPCs) {
      for (const vehicle of this.game.npcManager.vehicleNPCs) {
        if (!vehicle.mesh) continue;
        
        // Calculate distance between player and vehicle
        const distance = this.position.distanceTo(vehicle.mesh.position);
        // Vehicles have different sizes, use a reasonable collision radius
        const combinedRadius = playerRadius + (vehicle.type === 'car' ? 1.2 : 0.8);
        
        if (distance < combinedRadius) {
          // Calculate the direction vector from vehicle to player
          const direction = new THREE.Vector3().subVectors(this.position, vehicle.mesh.position).normalize();
          
          // Push player away from vehicle
          const pushDistance = combinedRadius - distance;
          this.position.add(direction.multiplyScalar(pushDistance));
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
    // Map boundaries based on ground size: width = 102, height = 187.5
    // So boundaries are:
    // X: from -51 to 51 (since width is 102, centered at 0)
    // Z: from -93.75 to 93.75 (since height is 187.5, centered at 0)
    // Account for player's size (0.4 units for half of player width/depth)
    const playerRadius = 0.4;
    const xBoundary = 51 - playerRadius;  // Account for player size
    const zBoundary = 93.75 - playerRadius;  // Account for player size

    // Clamp X position to stay within map boundaries
    this.position.x = Math.max(
      -xBoundary,
      Math.min(xBoundary, this.position.x)
    );

    // Clamp Z position to stay within map boundaries
    this.position.z = Math.max(
      -zBoundary,
      Math.min(zBoundary, this.position.z)
    );
  }
  


  getPosition() {
    return this.position.clone();
  }

  // Clean up event listeners to prevent memory leaks
  destroy() {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    document.removeEventListener('click', this.boundClick);
    document.removeEventListener('pointerlockchange', this.boundPointerLockChange);
    document.removeEventListener('mousemove', this.boundMouseMove);

    // Remove player mesh from scene if it exists
    if (this.mesh && this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
  
  // Methods to modify player attributes for cheat codes
  activateKangarooCheat() {
    this.jumpSpeed = this.originalJumpSpeed * 10; // 10x higher jumps
  }
  
  deactivateKangarooCheat() {
    this.jumpSpeed = this.originalJumpSpeed;
  }
  
  activateFlashCheat() {
    this.speed = this.originalSpeed * 5; // 5x faster movement
    this.sprintSpeed = this.originalSprintSpeed * 5; 
  }
  
  deactivateFlashCheat() {
    this.speed = this.originalSpeed;
    this.sprintSpeed = this.originalSprintSpeed;
  }
}
