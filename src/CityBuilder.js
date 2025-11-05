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
    // this.createTambalBan(0, 0);
    // this.createPosRonda(0, 0);
    this.createKapsterBox(-50, -120, { scale: 1.3, rotate: 270 });
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

  createPosRonda(
    x,
    z,
    {
      scale = 1.3,
      rotate = 0,
      characterFactory = null,
      npcScale = 0.9,
      name = 'Pos Ronda',
    } = {}
  ) {
    const group = new THREE.Group();

    // ================= Helpers =================
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

    function poseSit(char) {
      if (!char.userData) return;
      const s = char.userData.scale || 1;
      const { leftLeg, rightLeg, leftArm, rightArm, body } = char.userData;

      // duduk santai
      if (leftLeg && rightLeg) {
        leftLeg.rotation.x = THREE.MathUtils.degToRad(85);
        rightLeg.rotation.x = THREE.MathUtils.degToRad(85);
        leftLeg.position.y = -0.15 * s;
        rightLeg.position.y = -0.15 * s;
        leftLeg.position.z = 0.17 * s;
        rightLeg.position.z = 0.17 * s;
      }
      if (leftArm) leftArm.rotation.x = THREE.MathUtils.degToRad(-5);
      if (rightArm) rightArm.rotation.x = THREE.MathUtils.degToRad(-8);
      if (body)
        body.rotation.z = THREE.MathUtils.degToRad(Math.random() * 2 - 1);
    }

    function makeGlass(colorHex = 0x6f4e37) {
      // kopi coklat
      const g = new THREE.Group();
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.055, 0.1, 14),
        new THREE.MeshStandardMaterial({
          color: colorHex,
          roughness: 0.55,
          metalness: 0.05,
        })
      );
      cup.position.y = 0.05;
      g.add(cup);
      const foam = new THREE.Mesh(
        new THREE.CircleGeometry(0.048, 16),
        new THREE.MeshStandardMaterial({ color: 0x2e1a12, roughness: 0.6 })
      );
      foam.rotation.x = -Math.PI / 2;
      foam.position.y = 0.1;
      g.add(foam);
      return g;
    }

    // ================= Lantai / panggung pos =================
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, 0.15, 6.2),
      new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.85 })
    );
    deck.position.set(0, 0.075, 0);
    deck.receiveShadow = true;
    group.add(deck);

    // paving/beton tipis di bawah panggung
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.06, 8),
      new THREE.MeshStandardMaterial({ color: 0xa7a7a7, roughness: 0.95 })
    );
    pad.position.set(0, 0.03, 0);
    pad.receiveShadow = true;
    group.add(pad);

    // ================= Struktur pos: tiang + atap seng =================
    const hut = new THREE.Group();

    // hitung ketinggian tiang dari permukaan deck → underside atap
    const groundTopY = deck.position.y + deck.geometry.parameters.height / 2; // 0.075
    const roofY = 2.6; // center atap
    const roofHalfH = 0.08; // half thickness atap
    const canopyUnderY = roofY - roofHalfH; // underside
    const eps = 0.01;
    const poleH = Math.max(0.8, canopyUnderY - groundTopY - eps);

    // tiang (nempel deck)
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, poleH, 12);
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x6b7280,
      roughness: 0.6,
      metalness: 0.15,
    });
    [
      [-2.8, -2.8],
      [2.8, -2.8],
      [-2.8, 2.8],
      [2.8, 2.8],
    ].forEach(([px, pz]) => {
      const p = new THREE.Mesh(poleGeo, poleMat);
      p.position.set(px, groundTopY + poleH / 2, pz);
      p.castShadow = true;
      p.receiveShadow = true;
      hut.add(p);
    });

    // balok pengikat atas
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x5a4632,
      roughness: 0.8,
    });
    const beamX = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, 0.1, 0.12),
      beamMat
    );
    beamX.position.set(0, canopyUnderY - 0.05, -2.8);
    const beamX2 = beamX.clone();
    beamX2.position.z = 2.8;
    const beamZ = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.1, 6.2),
      beamMat
    );
    beamZ.position.set(-2.8, canopyUnderY - 0.05, 0);
    const beamZ2 = beamZ.clone();
    beamZ2.position.x = 2.8;
    hut.add(beamX, beamX2, beamZ, beamZ2);

    // atap seng datar sedikit miring
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(6.6, 0.16, 6.6),
      new THREE.MeshStandardMaterial({
        color: 0x2c3e50,
        roughness: 0.6,
        metalness: 0.2,
      })
    );
    roof.position.set(0, roofY, 0);
    roof.rotation.x = THREE.MathUtils.degToRad(-3);
    roof.castShadow = true;
    roof.receiveShadow = true;
    hut.add(roof);

    // list tepi atap
    const drip = new THREE.Mesh(
      new THREE.BoxGeometry(6.7, 0.06, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
    );
    drip.position.set(0, roofY - 0.06, -3.25);
    hut.add(drip);

    // pagar rendah (setengah)
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x7b5737,
      roughness: 0.85,
    });
    const railH = 0.7;
    const railTh = 0.08;
    const railFront = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, railH, railTh),
      railMat
    );
    railFront.position.set(0, 0.35 + groundTopY, 3.0);
    const railBack = railFront.clone();
    railBack.position.z = -3.0;
    const railLeft = new THREE.Mesh(
      new THREE.BoxGeometry(railTh, railH, 6.2),
      railMat
    );
    railLeft.position.set(-3.0, 0.35 + groundTopY, 0);
    const railRight = railLeft.clone();
    railRight.position.x = 3.0;
    hut.add(railFront, railBack, railLeft, railRight);

    // papan nama "Pos Ronda"
    function createTextPlane(
      text,
      {
        font = 'bold 56px Inter, Arial, sans-serif',
        fg = '#FFFFFF',
        bg = 'rgba(0,0,0,0)',
        w = 1024,
        h = 256,
        maxWidthPx = 920,
      } = {}
    ) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      let fs = 56;
      const fam = 'Inter, Arial, sans-serif';
      while (fs >= 24) {
        ctx.font = `bold ${fs}px ${fam}`;
        if (ctx.measureText(text).width <= maxWidthPx) break;
        fs -= 2;
      }
      ctx.font = `bold ${fs}px ${fam}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = fg;
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 8;
      ctx.fillText(text, w / 2, h / 2);

      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 8;
      tex.needsUpdate = true;

      const planeH = 0.45;
      const planeW = planeH * (w / h);
      const geo = new THREE.PlaneGeometry(planeW, planeH);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
      return new THREE.Mesh(geo, mat);
    }

    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.55, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 })
    );
    signBoard.position.set(0, roofY - 0.35, -3.05);
    signBoard.castShadow = true;
    hut.add(signBoard);

    const signText = createTextPlane('Pos Ronda', { fg: '#FFFFFF' });
    signText.position.set(0, roofY - 0.35, -3.01);
    hut.add(signText);

    // lampu gantung tengah
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xffcc88,
        emissive: 0xffcc88,
        emissiveIntensity: 0.7,
      })
    );
    bulb.position.set(0, roofY - 0.55, 0);
    hut.add(bulb);
    const lamp = new THREE.PointLight(0xffe3b1, 0.9, 10, 2.0);
    lamp.position.copy(bulb.position);
    hut.add(lamp);

    // meja kecil + bangku papan
    const table = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16),
      new THREE.MeshStandardMaterial({ color: 0x5e3b16, roughness: 0.85 })
    );
    table.position.set(0, groundTopY + 0.45, 0);
    hut.add(table);
    const tableStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.45, 12),
      new THREE.MeshStandardMaterial({ color: 0x4b2f12, roughness: 0.85 })
    );
    tableStem.position.set(0, groundTopY + 0.225, 0);
    hut.add(tableStem);

    // bangku memanjang dua sisi
    function addBench(px, pz, rotY = 0) {
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.08, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x7b5737, roughness: 0.85 })
      );
      seat.position.set(px, groundTopY + 0.42, pz);
      seat.rotation.y = rotY;
      seat.castShadow = true;
      hut.add(seat);

      const legGeo = new THREE.BoxGeometry(0.08, 0.42, 0.08);
      const legMat = new THREE.MeshStandardMaterial({
        color: 0x5a4632,
        roughness: 0.85,
      });
      const legOffsets = [
        [-0.8, -0.18],
        [0.8, -0.18],
        [-0.8, 0.18],
        [0.8, 0.18],
      ];
      legOffsets.forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        // rotasi lokal bangku
        const v = new THREE.Vector3(lx, -0.21, lz).applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          rotY
        );
        leg.position.set(px + v.x, groundTopY + 0.21, pz + v.z);
        leg.castShadow = true;
        hut.add(leg);
      });
    }
    addBench(-1.2, -0.9, THREE.MathUtils.degToRad(15));
    addBench(1.2, 0.9, THREE.MathUtils.degToRad(195));

    // tempatkan seluruh pos
    hut.position.set(0, 0, 0);
    group.add(hut);

    // ================= NPC: 2 orang ngopi =================
    const standY = 0.45 * npcScale; // referensi ketinggian karakter

    const npc1 = characterFactory
      ? characterFactory(0x2563eb, npcScale)
      : makeMinecraftCharacterWithJoints(0x2563eb, npcScale);
    npc1.position.set(-1.25, groundTopY + 0.42 + 0.01, -0.9); // di atas bangku
    npc1.rotation.y = THREE.MathUtils.degToRad(25);
    poseSit(npc1);
    hut.add(npc1);

    const npc2 = characterFactory
      ? characterFactory(0x22c55e, npcScale)
      : makeMinecraftCharacterWithJoints(0x22c55e, npcScale);
    npc2.position.set(1.25, groundTopY + 0.42 + 0.01, 0.9); // bangku seberang
    npc2.rotation.y = THREE.MathUtils.degToRad(205);
    poseSit(npc2);
    hut.add(npc2);

    // gelas kopi di tangan kanan masing-masing
    const cup1 = makeGlass();
    const cup2 = makeGlass();
    if (npc1.userData?.rightArm) {
      const s = npc1.userData.scale || 1;
      cup1.position.set(0, -0.33 * s, 0.11 * s);
      npc1.userData.rightArm.add(cup1);
    }
    if (npc2.userData?.rightArm) {
      const s = npc2.userData.scale || 1;
      cup2.position.set(0, -0.33 * s, 0.11 * s);
      npc2.userData.rightArm.add(cup2);
    }

    // animasi ngobrol ringan (angguk kepala & tangan)
    const t0 = Math.random() * 1000;
    group.onBeforeRender = (_, __, camera, renderer) => {
      const t = performance.now() * 0.001;
      const a1 = Math.sin(t * 1.6 + t0) * 0.08;
      const a2 = Math.sin(t * 1.4 + t0 + 1.3) * 0.08;

      if (npc1.userData?.head) npc1.userData.head.rotation.y = a1;
      if (npc2.userData?.head) npc2.userData.head.rotation.y = -a2;

      if (npc1.userData?.rightArm)
        npc1.userData.rightArm.rotation.x =
          THREE.MathUtils.degToRad(-8) + Math.sin(t * 1.2) * 0.05;
      if (npc2.userData?.rightArm)
        npc2.userData.rightArm.rotation.x =
          THREE.MathUtils.degToRad(-10) + Math.sin(t * 1.1 + 0.7) * 0.05;
    };

    // ================= Transform & collider =================
    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);

    this.scene.add(group);

    // collider hanya untuk struktur pos (bukan NPC)
    hut.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(hut);
    this.buildings.push({
      mesh: hut,
      boundingBox: bbox,
      name,
    });

    return group;
  }

  // Kapster Box - Modern (tanpa tangga, sign putih di papan hitam, tanpa parameter depth)
  createKapsterBox(
    x,
    z,
    {
      scale = 1,
      rotate = 0,
      name = 'Kapster Box',
      // Tidak ada "depth" di opsi!
      width = 6.0, // lebar fasad
      height = 4.2, // tinggi dinding
      colors = {
        wall: 0x152238, // biru tua matte
        frame: 0x1e3a8a, // biru frame
        concrete: 0xe6e6e6, // lantai teras (opsional tipis)
        canopy: 0x0f172a, // kanopi gelap
        signBg: 0x000000, // papan signage hitam
        signText: '#ffffff', // teks signage putih
      },
    } = {}
  ) {
    const group = new THREE.Group();

    // Kedalaman bangunan ditetapkan di dalam fungsi (tidak dikonfigurasi dari luar)
    const DEPTH = 5.0;

    // ====== LANTAI TIPIS (bisa dihapus jika tak perlu) ======
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.2, 0.08, DEPTH + 0.2),
      new THREE.MeshStandardMaterial({
        color: colors.concrete,
        roughness: 0.95,
      })
    );
    pad.position.set(0, 0.04, 0);
    pad.receiveShadow = true;
    group.add(pad);

    const groundTopY = pad.position.y + pad.geometry.parameters.height / 2;

    // ====== BADAN BANGUNAN ======
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, DEPTH),
      new THREE.MeshStandardMaterial({
        color: colors.wall,
        roughness: 0.85,
        metalness: 0.05,
      })
    );
    body.position.set(0, groundTopY + height / 2, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // ====== PARAPET RATA ======
    const parapetH = 0.5;
    const parapet = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.06, parapetH, DEPTH + 0.06),
      new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.7 })
    );
    parapet.position.set(0, groundTopY + height + parapetH / 2, 0);
    parapet.castShadow = true;
    group.add(parapet);

    // ====== KANOPI TIPIS ======
    const canopyDepth = 0.9;
    const canopyThk = 0.1;
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.96, canopyThk, canopyDepth),
      new THREE.MeshStandardMaterial({
        color: colors.canopy,
        roughness: 0.6,
        metalness: 0.2,
      })
    );
    canopy.position.set(
      0,
      groundTopY + height + 0.05,
      DEPTH / 2 + canopyDepth / 2 - 0.05
    );
    canopy.castShadow = true;
    group.add(canopy);

    // Bracket kanopi (nempel dinding)
    const bracketMat = new THREE.MeshStandardMaterial({
      color: 0x6b7280,
      roughness: 0.6,
      metalness: 0.3,
    });
    const makeBracket = (bx) => {
      const g = new THREE.Group();
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.9, 12),
        bracketMat
      );
      arm.rotation.x = Math.PI / 2;
      arm.position.set(0, 0, -0.45);
      const diag = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.04,
          0.04,
          Math.sqrt(0.9 * 0.9 + 0.5 * 0.5),
          12
        ),
        bracketMat
      );
      diag.rotation.set(Math.atan2(0.5, 0.9), 0, 0);
      diag.position.set(0, -0.25, -0.25);
      g.add(arm, diag);
      g.position.set(bx, groundTopY + height - 0.1, DEPTH / 2 + 0.05);
      return g;
    };
    const bx = (width * 0.96) / 2 - 0.5;
    group.add(makeBracket(-bx), makeBracket(bx));

    // LED strip di bawah kanopi
    const led = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 0.9, 0.06),
      new THREE.MeshStandardMaterial({
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 1.2,
        color: 0x000000,
      })
    );
    led.position.set(
      0,
      canopy.position.y - canopyThk / 2 - 0.02,
      DEPTH / 2 + canopyDepth - 0.15
    );
    led.rotation.x = -Math.PI / 2;
    group.add(led);

    // ====== FACADE KACA (pintu kiri, jendela kanan) ======
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.06,
      transmission: 0.92,
      roughness: 0.15,
      thickness: 0.06,
      envMapIntensity: 0.7,
    });
    const frameMat = new THREE.MeshStandardMaterial({
      color: colors.frame,
      roughness: 0.6,
      metalness: 0.2,
    });

    // Pintu kiri (frameless look)
    const doorW = 1.1,
      doorH = 2.4;
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, doorH, 0.05),
      glassMat
    );
    door.position.set(
      -(width / 2) + doorW / 2 + 0.25,
      groundTopY + doorH / 2,
      DEPTH / 2 + 0.03
    );
    group.add(door);

    const slimFrame = new THREE.Mesh(
      new THREE.BoxGeometry(doorW + 0.06, doorH + 0.06, 0.06),
      frameMat
    );
    slimFrame.position.copy(door.position);
    group.add(slimFrame);

    // Handle
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.45, 16),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.2,
      })
    );
    handle.rotation.z = Math.PI / 2;
    handle.position.set(
      door.position.x + doorW / 2 - 0.12,
      door.position.y,
      door.position.z + 0.04
    );
    group.add(handle);

    // Jendela kanan
    const winW = width - doorW - 0.7;
    const winH = 2.5;
    const windowGlass = new THREE.Mesh(
      new THREE.BoxGeometry(winW, winH, 0.05),
      glassMat
    );
    windowGlass.position.set(
      door.position.x + doorW / 2 + winW / 2 + 0.35,
      groundTopY + winH / 2,
      DEPTH / 2 + 0.03
    );
    group.add(windowGlass);

    const windowFrame = new THREE.Mesh(
      new THREE.BoxGeometry(winW + 0.06, winH + 0.06, 0.06),
      frameMat
    );
    windowFrame.position.copy(windowGlass.position);
    group.add(windowFrame);

    // ====== PANEL / CLADDING halus (opsional) ======
    const panelCount = 8;
    const panelGap = (width - 0.4) / panelCount;
    for (let i = 0; i < panelCount; i++) {
      const px = -width / 2 + 0.2 + panelGap * i + panelGap / 2;
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 1.2, 0.18),
        new THREE.MeshStandardMaterial({ color: 0x0e1a2b, roughness: 0.8 })
      );
      slat.position.set(px, groundTopY + 3.0, DEPTH / 2 - 0.09);
      slat.castShadow = true;
      group.add(slat);
    }

    function makeSignTexture(text = 'KAPSTERBOX', w = 2048, h = 512) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');

      // Papan hitam pekat
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // Teks putih
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 300px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, w / 2, h / 2);

      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 8;
      return tex;
    }

    const signW = width * 0.9;
    const signH = 0.9;

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(signW, signH),
      new THREE.MeshStandardMaterial({
        map: makeSignTexture('KAPSTERBOX'),
        transparent: false,
        roughness: 1.0,
        metalness: 0.0,
        emissiveIntensity: 0, // penting: supaya tidak putih
        color: 0xffffff, // JANGAN hitam — harus putih agar tidak menggelapkan tekstur
        toneMapped: true,
      })
    );

    // posisinya tetap
    sign.position.set(0, groundTopY + height - 0.4, DEPTH / 2 + 0.06);

    group.add(sign);

    // ====== BARBER POLE ======
    const poleLen = 1.2;
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.095, poleLen, 24),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.4,
      })
    );
    pole.position.set(-(width / 2) + 0.15, groundTopY + 2.2, DEPTH / 2 + 0.08);
    group.add(pole);

    // tutup atas/bawah aksen
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      metalness: 0.4,
      roughness: 0.4,
    });
    const capTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 16, 16),
      capMat
    );
    capTop.position.set(
      pole.position.x,
      pole.position.y + poleLen / 2,
      pole.position.z
    );
    const capBot = capTop.clone();
    capBot.position.set(
      pole.position.x,
      pole.position.y - poleLen / 2,
      pole.position.z
    );
    group.add(capTop, capBot);

    // ring diagonal merah-biru
    const ringGeo = new THREE.TorusGeometry(0.105, 0.012, 10, 24);
    for (let i = -6; i <= 6; i++) {
      const ring = new THREE.Mesh(
        ringGeo,
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0x1d4ed8 : 0xf43f5e,
          roughness: 0.6,
        })
      );
      ring.rotation.x = Math.PI / 2.2;
      ring.position.set(
        pole.position.x,
        pole.position.y + i * 0.09,
        pole.position.z
      );
      group.add(ring);
    }

    // bracket pole ke dinding
    const poleBracket = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.14, 0.16),
      bracketMat
    );
    poleBracket.position.set(
      pole.position.x,
      pole.position.y,
      DEPTH / 2 - 0.02
    );
    group.add(poleBracket);

    // ====== Pencahayaan fasad ======
    const wash = new THREE.RectAreaLight(0xffffff, 5, width * 0.9, 0.4);
    wash.position.set(0, groundTopY + height - 0.2, DEPTH / 2 + 0.25);
    wash.lookAt(0, groundTopY + 1.5, DEPTH / 2 - 0.5);
    group.add(wash);

    // ====== TRANSFORM ======
    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);
    this.scene.add(group);

    // ====== COLLIDER (body + kanopi) ======
    const colliderGroup = new THREE.Group();
    colliderGroup.add(body.clone(), canopy.clone());
    colliderGroup.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(colliderGroup);

    this.buildings.push({
      mesh: group,
      boundingBox: bbox,
      name,
    });

    return group;
  }

  createTambalBan(
    x,
    z,
    {
      scale = 1.2,
      rotate = 0,
      characterFactory = null,
      npcScale = 0.9,
      mechanicBack = 0.4,
      name = 'Tambal Ban',
    } = {}
  ) {
    const group = new THREE.Group();

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

    function poseMechanic(char) {
      if (!char.userData) return;
      const { leftArm, rightArm } = char.userData;
      if (leftArm) leftArm.rotation.x = THREE.MathUtils.degToRad(-25);
      if (rightArm) rightArm.rotation.x = THREE.MathUtils.degToRad(-5);
    }

    // --- Lantai/Pondasi beton ---
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.06, 8),
      new THREE.MeshStandardMaterial({ color: 0x9b9b9b, roughness: 0.95 })
    );
    pad.position.set(0, 0.03, 0);
    pad.receiveShadow = true;
    group.add(pad);

    // --- Karpet kerja karet (anti licin) ---
    const rubber = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.04, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.85 })
    );
    rubber.position.set(-1.8, 0.02, 0.4);
    rubber.receiveShadow = true;
    group.add(rubber);

    // --- Kanopi + tiang nempel tanah ---
    const stall = new THREE.Group();

    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.12, 3.2),
      new THREE.MeshStandardMaterial({
        color: 0x2c3e50,
        roughness: 0.6,
        metalness: 0.1,
      })
    );
    canopy.position.set(0, 2.4, 0);
    canopy.castShadow = true;
    stall.add(canopy);

    // hitung tinggi tiang (groundTopY → canopyUnderY)
    const groundHalfH = pad.geometry.parameters.height / 2; // 0.03
    const groundTopY = pad.position.y + groundHalfH; // 0.06
    const canopyHalfH = canopy.geometry.parameters.height / 2; // 0.06
    const canopyUnderY = canopy.position.y - canopyHalfH; // 2.34
    const eps = 0.01;
    const poleHeight = Math.max(0.1, canopyUnderY - groundTopY - eps);

    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, poleHeight, 16);
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x6b7280,
      roughness: 0.5,
      metalness: 0.2,
    });
    [
      [-1.9, -1.4],
      [1.9, -1.4],
      [-1.9, 1.4],
      [1.9, 1.4],
    ].forEach(([px, pz]) => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(px, groundTopY + poleHeight / 2, pz);
      pole.castShadow = true;
      pole.receiveShadow = true;
      stall.add(pole);
    });

    // talang sederhana (list) di tepi canopy
    const lip = new THREE.Mesh(
      new THREE.BoxGeometry(4.3, 0.06, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.6 })
    );
    lip.position.set(0, canopy.position.y - 0.05, -1.6);
    lip.castShadow = true;
    stall.add(lip);

    // --- Meja alat ---
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.1, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 })
    );
    bench.position.set(0.6, 1.0, -0.6);
    bench.castShadow = true;
    stall.add(bench);

    const benchLegGeo = new THREE.BoxGeometry(0.08, 0.9, 0.08);
    [
      [0.2, 0.55],
      [1.0, 0.55],
      [0.2, -0.55],
      [1.0, -0.55],
    ].forEach(([bx, bz]) => {
      const leg = new THREE.Mesh(
        benchLegGeo,
        new THREE.MeshStandardMaterial({ color: 0x5e3b16, roughness: 0.8 })
      );
      leg.position.set(bx, 0.55, bz);
      leg.castShadow = true;
      stall.add(leg);
    });

    // --- Kompresor angin ---
    const tank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.9, 24),
      new THREE.MeshStandardMaterial({
        color: 0x1e40af,
        metalness: 0.5,
        roughness: 0.4,
      })
    );
    tank.rotation.z = Math.PI / 2; // rebah
    tank.position.set(-1.4, 0.35, 0.2);
    tank.castShadow = true;
    stall.add(tank);

    const motor = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.35, 0.35),
      new THREE.MeshStandardMaterial({
        color: 0x374151,
        metalness: 0.3,
        roughness: 0.6,
      })
    );
    motor.position.set(-1.0, 0.55, 0.2);
    motor.castShadow = true;
    stall.add(motor);

    // roda kecil untuk kompresor
    const wheelGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    [
      [-1.7, 0.12],
      [-1.1, 0.12],
    ].forEach(([wx, wy]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, wy, 0.45);
      w.castShadow = true;
      stall.add(w);
    });

    // --- Selang angin (pakai torus sebagai lengkungan + silinder) ---
    const hose = new THREE.Group();
    const hoseMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.9,
    });
    // segmen lurus
    const hoseStraight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.1, 12),
      hoseMat
    );
    hoseStraight.rotation.z = Math.PI / 2;
    hoseStraight.position.set(-1.25, 0.5, 0.35);
    hose.add(hoseStraight);
    // elbow torus
    const elbow = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.03, 8, 20, Math.PI / 2),
      hoseMat
    );
    elbow.rotation.set(0, 0, Math.PI / 2);
    elbow.position.set(-0.7, 0.5, 0.35);
    hose.add(elbow);
    // segmen ke ban kerja
    const hoseStraight2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.9, 12),
      hoseMat
    );
    hoseStraight2.rotation.x = Math.PI / 2;
    hoseStraight2.position.set(-0.48, 0.5, 0.0);
    hose.add(hoseStraight2);
    stall.add(hose);

    // --- Tumpukan ban bekas ---
    function addTire(px, py, pz, r = 0.35, t = 0.08) {
      const tire = new THREE.Mesh(
        new THREE.TorusGeometry(r, t, 14, 24),
        new THREE.MeshStandardMaterial({
          color: 0x0f0f10,
          roughness: 0.7,
          metalness: 0.05,
        })
      );
      tire.rotation.x = Math.PI / 2;
      tire.position.set(px, py, pz);
      tire.castShadow = true;
      stall.add(tire);
      return tire;
    }
    addTire(1.5, 0.18, 0.4);
    addTire(1.3, 0.36, 0.45);
    addTire(1.7, 0.18, 0.1);
    addTire(1.45, 0.54, 0.35, 0.33, 0.07);

    // --- Kursi kecil (bangku plastik) ---
    const stool = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.38, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.6 })
    );
    stool.position.set(-0.8, 0.19, -0.1);
    stool.castShadow = true;
    stall.add(stool);

    // --- Lampu kerja ---
    const workLight = new THREE.PointLight(0xffe3b1, 0.9, 10, 2.0);
    workLight.position.set(0, 2.2, 0);
    stall.add(workLight);

    // Posisi stall relatif pad
    stall.position.set(0, 0, 0.0);
    group.add(stall);

    // --- Mekanik berdiri (bukan lesehan) ---
    const mechanic = characterFactory
      ? characterFactory(0x374151, npcScale)
      : makeMinecraftCharacterWithJoints(0x374151, npcScale);

    // hitung offset berdiri natural: origin di tengah badan → kaki nempel tanah
    const standY = 0.45 * npcScale;
    mechanic.position.set(0.2, standY, -0.6 - mechanicBack);
    mechanic.rotation.y = THREE.MathUtils.degToRad(-15);
    poseMechanic(mechanic);
    group.add(mechanic);

    // --- Ambient tambahan ---
    const ambient = new THREE.PointLight(0xffddaa, 0.5, 12, 2.0);
    ambient.position.set(-1.2, 2.0, 0.8);
    group.add(ambient);

    // --- Transform global & register collider ---
    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);

    this.scene.add(group);

    // collider hanya untuk area stall (kanopi + meja + kompresor), bukan seluruh group
    stall.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(stall);
    this.buildings.push({
      mesh: stall,
      boundingBox: bbox,
      name,
    });

    return group;
  }

  createAngkringan(
    x,
    z,
    {
      scale = 1.4,
      rotate = 0,
      characterFactory = null,
      npcScale = 0.85,
      vendorBack = 0.7,
    } = {}
  ) {
    const group = new THREE.Group();

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
        rightLeg.position.y = -0.15 * s;
        leftLeg.position.z = 0.18 * s;
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

    // ---------- GROUND ----------
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

    // ---------- GERObak ----------
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

    // ✅ TIANG NEMPEL TANAH (auto height dari ground → underside canopy)
    const groundHalfH = ground.geometry.parameters.height / 2; // 0.025
    const groundTopY = ground.position.y + groundHalfH; // 0.05
    const canopyHalfH = canopy.geometry.parameters.height / 2; // 0.05
    const canopyUnderY = canopy.position.y - canopyHalfH; // 2.45
    const eps = 0.01;
    const poleHeight = Math.max(0.1, canopyUnderY - groundTopY - eps);

    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, poleHeight, 12);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
    [
      [-1.6, -1.1],
      [1.6, -1.1],
      [-1.6, 1.1],
      [1.6, 1.1],
    ].forEach(([px, pz]) => {
      const p = new THREE.Mesh(poleGeo, poleMat);
      p.position.set(px, groundTopY + poleHeight / 2, pz);
      p.castShadow = true;
      p.receiveShadow = true;
      cart.add(p);
    });

    // Kabel & lampu
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

    // ✅ BARANG DAGANGAN (termos, kompor, api, panci, sate, nampan, makanan)
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

    cart.position.set(0, 0, -1.8);
    group.add(cart);

    const vendor = characterFactory
      ? characterFactory(0xb45309, npcScale)
      : makeMinecraftCharacterWithJoints(0xb45309, npcScale);
    const standY = 1 * npcScale;
    vendor.position.set(0, standY, -2.9 - vendorBack);

    poseVendor(vendor);
    group.add(vendor);

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
        ? characterFactory(color, npcScale)
        : makeMinecraftCharacterWithJoints(color, npcScale);
      npc.position.set(spot.x, 0.46 * npcScale, spot.z);
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

    // ---------- LAMPU AMBIENCE ----------
    const warm = new THREE.PointLight(0xffe3b1, 0.8, 12, 2.0);
    warm.position.set(-2.6, 2.2, 1.5);
    group.add(warm);

    // ---------- TRANSFORM & REGISTER ----------
    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);

    this.scene.add(group);

    cart.updateMatrixWorld(true);
    const cartBox = new THREE.Box3().setFromObject(cart);
    this.buildings.push({
      mesh: cart,
      boundingBox: cartBox,
      name: 'Angkringan - Gerobak',
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
