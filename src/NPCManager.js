import * as THREE from 'three';

export class NPCManager {
  constructor(scene, cityData) {
    this.scene = scene;
    this.cityData = cityData;
    this.npcs = [];
    this.specialNPCs = [];
    this.vehicleNPCs = [];
    this.birds = [];
    this.airplanes = [];
  }

  createNPCs() {
    // Create walking NPCs (30 variations)
    this.createWalkingNPCs();

    // Create vehicle NPCs (5 motorcycles, 3 cars)
    this.createVehicleNPCs();

    // Create flying birds
    this.createBirds();

    // Create airplanes
    this.createAirplanes();

    // Create special mission NPCs
    this.createSpecialNPCs();

    // Create Farhan Hadi Lutfi (non-mission NPC)
    this.createFarhanNPC();
  }

  createWalkingNPCs() {
    const colors = [
      0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xff8800,
      0x88ff00, 0x0088ff, 0xff0088, 0x8800ff, 0x00ff88, 0xffffff, 0x888888,
      0x444444, 0xaa0000, 0x00aa00, 0x0000aa, 0xaaaa00, 0xaa00aa, 0x00aaaa,
      0xffaa00, 0xaaff00, 0x00aaff, 0xff00aa, 0xaa00ff, 0x00ffaa, 0xcccccc,
      0x666666, 0x222222,
    ];

    if (
      !this.cityData.sidewalkPaths ||
      this.cityData.sidewalkPaths.length === 0
    ) {
      console.warn('No sidewalk paths available');
      return;
    }

    for (let i = 0; i < 30; i++) {
      const color = colors[i % colors.length];
      const path =
        this.cityData.sidewalkPaths[i % this.cityData.sidewalkPaths.length];

      if (!path) continue;

      const npc = this.createMinecraftCharacter(color);

      // Random position along path
      const t = Math.random();
      const startX = path.start.x;
      const startZ = path.start.z;
      const endX = path.end.x;
      const endZ = path.end.z;

      npc.position.set(
        startX + (endX - startX) * t,
        0.9,
        startZ + (endZ - startZ) * t
      );

      this.scene.add(npc);

      this.npcs.push({
        mesh: npc,
        path: path,
        speed: 0.8 + Math.random() * 0.8,
        direction: Math.random() > 0.5 ? 1 : -1,
        progress: t,
        type: 'walking',
      });
    }
  }

  createMinecraftCharacter(color, scale = 1) {
    const group = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.BoxGeometry(
      0.8 * scale,
      1.2 * scale,
      0.4 * scale
    );
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6 * scale;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeometry = new THREE.BoxGeometry(
      0.6 * scale,
      0.6 * scale,
      0.6 * scale
    );
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xfdbcb4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5 * scale;
    head.castShadow = true;
    group.add(head);

    // Arms
    const armGeometry = new THREE.BoxGeometry(
      0.3 * scale,
      0.9 * scale,
      0.3 * scale
    );
    const armMaterial = new THREE.MeshStandardMaterial({ color: color });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.6 * scale, 0.6 * scale, 0);
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.6 * scale, 0.6 * scale, 0);
    rightArm.castShadow = true;
    group.add(rightArm);

    // Legs
    const legGeometry = new THREE.BoxGeometry(
      0.3 * scale,
      0.9 * scale,
      0.3 * scale
    );
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.25 * scale, -0.45 * scale, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.25 * scale, -0.45 * scale, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    return group;
  }

  createVehicleNPCs() {
    if (!this.cityData.roadPaths || this.cityData.roadPaths.length === 0) {
      console.warn('No road paths available');
      return;
    }

    // Create 5 motorcycles
    for (let i = 0; i < 5; i++) {
      const path = this.cityData.roadPaths[i % this.cityData.roadPaths.length];
      if (!path) continue;

      const motorcycle = this.createMotorcycle();
      const t = Math.random();
      motorcycle.position.set(
        path.start.x + (path.end.x - path.start.x) * t,
        0.5,
        path.start.z + (path.end.z - path.start.z) * t
      );

      this.scene.add(motorcycle);

      this.vehicleNPCs.push({
        mesh: motorcycle,
        path: path,
        speed: 6 + Math.random() * 2,
        direction: Math.random() > 0.5 ? 1 : -1,
        progress: t,
        type: 'motorcycle',
      });
    }

    // Create 3 cars
    for (let i = 0; i < 3; i++) {
      const path =
        this.cityData.roadPaths[(i + 5) % this.cityData.roadPaths.length];
      if (!path) continue;

      const car = this.createCar([0xff0000, 0x0000ff, 0x00ff00][i]);
      const t = Math.random();
      car.position.set(
        path.start.x + (path.end.x - path.start.x) * t,
        0.5,
        path.start.z + (path.end.z - path.start.z) * t
      );

      this.scene.add(car);

      this.vehicleNPCs.push({
        mesh: car,
        path: path,
        speed: 5 + Math.random() * 2,
        direction: Math.random() > 0.5 ? 1 : -1,
        progress: t,
        type: 'car',
      });
    }
  }

  createMotorcycle() {
    const group = new THREE.Group();

    // Body (1.2x dari original)
    const bodyGeometry = new THREE.BoxGeometry(0.6, 0.96, 1.8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.72;
    body.castShadow = true;
    group.add(body);

    // Wheels (1.2x dari original)
    const wheelGeometry = new THREE.CylinderGeometry(0.36, 0.36, 0.24, 8);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });

    const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.36, 0.72);
    frontWheel.castShadow = true;
    group.add(frontWheel);

    const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    backWheel.rotation.z = Math.PI / 2;
    backWheel.position.set(0, 0.36, -0.72);
    backWheel.castShadow = true;
    group.add(backWheel);

    // Rider (scale 0.6 = 0.5 * 1.2)
    const rider = this.createMinecraftCharacter(0x00aaff);
    rider.position.y = 1.2;
    group.add(rider);

    return group;
  }

  createCar(color) {
    const group = new THREE.Group();

    // Body (1.5x lebih besar)
    const bodyGeometry = new THREE.BoxGeometry(3, 1.8, 5.25);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    group.add(body);

    // Roof (1.5x lebih besar)
    const roofGeometry = new THREE.BoxGeometry(2.7, 1.2, 3);
    const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
    roof.position.y = 2.4;
    roof.castShadow = true;
    group.add(roof);

    // Windows (1.5x lebih besar)
    const windowGeometry = new THREE.BoxGeometry(2.55, 1.05, 2.85);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.5,
    });
    const windows = new THREE.Mesh(windowGeometry, windowMaterial);
    windows.position.y = 2.4;
    group.add(windows);

    // Wheels (1.5x lebih besar)
    const wheelGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.45, 8);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });

    const wheelPositions = [
      { x: -1.35, z: 1.8 },
      { x: 1.35, z: 1.8 },
      { x: -1.35, z: -1.8 },
      { x: 1.35, z: -1.8 },
    ];

    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, 0.5, pos.z);
      wheel.castShadow = true;
      group.add(wheel);
    });

    return group;
  }

  createBirds() {
    for (let i = 0; i < 10; i++) {
      const bird = this.createBird();
      bird.position.set(
        (Math.random() - 0.5) * 200,
        20 + Math.random() * 30,
        (Math.random() - 0.5) * 200
      );

      this.scene.add(bird);

      this.birds.push({
        mesh: bird,
        speed: 5 + Math.random() * 5,
        angle: Math.random() * Math.PI * 2,
        radius: 50 + Math.random() * 50,
        centerX: bird.position.x,
        centerZ: bird.position.z,
        flapSpeed: 5 + Math.random() * 5,
      });
    }
  }

  createBird() {
    const group = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    group.add(body);

    // Wings
    const wingGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.5);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.y = 0.1;
    group.add(wings);

    group.userData.wings = wings;

    return group;
  }

  createAirplanes() {
    // Create 3 airplanes flying at different heights and paths
    for (let i = 0; i < 3; i++) {
      const airplane = this.createAirplane();
      const height = 40 + i * 10; // Different heights: 40, 50, 60
      const angle = (i * Math.PI * 2) / 3; // Distribute evenly around circle

      airplane.position.set(
        Math.cos(angle) * 100,
        height,
        Math.sin(angle) * 100
      );

      this.scene.add(airplane);

      this.airplanes.push({
        mesh: airplane,
        speed: 15 + Math.random() * 10, // Faster than birds
        angle: angle,
        radius: 100 + i * 20, // Different circular paths
        centerX: 0,
        centerZ: 0,
        height: height,
      });
    }
  }

  createAirplane() {
    const group = new THREE.Group();

    // Fuselage (body)
    const fuselageGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
    const fuselageMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
    });
    const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
    fuselage.rotation.z = Math.PI / 2; // Rotate to horizontal
    fuselage.castShadow = true;
    group.add(fuselage);

    // Nose cone
    const noseGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
    const nose = new THREE.Mesh(noseGeometry, fuselageMaterial);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 2.75;
    nose.castShadow = true;
    group.add(nose);

    // Wings
    const wingGeometry = new THREE.BoxGeometry(0.3, 6, 1.5);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.y = -0.2;
    wings.castShadow = true;
    group.add(wings);

    // Tail wing (horizontal stabilizer)
    const tailWingGeometry = new THREE.BoxGeometry(0.2, 3, 1);
    const tailWing = new THREE.Mesh(tailWingGeometry, wingMaterial);
    tailWing.position.set(-2, -0.1, 0);
    tailWing.castShadow = true;
    group.add(tailWing);

    // Vertical stabilizer (tail fin)
    const tailFinGeometry = new THREE.BoxGeometry(0.2, 1, 1.5);
    const tailFin = new THREE.Mesh(tailFinGeometry, wingMaterial);
    tailFin.position.set(-2, 0.5, 0);
    tailFin.castShadow = true;
    group.add(tailFin);

    // Cockpit window
    const windowGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.6,
    });
    const window = new THREE.Mesh(windowGeometry, windowMaterial);
    window.position.set(1.5, 0.3, 0);
    window.scale.set(1, 0.8, 0.8);
    group.add(window);

    return group;
  }

  createSpecialNPCs() {
    const specialCharacters = [
      {
        name: 'Ariman',
        position: { x: -55, z: -120 },
        dialogue: 'Yah aku ketawan.',
      }, // Di samping air mancur (park tetap di 0,-40)
      {
        name: 'Putra',
        position: { x: 40, z: 57 },
        dialogue: 'Waduh, kamu nemuin aku juga.',
      }, // Di depan SMK TELESANDI (bangunan di 40,45, depth 10, jadi depan di z=50+7)
      {
        name: 'Ananda',
        position: { x: -40, z: 57 },
        dialogue: 'Hehe, kamu jago banget nyarinya.',
      }, // Di depan SMPN 11 BEKASI (bangunan di -40,45, depth 10, jadi depan di z=50+7)
      {
        name: 'Zait',
        position: { x: -73, z: -67 },
        dialogue: 'Astaga, aku gak nyangka kamu nemu aku.',
      }, // Di depan Konoha Mart (bangunan di -40,5, depth 8, jadi depan di z=9+4)
      {
        name: 'Mahardhika',
        position: { x: -8, z: 28 },
        // position: { x: -15, z: 40 },
        dialogue: 'Haha, ketahuan juga deh aku.',
      }, // Di pinggir lake (lake tetap di 0,40)
    ];

    specialCharacters.forEach((char) => {
      const npc = this.createMinecraftCharacter(0xff00ff);
      npc.position.set(char.position.x, 0.9, char.position.z);

      // Create name tag
      const nameTag = this.createNameTag(char.name);
      nameTag.position.y = 2.5;
      npc.add(nameTag);

      this.scene.add(npc);

      this.specialNPCs.push({
        mesh: npc,
        name: char.name,
        dialogue: char.dialogue,
        found: false,
        nameTag: nameTag,
      });
    });
  }

  createFarhanNPC() {
    const farhan = this.createMinecraftCharacter(0xffd700);
    farhan.position.set(0, 0.9, -5);
    const nameTag = this.createNameTag('Farhan Hadi Lutfi');
    nameTag.position.y = 2.5;
    farhan.add(nameTag);

    this.scene.add(farhan);

    this.specialNPCs.push({
      mesh: farhan,
      name: 'Farhan Hadi Lutfi',
      dialogue:
        'Hai, Aku Farhan Hadi Lutfi. Aku gak ikutan main ya hehe, semangat ya kamu harus temukan semua yang bersembunyi!',
      dialogueNight: 'Sudah malam, harusnya kamu pulang...',
      found: false,
      isMission: false,
      isFarhan: true,
      nameTag: nameTag,
    });
  }

  createNameTag(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;

    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'bold 48px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(4, 1, 1);

    return sprite;
  }

  update(delta) {
    // Update walking NPCs
    this.npcs.forEach((npc) => {
      if (npc.type === 'walking') {
        // Skip update if NPC is being abducted by UFO
        if (npc.isBeingAbducted) {
          return;
        }

        npc.progress +=
          (npc.speed * npc.direction * delta) / this.getPathLength(npc.path);

        if (npc.progress > 1 || npc.progress < 0) {
          npc.direction *= -1;
          npc.progress = Math.max(0, Math.min(1, npc.progress));
        }

        const newPos = this.getPositionOnPath(npc.path, npc.progress);
        npc.mesh.position.x = newPos.x;
        npc.mesh.position.y = 0.9; // Keep NPCs at ground level
        npc.mesh.position.z = newPos.z;

        // Face movement direction
        const dx = npc.path.end.x - npc.path.start.x;
        const dz = npc.path.end.z - npc.path.start.z;
        const angle = Math.atan2(dx, dz);
        npc.mesh.rotation.y = angle + (npc.direction < 0 ? Math.PI : 0);
      }
    });

    // Update vehicle NPCs
    this.vehicleNPCs.forEach((vehicle) => {
      vehicle.progress +=
        (vehicle.speed * vehicle.direction * delta) /
        this.getPathLength(vehicle.path);

      if (vehicle.progress > 1) {
        vehicle.progress = 0;
        // Change to random path
        if (Math.random() > 0.7 && this.cityData.roadPaths.length > 1) {
          vehicle.path =
            this.cityData.roadPaths[
              Math.floor(Math.random() * this.cityData.roadPaths.length)
            ];
        }
      } else if (vehicle.progress < 0) {
        vehicle.progress = 1;
      }

      const newPos = this.getPositionOnPath(vehicle.path, vehicle.progress);
      vehicle.mesh.position.x = newPos.x;
      vehicle.mesh.position.y = 0.5; // Lowered to ensure wheels touch ground
      vehicle.mesh.position.z = newPos.z;

      // Calculate rotation angle based on path direction
      const dx = vehicle.path.end.x - vehicle.path.start.x;
      const dz = vehicle.path.end.z - vehicle.path.start.z;

      // atan2(dx, dz) gives angle where Z-axis is forward (which matches our vehicle model)
      const angle = Math.atan2(dx, dz);

      // Only rotate around Y axis to keep vehicle level (no tilting)
      // Add PI if going in reverse direction
      vehicle.mesh.rotation.set(
        0,
        angle + (vehicle.direction < 0 ? Math.PI : 0),
        0
      );
    });

    // Update birds
    this.birds.forEach((bird, index) => {
      bird.angle += (bird.speed * delta) / bird.radius;
      bird.mesh.position.x = bird.centerX + Math.cos(bird.angle) * bird.radius;
      bird.mesh.position.z = bird.centerZ + Math.sin(bird.angle) * bird.radius;
      bird.mesh.rotation.y = bird.angle + Math.PI / 2;

      // Animate wing flapping
      if (bird.mesh.userData.wings) {
        bird.mesh.userData.wings.rotation.z =
          Math.sin(index + Date.now() * 0.01 * bird.flapSpeed) * 0.3;
      }
    });

    // Update airplanes
    this.airplanes.forEach((airplane) => {
      airplane.angle += (airplane.speed * delta) / airplane.radius;
      airplane.mesh.position.x =
        airplane.centerX + Math.cos(airplane.angle) * airplane.radius;
      airplane.mesh.position.y = airplane.height;
      airplane.mesh.position.z =
        airplane.centerZ + Math.sin(airplane.angle) * airplane.radius;

      // Rotate airplane to face direction of movement
      airplane.mesh.rotation.y = airplane.angle + Math.PI / 2;

      // Add slight banking (tilting) for realism
      airplane.mesh.rotation.z = Math.sin(airplane.angle) * 0.1;
    });
  }

  getPathLength(path) {
    const dx = path.end.x - path.start.x;
    const dz = path.end.z - path.start.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  getPositionOnPath(path, t) {
    return {
      x: path.start.x + (path.end.x - path.start.x) * t,
      z: path.start.z + (path.end.z - path.start.z) * t,
    };
  }

  checkNPCProximity(playerPosition, radius = 3) {
    for (const npc of this.specialNPCs) {
      // Skip found NPCs, but NOT Farhan (he's always available)
      if (npc.found && !npc.isFarhan) {
        continue;
      }

      const distance = playerPosition.distanceTo(npc.mesh.position);

      if (distance < radius) {
        return npc;
      }
    }
    return null;
  }

  resetNPCs() {
    // Reset found state for all special NPCs except Farhan
    this.specialNPCs.forEach((npc) => {
      if (!npc.isFarhan) {
        npc.found = false;
        if (npc.nameTag) {
          npc.nameTag.visible = true; // Show name tag again
        }
      }
    });
  }
}
