import * as THREE from 'three';

export class CityBuilder {
  constructor(scene) {
    this.scene = scene;
    this.buildings = [];
    this.roads = [];
    this.sidewalks = [];
    this.sidewalkPaths = [];
    this.roadPaths = [];
  }

  build() {
    this.createGround();
    this.createRoadNetwork();
    this.createPark();
    this.createLake();
    this.createBasketballCourt(0, 0);
    this.createAngkringan(-100, 50);
    this.createAngkringan(-115, 50);
    this.createConstructionSite(-90, 85, { rotate: 180 });
    this.createLapanganBolaJalanan(-88, -40, { numPlayers: 4 });
    this.createTrafficLights();

    return {
      buildings: this.buildings,
      roads: this.roads,
      sidewalks: this.sidewalks,
      sidewalkPaths: this.sidewalkPaths,
      roadPaths: this.roadPaths,
      lakeArea: this.lakeArea,
      parkArea: this.parkArea,
    };
  }

  createGround() {
    const groundSize = 250;
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x6b8e23,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  createRoadNetwork() {
    const roadWidth = 8;
    const sidewalkWidth = 2;
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const sidewalkMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
    });

    // Main roads (grid pattern) - diperluas sampai ujung map (250)
    const roadPositions = [
      // Horizontal roads (panjang 250 dari -125 ke 125)
      { x: 0, z: -60, width: 250, depth: roadWidth },
      { x: 0, z: -20, width: 250, depth: roadWidth },
      { x: 0, z: 20, width: 250, depth: roadWidth },
      { x: 0, z: 60, width: 250, depth: roadWidth },
      // Vertical roads (panjang 250 dari -125 ke 125)
      { x: -60, z: 0, width: roadWidth, depth: 250 },
      { x: -20, z: 0, width: roadWidth, depth: 250 },
      { x: 20, z: 0, width: roadWidth, depth: 250 },
      { x: 60, z: 0, width: roadWidth, depth: 250 },
    ];

    roadPositions.forEach((pos) => {
      // Create road
      const roadGeometry = new THREE.BoxGeometry(pos.width, 0.1, pos.depth);
      const road = new THREE.Mesh(roadGeometry, roadMaterial);
      road.position.set(pos.x, 0.05, pos.z);
      road.receiveShadow = true;
      this.scene.add(road);
      this.roads.push(road);

      // Add road paths for vehicles
      if (pos.width > pos.depth) {
        // Horizontal road
        this.roadPaths.push({
          start: { x: pos.x - pos.width / 2, z: pos.z },
          end: { x: pos.x + pos.width / 2, z: pos.z },
          type: 'horizontal',
        });
      } else {
        // Vertical road
        this.roadPaths.push({
          start: { x: pos.x, z: pos.z - pos.depth / 2 },
          end: { x: pos.x, z: pos.z + pos.depth / 2 },
          type: 'vertical',
        });
      }

      // Create sidewalks on both sides
      if (pos.width > pos.depth) {
        // Horizontal road - sidewalks on top and bottom
        this.createSidewalk(
          pos.x,
          pos.z + pos.depth / 2 + sidewalkWidth / 2,
          pos.width,
          sidewalkWidth,
          sidewalkMaterial
        );
        this.createSidewalk(
          pos.x,
          pos.z - pos.depth / 2 - sidewalkWidth / 2,
          pos.width,
          sidewalkWidth,
          sidewalkMaterial
        );
      } else {
        // Vertical road - sidewalks on left and right
        this.createSidewalk(
          pos.x + pos.width / 2 + sidewalkWidth / 2,
          pos.z,
          sidewalkWidth,
          pos.depth,
          sidewalkMaterial
        );
        this.createSidewalk(
          pos.x - pos.width / 2 - sidewalkWidth / 2,
          pos.z,
          sidewalkWidth,
          pos.depth,
          sidewalkMaterial
        );
      }
    });
  }

  createSidewalk(x, z, width, depth, material) {
    const sidewalkGeometry = new THREE.BoxGeometry(width, 0.2, depth);
    const sidewalk = new THREE.Mesh(sidewalkGeometry, material);
    sidewalk.position.set(x, 0.1, z);
    sidewalk.receiveShadow = true;
    this.scene.add(sidewalk);
    this.sidewalks.push(sidewalk);

    // Add sidewalk path for walking NPCs
    if (width > depth) {
      this.sidewalkPaths.push({
        start: { x: x - width / 2, z: z },
        end: { x: x + width / 2, z: z },
      });
    } else {
      this.sidewalkPaths.push({
        start: { x: x, z: z - depth / 2 },
        end: { x: x, z: z + depth / 2 },
      });
    }
  }

  createBicycle(x, z) {
    const group = new THREE.Group();

    // Bicycle frame (diperbesar 2x)
    const frameGeometry = new THREE.BoxGeometry(0.1, 1.2, 2.4);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // Blue
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.y = 1;
    frame.castShadow = true;
    group.add(frame);

    // Front wheel (diperbesar 2x)
    const wheelGeometry = new THREE.TorusGeometry(0.6, 0.1, 8, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontWheel.rotation.y = Math.PI / 2;
    frontWheel.position.set(0, 0.8, 1);
    frontWheel.castShadow = true;
    group.add(frontWheel);

    // Back wheel (diperbesar 2x)
    const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    backWheel.rotation.y = Math.PI / 2;
    backWheel.position.set(0, 0.8, -1);
    backWheel.castShadow = true;
    group.add(backWheel);

    // Handlebars (diperbesar 2x)
    const handlebarGeometry = new THREE.BoxGeometry(1, 0.1, 0.1);
    const handlebar = new THREE.Mesh(handlebarGeometry, frameMaterial);
    handlebar.position.set(0, 1.6, 1.2);
    group.add(handlebar);

    // Seat (diperbesar 2x)
    const seatGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.4);
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 }); // Brown
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.set(0, 1.6, -0.4);
    group.add(seat);

    group.position.set(x, 0, z);
    group.rotation.y = Math.random() * 0.3 - 0.15; // Slight random angle
    this.scene.add(group);
  }

  createSchool(x, z, name, color, height) {
    const group = new THREE.Group();

    // Main building
    const buildingGeometry = new THREE.BoxGeometry(12, height, 10);
    const buildingMaterial = new THREE.MeshStandardMaterial({ color: color });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = height / 2;
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);

    // Flat roof
    const roofGeometry = new THREE.BoxGeometry(13, 0.5, 11);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + 0.25;
    roof.castShadow = true;
    group.add(roof);

    // Multiple windows
    const windowGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.2);
    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x87ceeb });

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < Math.floor(height / 2); j++) {
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(-4 + i * 4, 1 + j * 2, 5.1);
        group.add(window);
      }
    }

    // Building sign/plang - as texture on the wall
    const sign = this.createSchoolSign(name);
    sign.position.set(0, height * 0.7, 5.1);
    group.add(sign);

    group.position.set(x, 0, z);
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({ mesh: group, boundingBox: bbox, name: name });
  }

  createPark() {
    const parkX = 0;
    const parkZ = -40;
    const parkWidth = 28;
    const parkDepth = 28;

    // Grass area
    const grassGeometry = new THREE.BoxGeometry(parkWidth, 0.3, parkDepth);
    const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.position.set(parkX, 0.15, parkZ);
    grass.receiveShadow = true;
    this.scene.add(grass);

    // Benches
    const benchPositions = [
      { x: -6, z: -5 },
      { x: 6, z: -5 },
      { x: -6, z: 5 },
      { x: 6, z: 5 },
    ];

    benchPositions.forEach((pos) => {
      this.createBench(parkX + pos.x, parkZ + pos.z);
    });

    // Central fountain
    this.createFountain(parkX, parkZ);

    this.parkArea = { x: parkX, z: parkZ, width: parkWidth, depth: parkDepth };
  }

  createBench(x, z) {
    const group = new THREE.Group();
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

    // Seat
    const seatGeometry = new THREE.BoxGeometry(2, 0.2, 0.8);
    const seat = new THREE.Mesh(seatGeometry, woodMaterial);
    seat.position.y = 0.5;
    seat.castShadow = true;
    group.add(seat);

    // Backrest
    const backGeometry = new THREE.BoxGeometry(2, 1, 0.1);
    const back = new THREE.Mesh(backGeometry, woodMaterial);
    back.position.set(0, 1, -0.35);
    back.castShadow = true;
    group.add(back);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    [-0.8, 0.8].forEach((xOffset) => {
      [-0.3, 0.3].forEach((zOffset) => {
        const leg = new THREE.Mesh(legGeometry, woodMaterial);
        leg.position.set(xOffset, 0.25, zOffset);
        leg.castShadow = true;
        group.add(leg);
      });
    });

    group.position.set(x, 0, z);
    this.scene.add(group);
  }

  createFountain(x, z) {
    const group = new THREE.Group();

    // Base
    const baseGeometry = new THREE.CylinderGeometry(3, 3.5, 0.5, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.25;
    base.castShadow = true;
    group.add(base);

    // Water pool (with animated shader)
    const poolGeometry = new THREE.CylinderGeometry(2.5, 2.5, 0.3, 8);
    const poolMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
    });
    const pool = new THREE.Mesh(poolGeometry, poolMaterial);
    pool.position.y = 0.65;
    group.add(pool);

    // Center pillar
    const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
    const pillar = new THREE.Mesh(pillarGeometry, baseMaterial);
    pillar.position.y = 1.55;
    pillar.castShadow = true;
    group.add(pillar);

    group.position.set(x, 0, z);
    this.scene.add(group);
  }

  createLake() {
    const lakeX = 0;
    const lakeZ = 40;
    const lakeWidth = 25;
    const lakeDepth = 20;

    // Lake water (visible above ground)
    const lakeGeometry = new THREE.BoxGeometry(lakeWidth, 0.3, lakeDepth);
    const lakeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e90ff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.2,
      metalness: 0.3,
    });
    const lake = new THREE.Mesh(lakeGeometry, lakeMaterial);
    lake.position.set(lakeX, 0.15, lakeZ); // Raised above ground
    lake.receiveShadow = true;
    this.scene.add(lake);

    // Benches around lake (diagonal positions)
    // Serong kiri depan (kiri-atas)
    this.createBench(lakeX - 8, lakeZ - 12);
    // Serong kanan belakang (kanan-bawah)
    this.createBench(lakeX + 8, lakeZ + 12);

    this.lakeArea = { x: lakeX, z: lakeZ, width: lakeWidth, depth: lakeDepth };
  }

  createShops() {
    this.createKonohaMart(-75, -75, 'Konoha Mart');
    this.createFarhanMart(40, 5, 'Farhan Mart');
    this.createWarung(-115, 75, { rotate: 9.45 });
    this.createWarung(-30, -5, { rotate: 7.9 });
    this.createWarung(40, -10);
  }

  createKonohaMart(x, z, name) {
    const group = new THREE.Group();

    // Main building - green theme
    const buildingGeometry = new THREE.BoxGeometry(12, 6, 10);
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
    }); // Green
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 3;
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);

    // Roof with logo area
    const roofGeometry = new THREE.BoxGeometry(13, 0.5, 11);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 }); // Dark green
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 6.25;
    roof.castShadow = true;
    group.add(roof);

    // Awning (canopy above entrance)
    const awningGeometry = new THREE.BoxGeometry(8, 0.2, 3);
    const awningMaterial = new THREE.MeshStandardMaterial({ color: 0x32cd32 }); // Lime green
    const awning = new THREE.Mesh(awningGeometry, awningMaterial);
    awning.position.set(0, 2.5, 6);
    awning.castShadow = true;
    group.add(awning);

    // Awning support poles
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2.5, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });

    [-3, 3].forEach((xPos) => {
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.set(xPos, 1.25, 6.5);
      pole.castShadow = true;
      group.add(pole);
    });

    // Large glass entrance (automatic doors)
    const doorGeometry = new THREE.BoxGeometry(4, 4, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.4,
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 2, 5.1);
    group.add(door);

    // Display windows
    const displayGeometry = new THREE.BoxGeometry(2, 2, 0.2);
    const displayMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
    });

    [-4, 4].forEach((xPos) => {
      const display = new THREE.Mesh(displayGeometry, displayMaterial);
      display.position.set(xPos, 2.5, 5.1);
      group.add(display);
    });

    // Shop sign
    const sign = this.createShopSign(name);
    sign.position.set(0, 4.8, 5.1);
    group.add(sign);

    // Shopping cart area (simple cart models)
    for (let i = 0; i < 3; i++) {
      const cartGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.8);
      const cartMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0 });
      const cart = new THREE.Mesh(cartGeometry, cartMaterial);
      cart.position.set(-5, 0.4, 3 + i * 0.9);
      cart.castShadow = true;
      group.add(cart);
    }

    group.position.set(x, 0, z);
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({ mesh: group, boundingBox: bbox, name: name });
  }

  createFarhanMart(x, z, name) {
    const group = new THREE.Group();

    // Main building - orange theme
    const buildingGeometry = new THREE.BoxGeometry(12, 6, 10);
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600,
    }); // Orange
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 3;
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);

    // Roof
    const roofGeometry = new THREE.BoxGeometry(13, 0.5, 11);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xcc5200 }); // Dark orange
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 6.25;
    roof.castShadow = true;
    group.add(roof);

    // Modern awning (curved style)
    const awningGeometry = new THREE.BoxGeometry(10, 0.3, 3);
    const awningMaterial = new THREE.MeshStandardMaterial({ color: 0xff8c00 }); // Dark orange
    const awning = new THREE.Mesh(awningGeometry, awningMaterial);
    awning.position.set(0, 2.8, 6);
    awning.rotation.x = -0.2;
    awning.castShadow = true;
    group.add(awning);

    // LED light strips under awning
    const ledGeometry = new THREE.BoxGeometry(9, 0.1, 0.1);
    const ledMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.5,
    });
    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(0, 2.5, 6.5);
    group.add(led);

    // Large entrance
    const doorGeometry = new THREE.BoxGeometry(4.5, 4.5, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.3,
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 2.25, 5.1);
    group.add(door);

    // Product display shelves visible through windows
    const shelfGeometry = new THREE.BoxGeometry(1.5, 2.5, 0.3);
    const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });

    [-4.5, 4.5].forEach((xPos) => {
      const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
      shelf.position.set(xPos, 2.5, 5.05);
      group.add(shelf);
    });

    // Parking sign
    const parkingSignGeometry = new THREE.BoxGeometry(1, 1.5, 0.1);
    const parkingSignMaterial = new THREE.MeshStandardMaterial({
      color: 0x0000ff,
    });
    const parkingSign = new THREE.Mesh(
      parkingSignGeometry,
      parkingSignMaterial
    );
    parkingSign.position.set(-6, 1.5, 3);
    parkingSign.castShadow = true;
    group.add(parkingSign);

    // Shop sign
    const sign = this.createShopSign(name);
    sign.position.set(0, 5, 5.1);
    group.add(sign);

    // Trash bins outside
    for (let i = 0; i < 2; i++) {
      const binGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8);
      const binMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const bin = new THREE.Mesh(binGeometry, binMaterial);
      bin.position.set(5.5, 0.4, 2 + i * 1);
      bin.castShadow = true;
      group.add(bin);
    }

    group.position.set(x, 0, z);
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({ mesh: group, boundingBox: bbox, name: name });
  }

  createWarung(x, z, { rotate = 0 } = {}) {
    const group = new THREE.Group();

    // Warung base - warna kayu/bambu tradisional
    const buildingGeometry = new THREE.BoxGeometry(6, 3, 5);
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0xa0826d, // Coklat kayu
      roughness: 0.9,
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 1.5;
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);

    // Atap limasan miring khas warung (menggunakan box dengan rotasi)
    const roofGeometry = new THREE.BoxGeometry(7, 0.3, 6);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513, // Coklat genteng
      roughness: 0.8,
    });

    // Atap bagian depan (miring ke depan)
    const roofFront = new THREE.Mesh(roofGeometry, roofMaterial);
    roofFront.position.set(0, 3.5, 1.5);
    roofFront.rotation.x = -Math.PI / 6; // Miring 30 derajat
    roofFront.castShadow = true;
    group.add(roofFront);

    // Atap bagian belakang (miring ke belakang)
    const roofBack = new THREE.Mesh(roofGeometry, roofMaterial);
    roofBack.position.set(0, 3.5, -1.5);
    roofBack.rotation.x = Math.PI / 6; // Miring 30 derajat
    roofBack.castShadow = true;
    group.add(roofBack);

    // Counter/etalase terbuka di depan (khas warung)
    const counterGeometry = new THREE.BoxGeometry(5, 1.2, 0.8);
    const counterMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b7355, // Coklat counter kayu
    });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.set(0, 0.8, 2.5);
    counter.castShadow = true;
    group.add(counter);

    // Kaca etalase di counter
    const glassGeometry = new THREE.BoxGeometry(4.5, 0.8, 0.1);
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.3,
    });
    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.position.set(0, 1.2, 2.9);
    group.add(glass);

    // Pintu samping warung
    const doorGeometry = new THREE.BoxGeometry(1, 2, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(-2.2, 1, 1.6);
    group.add(door);

    // Jendela samping dengan terali
    const windowGeometry = new THREE.BoxGeometry(1, 0.8, 0.2);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.5,
    });
    const window = new THREE.Mesh(windowGeometry, windowMaterial);
    window.position.set(2.2, 1.8, 0);
    group.add(window);

    // Terali jendela (horizontal bars)
    const barGeometry = new THREE.BoxGeometry(1, 0.05, 0.05);
    const barMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

    for (let i = 0; i < 3; i++) {
      const bar = new THREE.Mesh(barGeometry, barMaterial);
      bar.position.set(2.25, 1.5 + i * 0.3, 0);
      group.add(bar);
    }

    // Papan nama warung sederhana
    const signGeometry = new THREE.BoxGeometry(3, 0.8, 0.1);
    const signMaterial = new THREE.MeshStandardMaterial({
      color: 0xffcc00, // Kuning papan nama
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 3.2, 2.6);
    group.add(sign);

    // Text "WARUNG" pada papan nama
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;

    context.fillStyle = '#ff0000'; // Merah
    context.font = 'bold 80px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('WARUNG', 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const textGeometry = new THREE.PlaneGeometry(2.8, 0.7);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 3.2, 2.65);
    group.add(textMesh);

    // Tiang penyangga atap depan (khas warung)
    const pillarGeometry = new THREE.CylinderGeometry(0.1, 0.12, 3, 8);
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: 0x654321,
      roughness: 0.8,
    });

    // Tiang kiri
    const pillarLeft = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillarLeft.position.set(-2.5, 1.5, 2.5);
    pillarLeft.castShadow = true;
    group.add(pillarLeft);

    // Tiang kanan
    const pillarRight = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillarRight.position.set(2.5, 1.5, 2.5);
    pillarRight.castShadow = true;
    group.add(pillarRight);

    // Jajanan di etalase - Baris 1 (depan counter)
    // Minuman botol (Aqua, Teh Botol, dll)
    const bottleColors = [0x4169e1, 0x8b4513, 0xff6347, 0xffa500, 0x32cd32];
    for (let i = 0; i < 6; i++) {
      const bottleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
      const bottleMaterial = new THREE.MeshStandardMaterial({
        color: bottleColors[i % bottleColors.length],
        transparent: true,
        opacity: 0.7,
      });
      const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
      bottle.position.set(-2 + i * 0.7, 1.15, 2.3);
      bottle.castShadow = true;
      group.add(bottle);

      // Tutup botol
      const capGeometry = new THREE.CylinderGeometry(0.09, 0.09, 0.08, 8);
      const capMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const cap = new THREE.Mesh(capGeometry, capMaterial);
      cap.position.set(-2 + i * 0.7, 1.44, 2.3);
      group.add(cap);
    }

    // Baris 2 - Keripik/snack dalam kemasan (standing)
    const snackColors = [0xff0000, 0xffff00, 0x00ff00, 0xff6600, 0x9370db];
    for (let i = 0; i < 5; i++) {
      const snackGeometry = new THREE.BoxGeometry(0.25, 0.6, 0.08);
      const snackMaterial = new THREE.MeshStandardMaterial({
        color: snackColors[i % snackColors.length],
        roughness: 0.3,
      });
      const snack = new THREE.Mesh(snackGeometry, snackMaterial);
      snack.position.set(-1.8 + i * 0.7, 1.2, 2.7);
      snack.castShadow = true;
      group.add(snack);
    }

    // Baris 3 - Permen dan cokelat kecil
    const candyColors = [0xff1493, 0xffff00, 0x00ffff, 0xff69b4, 0x7fff00];
    for (let i = 0; i < 8; i++) {
      const candyGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.1);
      const candyMaterial = new THREE.MeshStandardMaterial({
        color: candyColors[i % candyColors.length],
      });
      const candy = new THREE.Mesh(candyGeometry, candyMaterial);
      candy.position.set(-2 + i * 0.5, 0.85, 2.4);
      candy.castShadow = true;
      group.add(candy);
    }

    // Toples kaca berisi jajanan (khas warung)
    for (let i = 0; i < 3; i++) {
      // Toples kaca
      const jarGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 16);
      const jarMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        roughness: 0.1,
      });
      const jar = new THREE.Mesh(jarGeometry, jarMaterial);
      jar.position.set(-1.5 + i * 1.5, 1.3, 2.1);
      jar.castShadow = true;
      group.add(jar);

      // Tutup toples (merah/kuning)
      const lidGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.08, 16);
      const lidMaterial = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xff0000 : 0xffff00,
      });
      const lid = new THREE.Mesh(lidGeometry, lidMaterial);
      lid.position.set(-1.5 + i * 1.5, 1.54, 2.1);
      group.add(lid);

      // Isi toples (simulasi cookies/kerupuk)
      for (let j = 0; j < 6; j++) {
        const contentGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const contentMaterial = new THREE.MeshStandardMaterial({
          color: i === 0 ? 0xffa500 : i === 1 ? 0xff6347 : 0xffd700,
        });
        const content = new THREE.Mesh(contentGeometry, contentMaterial);
        content.position.set(
          -1.5 + i * 1.5 + (Math.random() - 0.5) * 0.15,
          1.15 + Math.random() * 0.25,
          2.1 + (Math.random() - 0.5) * 0.15
        );
        group.add(content);
      }
    }

    // Gantungan jajanan di atas counter (khas warung)
    // Permen lollipop digantung
    for (let i = 0; i < 5; i++) {
      // Batang lollipop
      const stickGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6);
      const stickMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const stick = new THREE.Mesh(stickGeometry, stickMaterial);
      stick.position.set(-1.5 + i * 0.7, 1.8, 2.8);
      group.add(stick);

      // Permen bulat
      const lollipopGeometry = new THREE.SphereGeometry(0.08, 12, 12);
      const lollipopMaterial = new THREE.MeshStandardMaterial({
        color: candyColors[i % candyColors.length],
      });
      const lollipop = new THREE.Mesh(lollipopGeometry, lollipopMaterial);
      lollipop.position.set(-1.5 + i * 0.7, 1.6, 2.8);
      lollipop.castShadow = true;
      group.add(lollipop);
    }

    // Roti dalam plastik (di samping counter)
    for (let i = 0; i < 3; i++) {
      const breadGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.25);
      const breadMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        roughness: 0.8,
      });
      const bread = new THREE.Mesh(breadGeometry, breadMaterial);
      bread.position.set(-2.3, 0.9 + i * 0.2, 2.3);
      bread.castShadow = true;
      group.add(bread);

      // Plastik wrapper (transparan)
      const wrapperGeometry = new THREE.BoxGeometry(0.32, 0.17, 0.27);
      const wrapperMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2,
      });
      const wrapper = new THREE.Mesh(wrapperGeometry, wrapperMaterial);
      wrapper.position.set(-2.3, 0.9 + i * 0.2, 2.3);
      group.rotation.y = rotate; //rotate warung
      group.add(wrapper);
    }

    // Kursi plastik kecil di depan warung (khas warung Indonesia)
    const chairGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
    const chairMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Kursi plastik merah

    const chair1 = new THREE.Mesh(chairGeometry, chairMaterial);
    chair1.position.set(-1.5, 0.3, 3.5);
    chair1.castShadow = true;
    group.add(chair1);

    const chair2 = new THREE.Mesh(chairGeometry, chairMaterial);
    chair2.position.set(1.5, 0.3, 3.5);
    chair2.castShadow = true;
    group.add(chair2);

    // Kaki kursi
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

    [-1.5, 1.5].forEach((xPos) => {
      [-0.15, 0.15].forEach((xOffset) => {
        [-0.15, 0.15].forEach((zOffset) => {
          const leg = new THREE.Mesh(legGeometry, legMaterial);
          leg.position.set(xPos + xOffset, 0.15, 3.5 + zOffset);
          leg.castShadow = true;
          group.add(leg);
        });
      });
    });

    group.position.set(x, 0, z);
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({ mesh: group, boundingBox: bbox });
  }

  createSchoolSign(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 256;

    // Background - school theme (blue/yellow gradient)
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e3a8a'); // Dark blue
    gradient.addColorStop(1, '#2563eb'); // Blue
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    context.strokeStyle = '#fbbf24'; // Yellow border for school
    context.lineWidth = 12;
    context.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    // Text
    context.font = 'bold 80px Arial';
    context.fillStyle = '#ffffff';
    context.strokeStyle = '#000000';
    context.lineWidth = 4;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const geometry = new THREE.PlaneGeometry(10, 2.5);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }

  createShopSign(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 256;

    // Background - shop theme (colorful)
    let bgColor1, bgColor2;
    if (text.includes('Konoha')) {
      bgColor1 = '#16a34a'; // Green
      bgColor2 = '#22c55e';
    } else if (text.includes('Farhan')) {
      bgColor1 = '#ea580c'; // Orange
      bgColor2 = '#fb923c';
    } else {
      bgColor1 = '#ca8a04'; // Gold
      bgColor2 = '#facc15';
    }

    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, bgColor1);
    gradient.addColorStop(1, bgColor2);
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative border
    context.strokeStyle = '#ffffff';
    context.lineWidth = 10;
    context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    // Inner border
    context.strokeStyle = '#000000';
    context.lineWidth = 4;
    context.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Text
    context.font = 'bold 90px Arial';
    context.fillStyle = '#ffffff';
    context.strokeStyle = '#000000';
    context.lineWidth = 6;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const geometry = new THREE.PlaneGeometry(8, 2);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }

  createTrafficLights() {
    const intersections = [
      { x: -60, z: -60 },
      { x: -60, z: -20 },
      { x: -60, z: 20 },
      { x: -60, z: 60 },
      { x: -20, z: -60 },
      { x: -20, z: -20 },
      { x: -20, z: 20 },
      { x: -20, z: 60 },
      { x: 20, z: -60 },
      { x: 20, z: -20 },
      { x: 20, z: 20 },
      { x: 20, z: 60 },
      { x: 60, z: -60 },
      { x: 60, z: -20 },
      { x: 60, z: 20 },
      { x: 60, z: 60 },
    ];

    intersections.forEach((pos) => {
      // 2 traffic lights per intersection - on opposite corners
      // Light 1: Northeast corner (on sidewalk)
      this.createTrafficLight(pos.x + 5, pos.z + 5, Math.PI * 2); // Facing southwest
      // Light 2: Southwest corner (on sidewalk)
      this.createTrafficLight(pos.x - 5, pos.z - 5, -Math.PI * 1); // Facing northeast
    });
  }

  createTrafficLight(x, z, rotation) {
    const group = new THREE.Group();

    // Pole
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 2;
    pole.castShadow = true;
    group.add(pole);

    // Traffic light box
    const boxGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.3);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(0, 4.6, 0);
    box.castShadow = true;
    group.add(box);

    // Lights (red, yellow, green)
    const lightGeometry = new THREE.CircleGeometry(0.15, 16);

    const redLight = new THREE.Mesh(
      lightGeometry,
      new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5,
      })
    );
    redLight.position.set(0, 5.1, 0.16);
    group.add(redLight);

    const yellowLight = new THREE.Mesh(
      lightGeometry,
      new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: 0x888800,
      })
    );
    yellowLight.position.set(0, 4.6, 0.16);
    group.add(yellowLight);

    const greenLight = new THREE.Mesh(
      lightGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        emissive: 0x008800,
      })
    );
    greenLight.position.set(0, 4.1, 0.16);
    group.add(greenLight);

    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    this.scene.add(group);
  }

  createBasketballCourt(x, z) {
    // Court base - professional orange/red court
    const courtWidth = 15;
    const courtLength = 28;
    const courtGeometry = new THREE.BoxGeometry(courtWidth, 0.15, courtLength);
    const courtMaterial = new THREE.MeshStandardMaterial({
      color: 0xd2691e,
      roughness: 0.8,
    });
    const court = new THREE.Mesh(courtGeometry, courtMaterial);
    court.position.set(x, 0.075, z);
    court.receiveShadow = true;
    this.scene.add(court);

    // Court boundary lines (white)
    const boundaryMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
    });

    // Outer boundary rectangle
    const lineThickness = 0.1;
    const lineHeight = 0.18;

    // Top boundary
    const topBoundary = new THREE.Mesh(
      new THREE.BoxGeometry(courtWidth, lineHeight, lineThickness),
      boundaryMaterial
    );
    topBoundary.position.set(x, 0.09, z - courtLength / 2);
    this.scene.add(topBoundary);

    // Bottom boundary
    const bottomBoundary = new THREE.Mesh(
      new THREE.BoxGeometry(courtWidth, lineHeight, lineThickness),
      boundaryMaterial
    );
    bottomBoundary.position.set(x, 0.09, z + courtLength / 2);
    this.scene.add(bottomBoundary);

    // Left boundary
    const leftBoundary = new THREE.Mesh(
      new THREE.BoxGeometry(lineThickness, lineHeight, courtLength),
      boundaryMaterial
    );
    leftBoundary.position.set(x - courtWidth / 2, 0.09, z);
    this.scene.add(leftBoundary);

    // Right boundary
    const rightBoundary = new THREE.Mesh(
      new THREE.BoxGeometry(lineThickness, lineHeight, courtLength),
      boundaryMaterial
    );
    rightBoundary.position.set(x + courtWidth / 2, 0.09, z);
    this.scene.add(rightBoundary);

    // Center line
    const centerLine = new THREE.Mesh(
      new THREE.BoxGeometry(courtWidth, lineHeight, lineThickness),
      boundaryMaterial
    );
    centerLine.position.set(x, 0.09, z);
    this.scene.add(centerLine);

    // Center circle
    const centerCircleGeometry = new THREE.RingGeometry(1.8, 2, 32);
    const centerCircle = new THREE.Mesh(centerCircleGeometry, boundaryMaterial);
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.set(x, 0.16, z);
    this.scene.add(centerCircle);

    // Center dot
    const centerDot = new THREE.Mesh(
      new THREE.CircleGeometry(0.2, 16),
      boundaryMaterial
    );
    centerDot.rotation.x = -Math.PI / 2;
    centerDot.position.set(x, 0.16, z);
    this.scene.add(centerDot);

    // Three-point lines (D-shape) - NBA style
    // Top three-point arc (half circle)
    const threePointRadius = 6.75; // NBA standard distance
    const threePointThickness = 0.1;
    const threePointGeometry = new THREE.RingGeometry(
      threePointRadius,
      threePointRadius + threePointThickness,
      64, // More segments for smoother curve
      1,
      0,
      Math.PI
    );
    const topThreePoint = new THREE.Mesh(threePointGeometry, boundaryMaterial);
    topThreePoint.rotation.x = -Math.PI / 2;
    topThreePoint.rotation.z = Math.PI; // Rotasi agar arc menghadap ke dalam
    topThreePoint.position.set(x, 0.16, z - courtLength / 2 + 0);
    this.scene.add(topThreePoint);

    // Bottom three-point arc (half circle)
    const bottomThreePoint = new THREE.Mesh(
      threePointGeometry,
      boundaryMaterial
    );
    bottomThreePoint.rotation.x = -Math.PI / 2;
    bottomThreePoint.rotation.z = 0; // Rotasi agar arc menghadap ke dalam
    bottomThreePoint.position.set(x, 0.16, z + courtLength / 2 - 0);
    this.scene.add(bottomThreePoint);

    // Paint area (key/lane) - Top
    const paintWidth = 4;
    const paintLength = 4.7; // Diperpendek dari 5.8 menjadi 4.2

    // Top paint outline
    const paintOutlineGeometry = new THREE.RingGeometry(
      0,
      paintWidth / 2,
      4,
      1,
      0,
      Math.PI * 2
    );

    // Top paint rectangle (left line)
    const topPaintLeft = new THREE.Mesh(
      new THREE.BoxGeometry(lineThickness, lineHeight, paintLength),
      boundaryMaterial
    );
    topPaintLeft.position.set(
      x - paintWidth / 2,
      0.09,
      z - courtLength / 2 + paintLength / 2
    );
    this.scene.add(topPaintLeft);

    // Top paint rectangle (right line)
    const topPaintRight = new THREE.Mesh(
      new THREE.BoxGeometry(lineThickness, lineHeight, paintLength),
      boundaryMaterial
    );
    topPaintRight.position.set(
      x + paintWidth / 2,
      0.09,
      z - courtLength / 2 + paintLength / 2
    );
    this.scene.add(topPaintRight);

    // Top paint rectangle (front line)
    const topPaintFront = new THREE.Mesh(
      new THREE.BoxGeometry(paintWidth, lineHeight, lineThickness),
      boundaryMaterial
    );
    topPaintFront.position.set(x, 0.09, z - courtLength / 2 + paintLength);
    this.scene.add(topPaintFront);

    // Bottom paint rectangle (left line)
    const bottomPaintLeft = new THREE.Mesh(
      new THREE.BoxGeometry(lineThickness, lineHeight, paintLength),
      boundaryMaterial
    );
    bottomPaintLeft.position.set(
      x - paintWidth / 2,
      0.09,
      z + courtLength / 2 - paintLength / 2
    );
    this.scene.add(bottomPaintLeft);

    // Bottom paint rectangle (right line)
    const bottomPaintRight = new THREE.Mesh(
      new THREE.BoxGeometry(lineThickness, lineHeight, paintLength),
      boundaryMaterial
    );
    bottomPaintRight.position.set(
      x + paintWidth / 2,
      0.09,
      z + courtLength / 2 - paintLength / 2
    );
    this.scene.add(bottomPaintRight);

    // Bottom paint rectangle (front line)
    const bottomPaintFront = new THREE.Mesh(
      new THREE.BoxGeometry(paintWidth, lineHeight, lineThickness),
      boundaryMaterial
    );
    bottomPaintFront.position.set(x, 0.09, z + courtLength / 2 - paintLength);
    this.scene.add(bottomPaintFront);

    // Free throw circles
    // Top free throw circle
    const freeThrowCircleGeometry = new THREE.RingGeometry(1.8, 2, 32);
    const topFreeThrowCircle = new THREE.Mesh(
      freeThrowCircleGeometry,
      boundaryMaterial
    );
    topFreeThrowCircle.rotation.x = -Math.PI / 2;
    topFreeThrowCircle.position.set(x, 0.16, z - courtLength / 2 + paintLength);
    this.scene.add(topFreeThrowCircle);

    // Bottom free throw circle
    const bottomFreeThrowCircle = new THREE.Mesh(
      freeThrowCircleGeometry,
      boundaryMaterial
    );
    bottomFreeThrowCircle.rotation.x = -Math.PI / 2;
    bottomFreeThrowCircle.position.set(
      x,
      0.16,
      z + courtLength / 2 - paintLength
    );
    this.scene.add(bottomFreeThrowCircle);

    // Create basketball hoops (both ends)
    this.createBasketballHoop(x, z - courtLength / 2 + 1.575, 0, 'top');
    this.createBasketballHoop(
      x,
      z + courtLength / 2 - 1.575,
      Math.PI,
      'bottom'
    );

    // Add benches on sidelines
    this.createCourtBench(x - courtWidth / 2 - 2, z - 6, Math.PI / 2);
    this.createCourtBench(x - courtWidth / 2 - 2, z - 3, Math.PI / 2);
    this.createCourtBench(x + courtWidth / 2 + 2, z + 6, -Math.PI / 2);
    this.createCourtBench(x + courtWidth / 2 + 2, z + 3, -Math.PI / 2);

    // Add scoreboard
    this.createScoreboard(x - 5, z + courtLength / 2.8);
  }

  createBasketballHoop(x, z, rotation, position) {
    const group = new THREE.Group();

    // Pole
    const poleGeometry = new THREE.CylinderGeometry(0.15, 0.2, 4, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.6,
      roughness: 0.4,
    });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 2;
    pole.castShadow = true;
    group.add(pole);

    // Support arm (from pole to backboard)
    const armGeometry = new THREE.BoxGeometry(0.15, 0.15, 1.2);
    const arm = new THREE.Mesh(armGeometry, poleMaterial);
    arm.position.set(0, 3.3, 0.6);
    arm.castShadow = true;
    group.add(arm);

    // Backboard
    const backboardGeometry = new THREE.BoxGeometry(1.8, 1.05, 0.1);
    const backboardMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      metalness: 0.3,
      roughness: 0.2,
    });
    const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
    backboard.position.set(0, 3.5, 1.2);
    backboard.castShadow = true;
    group.add(backboard);

    // Backboard red rectangle
    const rectangleGeometry = new THREE.BoxGeometry(0.59, 0.45, 0.05);
    const rectangleMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
    });
    const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);
    rectangle.position.set(0, 3.5, 1.25);
    group.add(rectangle);

    // Rim
    const rimGeometry = new THREE.TorusGeometry(0.225, 0.02, 8, 32);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      metalness: 0.8,
      roughness: 0.2,
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 3.05, 1.35);
    rim.castShadow = true;
    group.add(rim);

    // Net (simplified as chain/mesh)
    const netGroup = new THREE.Group();
    const netMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
    });

    // Create net segments (cone-like)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const netSegmentGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.4, 3);
      const netSegment = new THREE.Mesh(netSegmentGeometry, netMaterial);

      const radius = 0.225;
      netSegment.position.set(
        Math.cos(angle) * radius,
        2.85,
        1.35 + Math.sin(angle) * radius
      );
      netSegment.rotation.x = Math.PI / 6;
      netGroup.add(netSegment);
    }
    group.add(netGroup);

    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    this.scene.add(group);
  }

  createCourtBench(x, z, rotation) {
    const group = new THREE.Group();

    // Bench seat
    const seatGeometry = new THREE.BoxGeometry(2.5, 0.2, 0.6);
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x4169e1 }); // Blue
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = 0.5;
    seat.castShadow = true;
    group.add(seat);

    // Bench backrest
    const backGeometry = new THREE.BoxGeometry(2.5, 0.8, 0.1);
    const back = new THREE.Mesh(backGeometry, seatMaterial);
    back.position.set(0, 0.9, -0.25);
    back.castShadow = true;
    group.add(back);

    // Legs (metal)
    const legGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.6,
    });

    [-1, 1].forEach((xOffset) => {
      [-0.2, 0.2].forEach((zOffset) => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(xOffset, 0.25, zOffset);
        leg.castShadow = true;
        group.add(leg);
      });
    });

    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    this.scene.add(group);
  }

  createScoreboard(x, z) {
    const group = new THREE.Group();

    // Main board (horizontal/landscape orientation - lebar > tinggi)
    const boardGeometry = new THREE.BoxGeometry(6, 2.5, 0.3);
    const boardMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
    });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.y = 3;
    board.castShadow = true;
    group.add(board);

    // LED display area (center) - horizontal, menghadap ke lapangan
    const displayGeometry = new THREE.BoxGeometry(5.5, 2, 0.1);
    const displayMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0x00ff00,
      emissiveIntensity: 0.3,
    });
    const display = new THREE.Mesh(displayGeometry, displayMaterial);
    display.position.set(0, 3, -0.2); // Negatif agar menghadap ke lapangan
    group.add(display);

    // Support poles
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.5,
    });

    [-2.5, 2.5].forEach((xOffset) => {
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.set(xOffset, 1.5, 0);
      pole.castShadow = true;
      group.add(pole);
    });

    group.position.set(x - 5, 0, z);
    // Putar 180 derajat agar menghadap ke lapangan
    group.rotation.y = 300;
    this.scene.add(group);
  }

  createPlayground(x, z) {
    // Lantai pasir cream untuk area playground
    const sandGeometry = new THREE.BoxGeometry(20, 0.1, 17);
    const sandMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5deb3, // Wheat/cream color (pasir)
      roughness: 0.9,
    });
    const sand = new THREE.Mesh(sandGeometry, sandMaterial);
    sand.position.set(x, 0.05, z - 8);
    sand.receiveShadow = true;
    this.scene.add(sand);

    // Perosotan (Slide)
    this.createSlide(x - 5, z - 8);

    // Ayunan (Swing Set) - 2 ayunan
    this.createSwingSet(x + 5, z - 8);
  }

  createSlide(x, z) {
    const group = new THREE.Group();

    // Platform tangga perosotan
    const platformGeometry = new THREE.BoxGeometry(2, 0.3, 2);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600,
    }); // Orange
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 2;
    platform.castShadow = true;
    group.add(platform);

    // Tangga (stairs)
    const stairMaterial = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
    for (let i = 0; i < 4; i++) {
      const stairGeometry = new THREE.BoxGeometry(1.5, 0.2, 0.5);
      const stair = new THREE.Mesh(stairGeometry, stairMaterial);
      stair.position.set(0, 0.5 + i * 0.5, 1.5 - i * 0.4);
      stair.castShadow = true;
      group.add(stair);
    }

    // Slide surface (bidang luncuran)
    const slideGeometry = new THREE.BoxGeometry(1.5, 0.1, 3.5);
    const slideMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      metalness: 0.3,
      roughness: 0.2,
    }); // Yellow shiny
    const slide = new THREE.Mesh(slideGeometry, slideMaterial);
    slide.position.set(0, 1.2, -2.5);
    slide.rotation.x = -Math.PI / 6; // Miring 30 derajat
    slide.castShadow = true;
    group.add(slide);

    // Side rails for slide
    const railGeometry = new THREE.BoxGeometry(0.1, 0.3, 3.5);
    const railMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red

    const leftRail = new THREE.Mesh(railGeometry, railMaterial);
    leftRail.position.set(-0.8, 1.3, -2.5);
    leftRail.rotation.x = -Math.PI / 6;
    leftRail.castShadow = true;
    group.add(leftRail);

    const rightRail = new THREE.Mesh(railGeometry, railMaterial);
    rightRail.position.set(0.8, 1.3, -2.5);
    rightRail.rotation.x = -Math.PI / 6;
    rightRail.castShadow = true;
    group.add(rightRail);

    // Support poles
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.5,
    });

    [-0.8, 0.8].forEach((xOffset) => {
      [-0.8, 0.8].forEach((zOffset) => {
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.set(xOffset, 1, zOffset);
        pole.castShadow = true;
        group.add(pole);
      });
    });

    group.position.set(x, 0, z);
    this.scene.add(group);
  }

  createSwingSet(x, z) {
    const group = new THREE.Group();

    // Main horizontal bar (top bar)
    const topBarGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 8);
    const barMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.6,
    });
    const topBar = new THREE.Mesh(topBarGeometry, barMaterial);
    topBar.rotation.z = Math.PI / 2;
    topBar.position.y = 3;
    topBar.castShadow = true;
    group.add(topBar);

    // Support poles (A-frame)
    const poleGeometry = new THREE.CylinderGeometry(0.12, 0.12, 3.5, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.5,
    });

    // Left A-frame
    const leftPole1 = new THREE.Mesh(poleGeometry, poleMaterial);
    leftPole1.position.set(-2.5, 1.75, 0);
    leftPole1.rotation.z = 0.3;
    leftPole1.castShadow = true;
    group.add(leftPole1);

    const leftPole2 = new THREE.Mesh(poleGeometry, poleMaterial);
    leftPole2.position.set(-2.5, 1.75, 0);
    leftPole2.rotation.z = -0.3;
    leftPole2.castShadow = true;
    group.add(leftPole2);

    // Right A-frame
    const rightPole1 = new THREE.Mesh(poleGeometry, poleMaterial);
    rightPole1.position.set(2.5, 1.75, 0);
    rightPole1.rotation.z = 0.3;
    rightPole1.castShadow = true;
    group.add(rightPole1);

    const rightPole2 = new THREE.Mesh(poleGeometry, poleMaterial);
    rightPole2.position.set(2.5, 1.75, 0);
    rightPole2.rotation.z = -0.3;
    rightPole2.castShadow = true;
    group.add(rightPole2);

    // Create 2 swings
    this.createSwing(group, -1.5, 3);
    this.createSwing(group, 1.5, 3);

    group.position.set(x, 0, z);
    this.scene.add(group);
  }

  createSwing(parentGroup, xOffset, topY) {
    // Chains (ropes)
    const chainGeometry = new THREE.CylinderGeometry(0.03, 0.03, 2.5, 4);
    const chainMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

    const leftChain = new THREE.Mesh(chainGeometry, chainMaterial);
    leftChain.position.set(xOffset - 0.3, topY - 1.25, 0);
    leftChain.castShadow = true;
    parentGroup.add(leftChain);

    const rightChain = new THREE.Mesh(chainGeometry, chainMaterial);
    rightChain.position.set(xOffset + 0.3, topY - 1.25, 0);
    rightChain.castShadow = true;
    parentGroup.add(rightChain);

    // Seat
    const seatGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.4);
    const seatMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      roughness: 0.5,
    }); // Red seat
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.set(xOffset, topY - 2.5, 0);
    seat.castShadow = true;
    parentGroup.add(seat);
  }

  createMasjid(
    x,
    z,
    {
      scale = 1.6,
      rotate = 0,
      name = '',
      numWorshipers = 4,
      characterFactory = null,
    } = {}
  ) {
    const group = new THREE.Group();

    // ---------- Helper NPC ----------
    function makeMinecraftCharacterWithJoints(color, cScale = 1) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.8 * cScale, 1.2 * cScale, 0.4 * cScale),
        new THREE.MeshStandardMaterial({ color })
      );
      body.position.y = 0.6 * cScale;
      g.add(body);
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.6 * cScale, 0.6 * cScale, 0.6 * cScale),
        new THREE.MeshStandardMaterial({ color: 0xfdbcb4 })
      );
      head.position.y = 1.5 * cScale;
      g.add(head);
      const armGeo = new THREE.BoxGeometry(
        0.3 * cScale,
        0.9 * cScale,
        0.3 * cScale
      );
      const armMat = new THREE.MeshStandardMaterial({ color });
      const leftArm = new THREE.Mesh(armGeo, armMat);
      leftArm.position.set(-0.6 * cScale, 0.6 * cScale, 0);
      const rightArm = new THREE.Mesh(armGeo, armMat);
      rightArm.position.set(0.6 * cScale, 0.6 * cScale, 0);
      g.add(leftArm, rightArm);
      const legGeo = new THREE.BoxGeometry(
        0.3 * cScale,
        0.9 * cScale,
        0.3 * cScale
      );
      const legMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.25 * cScale, -0.45 * cScale, 0);
      const rightLeg = new THREE.Mesh(legGeo, legMat);
      rightLeg.position.set(0.25 * cScale, -0.45 * cScale, 0);
      g.add(leftLeg, rightLeg);
      g.userData = {
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        body,
        head,
        scale: cScale,
      };
      return g;
    }
    function poseWudhuHands(char) {
      const u = char.userData;
      if (!u) return;
      if (u.leftArm) u.leftArm.rotation.x = THREE.MathUtils.degToRad(-35);
      if (u.rightArm) u.rightArm.rotation.x = THREE.MathUtils.degToRad(-25);
      if (u.body) u.body.rotation.x = THREE.MathUtils.degToRad(8);
    }

    // ---------- Tapak & halaman (compact) ----------
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(28, 0.08, 22),
      new THREE.MeshStandardMaterial({ color: 0xcfcfcf, roughness: 0.95 })
    );
    pad.position.set(0, 0.04, 0);
    pad.receiveShadow = true;
    group.add(pad);

    const lawn = new THREE.Mesh(
      new THREE.BoxGeometry(30, 0.02, 24),
      new THREE.MeshStandardMaterial({ color: 0x3b7d3a, roughness: 1.0 })
    );
    lawn.position.set(0, 0.01, 0);
    lawn.receiveShadow = true;
    group.add(lawn);

    // Tangga serambi
    const stairsMat = new THREE.MeshStandardMaterial({
      color: 0xddd6fe,
      roughness: 0.9,
    });
    for (let i = 0; i < 3; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(9, 0.12, 0.9),
        stairsMat
      );
      step.position.set(0, 0.06 + i * 0.12, 5.3 + i * 0.9);
      group.add(step);
    }

    // ---------- Hall masjid ----------
    const hallW = 12,
      hallD = 10,
      hallH = 6.2;
    const hall = new THREE.Mesh(
      new THREE.BoxGeometry(hallW, hallH, hallD),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 })
    );
    hall.position.set(0, hallH / 2, 0);
    hall.castShadow = true;
    hall.receiveShadow = true;
    group.add(hall);

    // Kubah + bulan sabit
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(3.8, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({
        color: 0x16a34a,
        metalness: 0.2,
        roughness: 0.5,
      })
    );
    dome.position.set(0, hallH, 0);
    dome.castShadow = true;
    group.add(dome);
    const cresBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.65, 12),
      new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.6,
        roughness: 0.3,
      })
    );
    cresBase.position.set(0, hallH + 3.9, 0);
    const cres = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.07, 10, 24, Math.PI * 1.2),
      new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.6,
        roughness: 0.35,
      })
    );
    cres.position.set(0, hallH + 4.5, 0);
    cres.rotation.z = Math.PI / 2;
    group.add(cresBase, cres);

    // Menara
    function makeMinaret(px, pz) {
      const g = new THREE.Group();
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(1.0, 1.2, 9.5, 16),
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 })
      );
      shaft.position.y = 4.75;
      g.add(shaft);
      const balcony = new THREE.Mesh(
        new THREE.TorusGeometry(1.1, 0.12, 10, 24),
        new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.7 })
      );
      balcony.position.y = 7.2;
      g.add(balcony);
      const top = new THREE.Mesh(
        new THREE.ConeGeometry(0.9, 1.8, 16),
        new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 })
      );
      top.position.y = 9.2;
      g.add(top);
      g.position.set(px, 0, pz);
      g.castShadow = true;
      return g;
    }
    group.add(makeMinaret(-7.5, -5.5), makeMinaret(7.5, -5.5));

    // // Arcade depan (visual)
    // const archMat = new THREE.MeshStandardMaterial({
    //   color: 0xe2e8f0,
    //   roughness: 0.9,
    // });
    // for (let i = -1; i <= 1; i++) {
    //   const pilar = new THREE.Mesh(
    //     new THREE.BoxGeometry(1.0, 3.2, 1.0),
    //     archMat
    //   );
    //   pilar.position.set(i * 3, 1.6, hallD / 2 + 0.5);
    //   group.add(pilar);
    //   const arch = new THREE.Mesh(
    //     new THREE.TorusGeometry(1.6, 0.16, 12, 32, Math.PI),
    //     archMat
    //   );
    //   arch.position.set(i * 3, 3.2, hallD / 2 + 0.5);
    //   arch.rotation.x = Math.PI / 2;
    //   arch.rotation.z = Math.PI;
    //   group.add(arch);
    // }

    // ---------- Pintu masuk (visual) ----------
    const doorW = 2.2,
      doorH = 3.0,
      doorT = 0.08;
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, doorH, doorT),
      new THREE.MeshStandardMaterial({
        color: 0x374151,
        roughness: 0.8,
        metalness: 0.05,
      })
    );
    door.position.set(0, 1.2 + doorH / 2 - 1.2, hallD / 2 + doorT / 2 + 0.02);
    group.add(door);

    // ---------- Nama masjid = TEKS biasa di atas pintu ----------
    const nameCanvas = document.createElement('canvas');
    nameCanvas.width = 1024;
    nameCanvas.height = 256;
    const nctx = nameCanvas.getContext('2d');
    nctx.clearRect(0, 0, 1024, 256); // tanpa background/border
    let fs = 120,
      maxW = 920;
    while (fs > 56) {
      nctx.font = `bold ${fs}px Arial`;
      if (nctx.measureText(name).width <= maxW) break;
      fs -= 6;
    }
    nctx.fillStyle = '#111827';
    nctx.textAlign = 'center';
    nctx.textBaseline = 'middle';
    nctx.fillText(name, 512, 128);
    const nameTex = new THREE.CanvasTexture(nameCanvas);
    nameTex.minFilter = THREE.LinearFilter;
    nameTex.magFilter = THREE.LinearFilter;
    const nameSign = new THREE.Mesh(
      new THREE.PlaneGeometry(doorW + 1.2, 0.8),
      new THREE.MeshBasicMaterial({
        map: nameTex,
        transparent: true,
        side: THREE.DoubleSide,
      })
    );
    nameSign.position.set(
      0,
      door.position.y + doorH / 2 + 0.5,
      hallD / 2 + 0.06
    );
    group.add(nameSign);

    // ---------- Interior (visual saja) ----------
    const carpet = new THREE.Mesh(
      new THREE.BoxGeometry(hallW - 1, 0.05, hallD - 2),
      new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.95 })
    );
    carpet.position.set(0, 0.03, -0.4);
    carpet.receiveShadow = true;
    group.add(carpet);

    const lineMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.8,
    });
    for (let i = 0; i < 4; i++) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(hallW - 1.4, 0.02, 0.06),
        lineMat
      );
      stripe.position.set(0, 0.04, -3.5 + i * 2.0);
      group.add(stripe);
    }
    const mihrab = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.4, 0.5, 24, 1, true, Math.PI, Math.PI),
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.9,
        side: THREE.DoubleSide,
      })
    );
    mihrab.position.set(0, 1.2, -hallD / 2 + 0.4);
    mihrab.rotation.x = Math.PI / 2;
    group.add(mihrab);

    const lamp = new THREE.PointLight(0xffe8b5, 1.05, 24, 2.0);
    lamp.position.set(0, 5.4, 0);
    group.add(lamp);

    // ---------- RUANG WUDHU (enterable) ----------
    const wRoom = new THREE.Group();
    const rw = 9,
      rd = 5.5,
      rh = 3;

    const wFloor = new THREE.Mesh(
      new THREE.BoxGeometry(rw, 0.05, rd),
      new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 1.0 })
    );
    wFloor.position.set(hallW / 2 + rw / 2 + 1.2, 0.025, 1.4);
    wFloor.receiveShadow = true;
    wRoom.add(wFloor);

    const roomX = wFloor.position.x,
      roomZ = wFloor.position.z;
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      roughness: 0.9,
    });
    const t = 0.2;

    const wLeft = new THREE.Mesh(new THREE.BoxGeometry(t, rh, rd), wallMat);
    wLeft.position.set(roomX - rw / 2, rh / 2, roomZ);
    wRoom.add(wLeft);
    const wRight = new THREE.Mesh(new THREE.BoxGeometry(t, rh, rd), wallMat);
    wRight.position.set(roomX + rw / 2, rh / 2, roomZ);
    wRoom.add(wRight);
    const wBack = new THREE.Mesh(new THREE.BoxGeometry(rw, rh, t), wallMat);
    wBack.position.set(roomX, rh / 2, roomZ - rd / 2);
    wRoom.add(wBack);

    // Depan dengan pintu lebar (ruang wudhu bisa dimasuki)
    const doorWudhuW = 2.8,
      segLen = (rw - doorWudhuW) / 2;
    const wFrontL = new THREE.Mesh(
      new THREE.BoxGeometry(segLen, rh, t),
      wallMat
    );
    wFrontL.position.set(
      roomX - (doorWudhuW / 2 + segLen / 2),
      rh / 2,
      roomZ + rd / 2
    );
    const wFrontR = new THREE.Mesh(
      new THREE.BoxGeometry(segLen, rh, t),
      wallMat
    );
    wFrontR.position.set(
      roomX + (doorWudhuW / 2 + segLen / 2),
      rh / 2,
      roomZ + rd / 2
    );
    wRoom.add(wFrontL, wFrontR);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(rw + 0.2, 0.12, rd + 0.2),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.85 })
    );
    roof.position.set(roomX, rh + 0.06, roomZ);
    wRoom.add(roof);

    // Palung & air
    const trough = new THREE.Mesh(
      new THREE.BoxGeometry(rw - 1.2, 0.35, 0.7),
      new THREE.MeshStandardMaterial({
        color: 0x64748b,
        roughness: 0.7,
        metalness: 0.1,
      })
    );
    trough.position.set(roomX, 0.35, roomZ - rd / 2 + 0.9);
    wRoom.add(trough);
    const water = new THREE.Mesh(
      new THREE.BoxGeometry(rw - 1.5, 0.06, 0.45),
      new THREE.MeshStandardMaterial({
        color: 0x66c3ff,
        transparent: true,
        opacity: 0.6,
      })
    );
    water.position.set(roomX, 0.4, roomZ - rd / 2 + 0.9);
    wRoom.add(water);

    // Keran & aliran
    const tapMat = new THREE.MeshStandardMaterial({
      color: 0xbdbdbd,
      metalness: 0.6,
      roughness: 0.4,
    });
    for (let i = 0; i < 5; i++) {
      const tx = roomX - (rw / 2 - 1) + i * ((rw - 2) / 4);
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.35, 10),
        tapMat
      );
      pipe.position.set(tx, 1.0, roomZ - rd / 2 + 0.2);
      pipe.rotation.x = Math.PI / 2;
      const spout = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.35, 10),
        tapMat
      );
      spout.position.set(tx, 0.86, roomZ - rd / 2 + 0.4);
      const flow = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.22, 8),
        new THREE.MeshStandardMaterial({
          color: 0x66c3ff,
          transparent: true,
          opacity: 0.7,
        })
      );
      flow.position.set(tx, 0.78, roomZ - rd / 2 + 0.55);
      flow.rotation.x = -Math.PI / 2;
      wRoom.add(pipe, spout, flow);
    }

    // Pijakan
    for (let i = 0; i < 5; i++) {
      const bx = roomX - (rw / 2 - 1) + i * ((rw - 2) / 4);
      const bench = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.2, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.95 })
      );
      bench.position.set(bx, 0.1, roomZ - rd / 2 + 1.2);
      wRoom.add(bench);
    }

    group.add(wRoom);

    // ---------- NPC wudhu ----------
    const wSpots = [
      { x: roomX - (rw / 2 - 1), z: roomZ - rd / 2 + 1.0 },
      { x: roomX - (rw / 2 - 1) + (rw - 2) / 4, z: roomZ - rd / 2 + 1.0 },
      { x: roomX - (rw / 2 - 1) + (2 * (rw - 2)) / 4, z: roomZ - rd / 2 + 1.0 },
      { x: roomX - (rw / 2 - 1) + (4 * (rw - 2)) / 4, z: roomZ - rd / 2 + 1.0 },
    ];
    for (let i = 0; i < Math.min(numWorshipers, wSpots.length); i++) {
      const s = wSpots[i];
      const c = characterFactory
        ? characterFactory(i % 2 ? 0x2563eb : 0x22c55e, 1.0)
        : makeMinecraftCharacterWithJoints(i % 2 ? 0x2563eb : 0x22c55e, 1.0);
      c.position.set(s.x, 0, s.z);
      c.rotation.y = THREE.MathUtils.degToRad(-90);
      poseWudhuHands(c);
      group.add(c);
    }

    // ---------- Pencahayaan ----------
    const yardLight = new THREE.PointLight(0xfff1d0, 0.8, 32, 2.0);
    yardLight.position.set(0, 7, 6.5);
    group.add(yardLight);

    // ---------- Transform ----------
    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);

    // ---------- Registrasi COLLIDER ----------
    this.scene.add(group);

    // ✅ Hall masjid = collider utuh (blok total)
    hall.updateMatrixWorld(true);
    const hallBox = new THREE.Box3().setFromObject(hall);
    this.buildings.push({
      mesh: hall,
      boundingBox: hallBox,
      name: 'Masjid (Hall Collider)',
    });

    // ❌ Ruang wudhu tanpa collider → bisa dimasuki.

    return group;
  }

  createPosRonda(x, z) {
    const group = new THREE.Group();

    // Base/lantai pos ronda
    const baseGeometry = new THREE.BoxGeometry(4, 0.3, 4);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.15;
    base.receiveShadow = true;
    group.add(base);

    // Tiang-tiang penyangga (4 tiang di pojok)
    const pillarGeometry = new THREE.CylinderGeometry(0.15, 0.15, 3, 8);
    const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });

    const pillarPositions = [
      { x: -1.8, z: -1.8 },
      { x: 1.8, z: -1.8 },
      { x: -1.8, z: 1.8 },
      { x: 1.8, z: 1.8 },
    ];

    pillarPositions.forEach((pos) => {
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      pillar.position.set(pos.x, 1.8, pos.z);
      pillar.castShadow = true;
      group.add(pillar);
    });

    // Atap pos ronda (pyramid style)
    const roofGeometry = new THREE.ConeGeometry(3, 1.5, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Merah
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 4;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // Pagar pembatas rendah (railing)
    const railingGeometry = new THREE.BoxGeometry(4, 0.8, 0.1);
    const railingMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

    // Front and back railing
    const frontRailing = new THREE.Mesh(railingGeometry, railingMaterial);
    frontRailing.position.set(0, 1, 2);
    group.add(frontRailing);

    const backRailing = new THREE.Mesh(railingGeometry, railingMaterial);
    backRailing.position.set(0, 1, -2);
    group.add(backRailing);

    // Side railings
    const sideRailingGeometry = new THREE.BoxGeometry(0.1, 0.8, 4);
    const leftRailing = new THREE.Mesh(sideRailingGeometry, railingMaterial);
    leftRailing.position.set(-2, 1, 0);
    group.add(leftRailing);

    const rightRailing = new THREE.Mesh(sideRailingGeometry, railingMaterial);
    rightRailing.position.set(2, 1, 0);
    group.add(rightRailing);

    // Bangku panjang di dalam pos
    const benchGeometry = new THREE.BoxGeometry(3, 0.3, 0.8);
    const benchMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const bench = new THREE.Mesh(benchGeometry, benchMaterial);
    bench.position.set(0, 0.6, -1);
    bench.castShadow = true;
    group.add(bench);

    // Papan pengumuman
    const boardGeometry = new THREE.BoxGeometry(2, 1.5, 0.1);
    const boardMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.set(-1.5, 2, 0);
    board.castShadow = true;
    group.add(board);

    // Text "POS RONDA" di papan
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 256;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = '#000000';
    context.lineWidth = 5;
    context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    context.fillStyle = '#ff0000';
    context.font = 'bold 60px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('POS RONDA', 256, 100);

    context.fillStyle = '#000000';
    context.font = 'bold 30px Arial';
    context.fillText('RT 05 / RW 03', 256, 180);

    const texture = new THREE.CanvasTexture(canvas);
    const textGeometry = new THREE.PlaneGeometry(1.9, 1.4);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-1.5, 2, 0.06);
    group.add(textMesh);

    // Lampu gantung kecil
    const lampGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.4, 8);
    const lampMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.5,
    });
    const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
    lamp.position.set(0, 3.2, 0);
    group.add(lamp);

    group.position.set(x, 0, z);
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({ mesh: group, boundingBox: bbox, name: 'Pos Ronda' });
  }

  createSPBU(x, z, name, { rotate = 0 }) {
    const group = new THREE.Group();

    // Kanopi besar (canopy) - khas SPBU
    const canopyGeometry = new THREE.BoxGeometry(16, 0.4, 12);
    const canopyMaterial = new THREE.MeshStandardMaterial({
      color: 0x00a86b, // Hijau Pertamina
      metalness: 0.5,
      roughness: 0.3,
    });
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
    canopy.position.y = 5;
    canopy.castShadow = true;
    group.add(canopy);

    // Tiang penyangga kanopi (4 tiang)
    const supportGeometry = new THREE.CylinderGeometry(0.3, 0.3, 5, 8);
    const supportMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.7,
    });

    [
      { x: -7, z: -5 },
      { x: 7, z: -5 },
      { x: -7, z: 5 },
      { x: 7, z: 5 },
    ].forEach((pos) => {
      const support = new THREE.Mesh(supportGeometry, supportMaterial);
      support.position.set(pos.x, 2.5, pos.z);
      support.castShadow = true;
      group.add(support);
    });

    // Logo Pertamina di kanopi
    const logoCanvas = document.createElement('canvas');
    const logoContext = logoCanvas.getContext('2d');
    logoCanvas.width = 512;
    logoCanvas.height = 256;

    logoContext.fillStyle = '#00a86b';
    logoContext.fillRect(0, 0, logoCanvas.width, logoCanvas.height);

    logoContext.fillStyle = '#ffffff';
    logoContext.font = 'bold 80px Arial';
    logoContext.textAlign = 'center';
    logoContext.textBaseline = 'middle';
    logoContext.fillText('SPBU', 256, 128);

    const logoTexture = new THREE.CanvasTexture(logoCanvas);
    const logoGeometry = new THREE.PlaneGeometry(6, 3);
    const logoMaterial = new THREE.MeshBasicMaterial({
      map: logoTexture,
      side: THREE.DoubleSide,
    });
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.set(0, 5.3, -6.3);
    logo.rotation.y = 575;
    group.add(logo);

    // Pompa bensin (fuel dispenser) - 2 pompa
    for (let i = -1; i <= 1; i += 2) {
      // Body pompa
      const pumpBodyGeometry = new THREE.BoxGeometry(1, 2, 0.6);
      const pumpBodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000, // Merah
      });
      const pumpBody = new THREE.Mesh(pumpBodyGeometry, pumpBodyMaterial);
      pumpBody.position.set(i * 3, 1, 0);
      pumpBody.castShadow = true;
      group.add(pumpBody);

      // Display screen
      const screenGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.1);
      const screenMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 0.3,
      });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.set(i * 3, 1.5, 0.35);
      group.add(screen);

      // Nozzle holder
      const holderGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
      const holderMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
      });
      const holder = new THREE.Mesh(holderGeometry, holderMaterial);
      holder.position.set(i * 3.6, 1.2, 0);
      group.add(holder);

      // Nozzle (gun/pistol)
      const nozzleGeometry = new THREE.BoxGeometry(0.15, 0.4, 0.2);
      const nozzleMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00,
      });
      const nozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
      nozzle.position.set(i * 3.6, 1.2, 0.2);
      group.add(nozzle);

      // Hose (selang)
      const hoseGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
      const hoseMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
      const hose = new THREE.Mesh(hoseGeometry, hoseMaterial);
      hose.position.set(i * 3.6, 1.6, 0);
      hose.rotation.z = (i * Math.PI) / 6;
      group.add(hose);
    }

    // Kantor/booth operator kecil
    const boothGeometry = new THREE.BoxGeometry(4, 3, 4);
    const boothMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
    const booth = new THREE.Mesh(boothGeometry, boothMaterial);
    booth.position.set(-10, 1.5, 0);
    booth.castShadow = true;
    group.add(booth);

    // Atap booth
    const boothRoofGeometry = new THREE.BoxGeometry(4.5, 0.3, 4.5);
    const boothRoof = new THREE.Mesh(boothRoofGeometry, canopyMaterial);
    boothRoof.position.set(-10, 3.15, 0);
    boothRoof.castShadow = true;
    group.add(boothRoof);

    // Jendela booth
    const windowGeometry = new THREE.BoxGeometry(2, 1.5, 0.1);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.5,
    });
    const window = new THREE.Mesh(windowGeometry, windowMaterial);
    window.position.set(-10, 2, 2.05);
    group.add(window);

    // Pintu booth
    const doorGeometry = new THREE.BoxGeometry(1, 2, 0.1);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(-8.5, 1, 0);
    group.add(door);

    group.position.set(x, 0, z);
    group.rotation.y = rotate;
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({ mesh: group, boundingBox: bbox, name: name });
  }

  createRentalPlayStation(x, z, name) {
    const group = new THREE.Group();

    // Main building - warna gelap gaming
    const buildingGeometry = new THREE.BoxGeometry(10, 4, 8);
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e, // Dark blue
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 2;
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);

    // Roof
    const roofGeometry = new THREE.BoxGeometry(10.5, 0.4, 8.5);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x0f0f1e });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 4.2;
    roof.castShadow = true;
    group.add(roof);

    // Papan nama besar dengan LED style
    const signGeometry = new THREE.BoxGeometry(8, 1.5, 0.3);
    const signMaterial = new THREE.MeshStandardMaterial({
      color: 0x0000ff,
      emissive: 0x0000ff,
      emissiveIntensity: 0.5,
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 3.5, 4.15);
    group.add(sign);

    // Text pada papan nama
    const signCanvas = document.createElement('canvas');
    const signContext = signCanvas.getContext('2d');
    signCanvas.width = 1024;
    signCanvas.height = 256;

    const gradient = signContext.createLinearGradient(
      0,
      0,
      signCanvas.width,
      0
    );
    gradient.addColorStop(0, '#0000ff');
    gradient.addColorStop(0.5, '#4169e1');
    gradient.addColorStop(1, '#0000ff');
    signContext.fillStyle = gradient;
    signContext.fillRect(0, 0, signCanvas.width, signCanvas.height);

    signContext.fillStyle = '#ffffff';
    signContext.font = 'bold 70px Arial';
    signContext.textAlign = 'center';
    signContext.textBaseline = 'middle';
    signContext.fillText(name, 512, 80);

    signContext.font = 'bold 50px Arial';
    signContext.fillStyle = '#ffff00';
    signContext.fillText('Rp 3.000/jam', 512, 180);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signTextGeometry = new THREE.PlaneGeometry(7.5, 1.4);
    const signTextMaterial = new THREE.MeshBasicMaterial({
      map: signTexture,
      side: THREE.DoubleSide,
    });
    const signText = new THREE.Mesh(signTextGeometry, signTextMaterial);
    signText.position.set(0, 3.5, 4.3);
    group.add(signText);

    // Pintu kaca
    const doorGeometry = new THREE.BoxGeometry(2, 3, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x4169e1,
      transparent: true,
      opacity: 0.4,
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.5, 4.1);
    group.add(door);

    // Jendela dengan nuansa gaming
    const windowGeometry = new THREE.BoxGeometry(2, 1.5, 0.1);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5,
      emissive: 0x00ffff,
      emissiveIntensity: 0.2,
    });

    [-3, 3].forEach((xPos) => {
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(xPos, 2.5, 4.1);
      group.add(window);
    });

    // PlayStation consoles di dalam (visible through window)
    for (let i = 0; i < 4; i++) {
      // Console body
      const consoleGeometry = new THREE.BoxGeometry(0.6, 0.15, 0.8);
      const consoleMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
      });
      const console = new THREE.Mesh(consoleGeometry, consoleMaterial);
      console.position.set(-3 + i * 2, 1, 2);
      console.castShadow = true;
      group.add(console);

      // LED light pada console
      const ledGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.1);
      const ledMaterial = new THREE.MeshStandardMaterial({
        color: 0x0000ff,
        emissive: 0x0000ff,
        emissiveIntensity: 0.8,
      });
      const led = new THREE.Mesh(ledGeometry, ledMaterial);
      led.position.set(-3 + i * 2, 1.1, 2.4);
      group.add(led);

      // TV/Monitor di atas console
      const tvGeometry = new THREE.BoxGeometry(1.2, 0.9, 0.1);
      const tvMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
      });
      const tv = new THREE.Mesh(tvGeometry, tvMaterial);
      tv.position.set(-3 + i * 2, 1.8, 1.5);
      tv.castShadow = true;
      group.add(tv);

      // TV screen (nyala)
      const screenGeometry = new THREE.BoxGeometry(1.1, 0.8, 0.05);
      const screenMaterial = new THREE.MeshStandardMaterial({
        color: 0x4169e1,
        emissive: 0x4169e1,
        emissiveIntensity: 0.4,
      });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.set(-3 + i * 2, 1.8, 1.56);
      group.add(screen);

      // Controller/Stik
      const controllerGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.2);
      const controllerMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
      });
      const controller = new THREE.Mesh(controllerGeometry, controllerMaterial);
      controller.position.set(-3 + i * 2, 1.05, 2.5);
      controller.rotation.y = Math.random() * 0.5 - 0.25;
      group.add(controller);
    }

    // Kursi gaming (4 kursi)
    for (let i = 0; i < 4; i++) {
      const chairGeometry = new THREE.BoxGeometry(0.6, 0.15, 0.6);
      const chairMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const chair = new THREE.Mesh(chairGeometry, chairMaterial);
      chair.position.set(-3 + i * 2, 0.5, 3);
      chair.castShadow = true;
      group.add(chair);

      // Sandaran kursi
      const backrestGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.1);
      const backrest = new THREE.Mesh(backrestGeometry, chairMaterial);
      backrest.position.set(-3 + i * 2, 0.9, 2.75);
      backrest.castShadow = true;
      group.add(backrest);

      // Kaki kursi
      const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
      const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(-3 + i * 2, 0.25, 3);
      group.add(leg);
    }

    // AC unit di luar
    const acGeometry = new THREE.BoxGeometry(1, 0.6, 0.4);
    const acMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
    const ac = new THREE.Mesh(acGeometry, acMaterial);
    ac.position.set(4.5, 3, 2);
    ac.castShadow = true;
    group.add(ac);

    group.position.set(x, 0, z);
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({ mesh: group, boundingBox: bbox, name: name });
  }

  createWarnet(x, z, name) {
    const group = new THREE.Group();

    // Main building
    const buildingGeometry = new THREE.BoxGeometry(12, 4.5, 9);
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c3e50, // Dark gray-blue
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 2.25;
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);

    // Roof
    const roofGeometry = new THREE.BoxGeometry(12.5, 0.4, 9.5);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x1a252f });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 4.7;
    roof.castShadow = true;
    group.add(roof);

    // Papan nama LED style
    const signGeometry = new THREE.BoxGeometry(10, 1.8, 0.3);
    const signMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xff6600,
      emissiveIntensity: 0.5,
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 4, 4.65);
    group.add(sign);

    // Text papan nama
    const signCanvas = document.createElement('canvas');
    const signContext = signCanvas.getContext('2d');
    signCanvas.width = 1024;
    signCanvas.height = 256;

    const gradient = signContext.createLinearGradient(
      0,
      0,
      signCanvas.width,
      0
    );
    gradient.addColorStop(0, '#ff6600');
    gradient.addColorStop(0.5, '#ff9933');
    gradient.addColorStop(1, '#ff6600');
    signContext.fillStyle = gradient;
    signContext.fillRect(0, 0, signCanvas.width, signCanvas.height);

    signContext.strokeStyle = '#ffffff';
    signContext.lineWidth = 8;
    signContext.strokeRect(
      10,
      10,
      signCanvas.width - 20,
      signCanvas.height - 20
    );

    signContext.fillStyle = '#ffffff';
    signContext.font = 'bold 80px Arial';
    signContext.textAlign = 'center';
    signContext.textBaseline = 'middle';
    signContext.fillText(name, 512, 90);

    signContext.font = 'bold 45px Arial';
    signContext.fillStyle = '#ffff00';
    signContext.fillText('24 JAM • Rp 2.000/jam', 512, 180);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signTextGeometry = new THREE.PlaneGeometry(9.5, 1.7);
    const signTextMaterial = new THREE.MeshBasicMaterial({
      map: signTexture,
      side: THREE.DoubleSide,
    });
    const signText = new THREE.Mesh(signTextGeometry, signTextMaterial);
    signText.position.set(0, 4, 4.8);
    group.add(signText);

    // Pintu masuk
    const doorGeometry = new THREE.BoxGeometry(2.5, 3.5, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x34495e,
      transparent: true,
      opacity: 0.6,
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.75, 4.6);
    group.add(door);

    // Jendela besar
    const windowGeometry = new THREE.BoxGeometry(3, 2, 0.1);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.4,
      emissive: 0x00ffff,
      emissiveIntensity: 0.2,
    });

    [-4, 4].forEach((xPos) => {
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(xPos, 2.5, 4.55);
      group.add(window);
    });

    // Komputer dan meja di dalam (2 baris, 6 komputer)
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const xPos = -3.5 + col * 3.5;
        const zPos = -2 + row * 4;

        // Meja
        const deskGeometry = new THREE.BoxGeometry(1.5, 0.8, 1);
        const deskMaterial = new THREE.MeshStandardMaterial({
          color: 0x8b4513,
        });
        const desk = new THREE.Mesh(deskGeometry, deskMaterial);
        desk.position.set(xPos, 0.4, zPos);
        desk.castShadow = true;
        group.add(desk);

        // Monitor
        const monitorGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.1);
        const monitorMaterial = new THREE.MeshStandardMaterial({
          color: 0x000000,
        });
        const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
        monitor.position.set(xPos, 1.1, zPos - 0.3);
        monitor.castShadow = true;
        group.add(monitor);

        // Monitor screen (nyala)
        const screenGeometry = new THREE.BoxGeometry(0.75, 0.55, 0.05);
        const screenMaterial = new THREE.MeshStandardMaterial({
          color: 0x1e90ff,
          emissive: 0x1e90ff,
          emissiveIntensity: 0.5,
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(xPos, 1.1, zPos - 0.24);
        group.add(screen);

        // Keyboard
        const keyboardGeometry = new THREE.BoxGeometry(0.6, 0.05, 0.25);
        const keyboardMaterial = new THREE.MeshStandardMaterial({
          color: 0x1a1a1a,
        });
        const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
        keyboard.position.set(xPos, 0.82, zPos + 0.2);
        group.add(keyboard);

        // Mouse
        const mouseGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.15);
        const mouse = new THREE.Mesh(mouseGeometry, keyboardMaterial);
        mouse.position.set(xPos + 0.4, 0.82, zPos + 0.2);
        group.add(mouse);

        // CPU tower di bawah meja
        const cpuGeometry = new THREE.BoxGeometry(0.3, 0.6, 0.5);
        const cpuMaterial = new THREE.MeshStandardMaterial({ color: 0x2c2c2c });
        const cpu = new THREE.Mesh(cpuGeometry, cpuMaterial);
        cpu.position.set(xPos + 0.5, 0.3, zPos);
        cpu.castShadow = true;
        group.add(cpu);

        // LED CPU
        const cpuLedGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        const cpuLedMaterial = new THREE.MeshStandardMaterial({
          color: 0x00ff00,
          emissive: 0x00ff00,
          emissiveIntensity: 0.8,
        });
        const cpuLed = new THREE.Mesh(cpuLedGeometry, cpuLedMaterial);
        cpuLed.position.set(xPos + 0.5, 0.5, zPos + 0.26);
        group.add(cpuLed);

        // Kursi
        const chairGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.6);
        const chairMaterial = new THREE.MeshStandardMaterial({
          color: 0x4169e1,
        });
        const chair = new THREE.Mesh(chairGeometry, chairMaterial);
        chair.position.set(xPos, 0.45, zPos + 0.8);
        chair.castShadow = true;
        group.add(chair);

        // Sandaran kursi
        const backrestGeometry = new THREE.BoxGeometry(0.6, 0.7, 0.1);
        const backrest = new THREE.Mesh(backrestGeometry, chairMaterial);
        backrest.position.set(xPos, 0.8, zPos + 1.05);
        backrest.castShadow = true;
        group.add(backrest);
      }
    }

    // Counter kasir
    const counterGeometry = new THREE.BoxGeometry(3, 1.2, 1);
    const counterMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.set(-4.5, 0.6, 3.5);
    counter.castShadow = true;
    group.add(counter);

    // Monitor kasir
    const cashierMonitorGeometry = new THREE.BoxGeometry(0.6, 0.5, 0.1);
    const monitorMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const cashierMonitor = new THREE.Mesh(
      cashierMonitorGeometry,
      monitorMaterial
    );
    cashierMonitor.position.set(-4.5, 1.3, 3.3);
    group.add(cashierMonitor);

    // AC units (2 buah)
    const acGeometry = new THREE.BoxGeometry(1.2, 0.7, 0.5);
    const acMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });

    [-3, 3].forEach((xPos) => {
      const ac = new THREE.Mesh(acGeometry, acMaterial);
      ac.position.set(xPos, 3.8, 4);
      ac.castShadow = true;
      group.add(ac);
    });

    group.position.set(x, 0, z);
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({ mesh: group, boundingBox: bbox, name: name });
  }

  // ======================================================
  // ANGKRINGAN (Cart-Only Collider, Enterable)
  // ======================================================
  // Player bebas masuk; hanya GEROBak yang didaftarkan sebagai collider.
  // - Penjual: berdiri di balik gerobak
  // - Pelanggan: 2 orang lesehan, pegang piring + gelas di samping
  // Opsi:
  // - scale, rotate
  // - name
  // - characterFactory(color, scale)
  createAngkringan(
    x,
    z,
    {
      scale = 1.4,
      rotate = 0,
      name = 'ANGKRINGAN',
      characterFactory = null,
    } = {}
  ) {
    const group = new THREE.Group();

    // -------- Helpers: NPC fallback + pose --------
    function makeMinecraftCharacterWithJoints(color, cScale = 1) {
      const g = new THREE.Group();

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.8 * cScale, 1.2 * cScale, 0.4 * cScale),
        new THREE.MeshStandardMaterial({ color })
      );
      body.position.y = 0.6 * cScale;
      body.castShadow = true;
      g.add(body);

      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.6 * cScale, 0.6 * cScale, 0.6 * cScale),
        new THREE.MeshStandardMaterial({ color: 0xfdbcb4 })
      );
      head.position.y = 1.5 * cScale;
      head.castShadow = true;
      g.add(head);

      const armGeo = new THREE.BoxGeometry(
        0.3 * cScale,
        0.9 * cScale,
        0.3 * cScale
      );
      const armMat = new THREE.MeshStandardMaterial({ color });
      const leftArm = new THREE.Mesh(armGeo, armMat);
      leftArm.position.set(-0.6 * cScale, 0.6 * cScale, 0);
      const rightArm = new THREE.Mesh(armGeo, armMat);
      rightArm.position.set(0.6 * cScale, 0.6 * cScale, 0);
      leftArm.castShadow = rightArm.castShadow = true;
      g.add(leftArm, rightArm);

      const legGeo = new THREE.BoxGeometry(
        0.3 * cScale,
        0.9 * cScale,
        0.3 * cScale
      );
      const legMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.25 * cScale, -0.45 * cScale, 0);
      const rightLeg = new THREE.Mesh(legGeo, legMat);
      rightLeg.position.set(0.25 * cScale, -0.45 * cScale, 0);
      leftLeg.castShadow = rightLeg.castShadow = true;
      g.add(leftLeg, rightLeg);

      g.userData = {
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        body,
        head,
        scale: cScale,
      };
      return g;
    }

    function poseLesehan(char) {
      if (char.userData?.leftLeg && char.userData?.rightLeg) {
        const s = char.userData.scale || 1;
        const { leftLeg, rightLeg, leftArm, rightArm, body } = char.userData;
        leftLeg.rotation.x = THREE.MathUtils.degToRad(90);
        rightLeg.rotation.x = THREE.MathUtils.degToRad(90);
        leftLeg.position.y = -0.15 * s;
        leftLeg.position.z = 0.18 * s;
        rightLeg.position.y = -0.15 * s;
        rightLeg.position.z = 0.18 * s;
        if (leftArm) leftArm.rotation.x = THREE.MathUtils.degToRad(15);
        if (rightArm) rightArm.rotation.x = THREE.MathUtils.degToRad(10);
        if (body)
          body.rotation.z = THREE.MathUtils.degToRad(Math.random() * 6 - 3);
      }
    }
    function poseVendor(char) {
      if (!char.userData) return;
      if (char.userData.leftArm)
        char.userData.leftArm.rotation.x = THREE.MathUtils.degToRad(-20);
      if (char.userData.rightArm)
        char.userData.rightArm.rotation.x = THREE.MathUtils.degToRad(-10);
    }

    // -------- Area lantai & tikar --------
    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.05, 8),
      new THREE.MeshStandardMaterial({ color: 0x8f8f8f, roughness: 0.95 })
    );
    ground.position.set(0, 0.025, 0);
    ground.receiveShadow = true;
    group.add(ground);

    function makeMat(px, pz, color = 0x8b5a2b) {
      const mat = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.04, 2.4),
        new THREE.MeshStandardMaterial({ color, roughness: 0.9 })
      );
      mat.position.set(px, 0.02, pz);
      mat.receiveShadow = true;
      return mat;
    }
    group.add(makeMat(-2.6, 1.5, 0x8b5a2b), makeMat(2.6, 1.2, 0x996633));

    // -------- Gerobak angkringan --------
    const cart = new THREE.Group();

    const cartBody = new THREE.Mesh(
      new THREE.BoxGeometry(3, 1.2, 2),
      new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 })
    );
    cartBody.position.set(0, 0.8, 0);
    cartBody.castShadow = true;
    cart.add(cartBody);

    const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    [
      [-1.2, -0.8],
      [1.2, -0.8],
      [-1.2, 0.8],
      [1.2, 0.8],
    ].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(wx, 0.18, wz);
      w.rotation.z = Math.PI / 2;
      w.castShadow = true;
      cart.add(w);
    });

    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.1, 2.5),
      new THREE.MeshStandardMaterial({ color: 0xff6347, roughness: 0.7 })
    );
    canopy.position.set(0, 2.5, 0);
    canopy.castShadow = true;
    cart.add(canopy);

    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
    [
      [-1.6, -1.1],
      [1.6, -1.1],
      [-1.6, 1.1],
      [1.6, 1.1],
    ].forEach(([px, pz]) => {
      const p = new THREE.Mesh(poleGeo, poleMat);
      p.position.set(px, 1.6, pz);
      cart.add(p);
    });

    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: 0x000000 })
    );
    cable.position.set(0, 2.35, 0);
    cart.add(cable);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xffa500,
        emissive: 0xffa500,
        emissiveIntensity: 0.8,
      })
    );
    bulb.position.set(0, 2.2, 0);
    cart.add(bulb);
    const point = new THREE.PointLight(0xffddaa, 1.0, 10, 2.0);
    point.position.set(0, 2.2, 0);
    cart.add(point);

    // termos, kompor, api, panci
    for (let i = 0; i < 2; i++) {
      const thermos = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.7, 16),
        new THREE.MeshStandardMaterial({
          color: i === 0 ? 0xff0000 : 0x0000ff,
          metalness: 0.6,
          roughness: 0.3,
        })
      );
      thermos.position.set(-1 + i * 0.8, 1.75, -0.7);
      thermos.castShadow = true;
      cart.add(thermos);
      const lid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.15, 16),
        new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8 })
      );
      lid.position.set(-1 + i * 0.8, 2.17, -0.7);
      cart.add(lid);
    }
    const stove = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.15, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x4169e1 })
    );
    stove.position.set(1, 1.5, -0.5);
    stove.castShadow = true;
    cart.add(stove);

    const fire = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.15, 8),
      new THREE.MeshStandardMaterial({
        color: 0xff4500,
        emissive: 0xff4500,
        emissiveIntensity: 1,
      })
    );
    fire.position.set(1, 1.65, -0.5);
    cart.add(fire);

    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.12, 0.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7 })
    );
    pot.position.set(1, 1.75, -0.5);
    pot.castShadow = true;
    cart.add(pot);

    // tusuk sate + nampan makanan
    for (let i = 0; i < 8; i++) {
      const skew = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.6, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xa0522d })
      );
      skew.position.set(-1.2 + i * 0.35, 1.6, 0.5);
      skew.rotation.z = Math.PI / 6;
      skew.castShadow = true;
      cart.add(skew);
    }
    for (let i = 0; i < 3; i++) {
      const tray = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.05, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xd3d3d3 })
      );
      tray.position.set(-0.8 + i * 0.8, 1.45, 0.2);
      cart.add(tray);
      for (let j = 0; j < 4; j++) {
        const food = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.08, 0.12),
          new THREE.MeshStandardMaterial({ color: 0xd2691e })
        );
        food.position.set(
          -0.8 + i * 0.8 - 0.15 + (j % 2) * 0.3,
          1.5,
          0.1 + Math.floor(j / 2) * 0.25
        );
        cart.add(food);
      }
    }

    // papan nama kanvas (auto-fit, orientasi benar)
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 1024;
    signCanvas.height = 256;
    const sctx = signCanvas.getContext('2d');
    sctx.fillStyle = '#ffcc00';
    sctx.fillRect(0, 0, 1024, 256);
    sctx.strokeStyle = '#000000';
    sctx.lineWidth = 8;
    sctx.strokeRect(8, 8, 1008, 240);
    let fs = 120;
    const maxW = 900;
    while (fs > 60) {
      sctx.font = `bold ${fs}px Arial`;
      if (sctx.measureText(name).width <= maxW) break;
      fs -= 6;
    }
    sctx.fillStyle = '#ff0000';
    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    sctx.fillText(name, 512, 128);
    const signTex = new THREE.CanvasTexture(signCanvas);
    signTex.minFilter = THREE.LinearFilter;
    signTex.magFilter = THREE.LinearFilter;

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.9),
      new THREE.MeshBasicMaterial({
        map: signTex,
        transparent: true,
        side: THREE.DoubleSide,
      })
    );
    sign.position.set(0, 2.8, 0);
    sign.rotation.y = 0;
    cart.add(sign);

    // posisi gerobak
    cart.position.set(0, 0, -1.8);
    group.add(cart);

    // -------- NPC: Penjual (berdiri) --------
    const vendor = characterFactory
      ? characterFactory(0xb45309, 1.0)
      : makeMinecraftCharacterWithJoints(0xb45309, 1.0);
    vendor.position.set(0, 0, -2.9);
    vendor.rotation.y = 0;
    poseVendor(vendor);
    group.add(vendor);

    // -------- NPC: 2 pelanggan lesehan (pegang piring + gelas di samping) --------
    const sitSpots = [
      { x: -2.8, z: 1.3, face: 15 },
      { x: 2.6, z: 1.1, face: 160 },
    ];

    function makePlate() {
      const plate = new THREE.Group();
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.18, 0.03, 24),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.6 })
      );
      base.position.y = 0.015;
      plate.add(base);
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.17, 0.015, 8, 24),
        new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.7 })
      );
      rim.rotation.x = Math.PI / 2;
      plate.add(rim);
      return plate;
    }
    function makeGlass() {
      return new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.05, 0.12, 12),
        new THREE.MeshStandardMaterial({
          color: 0xb97a57,
          roughness: 0.6,
          metalness: 0.05,
        })
      );
    }

    for (let i = 0; i < 2; i++) {
      const spot = sitSpots[i];
      const color = i % 2 ? 0x2563eb : 0x22c55e;
      const npc = characterFactory
        ? characterFactory(color, 1.0)
        : makeMinecraftCharacterWithJoints(color, 1.0);
      npc.position.set(spot.x, 0.46, spot.z);
      npc.rotation.y = THREE.MathUtils.degToRad(spot.face);
      poseLesehan(npc);
      group.add(npc);

      const plate = makePlate();
      if (npc.userData?.rightArm) {
        const s = npc.userData.scale || 1;
        plate.position.set(0, -0.35 * s, 0.12 * s);
        plate.rotation.x = THREE.MathUtils.degToRad(10);
        npc.userData.rightArm.add(plate);
      } else {
        const p = plate.clone();
        p.position.set(spot.x + 0.18, 0.06, spot.z + 0.06);
        group.add(p);
      }

      const glass = makeGlass();
      glass.position.set(spot.x + 0.22, 0.1, spot.z - 0.05);
      group.add(glass);
    }

    // -------- Lampu ambience --------
    const warm = new THREE.PointLight(0xffe3b1, 0.8, 12, 2.0);
    warm.position.set(-2.6, 2.2, 1.5);
    group.add(warm);

    // -------- Transform & register --------
    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);

    // Tambahkan ke scene
    this.scene.add(group);

    // ✅ Hanya GERObak yang jadi collider (player tetap bisa masuk & lesehan)
    cart.updateMatrixWorld(true);
    const cartBox = new THREE.Box3().setFromObject(cart);
    this.buildings.push({
      mesh: cart,
      boundingBox: cartBox,
      name: 'Angkringan - Gerobak',
    });

    // Tidak mendaftarkan bbox untuk seluruh group.
    return group;
  }

  createWarteg(x, z, name) {
    const group = new THREE.Group();

    const buildingGeometry = new THREE.BoxGeometry(8, 4, 6);
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0xffa500,
      roughness: 0.8,
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 2;
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);

    const roofGeometry = new THREE.BoxGeometry(9, 0.3, 7);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
    const roof1 = new THREE.Mesh(roofGeometry, roofMaterial);
    roof1.position.set(0, 4.5, 1);
    roof1.rotation.x = -Math.PI / 6;
    roof1.castShadow = true;
    group.add(roof1);

    const roof2 = new THREE.Mesh(roofGeometry, roofMaterial);
    roof2.position.set(0, 4.5, -1);
    roof2.rotation.x = Math.PI / 6;
    roof2.castShadow = true;
    group.add(roof2);

    const doorGeometry = new THREE.BoxGeometry(3, 3, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x654321,
      transparent: true,
      opacity: 0.7,
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.5, 3.1);
    group.add(door);

    // Etalase kaca
    const displayCaseGeometry = new THREE.BoxGeometry(6, 1.8, 1);
    const displayCaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.3,
    });
    const displayCase = new THREE.Mesh(
      displayCaseGeometry,
      displayCaseMaterial
    );
    displayCase.position.set(0, 1.2, 3.5);
    displayCase.castShadow = true;
    group.add(displayCase);

    const frameGeometry = new THREE.BoxGeometry(6.2, 1.9, 0.1);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const frameBack = new THREE.Mesh(frameGeometry, frameMaterial);
    frameBack.position.set(0, 1.2, 3);
    frameBack.castShadow = true;
    group.add(frameBack);

    // Piring makanan
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const plateGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16);
        const plateMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
        });
        const plate = new THREE.Mesh(plateGeometry, plateMaterial);
        plate.position.set(-2 + col * 1.3, 0.6 + row * 0.5, 3.3);
        plate.castShadow = true;
        group.add(plate);

        const foodColors = [
          0xff6347, 0x228b22, 0xffd700, 0x8b4513, 0xff8c00, 0x006400,
        ];
        const foodGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.3);
        const foodMaterial = new THREE.MeshStandardMaterial({
          color: foodColors[Math.floor(Math.random() * foodColors.length)],
        });
        const food = new THREE.Mesh(foodGeometry, foodMaterial);
        food.position.set(-2 + col * 1.3, 0.7 + row * 0.5, 3.3);
        food.castShadow = true;
        group.add(food);
      }
    }

    // Dispenser
    const dispenserGeometry = new THREE.BoxGeometry(0.5, 1.2, 0.4);
    const dispenserMaterial = new THREE.MeshStandardMaterial({
      color: 0x4169e1,
    });
    const dispenser = new THREE.Mesh(dispenserGeometry, dispenserMaterial);
    dispenser.position.set(3.5, 1, 2);
    dispenser.castShadow = true;
    group.add(dispenser);

    const gallonGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 16);
    const gallonMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.4,
    });
    const gallon = new THREE.Mesh(gallonGeometry, gallonMaterial);
    gallon.position.set(3.5, 1.9, 2);
    group.add(gallon);

    // Papan nama
    const signCanvas = document.createElement('canvas');
    const signContext = signCanvas.getContext('2d');
    signCanvas.width = 1024;
    signCanvas.height = 256;

    const gradient = signContext.createLinearGradient(
      0,
      0,
      0,
      signCanvas.height
    );
    gradient.addColorStop(0, '#ff6600');
    gradient.addColorStop(1, '#ff9900');
    signContext.fillStyle = gradient;
    signContext.fillRect(0, 0, signCanvas.width, signCanvas.height);

    signContext.strokeStyle = '#ffffff';
    signContext.lineWidth = 10;
    signContext.strokeRect(
      10,
      10,
      signCanvas.width - 20,
      signCanvas.height - 20
    );

    signContext.fillStyle = '#ffffff';
    signContext.font = 'bold 90px Arial';
    signContext.textAlign = 'center';
    signContext.textBaseline = 'middle';
    signContext.strokeStyle = '#000000';
    signContext.lineWidth = 4;
    signContext.strokeText(name, 512, 100);
    signContext.fillText(name, 512, 100);

    signContext.font = 'bold 40px Arial';
    signContext.fillStyle = '#ffff00';
    signContext.fillText('NASI RAMES Rp 10.000', 512, 180);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signGeometry = new THREE.PlaneGeometry(6, 1.5);
    const signMaterial = new THREE.MeshBasicMaterial({
      map: signTexture,
      side: THREE.DoubleSide,
    });
    const signMesh = new THREE.Mesh(signGeometry, signMaterial);
    signMesh.position.set(0, 3.5, 3.15);
    group.add(signMesh);

    group.position.set(x, 0, z);
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({ mesh: group, boundingBox: bbox, name: name });
  }

  createKapsterBox(x, z) {
    const group = new THREE.Group();

    const buildingGeometry = new THREE.BoxGeometry(7, 4.5, 6);
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.3,
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 2.25;
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);

    const roofGeometry = new THREE.BoxGeometry(7.5, 0.3, 6.5);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 4.65;
    roof.castShadow = true;
    group.add(roof);

    // Stripe barber
    for (let i = 0; i < 3; i++) {
      const stripeGeometry = new THREE.BoxGeometry(0.3, 4, 0.1);
      const colors = [0xff0000, 0xffffff, 0x0000ff];
      const stripeMaterial = new THREE.MeshStandardMaterial({
        color: colors[i],
        emissive: colors[i],
        emissiveIntensity: 0.3,
      });
      const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
      stripe.position.set(-2.5 + i * 1.2, 2.25, 3.05);
      group.add(stripe);
    }

    // Barber pole
    const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 16);
    const poleMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.6,
    });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(-3.5, 1.5, 2);
    pole.castShadow = true;
    group.add(pole);

    for (let i = 0; i < 8; i++) {
      const spiralGeometry = new THREE.TorusGeometry(0.22, 0.05, 8, 16);
      const spiralMaterial = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xff0000 : 0x0000ff,
      });
      const spiral = new THREE.Mesh(spiralGeometry, spiralMaterial);
      spiral.position.set(-3.5, 0.7 + i * 0.23, 2);
      spiral.rotation.x = Math.PI / 2;
      group.add(spiral);
    }

    const capGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.9,
      roughness: 0.1,
    });
    const topCap = new THREE.Mesh(capGeometry, capMaterial);
    topCap.position.set(-3.5, 2.6, 2);
    group.add(topCap);

    // Papan nama
    const signCanvas = document.createElement('canvas');
    const signContext = signCanvas.getContext('2d');
    signCanvas.width = 1024;
    signCanvas.height = 256;

    signContext.fillStyle = '#000000';
    signContext.fillRect(0, 0, signCanvas.width, signCanvas.height);

    const borderColors = ['#ff0000', '#ffffff', '#0000ff'];
    for (let i = 0; i < 3; i++) {
      signContext.strokeStyle = borderColors[i];
      signContext.lineWidth = 8;
      signContext.strokeRect(
        10 + i * 5,
        10 + i * 5,
        signCanvas.width - 20 - i * 10,
        signCanvas.height - 20 - i * 10
      );
    }

    signContext.fillStyle = '#ffffff';
    signContext.font = 'bold 70px Arial';
    signContext.textAlign = 'center';
    signContext.textBaseline = 'middle';
    signContext.strokeStyle = '#ff0000';
    signContext.lineWidth = 4;
    signContext.strokeText('KAPSTER BOX', 512, 90);
    signContext.fillText('KAPSTER BOX', 512, 90);

    signContext.font = 'bold 40px Arial';
    signContext.fillStyle = '#ffff00';
    signContext.fillText('PANGKAS RAMBUT', 512, 170);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signGeometry = new THREE.PlaneGeometry(5, 1.25);
    const signMaterial = new THREE.MeshStandardMaterial({
      map: signTexture,
      emissive: 0x222222,
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide,
    });
    const signMesh = new THREE.Mesh(signGeometry, signMaterial);
    signMesh.position.set(0, 4, 3.15);
    group.add(signMesh);

    group.position.set(x, 0, z);
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({
      mesh: group,
      boundingBox: bbox,
      name: 'Kapster Box',
    });
  }

  createLaundry(x, z, name) {
    const group = new THREE.Group();

    const buildingGeometry = new THREE.BoxGeometry(8, 4, 7);
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      roughness: 0.7,
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 2;
    building.castShadow = true;
    building.receiveShadow = true;
    group.add(building);

    const roofGeometry = new THREE.BoxGeometry(8.5, 0.3, 7.5);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x4682b4 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 4.15;
    roof.castShadow = true;
    group.add(roof);

    // Mesin cuci
    for (let i = 0; i < 4; i++) {
      const machineGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.8);
      const machineMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.4,
        roughness: 0.3,
      });
      const machine = new THREE.Mesh(machineGeometry, machineMaterial);
      machine.position.set(-2.5 + i * 1.7, 0.6, 1.5);
      machine.castShadow = true;
      group.add(machine);

      const doorMachineGeometry = new THREE.CircleGeometry(0.3, 32);
      const doorMachineMaterial = new THREE.MeshStandardMaterial({
        color: 0x4169e1,
        transparent: true,
        opacity: 0.4,
        metalness: 0.5,
      });
      const doorMachine = new THREE.Mesh(
        doorMachineGeometry,
        doorMachineMaterial
      );
      doorMachine.position.set(-2.5 + i * 1.7, 0.8, 2.35);
      group.add(doorMachine);
    }

    // Jemuran
    const clotheslineGeometry = new THREE.CylinderGeometry(0.03, 0.03, 6, 8);
    const clotheslineMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
    });

    for (let i = 0; i < 2; i++) {
      const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
      const pole = new THREE.Mesh(poleGeometry, clotheslineMaterial);
      pole.position.set(-2.5 + i * 5, 5.5, -2);
      group.add(pole);
    }

    const line1 = new THREE.Mesh(clotheslineGeometry, clotheslineMaterial);
    line1.position.set(0, 7, -2);
    line1.rotation.z = Math.PI / 2;
    group.add(line1);

    // Baju tergantung
    const clothesColors = [
      0xff0000, 0x0000ff, 0xffff00, 0x00ff00, 0xff69b4, 0xffffff,
    ];
    for (let i = 0; i < 5; i++) {
      const clothGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.05);
      const clothMaterial = new THREE.MeshStandardMaterial({
        color: clothesColors[Math.floor(Math.random() * clothesColors.length)],
      });
      const cloth = new THREE.Mesh(clothGeometry, clothMaterial);
      cloth.position.set(-2.3 + i * 1.2, 6.7, -2);
      cloth.castShadow = true;
      group.add(cloth);
    }

    // Papan nama
    const signCanvas = document.createElement('canvas');
    const signContext = signCanvas.getContext('2d');
    signCanvas.width = 1024;
    signCanvas.height = 256;

    const gradient = signContext.createLinearGradient(
      0,
      0,
      signCanvas.width,
      0
    );
    gradient.addColorStop(0, '#4169e1');
    gradient.addColorStop(0.5, '#87ceeb');
    gradient.addColorStop(1, '#4169e1');
    signContext.fillStyle = gradient;
    signContext.fillRect(0, 0, signCanvas.width, signCanvas.height);

    signContext.strokeStyle = '#ffffff';
    signContext.lineWidth = 10;
    signContext.strokeRect(
      10,
      10,
      signCanvas.width - 20,
      signCanvas.height - 20
    );

    signContext.fillStyle = '#ffffff';
    signContext.font = 'bold 80px Arial';
    signContext.textAlign = 'center';
    signContext.textBaseline = 'middle';
    signContext.strokeStyle = '#000000';
    signContext.lineWidth = 5;
    signContext.strokeText(name, 512, 100);
    signContext.fillText(name, 512, 100);

    signContext.font = 'bold 45px Arial';
    signContext.fillStyle = '#ffff00';
    signContext.fillText('KILOAN - CEPAT & BERSIH', 512, 180);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signGeometry = new THREE.PlaneGeometry(6, 1.5);
    const signMaterial = new THREE.MeshBasicMaterial({
      map: signTexture,
      side: THREE.DoubleSide,
    });
    const signMesh = new THREE.Mesh(signGeometry, signMaterial);
    signMesh.position.set(0, 3.5, 3.65);
    group.add(signMesh);

    group.position.set(x, 0, z);
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({ mesh: group, boundingBox: bbox, name: name });
  }

  createTambalBan(x, z) {
    const group = new THREE.Group();

    // Kanopi
    const canopyGeometry = new THREE.BoxGeometry(6, 0.3, 5);
    const canopyMaterial = new THREE.MeshStandardMaterial({
      color: 0x008000,
      metalness: 0.4,
    });
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
    canopy.position.y = 3;
    canopy.castShadow = true;
    group.add(canopy);

    // Tiang
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });

    [
      { x: -2.8, z: -2.3 },
      { x: 2.8, z: -2.3 },
      { x: -2.8, z: 2.3 },
      { x: 2.8, z: 2.3 },
    ].forEach((pos) => {
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.set(pos.x, 1.5, pos.z);
      pole.castShadow = true;
      group.add(pole);
    });

    // Ban bertumpuk
    for (let i = 0; i < 5; i++) {
      const tireGeometry = new THREE.TorusGeometry(0.4, 0.15, 16, 32);
      const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
      const tire = new THREE.Mesh(tireGeometry, tireMaterial);
      tire.position.set(-2, 0.15 + i * 0.25, -1.5);
      tire.rotation.x = Math.PI / 2;
      tire.castShadow = true;
      group.add(tire);
    }

    for (let i = 0; i < 6; i++) {
      const tireGeometry = new THREE.TorusGeometry(0.35, 0.12, 16, 32);
      const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
      const tire = new THREE.Mesh(tireGeometry, tireMaterial);
      tire.position.set(2, 0.13 + i * 0.22, -1.5);
      tire.rotation.x = Math.PI / 2;
      tire.castShadow = true;
      group.add(tire);
    }

    // Kompresor
    const compressorGeometry = new THREE.BoxGeometry(0.8, 1, 0.6);
    const compressorMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      metalness: 0.6,
    });
    const compressor = new THREE.Mesh(compressorGeometry, compressorMaterial);
    compressor.position.set(-1.5, 0.5, 0.5);
    compressor.castShadow = true;
    group.add(compressor);

    // Ember
    const bucketGeometry = new THREE.CylinderGeometry(0.3, 0.25, 0.4, 16);
    const bucketMaterial = new THREE.MeshStandardMaterial({ color: 0x4169e1 });
    const bucket = new THREE.Mesh(bucketGeometry, bucketMaterial);
    bucket.position.set(1.5, 0.2, 0.5);
    bucket.castShadow = true;
    group.add(bucket);

    // Papan nama
    const signCanvas = document.createElement('canvas');
    const signContext = signCanvas.getContext('2d');
    signCanvas.width = 512;
    signCanvas.height = 256;

    signContext.fillStyle = '#ffcc00';
    signContext.fillRect(0, 0, signCanvas.width, signCanvas.height);
    signContext.strokeStyle = '#000000';
    signContext.lineWidth = 8;
    signContext.strokeRect(8, 8, signCanvas.width - 16, signCanvas.height - 16);
    signContext.fillStyle = '#000000';
    signContext.font = 'bold 70px Arial';
    signContext.textAlign = 'center';
    signContext.textBaseline = 'middle';
    signContext.fillText('TAMBAL', 256, 90);
    signContext.fillText('BAN', 256, 170);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signGeometry = new THREE.PlaneGeometry(2.5, 1.25);
    const signMaterial = new THREE.MeshBasicMaterial({
      map: signTexture,
      side: THREE.DoubleSide,
    });
    const signMesh = new THREE.Mesh(signGeometry, signMaterial);
    signMesh.position.set(0, 3.5, -2.6);
    group.add(signMesh);

    group.position.set(x, 0, z);
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({ mesh: group, boundingBox: bbox, name: 'Tambal Ban' });
  }

  createHouse(x, z, colorScheme) {
    const group = new THREE.Group();

    // Pilih warna rumah berdasarkan scheme
    const houseColors = {
      red: { wall: 0xff6b6b, roof: 0x8b0000 },
      blue: { wall: 0x6ba3ff, roof: 0x000080 },
      green: { wall: 0x90ee90, roof: 0x006400 },
      yellow: { wall: 0xffd966, roof: 0xcc8800 },
      pink: { wall: 0xffb6c1, roof: 0xc71585 },
      orange: { wall: 0xffa500, roof: 0xff6347 },
    };

    const colors = houseColors[colorScheme] || houseColors.red;

    // Main house body
    const houseGeometry = new THREE.BoxGeometry(4, 3, 4);
    const houseMaterial = new THREE.MeshStandardMaterial({
      color: colors.wall,
      roughness: 0.8,
    });
    const house = new THREE.Mesh(houseGeometry, houseMaterial);
    house.position.y = 1.5;
    house.castShadow = true;
    house.receiveShadow = true;
    group.add(house);

    // Atap pyramid
    const roofGeometry = new THREE.ConeGeometry(3.5, 2, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: colors.roof,
      roughness: 0.7,
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 4;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // Pintu
    const doorGeometry = new THREE.BoxGeometry(0.8, 1.8, 0.1);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 0.9, 2.05);
    door.castShadow = true;
    group.add(door);

    // Jendela (2 buah)
    const windowGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.6,
    });

    const windowLeft = new THREE.Mesh(windowGeometry, windowMaterial);
    windowLeft.position.set(-1.2, 1.8, 2.05);
    group.add(windowLeft);

    const windowRight = new THREE.Mesh(windowGeometry, windowMaterial);
    windowRight.position.set(1.2, 1.8, 2.05);
    group.add(windowRight);

    // Cerobong asap kecil
    const chimneyGeometry = new THREE.BoxGeometry(0.4, 1, 0.4);
    const chimneyMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(1.5, 4.5, -1);
    chimney.castShadow = true;
    group.add(chimney);

    // Pagar depan rumah
    const fenceHeight = 0.8;
    const fenceGeometry = new THREE.BoxGeometry(0.1, fenceHeight, 0.1);
    const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355 });

    // Pagar horizontal
    const fenceHorizontalGeometry = new THREE.BoxGeometry(5, 0.1, 0.1);
    const fenceTop = new THREE.Mesh(fenceHorizontalGeometry, fenceMaterial);
    fenceTop.position.set(0, fenceHeight, 3);
    group.add(fenceTop);

    // Tiang pagar vertikal
    for (let i = -2; i <= 2; i++) {
      const post = new THREE.Mesh(fenceGeometry, fenceMaterial);
      post.position.set(i * 1.2, fenceHeight / 2, 3);
      post.castShadow = true;
      group.add(post);
    }

    // Tanaman kecil di depan rumah (pot bunga)
    const potGeometry = new THREE.CylinderGeometry(0.2, 0.15, 0.3, 8);
    const potMaterial = new THREE.MeshStandardMaterial({ color: 0xa0522d });
    const pot = new THREE.Mesh(potGeometry, potMaterial);
    pot.position.set(-1.8, 0.15, 2.8);
    pot.castShadow = true;
    group.add(pot);

    // Daun tanaman
    const plantGeometry = new THREE.SphereGeometry(0.25, 8, 8);
    const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const plant = new THREE.Mesh(plantGeometry, plantMaterial);
    plant.position.set(-1.8, 0.5, 2.8);
    group.add(plant);

    group.position.set(x, 0, z);
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({ mesh: group, boundingBox: bbox, name: 'House' });
  }

  // Rumah Kecil - Tipe 1 (Rumah sangat sederhana)
  createSmallHouse(x, z, colorScheme, rotation = 0) {
    const group = new THREE.Group();

    const houseColors = {
      red: { wall: 0xcd5c5c, roof: 0x8b0000 },
      blue: { wall: 0x87ceeb, roof: 0x4682b4 },
      green: { wall: 0x98fb98, roof: 0x228b22 },
      yellow: { wall: 0xffeaa7, roof: 0xfdcb6e },
    };
    const colors = houseColors[colorScheme] || houseColors.red;

    // Bangunan kecil 6x5x6 (diperbesar 2x)
    const houseGeometry = new THREE.BoxGeometry(6, 5, 6);
    const houseMaterial = new THREE.MeshStandardMaterial({
      color: colors.wall,
      roughness: 0.9,
    });
    const house = new THREE.Mesh(houseGeometry, houseMaterial);
    house.position.y = 2.5;
    house.castShadow = true;
    house.receiveShadow = true;
    group.add(house);

    // Atap sederhana miring
    const roofGeometry = new THREE.BoxGeometry(7, 0.6, 7);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: colors.roof,
      roughness: 0.8,
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 5.6, 0.6);
    roof.rotation.x = Math.PI / 8;
    roof.castShadow = true;
    group.add(roof);

    // Pintu kecil
    const doorGeometry = new THREE.BoxGeometry(1.4, 3, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.5, 3.1);
    group.add(door);

    // 1 jendela kecil
    const windowGeometry = new THREE.BoxGeometry(1.2, 1.2, 0.2);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.5,
    });
    const window = new THREE.Mesh(windowGeometry, windowMaterial);
    window.position.set(-1.6, 3, 3.1);
    group.add(window);

    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({
      mesh: group,
      boundingBox: bbox,
      name: 'Small House',
    });
  }

  // Rumah Sederhana - Tipe 2 (Rumah standar)
  createSimpleHouse(x, z, colorScheme, rotation = 0) {
    const group = new THREE.Group();

    const houseColors = {
      red: { wall: 0xf08080, roof: 0xa52a2a },
      blue: { wall: 0x87cefa, roof: 0x4169e1 },
      green: { wall: 0x90ee90, roof: 0x32cd32 },
      yellow: { wall: 0xffd700, roof: 0xdaa520 },
    };
    const colors = houseColors[colorScheme] || houseColors.red;

    // Bangunan standar 8x6x8 (diperbesar 2x)
    const houseGeometry = new THREE.BoxGeometry(8, 6, 8);
    const houseMaterial = new THREE.MeshStandardMaterial({
      color: colors.wall,
      roughness: 0.8,
    });
    const house = new THREE.Mesh(houseGeometry, houseMaterial);
    house.position.y = 3;
    house.castShadow = true;
    house.receiveShadow = true;
    group.add(house);

    // Atap pelana
    const roofGeometry = new THREE.ConeGeometry(6, 3, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: colors.roof,
      roughness: 0.7,
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 7.6;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // Pintu
    const doorGeometry = new THREE.BoxGeometry(1.6, 3.6, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.8, 4.1);
    group.add(door);

    // 2 jendela
    const windowGeometry = new THREE.BoxGeometry(1.4, 1.4, 0.2);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.6,
    });

    const windowLeft = new THREE.Mesh(windowGeometry, windowMaterial);
    windowLeft.position.set(-2, 3.6, 4.1);
    group.add(windowLeft);

    const windowRight = new THREE.Mesh(windowGeometry, windowMaterial);
    windowRight.position.set(2, 3.6, 4.1);
    group.add(windowRight);

    // Pagar sederhana
    const fenceGeometry = new THREE.BoxGeometry(10, 1.2, 0.2);
    const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
    const fence = new THREE.Mesh(fenceGeometry, fenceMaterial);
    fence.position.set(0, 0.6, 5.6);
    group.add(fence);

    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({
      mesh: group,
      boundingBox: bbox,
      name: 'Simple House',
    });
  }

  // Rumah Bagus - Tipe 3 (Rumah menengah atas)
  createNiceHouse(x, z, colorScheme, rotation = 0) {
    const group = new THREE.Group();

    const houseColors = {
      red: { wall: 0xffa07a, roof: 0x8b4513, accent: 0xffffff },
      blue: { wall: 0xadd8e6, roof: 0x191970, accent: 0xffffff },
      green: { wall: 0x98fb98, roof: 0x2f4f4f, accent: 0xffffff },
      yellow: { wall: 0xfafad2, roof: 0xb8860b, accent: 0xffffff },
    };
    const colors = houseColors[colorScheme] || houseColors.red;

    // Bangunan utama 10x7x10 (diperbesar 2x)
    const houseGeometry = new THREE.BoxGeometry(10, 7, 10);
    const houseMaterial = new THREE.MeshStandardMaterial({
      color: colors.wall,
      roughness: 0.6,
    });
    const house = new THREE.Mesh(houseGeometry, houseMaterial);
    house.position.y = 3.5;
    house.castShadow = true;
    house.receiveShadow = true;
    group.add(house);

    // Atap ganda bertingkat
    const roofGeometry = new THREE.ConeGeometry(7.6, 4, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: colors.roof,
      roughness: 0.5,
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 9;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // Balkon kecil di lantai 2
    const balconyGeometry = new THREE.BoxGeometry(4, 0.4, 2);
    const balconyMaterial = new THREE.MeshStandardMaterial({
      color: colors.accent,
      metalness: 0.2,
    });
    const balcony = new THREE.Mesh(balconyGeometry, balconyMaterial);
    balcony.position.set(0, 5.6, 5);
    balcony.castShadow = true;
    group.add(balcony);

    // Pagar balkon
    const balconyRailGeometry = new THREE.BoxGeometry(4, 1.2, 0.2);
    const balconyRail = new THREE.Mesh(balconyRailGeometry, balconyMaterial);
    balconyRail.position.set(0, 6.4, 6);
    group.add(balconyRail);

    // Pintu besar
    const doorGeometry = new THREE.BoxGeometry(2, 4, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x654321,
      metalness: 0.3,
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(-2.4, 2, 5.1);
    door.castShadow = true;
    group.add(door);

    // 3 jendela besar
    const windowGeometry = new THREE.BoxGeometry(1.8, 2, 0.2);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.4,
      metalness: 0.5,
    });

    const windowLeft = new THREE.Mesh(windowGeometry, windowMaterial);
    windowLeft.position.set(-3.6, 3.6, 5.1);
    group.add(windowLeft);

    const windowCenter = new THREE.Mesh(windowGeometry, windowMaterial);
    windowCenter.position.set(0, 3.6, 5.1);
    group.add(windowCenter);

    const windowRight = new THREE.Mesh(windowGeometry, windowMaterial);
    windowRight.position.set(3.6, 3.6, 5.1);
    group.add(windowRight);

    // Garasi samping
    const garageGeometry = new THREE.BoxGeometry(5, 5, 5);
    const garageMaterial = new THREE.MeshStandardMaterial({
      color: colors.wall,
      roughness: 0.7,
    });
    const garage = new THREE.Mesh(garageGeometry, garageMaterial);
    garage.position.set(7, 2.5, 0);
    garage.castShadow = true;
    group.add(garage);

    // Pintu garasi
    const garageDoorGeometry = new THREE.BoxGeometry(4, 4, 0.2);
    const garageDoorMaterial = new THREE.MeshStandardMaterial({
      color: 0x696969,
      metalness: 0.6,
    });
    const garageDoor = new THREE.Mesh(garageDoorGeometry, garageDoorMaterial);
    garageDoor.position.set(7, 2, 2.6);
    group.add(garageDoor);

    // Pagar batu modern
    const fenceGeometry = new THREE.BoxGeometry(16, 2, 0.4);
    const fenceMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.8,
    });
    const fence = new THREE.Mesh(fenceGeometry, fenceMaterial);
    fence.position.set(0, 1, 7);
    fence.castShadow = true;
    group.add(fence);

    // Taman depan
    for (let i = 0; i < 2; i++) {
      const bushGeometry = new THREE.SphereGeometry(0.8, 8, 8);
      const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
      const bush = new THREE.Mesh(bushGeometry, bushMaterial);
      bush.position.set(-4 + i * 8, 0.8, 6.4);
      bush.castShadow = true;
      group.add(bush);
    }

    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({ mesh: group, boundingBox: bbox, name: 'Nice House' });
  }

  // Rumah Mewah - Tipe 4 (Rumah elite)
  createLuxuryHouse(x, z, colorScheme, rotation = 0) {
    const group = new THREE.Group();

    const houseColors = {
      white: { wall: 0xf5f5f5, roof: 0x2f4f4f, accent: 0xdaa520 },
      cream: { wall: 0xfffacd, roof: 0x8b4513, accent: 0xffd700 },
      gray: { wall: 0xd3d3d3, roof: 0x1c1c1c, accent: 0xc0c0c0 },
    };
    const colors = houseColors[colorScheme] || houseColors.white;

    // Bangunan utama 2 lantai 12x10x12 (diperbesar 2x)
    const houseGeometry = new THREE.BoxGeometry(12, 10, 12);
    const houseMaterial = new THREE.MeshStandardMaterial({
      color: colors.wall,
      roughness: 0.4,
      metalness: 0.1,
    });
    const house = new THREE.Mesh(houseGeometry, houseMaterial);
    house.position.y = 5;
    house.castShadow = true;
    house.receiveShadow = true;
    group.add(house);

    // Atap datar modern
    const roofGeometry = new THREE.BoxGeometry(13, 1, 13);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: colors.roof,
      roughness: 0.3,
      metalness: 0.4,
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 10.5;
    roof.castShadow = true;
    group.add(roof);

    // Pagar atap (railing)
    const roofRailGeometry = new THREE.BoxGeometry(12, 0.6, 0.2);
    const roofRailMaterial = new THREE.MeshStandardMaterial({
      color: colors.accent,
      metalness: 0.8,
      roughness: 0.2,
    });

    [
      { x: 0, z: 6.4 },
      { x: 0, z: -6.4 },
    ].forEach((pos) => {
      const rail = new THREE.Mesh(roofRailGeometry, roofRailMaterial);
      rail.position.set(pos.x, 10.8, pos.z);
      group.add(rail);
    });

    // Balkon lebar lantai 2
    const balconyGeometry = new THREE.BoxGeometry(10, 0.6, 3);
    const balconyMaterial = new THREE.MeshStandardMaterial({
      color: colors.wall,
      metalness: 0.3,
    });
    const balcony = new THREE.Mesh(balconyGeometry, balconyMaterial);
    balcony.position.set(0, 7, 6);
    balcony.castShadow = true;
    group.add(balcony);

    // Pagar balkon kaca
    const glassRailGeometry = new THREE.BoxGeometry(10, 2, 0.2);
    const glassRailMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.3,
      metalness: 0.8,
    });
    const glassRail = new THREE.Mesh(glassRailGeometry, glassRailMaterial);
    glassRail.position.set(0, 8, 7.4);
    group.add(glassRail);

    // Pintu utama besar dengan frame emas
    const doorFrameGeometry = new THREE.BoxGeometry(3, 5.6, 0.4);
    const doorFrameMaterial = new THREE.MeshStandardMaterial({
      color: colors.accent,
      metalness: 0.9,
      roughness: 0.1,
    });
    const doorFrame = new THREE.Mesh(doorFrameGeometry, doorFrameMaterial);
    doorFrame.position.set(0, 2.8, 6.2);
    group.add(doorFrame);

    const doorGeometry = new THREE.BoxGeometry(2.4, 5, 0.3);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x654321,
      metalness: 0.5,
      roughness: 0.3,
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 2.5, 6.3);
    door.castShadow = true;
    group.add(door);

    // Jendela kaca besar modern (4 jendela)
    const largeWindowGeometry = new THREE.BoxGeometry(2.4, 3, 0.2);
    const largeWindowMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.3,
      metalness: 0.7,
    });

    // Lantai 1
    [-4, 4].forEach((xPos) => {
      const window = new THREE.Mesh(largeWindowGeometry, largeWindowMaterial);
      window.position.set(xPos, 4, 6.1);
      group.add(window);
    });

    // Lantai 2
    [-4, 4].forEach((xPos) => {
      const window = new THREE.Mesh(largeWindowGeometry, largeWindowMaterial);
      window.position.set(xPos, 8, 6.1);
      group.add(window);
    });

    // Garasi double
    const garageGeometry = new THREE.BoxGeometry(8, 6, 6);
    const garage = new THREE.Mesh(garageGeometry, houseMaterial);
    garage.position.set(-10, 3, 0);
    garage.castShadow = true;
    group.add(garage);

    // Pintu garasi double
    const garageDoorGeometry = new THREE.BoxGeometry(7, 5, 0.2);
    const garageDoorMaterial = new THREE.MeshStandardMaterial({
      color: 0x696969,
      metalness: 0.8,
      roughness: 0.2,
    });
    const garageDoor = new THREE.Mesh(garageDoorGeometry, garageDoorMaterial);
    garageDoor.position.set(-10, 2.5, 3);
    group.add(garageDoor);

    // Kolom/pilar mewah
    const pillarGeometry = new THREE.CylinderGeometry(0.6, 0.7, 7, 12);
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: colors.accent,
      metalness: 0.6,
      roughness: 0.3,
    });

    [-4, 4].forEach((xPos) => {
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      pillar.position.set(xPos, 3.5, 7);
      pillar.castShadow = true;
      group.add(pillar);
    });

    // Pagar besi tempa mewah
    const fenceHeight = 3;
    const fancyFenceGeometry = new THREE.BoxGeometry(24, fenceHeight, 0.2);
    const fancyFenceMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c1c1c,
      metalness: 0.9,
      roughness: 0.1,
    });
    const fence = new THREE.Mesh(fancyFenceGeometry, fancyFenceMaterial);
    fence.position.set(0, fenceHeight / 2, 9);
    fence.castShadow = true;
    group.add(fence);

    // Ornamen pagar emas
    for (let i = -10; i <= 10; i += 4) {
      const ornamentGeometry = new THREE.SphereGeometry(0.3, 8, 8);
      const ornamentMaterial = new THREE.MeshStandardMaterial({
        color: colors.accent,
        metalness: 0.9,
      });
      const ornament = new THREE.Mesh(ornamentGeometry, ornamentMaterial);
      ornament.position.set(i, fenceHeight, 9);
      group.add(ornament);
    }

    // Taman landscape mewah
    // Pohon besar
    const treeTrunkGeometry = new THREE.CylinderGeometry(0.6, 0.7, 4, 8);
    const treeTrunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
    });
    const treeTrunk = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial);
    treeTrunk.position.set(-7, 2, 8);
    treeTrunk.castShadow = true;
    group.add(treeTrunk);

    const treeLeavesGeometry = new THREE.SphereGeometry(2, 12, 12);
    const treeLeavesMaterial = new THREE.MeshStandardMaterial({
      color: 0x228b22,
    });
    const treeLeaves = new THREE.Mesh(treeLeavesGeometry, treeLeavesMaterial);
    treeLeaves.position.set(-7, 5, 8);
    treeLeaves.castShadow = true;
    group.add(treeLeaves);

    // Bushes sculpted
    for (let i = 0; i < 3; i++) {
      const bushGeometry = new THREE.SphereGeometry(1, 12, 12);
      const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x2e8b57 });
      const bush = new THREE.Mesh(bushGeometry, bushMaterial);
      bush.position.set(-4 + i * 4, 1, 8.4);
      bush.castShadow = true;
      group.add(bush);
    }

    // Lampu taman mewah
    const lampPostGeometry = new THREE.CylinderGeometry(0.16, 0.16, 4, 8);
    const lampPostMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c1c1c,
      metalness: 0.8,
    });

    [7, -7].forEach((xPos) => {
      const lampPost = new THREE.Mesh(lampPostGeometry, lampPostMaterial);
      lampPost.position.set(xPos, 2, 8);
      group.add(lampPost);

      // Lampu
      const lampGeometry = new THREE.SphereGeometry(0.4, 12, 12);
      const lampMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffd700,
        emissiveIntensity: 0.5,
      });
      const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
      lamp.position.set(xPos, 4, 8);
      group.add(lamp);
    });

    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    this.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    this.buildings.push({
      mesh: group,
      boundingBox: bbox,
      name: 'Luxury House',
    });
  }

  createHousesInEmptyAreas() {
    // Define house positions with types - avoid corners and existing buildings
    // Types: small, simple, nice, luxury

    const houseData = [
      // Area tengah kiri (mixed types)
      { x: -40, z: -80, type: 'small', color: 'red' },
      { x: -40, z: -40, type: 'simple', color: 'blue' },
      { x: -40, z: 40, type: 'simple', color: 'green' },
      { x: -40, z: 80, type: 'nice', color: 'red' },

      // Area tengah (varied types)
      { x: 0, z: -80, type: 'small', color: 'yellow' },
      { x: 0, z: 40, type: 'nice', color: 'blue' },
      { x: 0, z: 80, type: 'simple', color: 'yellow' },

      // Area tengah kanan (mixed)
      { x: 40, z: -80, type: 'small', color: 'blue' },
      { x: 40, z: -40, type: 'simple', color: 'red' },
      { x: 40, z: 40, type: 'nice', color: 'yellow' },
      { x: 40, z: 80, type: 'simple', color: 'green' },

      // Area pinggir kiri (simple & small)
      { x: -80, z: -40, type: 'small', color: 'green' },
      { x: -80, z: 0, type: 'simple', color: 'yellow' },
      { x: -80, z: 40, type: 'small', color: 'red' },

      // Area pinggir kanan (nice & luxury)
      { x: 80, z: -80, type: 'nice', color: 'green' },
      { x: 80, z: -40, type: 'simple', color: 'blue' },
      { x: 80, z: 0, type: 'luxury', color: 'white' },
      { x: 80, z: 80, type: 'nice', color: 'red' },

      // Area pinggir atas (luxury zone)
      { x: -40, z: 100, type: 'luxury', color: 'cream' },
      { x: 0, z: 100, type: 'simple', color: 'red' },
      { x: 40, z: 100, type: 'luxury', color: 'gray' },

      // Area pinggir bawah (small houses)
      { x: -40, z: -100, type: 'small', color: 'blue' },
      { x: 40, z: -100, type: 'small', color: 'green' },
    ];

    houseData.forEach((house) => {
      switch (house.type) {
        case 'small':
          this.createSmallHouse(house.x, house.z, house.color);
          break;
        case 'simple':
          this.createSimpleHouse(house.x, house.z, house.color);
          break;
        case 'nice':
          this.createNiceHouse(house.x, house.z, house.color);
          break;
        case 'luxury':
          this.createLuxuryHouse(house.x, house.z, house.color);
          break;
      }
    });
  }

  // =====================
  // Pangkalan Ojek Sederhana (area, kanopi, bangku, papan nama, motor, NPC duduk)
  // =====================
  createPangkalanOjek(
    x,
    z,
    {
      scale = 1.4,
      numNPCs = 4,
      numBikes = 5,
      buildingName = 'Pangkalan Ojek',
      rotate = 0, // derajat
      characterFactory = null, // (color, scale)=>THREE.Group; opsional
    } = {}
  ) {
    const group = new THREE.Group();

    // ===== Helper: NPC dengan userData joints (fallback kalau tidak ada factory) =====
    function makeMinecraftCharacterWithJoints(color, cScale = 1) {
      const g = new THREE.Group();

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.8 * cScale, 1.2 * cScale, 0.4 * cScale),
        new THREE.MeshStandardMaterial({ color })
      );
      body.position.y = 0.6 * cScale;
      body.castShadow = true;
      g.add(body);

      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.6 * cScale, 0.6 * cScale, 0.6 * cScale),
        new THREE.MeshStandardMaterial({ color: 0xfdbcb4 })
      );
      head.position.y = 1.5 * cScale;
      head.castShadow = true;
      g.add(head);

      const armGeo = new THREE.BoxGeometry(
        0.3 * cScale,
        0.9 * cScale,
        0.3 * cScale
      );
      const armMat = new THREE.MeshStandardMaterial({ color });
      const leftArm = new THREE.Mesh(armGeo, armMat);
      leftArm.position.set(-0.6 * cScale, 0.6 * cScale, 0);
      const rightArm = new THREE.Mesh(armGeo, armMat);
      rightArm.position.set(0.6 * cScale, 0.6 * cScale, 0);
      leftArm.castShadow = rightArm.castShadow = true;
      g.add(leftArm, rightArm);

      const legGeo = new THREE.BoxGeometry(
        0.3 * cScale,
        0.9 * cScale,
        0.3 * cScale
      );
      const legMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      const rightLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.25 * cScale, -0.45 * cScale, 0);
      rightLeg.position.set(0.25 * cScale, -0.45 * cScale, 0);
      leftLeg.castShadow = rightLeg.castShadow = true;
      g.add(leftLeg, rightLeg);

      g.userData = {
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        head,
        body,
        scale: cScale,
      };
      return g;
    }

    function poseSit(character) {
      // Jika punya joints di userData, pose duduk.
      if (
        character.userData &&
        character.userData.leftLeg &&
        character.userData.rightLeg
      ) {
        const s = character.userData.scale || 1;
        const { leftLeg, rightLeg, leftArm, rightArm } = character.userData;
        [leftLeg, rightLeg].forEach((leg) => {
          leg.rotation.x = THREE.MathUtils.degToRad(90);
          leg.position.y = -0.15 * s;
          leg.position.z = 0.18 * s;
        });
        if (leftArm) leftArm.rotation.x = THREE.MathUtils.degToRad(20);
        if (rightArm) rightArm.rotation.x = THREE.MathUtils.degToRad(10);
      }
      // kalau tidak ada joints: biarkan berdiri (fallback)
    }

    // ===== Area dasar =====
    const baseGeo = new THREE.BoxGeometry(10, 0.05, 6);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x8f8f8f,
      roughness: 0.95,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, 0.025, 0);
    base.receiveShadow = true;
    group.add(base);

    // ===== Tiang & atap =====
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.4, 12);
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 0.8,
    });
    [
      [-4.6, -2.6],
      [4.6, -2.6],
      [-4.6, 2.6],
      [4.6, 2.6],
    ].forEach(([px, pz]) => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(px, 1.2, pz);
      pole.castShadow = true;
      group.add(pole);
    });

    const roofGeo = new THREE.PlaneGeometry(9.4, 5.4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x2d74ff,
      roughness: 0.65,
      side: THREE.DoubleSide,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.x = Math.PI / 2;
    roof.position.set(0, 2.5, 0);
    roof.castShadow = true;
    roof.receiveShadow = true;
    group.add(roof);

    // ===== Bangku =====
    const benchTopGeo = new THREE.BoxGeometry(3.2, 0.1, 0.4);
    const benchLegGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x8b5a2b,
      roughness: 0.85,
    });

    function makeBench(px, pz) {
      const g = new THREE.Group();
      const top = new THREE.Mesh(benchTopGeo, woodMat);
      top.position.y = 0.35;
      top.castShadow = true;
      g.add(top);
      [
        [-1.5, -0.15],
        [1.5, -0.15],
        [-1.5, 0.15],
        [1.5, 0.15],
      ].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(benchLegGeo, woodMat);
        leg.position.set(lx, 0.1, lz);
        leg.castShadow = true;
        g.add(leg);
      });
      g.position.set(px, 0, pz);
      return g;
    }
    group.add(makeBench(-2.8, 0), makeBench(0, 0), makeBench(2.8, 0));

    // ===== Papan nama: tidak terbalik =====
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 1004, 236);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 110px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(buildingName, 512, 128);

    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 0.9),
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide,
      })
    );
    sign.position.set(0, 2.9, 2.8);
    sign.rotation.y = 0; // arah teks benar
    group.add(sign);

    // ===== Motor low-poly =====
    function makeBike(color = 0x2c3e50) {
      const g = new THREE.Group();

      const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.12, 14);
      const wheelMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.9,
      });
      const wF = new THREE.Mesh(wheelGeo, wheelMat);
      wF.rotation.z = Math.PI / 2;
      wF.position.set(0.9, 0.28, 0);
      const wB = new THREE.Mesh(wheelGeo, wheelMat);
      wB.rotation.z = Math.PI / 2;
      wB.position.set(-0.6, 0.28, 0);
      wF.castShadow = wB.castShadow = true;
      g.add(wF, wB);

      const frameMat = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.2,
        roughness: 0.7,
      });
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.15, 0.18),
        frameMat
      );
      frame.position.set(0.2, 0.6, 0);
      frame.castShadow = true;
      g.add(frame);

      const front = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.5, 0.25),
        frameMat
      );
      front.position.set(1.0, 0.75, 0);
      front.castShadow = true;
      g.add(front);

      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.12, 0.28),
        new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })
      );
      seat.position.set(-0.05, 0.78, 0);
      seat.castShadow = true;
      g.add(seat);

      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8),
        new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 })
      );
      bar.rotation.z = Math.PI / 2;
      bar.position.set(1.02, 0.98, 0);
      g.add(bar);

      const stand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8),
        new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 })
      );
      stand.position.set(-0.45, 0.15, -0.1);
      stand.rotation.z = THREE.MathUtils.degToRad(20);
      g.add(stand);

      return g;
    }

    for (let i = 0; i < numBikes; i++) {
      const bike = makeBike(i % 2 ? 0x1f6feb : 0x16a34a);
      const offsetX = 3.6 - i * 1.6;
      bike.position.set(offsetX, 0, 1.9);
      bike.rotation.y = THREE.MathUtils.degToRad(-20 - (i % 3) * 6);
      bike.castShadow = true;
      group.add(bike);
    }

    // ===== NPC duduk di bangku =====
    const benchSlots = [
      { x: -3.6, z: -0.15 },
      { x: -2.8, z: 0.15 },
      { x: -0.8, z: -0.15 },
      { x: 0.2, z: 0.15 },
      { x: 1.8, z: -0.15 },
      { x: 2.6, z: 0.15 },
    ];

    for (let i = 0; i < Math.min(numNPCs, benchSlots.length); i++) {
      const slot = benchSlots[i];
      const color = i % 2 ? 0x22c55e : 0x2563eb;

      // pakai factory jika disediakan; kalau tidak, fallback
      const char = characterFactory
        ? characterFactory(color, 1.0)
        : makeMinecraftCharacterWithJoints(color, 1.0);

      // posisi "duduk": ketinggian duduk ≈ permukaan bangku (0.35) + margin
      char.position.set(slot.x, 0.45, slot.z);
      char.rotation.y = THREE.MathUtils.degToRad(180); // menghadap jalan/motor

      poseSit(char); // akan duduk jika joints tersedia
      group.add(char);
    }

    // ===== Lampu =====
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xffe08a,
        emissive: 0xffcc66,
        emissiveIntensity: 1.0,
      })
    );
    bulb.position.set(0, 2.35, 0);
    group.add(bulb);

    const light = new THREE.PointLight(0xffddaa, 1.1, 12, 2.0);
    light.position.set(0, 2.35, 0);
    light.castShadow = true;
    group.add(light);

    // ===== Place, rotate, bbox, register =====
    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);

    const bbox = new THREE.Box3().setFromObject(group);
    this.scene.add(group);
    this.buildings.push({ mesh: group, boundingBox: bbox, name });

    return group;
  }

  createPemancingan(
    x,
    z,
    {
      scale = 1.5,
      rotate = 0, // derajat
      name = 'PEMANCINGAN',
      numNPCs = 4,
      characterFactory = null,
    } = {}
  ) {
    const group = new THREE.Group();

    // ---------- Helper: Karakter fallback dgn joints ----------
    function makeMinecraftCharacterWithJoints(color, cScale = 1) {
      const g = new THREE.Group();

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.8 * cScale, 1.2 * cScale, 0.4 * cScale),
        new THREE.MeshStandardMaterial({ color })
      );
      body.position.y = 0.6 * cScale;
      body.castShadow = true;
      g.add(body);

      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.6 * cScale, 0.6 * cScale, 0.6 * cScale),
        new THREE.MeshStandardMaterial({ color: 0xfdbcb4 })
      );
      head.position.y = 1.5 * cScale;
      head.castShadow = true;
      g.add(head);

      const armGeo = new THREE.BoxGeometry(
        0.3 * cScale,
        0.9 * cScale,
        0.3 * cScale
      );
      const armMat = new THREE.MeshStandardMaterial({ color });
      const leftArm = new THREE.Mesh(armGeo, armMat);
      leftArm.position.set(-0.6 * cScale, 0.6 * cScale, 0);
      const rightArm = new THREE.Mesh(armGeo, armMat);
      rightArm.position.set(0.6 * cScale, 0.6 * cScale, 0);
      leftArm.castShadow = rightArm.castShadow = true;
      g.add(leftArm, rightArm);

      const legGeo = new THREE.BoxGeometry(
        0.3 * cScale,
        0.9 * cScale,
        0.3 * cScale
      );
      const legMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      const rightLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.25 * cScale, -0.45 * cScale, 0);
      rightLeg.position.set(0.25 * cScale, -0.45 * cScale, 0);
      leftLeg.castShadow = rightLeg.castShadow = true;
      g.add(leftLeg, rightLeg);

      g.userData = {
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        head,
        body,
        scale: cScale,
      };
      return g;
    }
    function poseSit(char) {
      if (char.userData?.leftLeg && char.userData?.rightLeg) {
        const s = char.userData.scale || 1;
        const { leftLeg, rightLeg, leftArm, rightArm } = char.userData;
        [leftLeg, rightLeg].forEach((leg) => {
          leg.rotation.x = THREE.MathUtils.degToRad(90);
          leg.position.y = -0.15 * s;
          leg.position.z = 0.18 * s;
        });
        if (leftArm) leftArm.rotation.x = THREE.MathUtils.degToRad(20);
        if (rightArm) rightArm.rotation.x = THREE.MathUtils.degToRad(10);
      }
    }

    // ---------- Area tanah ----------
    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(22, 0.05, 16),
      new THREE.MeshStandardMaterial({ color: 0x8b7e66, roughness: 0.95 })
    );
    ground.position.set(0, 0.025, 0);
    ground.receiveShadow = true;
    group.add(ground);

    // ---------- Kolam air ----------
    // Dinding kolam tipis
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x6b6b6b,
      roughness: 0.9,
    });
    function wall(w, h, d, px, py, pz) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
      m.position.set(px, py, pz);
      m.castShadow = true;
      group.add(m);
    }
    wall(18, 0.6, 0.2, 0, 0.3, -6.9); // belakang
    wall(18, 0.6, 0.2, 0, 0.3, -1.1); // depan
    wall(0.2, 0.6, 5.8, -9.0, 0.3, -4.0); // kiri
    wall(0.2, 0.6, 5.8, 9.0, 0.3, -4.0); // kanan

    // Permukaan air (kedalaman sedikit di bawah bibir kolam)
    const water = new THREE.Mesh(
      new THREE.BoxGeometry(17.6, 0.2, 5.4),
      new THREE.MeshPhysicalMaterial({
        color: 0x3aa0d8,
        metalness: 0.0,
        roughness: 0.15,
        transmission: 0.6, // semi transparan
        thickness: 0.5,
        clearcoat: 0.3,
      })
    );
    water.position.set(0, 0.15, -4.0);
    water.receiveShadow = true;
    group.add(water);

    // ---------- Jembatan/Deck kayu pinggir kolam ----------
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.08, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x7a5c3a, roughness: 0.9 })
    );
    deck.position.set(0, 0.04, -0.3);
    deck.receiveShadow = true;
    group.add(deck);

    // ---------- Gubuk bambu sederhana ----------
    // Lantai gubuk
    const hutFloor = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.1, 4),
      new THREE.MeshStandardMaterial({ color: 0x8b6b3a, roughness: 0.9 })
    );
    hutFloor.position.set(-6.5, 0.05, 4.5);
    hutFloor.receiveShadow = true;
    group.add(hutFloor);

    // Tiang gubuk
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 10);
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x705635,
      roughness: 0.9,
    });
    [
      [-9.2, 3.0],
      [-3.8, 3.0],
      [-9.2, 6.0],
      [-3.8, 6.0],
    ].forEach(([px, pz]) => {
      const p = new THREE.Mesh(poleGeo, poleMat);
      p.position.set(px, 1.15, pz);
      p.castShadow = true;
      group.add(p);
    });

    // Atap daun (kanopi)
    const roof = new THREE.Mesh(
      new THREE.PlaneGeometry(6.2, 4.2),
      new THREE.MeshStandardMaterial({
        color: 0x8ea04d,
        roughness: 0.8,
        side: THREE.DoubleSide,
      })
    );
    roof.rotation.x = Math.PI / 2;
    roof.position.set(-6.5, 2.2, 4.5);
    roof.castShadow = true;
    group.add(roof);

    // ---------- Bangku untuk pemancing ----------
    const benchTopGeo = new THREE.BoxGeometry(2.4, 0.1, 0.4);
    const benchLegGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x8b5a2b,
      roughness: 0.85,
    });
    function makeBench(px, pz) {
      const g = new THREE.Group();
      const top = new THREE.Mesh(benchTopGeo, woodMat);
      top.position.y = 0.35;
      top.castShadow = true;
      g.add(top);
      [
        [-1.1, -0.15],
        [1.1, -0.15],
        [-1.1, 0.15],
        [1.1, 0.15],
      ].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(benchLegGeo, woodMat);
        leg.position.set(lx, 0.1, lz);
        leg.castShadow = true;
        g.add(leg);
      });
      g.position.set(px, 0, pz);
      return g;
    }
    // Dua bangku di gubuk
    group.add(makeBench(-7.6, 4.0), makeBench(-5.4, 5.0));

    // ---------- NPC pemancing duduk + pancing ----------
    // Slot duduk di tepi deck
    const sitSlots = [
      { x: -6.5, z: 0.1 },
      { x: -2.0, z: 0.1 },
      { x: 2.0, z: 0.1 },
      { x: 6.5, z: 0.1 },
      // cadangan
      { x: -4.3, z: 0.1 },
      { x: 4.3, z: 0.1 },
    ];
    function makeRod() {
      const rod = new THREE.Group();
      // gagang
      const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x262626, roughness: 0.8 })
      );
      stick.position.set(0, 0.7, 0);
      stick.rotation.z = THREE.MathUtils.degToRad(-20);
      rod.add(stick);
      // senar
      const line = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 1.0, 6),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.9 })
      );
      line.position.set(0.45, 0.1, 0);
      line.rotation.z = THREE.MathUtils.degToRad(-20);
      rod.add(line);
      // pelampung kecil
      const floater = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0xff3b3b,
          emissive: 0x550000,
          emissiveIntensity: 0.2,
        })
      );
      floater.position.set(0.9, -0.35, 0);
      rod.add(floater);
      return rod;
    }
    for (let i = 0; i < Math.min(numNPCs, sitSlots.length); i++) {
      const slot = sitSlots[i];
      const col = i % 2 ? 0x22c55e : 0x2563eb;
      const char = characterFactory
        ? characterFactory(col, 1.0)
        : makeMinecraftCharacterWithJoints(col, 1.0);
      // pos duduk di tepi deck, menghadap kolam
      char.position.set(slot.x, 0.45, slot.z);
      char.rotation.y = THREE.MathUtils.degToRad(180);
      poseSit(char);
      // pancing di tangan kanan (pos relatif simpel)
      const rod = makeRod();
      rod.position.set(0.35, 1.2, 0); // relatif terhadap root char
      char.add(rod);

      group.add(char);
    }

    // ---------- Ikan di kolam (low-poly) ----------
    function makeFish(color = 0xffa500, scaleF = 0.25) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.25 * scaleF, 12, 10),
        new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
      );
      const tail = new THREE.Mesh(
        new THREE.ConeGeometry(0.16 * scaleF, 0.24 * scaleF, 10),
        new THREE.MeshStandardMaterial({ color })
      );
      body.castShadow = false;
      tail.castShadow = false;
      tail.rotation.z = Math.PI;
      tail.position.x = -0.28 * scaleF;
      g.add(body, tail);
      return g;
    }
    const fishSpots = [
      [-6, 0.12, -3.4],
      [-2, 0.1, -4.3],
      [2, 0.11, -3.8],
      [6, 0.13, -4.5],
      [-4, 0.12, -4.1],
      [4, 0.11, -3.6],
    ];
    fishSpots.forEach((p, idx) => {
      const f = makeFish(idx % 2 ? 0xaaaaaa : 0xffa500, 0.9);
      f.position.set(p[0], p[1], p[2]);
      f.rotation.y = THREE.MathUtils.degToRad(idx * 60);
      group.add(f);
    });

    // ---------- Papan nama kanvas (orientasi benar) ----------
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 1004, 236);

    // Auto-resize font agar tidak kepanjangan
    const maxTextWidth = 900;
    let fontSize = 90; // mulai kecil biar aman
    while (fontSize > 40) {
      ctx.font = `bold ${fontSize}px Arial`;
      if (ctx.measureText(name).width <= maxTextWidth) break;
      fontSize -= 4;
    }
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 512, 128);

    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    // ---------- Lampu malam ----------
    const light = new THREE.PointLight(0xffe3b1, 1.0, 20, 2.0);
    light.position.set(-6.5, 2.3, 4.5);
    light.castShadow = true;
    group.add(light);

    // ---------- Penempatan, rotasi, skala ----------
    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);

    // ---------- BBox & register ----------
    const bbox = new THREE.Box3().setFromObject(group);
    this.scene.add(group);
    this.buildings.push({
      mesh: group,
      boundingBox: bbox,
      name: 'Pemancingan',
    });

    return group;
  }

  createCoffeeShop(
    x,
    z,
    {
      scale = 1.5,
      rotate = 0,
      name = 'LANGIT SENJA COFFEE',
      numCustomers = 4,
      characterFactory = null,
    } = {}
  ) {
    const group = new THREE.Group();

    // --- Helpers: karakter fallback & pose ---
    function makeMinecraftCharacterWithJoints(color, cScale = 1) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.8 * cScale, 1.2 * cScale, 0.4 * cScale),
        new THREE.MeshStandardMaterial({ color })
      );
      body.position.y = 0.6 * cScale;
      body.castShadow = true;
      g.add(body);

      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.6 * cScale, 0.6 * cScale, 0.6 * cScale),
        new THREE.MeshStandardMaterial({ color: 0xfdbcb4 })
      );
      head.position.y = 1.5 * cScale;
      head.castShadow = true;
      g.add(head);

      const armGeo = new THREE.BoxGeometry(
        0.3 * cScale,
        0.9 * cScale,
        0.3 * cScale
      );
      const armMat = new THREE.MeshStandardMaterial({ color });
      const leftArm = new THREE.Mesh(armGeo, armMat);
      leftArm.position.set(-0.6 * cScale, 0.6 * cScale, 0);
      const rightArm = new THREE.Mesh(armGeo, armMat);
      rightArm.position.set(0.6 * cScale, 0.6 * cScale, 0);
      leftArm.castShadow = rightArm.castShadow = true;
      g.add(leftArm, rightArm);

      const legGeo = new THREE.BoxGeometry(
        0.3 * cScale,
        0.9 * cScale,
        0.3 * cScale
      );
      const legMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      const rightLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.25 * cScale, -0.45 * cScale, 0);
      rightLeg.position.set(0.25 * cScale, -0.45 * cScale, 0);
      leftLeg.castShadow = rightLeg.castShadow = true;
      g.add(leftLeg, rightLeg);

      g.userData = {
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        head,
        body,
        scale: cScale,
      };
      return g;
    }
    function poseSit(char) {
      if (char.userData?.leftLeg && char.userData?.rightLeg) {
        const s = char.userData.scale || 1;
        const { leftLeg, rightLeg, leftArm, rightArm } = char.userData;
        [leftLeg, rightLeg].forEach((leg) => {
          leg.rotation.x = THREE.MathUtils.degToRad(90);
          leg.position.y = -0.15 * s;
          leg.position.z = 0.18 * s;
        });
        if (leftArm) leftArm.rotation.x = THREE.MathUtils.degToRad(15);
        if (rightArm) rightArm.rotation.x = THREE.MathUtils.degToRad(10);
      }
    }
    function poseBarista(char) {
      // tangan sedikit terangkat seolah menyeduh
      if (char.userData?.leftArm)
        char.userData.leftArm.rotation.x = THREE.MathUtils.degToRad(-20);
      if (char.userData?.rightArm)
        char.userData.rightArm.rotation.x = THREE.MathUtils.degToRad(-10);
    }

    // --- Lantai/tapak toko ---
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.08, 10),
      new THREE.MeshStandardMaterial({ color: 0x7b7b7b, roughness: 0.95 })
    );
    pad.position.set(0, 0.04, 0);
    pad.receiveShadow = true;
    group.add(pad);

    // --- Bangunan utama (kotak interior) ---
    const shell = new THREE.Mesh(
      new THREE.BoxGeometry(12, 3.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: 0.9 })
    );
    shell.position.set(0, 1.6, 0);
    shell.castShadow = true;
    shell.receiveShadow = true;
    group.add(shell);

    // --- Fasad kaca depan (frame + kaca) ---
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f3f,
      roughness: 0.8,
      metalness: 0.1,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.7,
      roughness: 0.1,
      thickness: 0.4,
      transparent: true,
    });

    // Pilar sisi (frame)
    const frameL = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2.4, 0.2),
      frameMat
    );
    frameL.position.set(-5.8, 1.2, 4.1);
    const frameR = frameL.clone();
    frameR.position.x = 5.8;
    const frameTop = new THREE.Mesh(
      new THREE.BoxGeometry(11.6, 0.2, 0.2),
      frameMat
    );
    frameTop.position.set(0, 2.3, 4.1);
    group.add(frameL, frameR, frameTop);

    // Panel kaca besar
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(11.2, 2.0, 0.06),
      glassMat
    );
    glass.position.set(0, 1.2, 4.1);
    glass.castShadow = false;
    glass.receiveShadow = true;
    group.add(glass);

    // --- Pintu kaca geser sederhana ---
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 2.0, 0.06),
      glassMat
    );
    door.position.set(-2.5, 1.2, 4.11);
    group.add(door);

    // --- Counter bar di dalam ---
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(6, 1.0, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x4e382a, roughness: 0.85 })
    );
    counter.position.set(0, 0.5, 1.5);
    counter.castShadow = true;
    group.add(counter);

    // --- Mesin espresso low-poly ---
    const machineBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.5, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 })
    );
    machineBase.position.set(-1.5, 1.0, 1.0);
    const machineTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.2, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6 })
    );
    machineTop.position.set(-1.5, 1.3, 1.0);
    const hopper = new THREE.Mesh(
      new THREE.ConeGeometry(0.25, 0.35, 12),
      new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.4,
        metalness: 0.2,
      })
    );
    hopper.position.set(-0.9, 1.5, 1.0);
    group.add(machineBase, machineTop, hopper);

    // --- Rak cangkir belakang bar ---
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 0.15, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x3b2a20, roughness: 0.85 })
    );
    shelf.position.set(0, 1.6, 0.4);
    group.add(shelf);

    // --- Kursi stool di counter (3) ---
    function makeStool(px) {
      const s = new THREE.Group();
      const seat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.06, 16),
        new THREE.MeshStandardMaterial({ color: 0x6b4b3a, roughness: 0.85 })
      );
      seat.position.y = 0.6;
      s.add(seat);
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.6, 12),
        new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 })
      );
      leg.position.y = 0.3;
      s.add(leg);
      s.position.set(px, 0, 2.4);
      return s;
    }
    group.add(makeStool(-1.5), makeStool(0), makeStool(1.5));

    // --- Meja kecil di luar + kursi (2 set) ---
    function makeOutdoorSet(px, pz) {
      const g = new THREE.Group();
      const tbl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.06, 16),
        new THREE.MeshStandardMaterial({ color: 0x6b4b3a, roughness: 0.85 })
      );
      tbl.position.y = 0.7;
      g.add(tbl);
      const tblLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.7, 12),
        new THREE.MeshStandardMaterial({ color: 0x555555 })
      );
      tblLeg.position.y = 0.35;
      g.add(tblLeg);
      // 2 kursi kecil
      function chair(angle) {
        const c = new THREE.Group();
        const seat = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.22, 0.05, 12),
          new THREE.MeshStandardMaterial({ color: 0x3f3f3f, roughness: 0.85 })
        );
        seat.position.y = 0.45;
        c.add(seat);
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.45, 10),
          new THREE.MeshStandardMaterial({ color: 0x666666 })
        );
        leg.position.y = 0.225;
        c.add(leg);
        c.rotation.y = angle;
        return c;
      }
      const c1 = chair(THREE.MathUtils.degToRad(45));
      c1.position.set(0.8, 0, 0.2);
      const c2 = chair(THREE.MathUtils.degToRad(-135));
      c2.position.set(-0.8, 0, -0.2);
      g.add(c1, c2);
      g.position.set(px, 0, pz);
      return g;
    }
    group.add(makeOutdoorSet(-3.5, 5.5), makeOutdoorSet(3.5, 5.0));

    // --- Papan nama / signage kanvas (auto fit + orientasi benar) ---
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 16;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    // auto font-size agar muat
    const maxText = 1800;
    let fontSize = 220;
    while (fontSize > 80) {
      ctx.font = `bold ${fontSize}px Arial`;
      if (ctx.measureText(name).width <= maxText) break;
      fontSize -= 10;
    }
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(7.5, 1.8),
      new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide,
      })
    );
    sign.position.set(0, 3.0, 4.3);
    sign.rotation.y = 0; // menghadap depan
    group.add(sign);

    // --- NPC Barista (di belakang bar) ---
    const barista = characterFactory
      ? characterFactory(0xb45309, 1.0)
      : makeMinecraftCharacterWithJoints(0xb45309, 1.0);
    barista.position.set(0.5, 0, 0.8);
    barista.rotation.y = THREE.MathUtils.degToRad(180);
    poseBarista(barista);
    group.add(barista);

    // --- NPC Pelanggan duduk (di stool & outdoor) ---
    const seats = [
      // di dalam (stool)
      { x: -1.5, y: 0.6, z: 2.4, face: 180 },
      { x: 0.0, y: 0.6, z: 2.4, face: 180 },
      { x: 1.5, y: 0.6, z: 2.4, face: 180 },
      // di luar (dua set meja)
      { x: -3.5 + 0.8, y: 0.45, z: 5.5 + 0.2, face: -135 },
      { x: 3.5 - 0.8, y: 0.45, z: 5.0 - 0.2, face: 45 },
    ];
    for (let i = 0; i < Math.min(numCustomers, seats.length); i++) {
      const s = seats[i];
      const c = characterFactory
        ? characterFactory(i % 2 ? 0x2563eb : 0x22c55e, 1.0)
        : makeMinecraftCharacterWithJoints(i % 2 ? 0x2563eb : 0x22c55e, 1.0);
      c.position.set(s.x, s.y, s.z);
      c.rotation.y = THREE.MathUtils.degToRad(s.face);
      poseSit(c);
      group.add(c);
    }

    // --- Lampu hangat (dalam + luar) ---
    const warmInside = new THREE.PointLight(0xffe3b1, 1.2, 18, 2.0);
    warmInside.position.set(0, 2.6, 1.8);
    warmInside.castShadow = true;
    group.add(warmInside);

    const warmOutside = new THREE.PointLight(0xffd7a1, 0.9, 12, 2.0);
    warmOutside.position.set(0, 3.1, 4.5);
    group.add(warmOutside);

    // --- Penempatan, rotasi, skala, bbox ---
    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);

    const bbox = new THREE.Box3().setFromObject(group);
    this.scene.add(group);
    this.buildings.push({
      mesh: group,
      boundingBox: bbox,
      name: 'Coffee Shop',
    });

    return group;
  }

  createConstructionSite(
    x,
    z,
    {
      scale = 1.6,
      rotate = 0,
      floors = 3,
      includeCrane = true,
      name = 'PROYEK PEMBANGUNAN',
    } = {}
  ) {
    const group = new THREE.Group();

    // --- Tapak proyek (tanah/beton) ---
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(24, 0.08, 18),
      new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.95 })
    );
    pad.position.set(0, 0.04, 0);
    pad.receiveShadow = true;
    group.add(pad);

    // --- Pagar proyek sederhana (tiang + panel) ---
    const fenceMat = new THREE.MeshStandardMaterial({
      color: 0x3e4a56,
      roughness: 0.8,
    });
    function fence(x1, z1, x2, z2) {
      const len = Math.hypot(x2 - x1, z2 - z1);
      const ang = Math.atan2(z2 - z1, x2 - x1);
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(len, 1.4, 0.1),
        fenceMat
      );
      rail.position.set((x1 + x2) / 2, 0.75, (z1 + z2) / 2);
      rail.rotation.y = -ang;
      group.add(rail);
    }
    fence(-11.5, -8.5, 11.5, -8.5);
    fence(11.5, -8.5, 11.5, 8.5);
    fence(11.5, 8.5, -11.5, 8.5);
    fence(-11.5, 8.5, -11.5, -8.5);

    // --- Struktur gedung kasar: kolom & pelat lantai sebagian ---
    const colMat = new THREE.MeshStandardMaterial({
      color: 0x7c7c7c,
      roughness: 0.9,
    });
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x9a9a9a,
      roughness: 0.95,
    });
    const grid = { w: 14, d: 10 }; // bentang bangunan
    const colPos = [
      [-grid.w / 2, -grid.d / 2],
      [grid.w / 2, -grid.d / 2],
      [-grid.w / 2, grid.d / 2],
      [grid.w / 2, grid.d / 2],
      [0, -grid.d / 2],
      [0, grid.d / 2],
      [-grid.w / 2, 0],
      [grid.w / 2, 0],
    ];
    for (let f = 0; f < floors; f++) {
      const levelY = 0.08 + f * 2.8;
      // kolom
      colPos.forEach(([cx, cz]) => {
        const col = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 2.8, 0.35),
          colMat
        );
        col.position.set(cx, levelY + 1.4, cz);
        col.castShadow = true;
        group.add(col);
        // besi tulangan yang menonjol di atas lantai paling atas
        if (f === floors - 1) {
          const rebar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8),
            new THREE.MeshStandardMaterial({
              color: 0x444444,
              roughness: 0.7,
              metalness: 0.2,
            })
          );
          rebar.position.set(cx, levelY + 2.8 + 0.4, cz);
          group.add(rebar);
        }
      });
      // pelat lantai parsial (sebagian area masih bolong)
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(grid.w, 0.25, grid.d),
        slabMat
      );
      slab.position.set(0, levelY + 2.8, 0);
      slab.castShadow = true;
      slab.receiveShadow = true;
      group.add(slab);

      // lubang void di tepi (simulasi area belum dicor) -> pakai plat kecil yang menutup sebagian
      const patch = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 0.26, 3.2),
        slabMat
      );
      patch.position.set(
        -grid.w / 2 + 2.5,
        levelY + 2.8 + 0.02,
        grid.d / 2 - 1.8
      );
      group.add(patch);
    }

    // --- Scaffolding (perancah) di sisi fasad depan ---
    const scaffMat = new THREE.MeshStandardMaterial({
      color: 0x6b6b6b,
      roughness: 0.6,
      metalness: 0.2,
    });
    for (let y = 0; y < Math.max(2, floors); y++) {
      for (let i = 0; i < 4; i++) {
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, 2.6, 10),
          scaffMat
        );
        pole.position.set(
          -grid.w / 2 - 1.2 + i * 0.8,
          0.08 + 1.3 + y * 2.8,
          -grid.d / 2 - 0.7
        );
        group.add(pole);
      }
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(3.0, 0.1, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x7a5c3a, roughness: 0.9 })
      );
      plank.position.set(
        -grid.w / 2 - 0.6,
        0.08 + y * 2.8 + 2.2,
        -grid.d / 2 - 0.7
      );
      group.add(plank);
    }

    // --- Material menumpuk: palet bata & semen ---
    function makeBrickPile(px, pz) {
      const g = new THREE.Group();
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 5; c++) {
          const b = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.2, 0.25),
            new THREE.MeshStandardMaterial({ color: 0xb55239, roughness: 0.9 })
          );
          b.position.set(c * 0.52, r * 0.22, 0);
          g.add(b);
        }
      }
      g.position.set(px, 0.1, pz);
      return g;
    }
    group.add(makeBrickPile(8, 5), makeBrickPile(6, 6.5));

    const cement = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.5, 12),
      new THREE.MeshStandardMaterial({ color: 0xcfcfcf, roughness: 0.9 })
    );
    cement.position.set(-8, 0.25, 6.5);
    group.add(cement);

    // --- Tower crane sederhana (opsional) ---
    if (includeCrane) {
      const mast = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, floors * 3.1, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xf0b429, roughness: 0.6 })
      );
      mast.position.set(grid.w / 2 + 2.2, floors * 1.55, 0);
      mast.castShadow = true;
      group.add(mast);

      const jib = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.25, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xf0b429, roughness: 0.6 })
      );
      jib.position.set(grid.w / 2 + 2.2 + 4, floors * 3.1 - 0.2, 0);
      group.add(jib);

      const counter = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.8, 0.8),
        new THREE.MeshStandardMaterial({ color: 0xb08117, roughness: 0.7 })
      );
      counter.position.set(grid.w / 2 + 2.2 - 1.4, floors * 3.1 - 0.2, 0);
      group.add(counter);

      const hookLine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 2.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 })
      );
      hookLine.position.set(grid.w / 2 + 2.2 + 6.8, floors * 3.1 - 1.3, 0);
      group.add(hookLine);

      const hook = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.04, 8, 12, Math.PI * 1.2),
        new THREE.MeshStandardMaterial({
          color: 0x444444,
          metalness: 0.2,
          roughness: 0.7,
        })
      );
      hook.position.set(grid.w / 2 + 2.2 + 6.8, floors * 3.1 - 2.6, 0);
      hook.rotation.x = Math.PI / 2;
      group.add(hook);
    }

    // --- Papan proyek (kanvas, orientasi benar) ---
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#102a43';
    ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = '#62b0e8';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 1004, 236);
    // auto-fit teks
    const maxText = 900;
    let fs = 90;
    while (fs > 40) {
      ctx.font = `bold ${fs}px Arial`;
      if (ctx.measureText(name).width <= maxText) break;
      fs -= 4;
    }
    ctx.fillStyle = '#f0f4f8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 512, 128);
    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    // --- Lighting kerja malam (sedikit warm) ---
    const workLight = new THREE.PointLight(0xffe3b1, 0.9, 20, 2.0);
    workLight.position.set(-9, 3.2, -7.5);
    group.add(workLight);

    // --- Transform & register ---
    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);

    const bbox = new THREE.Box3().setFromObject(group);
    this.scene.add(group);
    this.buildings.push({
      mesh: group,
      boundingBox: bbox,
      name: 'Construction Site',
    });
    return group;
  }

  createLapanganBolaJalanan(
    x,
    z,
    {
      scale = 1.4,
      rotate = 0,
      size = { length: 28, width: 16 },
      numPlayers = 8,
      teamAColor = 0x2563eb,
      teamBColor = 0x22c55e,
      characterFactory = null,
      registerGoalColliders = true,
    } = {}
  ) {
    const group = new THREE.Group();

    // ---------- Helper NPC fallback dengan joints ----------
    function makeMinecraftCharacterWithJoints(color, cScale = 1) {
      const g = new THREE.Group();

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.8 * cScale, 1.2 * cScale, 0.4 * cScale),
        new THREE.MeshStandardMaterial({ color })
      );
      body.position.y = 0.6 * cScale;
      body.castShadow = true;
      g.add(body);

      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.6 * cScale, 0.6 * cScale, 0.6 * cScale),
        new THREE.MeshStandardMaterial({ color: 0xfdbcb4 })
      );
      head.position.y = 1.5 * cScale;
      head.castShadow = true;
      g.add(head);

      const armGeo = new THREE.BoxGeometry(
        0.3 * cScale,
        0.9 * cScale,
        0.3 * cScale
      );
      const armMat = new THREE.MeshStandardMaterial({ color });
      const leftArm = new THREE.Mesh(armGeo, armMat);
      leftArm.position.set(-0.6 * cScale, 0.6 * cScale, 0);
      const rightArm = new THREE.Mesh(armGeo, armMat);
      rightArm.position.set(0.6 * cScale, 0.6 * cScale, 0);
      leftArm.castShadow = rightArm.castShadow = true;
      g.add(leftArm, rightArm);

      const legGeo = new THREE.BoxGeometry(
        0.3 * cScale,
        0.9 * cScale,
        0.3 * cScale
      );
      const legMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.25 * cScale, -0.45 * cScale, 0);
      const rightLeg = new THREE.Mesh(legGeo, legMat);
      rightLeg.position.set(0.25 * cScale, -0.45 * cScale, 0);
      leftLeg.castShadow = rightLeg.castShadow = true;
      g.add(leftLeg, rightLeg);

      g.userData = {
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        body,
        head,
        scale: cScale,
      };
      return g;
    }
    // Pose lari
    function poseRun(char, strideDeg = 25) {
      const u = char.userData;
      if (!u) return;
      const s = u.scale || 1;
      if (u.leftLeg && u.rightLeg) {
        u.leftLeg.rotation.x = THREE.MathUtils.degToRad(strideDeg);
        u.rightLeg.rotation.x = THREE.MathUtils.degToRad(-strideDeg);
        u.leftLeg.position.y = -0.35 * s;
        u.rightLeg.position.y = -0.35 * s;
      }
      if (u.leftArm && u.rightArm) {
        u.leftArm.rotation.x = THREE.MathUtils.degToRad(-strideDeg);
        u.rightArm.rotation.x = THREE.MathUtils.degToRad(strideDeg);
      }
      if (u.body) u.body.rotation.z = THREE.MathUtils.degToRad(3);
    }
    // Pose nendang
    function poseKick(char) {
      const u = char.userData;
      if (!u) return;
      const s = u.scale || 1;
      if (u.rightLeg) {
        u.rightLeg.rotation.x = THREE.MathUtils.degToRad(65);
        u.rightLeg.position.y = -0.15 * s;
        u.rightLeg.position.z = 0.18 * s;
      }
      if (u.leftLeg) {
        u.leftLeg.rotation.x = THREE.MathUtils.degToRad(-10);
        u.leftLeg.position.y = -0.4 * s;
      }
      if (u.rightArm) u.rightArm.rotation.x = THREE.MathUtils.degToRad(-15);
      if (u.leftArm) u.leftArm.rotation.x = THREE.MathUtils.degToRad(20);
    }

    // ---------- Ukuran ----------
    const L = size.length;
    const W = size.width;

    // ---------- Aspal lapangan ----------
    const asphalt = new THREE.Mesh(
      new THREE.BoxGeometry(L + 4, 0.05, W + 4),
      new THREE.MeshStandardMaterial({ color: 0x2f2f2f, roughness: 0.95 })
    );
    asphalt.position.set(0, 0.025, 0);
    asphalt.receiveShadow = true;
    group.add(asphalt);

    // ---------- Garis lapangan (kapur) ----------
    const lineMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
    });
    function line(w, h, d, px, py, pz) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lineMat);
      m.position.set(px, py, pz);
      m.receiveShadow = true;
      group.add(m);
    }
    // Pinggir
    line(L, 0.06, 0.12, 0, 0.03, -W / 2); // bawah
    line(L, 0.06, 0.12, 0, 0.03, W / 2); // atas
    line(0.12, 0.06, W, -L / 2, 0.03, 0); // kiri
    line(0.12, 0.06, W, L / 2, 0.03, 0); // kanan
    // Tengah
    line(0.12, 0.06, W, 0, 0.03, 0); // garis tengah
    // Lingkaran tengah (segmen)
    const r = 2.2,
      seg = 24;
    for (let i = 0; i < seg; i++) {
      const th = (i / seg) * Math.PI * 2;
      const th2 = ((i + 1) / seg) * Math.PI * 2;
      const mx = ((Math.cos(th) + Math.cos(th2)) * r) / 2;
      const mz = ((Math.sin(th) + Math.sin(th2)) * r) / 2;
      const dx = Math.cos(th2) - Math.cos(th);
      const dz = Math.sin(th2) - Math.sin(th);
      const len = Math.hypot(dx, dz) * r;
      const piece = new THREE.Mesh(
        new THREE.BoxGeometry(len, 0.06, 0.09),
        lineMat
      );
      piece.position.set(mx, 0.03, mz);
      piece.rotation.y = Math.atan2(dz, dx);
      group.add(piece);
    }

    // ---------- Gawang kiri & kanan ----------
    // --- Gawang yang lebih akurat (frame 3D + net)
    function makeGoal({
      width = 3.0, // lebar mulut gawang
      height = 2.0, // tinggi mistar
      depth = 1.0, // kedalaman gawang
      tube = 0.07, // diameter pipa
    } = {}) {
      const g = new THREE.Group();

      const postMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.55,
        metalness: 0.05,
      });

      // helper silinder
      const cyl = (r, h, mat) =>
        new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), mat);

      // FRONT FRAME (mulut gawang)
      const L = width,
        H = height,
        D = depth,
        R = tube;

      // tiang kiri & kanan (vertikal)
      const leftPost = cyl(R, H, postMat);
      leftPost.position.set(-L / 2, H / 2, 0);
      const rightPost = cyl(R, H, postMat);
      rightPost.position.set(L / 2, H / 2, 0);

      // mistar (horizontal atas)
      const crossbar = cyl(R, L, postMat);
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0, H, 0);

      // palang bawah depan (opsional: pengikat bawah)
      const frontBottom = cyl(R, L, postMat);
      frontBottom.rotation.z = Math.PI / 2;
      frontBottom.position.set(0, R / 2, 0);

      g.add(leftPost, rightPost, crossbar, frontBottom);

      // DEPTH BARS (kiri-kanan: maju ke belakang)
      const sideTopL = cyl(R, D, postMat);
      sideTopL.rotation.x = Math.PI / 2;
      sideTopL.rotation.z = 0;
      sideTopL.position.set(-L / 2, H, -D / 2);

      const sideTopR = sideTopL.clone();
      sideTopR.position.x = L / 2;

      const sideBotL = cyl(R, D, postMat);
      sideBotL.rotation.x = Math.PI / 2;
      sideBotL.position.set(-L / 2, R / 2, -D / 2);

      const sideBotR = sideBotL.clone();
      sideBotR.position.x = L / 2;

      g.add(sideTopL, sideTopR, sideBotL, sideBotR);

      // BACK FRAME (belakang)
      const backLeft = cyl(R, H, postMat);
      backLeft.position.set(-L / 2, H / 2, -D);
      const backRight = cyl(R, H, postMat);
      backRight.position.set(L / 2, H / 2, -D);

      const backTop = cyl(R, L, postMat);
      backTop.rotation.z = Math.PI / 2;
      backTop.position.set(0, H, -D);

      const backBottom = cyl(R, L, postMat);
      backBottom.rotation.z = Math.PI / 2;
      backBottom.position.set(0, R / 2, -D);

      g.add(backLeft, backRight, backTop, backBottom);

      // NET (sederhana: plane wireframe transparan)
      const netMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        wireframe: true,
      });

      // belakang
      const netBack = new THREE.Mesh(
        new THREE.PlaneGeometry(L - R * 2, H - R, 8, 6),
        netMat
      );
      netBack.position.set(0, H / 2, -D);
      // sisi kiri & kanan
      const netSideL = new THREE.Mesh(
        new THREE.PlaneGeometry(D, H - R, 6, 6),
        netMat
      );
      netSideL.rotation.y = Math.PI / 2;
      netSideL.position.set(-L / 2, H / 2, -D / 2);

      const netSideR = netSideL.clone();
      netSideR.position.x = L / 2;

      // atap
      const netTop = new THREE.Mesh(
        new THREE.PlaneGeometry(L - R * 2, D, 10, 6),
        netMat
      );
      netTop.rotation.x = Math.PI / 2;
      netTop.position.set(0, H, -D / 2);

      g.add(netBack, netSideL, netSideR, netTop);

      // origin gawang = mulut gawang (garis gawang), center di tengah mulut
      return g;
    }

    // Gawang kiri — menghadap ke kanan (ke arah tengah lapangan)
    const goalLeft = makeGoal({
      width: 3.0,
      height: 2.0,
      depth: 1.0,
      tube: 0.07,
    });
    goalLeft.position.set(-L / 2 + 0.6, 0, 0);
    goalLeft.rotation.y = 33; // 🔁 hadap kanan (ke tengah lapangan)
    group.add(goalLeft);

    // Gawang kanan — menghadap ke kiri (ke arah tengah lapangan)
    const goalRight = makeGoal({
      width: 3.0,
      height: 2.0,
      depth: 1.0,
      tube: 0.07,
    });
    goalRight.position.set(L / 2 - 0.6, 0, 0);
    goalRight.rotation.y = 4.65; // 🔁 hadap kiri (ke tengah lapangan)
    group.add(goalRight);

    // ---------- Bola ----------
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
    );
    ball.position.set(0, 0.22, 0);
    ball.castShadow = true;
    group.add(ball);

    // ---------- Pemain ----------
    const total = Math.max(2, numPlayers);
    const perTeam = Math.floor(total / 2);
    const spawnRadiusX = L / 2 - 3;
    const spawnRadiusZ = W / 2 - 2;

    function spawnPlayer(isTeamA, idx) {
      const color = isTeamA ? teamAColor : teamBColor;
      const p = characterFactory
        ? characterFactory(color, 1.0)
        : makeMinecraftCharacterWithJoints(color, 1.0);

      const side = isTeamA ? -1 : 1;
      const px = THREE.MathUtils.lerp(
        -spawnRadiusX * side,
        -2 * side,
        Math.random()
      );
      const pz = THREE.MathUtils.lerp(
        -spawnRadiusZ,
        spawnRadiusZ,
        Math.random()
      );
      p.position.set(px, 0, pz);

      const angleToCenter = Math.atan2(0 - pz, 0 - px);
      p.rotation.y = angleToCenter;

      if (idx === 0 && !isTeamA) {
        p.position.set(0.6, 0, 0.4);
        p.rotation.y = Math.atan2(0 - 0.4, 0 - 0.6);
        poseKick(p);
      } else if (idx === 0 && isTeamA) {
        p.position.set(-1.0, 0, -0.5);
        p.rotation.y = Math.atan2(0 - -0.5, 0 - -1.0);
        poseRun(p, 30);
      } else {
        poseRun(p, 20 + Math.random() * 10);
      }

      group.add(p);
    }
    for (let i = 0; i < perTeam; i++) spawnPlayer(true, i);
    for (let i = 0; i < perTeam; i++) spawnPlayer(false, i);

    const lightMid = new THREE.PointLight(0xffe3b1, 0.8, 22, 2.0);
    lightMid.position.set(0, 4.5, 0);
    group.add(lightMid);

    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);

    this.scene.add(group);

    if (registerGoalColliders) {
      [goalLeft, goalRight].forEach((goal, i) => {
        goal.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(goal);
        this.buildings.push({
          mesh: goal,
          boundingBox: bbox,
          name: i === 0 ? 'Goal Kiri' : 'Goal Kanan',
        });
      });
    }

    return group;
  }
}
