import * as THREE from 'three';

export class CityBuilder {
  constructor(scene) {
    this.scene = scene;
    this.buildings = [];
    this.roads = [];
    this.sidewalks = [];
    this.sidewalkPaths = [];
    this.roadPaths = [];
    this.ground = 0;
  }

  build() {
    this.createGround();
    this.getGroundSize();
    this.createRoadNetwork();
    this.createPark();
    this.createLake();
    this.createLapanganBasketJalanan(0, 72.2, {
      numPlayers: 4,
      rotate: 0,
      scale: 1,
      size: { length: 42.9, width: 18 },
    });
    this.createTambalBan(0, -25, { scale: 1.5 });
    this.createAngkringan(0, -35, { scale: 1.5, rotate: 180 });
    this.createPosRonda(26, 0, { rotate: 270 });
    this.createLapanganBolaJalanan(-30, -72, {
      numPlayers: 4,
      rotate: 90,
      scale: 0.9,
    });
    this.createKebunBunga(0, -72, {
      numPlayers: 4,
      rotate: 90,
      scale: 0.98,
    });
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
    const width = 102;
    const height = 187.5;

    const groundGeometry = new THREE.PlaneGeometry(width, height);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x6b8e23,
      roughness: 0.8,
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;

    this.scene.add(ground);
    this.ground = ground;
  }

  getGroundSize() {
    if (!this.ground) throw new Error('Ground belum dibuat');

    const params = this.ground.geometry.parameters;
    const sx = this.ground.scale.x || 1;
    const sz = this.ground.scale.y || 1;

    return { width: params.width * sx, height: params.height * sz };
  }

  createSidewalk(x, z, width, depth, material) {
    if (!this.sidewalks) this.sidewalks = [];
    if (!this.sidewalkPaths) this.sidewalkPaths = [];

    const sidewalkGeometry = new THREE.BoxGeometry(width, 0.1, depth);
    const sidewalk = new THREE.Mesh(sidewalkGeometry, material);
    sidewalk.position.set(x, 0.045, z);
    sidewalk.receiveShadow = true;

    this.scene.add(sidewalk);
    this.sidewalks.push(sidewalk);

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

  createRoadNetwork() {
    if (!this.roads) this.roads = [];
    if (!this.roadPaths) this.roadPaths = [];

    const sizes = this.getGroundSize();
    const gW = sizes.width;
    const gH = sizes.height;
    const halfW = gW / 2;
    const halfH = gH / 2;

    const roadWidth = 8;
    const sidewalkWidth = 2;
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const sidewalkMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
    });

    const baseHalfH = 93.75;
    const horizRatios = [-45, -15, 15, 45].map((v) => v / baseHalfH);
    const baseHalfW = 51;
    const vertRatios = [-45, -15, 15, 45].map((v) => v / baseHalfW);
    const roadPositions = [];

    horizRatios.forEach((r) => {
      roadPositions.push({
        x: 0,
        z: r * halfH,
        width: gW,
        depth: roadWidth,
      });
    });

    vertRatios.forEach((r) => {
      roadPositions.push({
        x: r * halfW,
        z: 0,
        width: roadWidth,
        depth: gH,
      });
    });

    roadPositions.forEach((pos) => {
      const roadGeometry = new THREE.BoxGeometry(pos.width, 0.1, pos.depth);
      const road = new THREE.Mesh(roadGeometry, roadMaterial);
      road.position.set(pos.x, 0.05, pos.z);
      road.receiveShadow = true;
      this.scene.add(road);
      this.roads.push(road);

      if (pos.width > pos.depth) {
        this.roadPaths.push({
          start: { x: pos.x - pos.width / 2, z: pos.z },
          end: { x: pos.x + pos.width / 2, z: pos.z },
          type: 'horizontal',
        });

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
        this.roadPaths.push({
          start: { x: pos.x, z: pos.z - pos.depth / 2 },
          end: { x: pos.x, z: pos.z + pos.depth / 2 },
          type: 'vertical',
        });

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

  createBicycle(x, z) {
    const group = new THREE.Group();
    const frameGeometry = new THREE.BoxGeometry(0.1, 1.2, 2.4);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.y = 1;
    frame.castShadow = true;
    group.add(frame);
    const wheelGeometry = new THREE.TorusGeometry(0.6, 0.1, 8, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontWheel.rotation.y = Math.PI / 2;
    frontWheel.position.set(0, 0.8, 1);
    frontWheel.castShadow = true;
    group.add(frontWheel);
    const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    backWheel.rotation.y = Math.PI / 2;
    backWheel.position.set(0, 0.8, -1);
    backWheel.castShadow = true;
    group.add(backWheel);
    const handlebarGeometry = new THREE.BoxGeometry(1, 0.1, 0.1);
    const handlebar = new THREE.Mesh(handlebarGeometry, frameMaterial);
    handlebar.position.set(0, 1.6, 1.2);
    group.add(handlebar);
    const seatGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.4);
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.set(0, 1.6, -0.4);
    group.add(seat);

    group.position.set(x, 0, z);
    group.rotation.y = Math.random() * 0.3 - 0.15;
    this.scene.add(group);
  }

  createPark() {
    const parkX = 0;
    const parkZ = 0;
    const parkWidth = 18;
    const parkDepth = 18;

    const grassGeometry = new THREE.BoxGeometry(parkWidth, 0.3, parkDepth);
    const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.position.set(parkX, 0.15, parkZ);
    grass.receiveShadow = true;
    this.scene.add(grass);

    const benchPositions = [
      { x: -4.5, z: -3.75 },
      { x: 4.5, z: -3.75 },
      { x: -4.5, z: 3.75 },
      { x: 4.5, z: 3.75 },
    ];

    const createFountain = (x, z) => {
      const group = new THREE.Group();

      const baseGeometry = new THREE.CylinderGeometry(3, 3.5, 0.5, 8);
      const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.y = 0.25;
      base.castShadow = true;
      group.add(base);

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

      const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
      const pillar = new THREE.Mesh(pillarGeometry, baseMaterial);
      pillar.position.y = 1.55;
      pillar.castShadow = true;
      group.add(pillar);

      group.position.set(x, 0, z);
      this.scene.add(group);
      group.updateMatrixWorld(true);

      const bbox = new THREE.Box3().setFromObject(group);

      this.buildings.push({
        mesh: group,
        boundingBox: bbox,
        name: 'Fontain',
      });
    };

    benchPositions.forEach((pos) => {
      this.createBench(parkX + pos.x, parkZ + pos.z, 0, true);
    });

    createFountain(parkX, parkZ);

    this.parkArea = { x: parkX, z: parkZ, width: parkWidth, depth: parkDepth };
  }

  createLake() {
    const lakeX = 0;
    const lakeZ = 30;
    const lakeWidth = 18;
    const lakeDepth = 15;
    const lakeGeometry = new THREE.BoxGeometry(lakeWidth, 0.3, lakeDepth);
    const lakeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e90ff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.2,
      metalness: 0.3,
    });
    const lake = new THREE.Mesh(lakeGeometry, lakeMaterial);
    lake.position.set(lakeX, 0.15, lakeZ);
    lake.receiveShadow = true;
    this.scene.add(lake);

    this.createBench(lakeX - 6, lakeZ - 8.3, 0, false);
    this.createBench(lakeX + 6, lakeZ + 8.3, 3.2, false);

    this.lakeArea = { x: lakeX, z: lakeZ, width: lakeWidth, depth: lakeDepth };
  }

  createBench(x, z, rotateY, isPark) {
    const group = new THREE.Group();
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const seatGeometry = new THREE.BoxGeometry(2, 0.2, 0.8);
    const seat = new THREE.Mesh(seatGeometry, woodMaterial);
    seat.position.y = isPark == true ? 0.8 : 0.5;
    seat.castShadow = true;
    group.add(seat);

    const backGeometry = new THREE.BoxGeometry(2, 1, 0.1);
    const back = new THREE.Mesh(backGeometry, woodMaterial);
    back.position.set(0, isPark == true ? 1.2 : 1, -0.35);
    back.castShadow = true;
    group.add(back);
    const legGeometry = new THREE.BoxGeometry(
      0.1,
      isPark == true ? 1 : 0.5,
      0.1
    );
    [-0.8, 0.8].forEach((xOffset) => {
      [-0.3, 0.3].forEach((zOffset) => {
        const leg = new THREE.Mesh(legGeometry, woodMaterial);
        leg.position.set(xOffset, 0.25, zOffset);
        leg.castShadow = true;
        group.add(leg);
      });
    });

    group.position.set(x, 0, z);
    group.rotation.y = rotateY;
    this.scene.add(group);
    group.updateMatrixWorld(true);

    const bbox = new THREE.Box3().setFromObject(group);

    this.buildings.push({
      mesh: group,
      boundingBox: bbox,
      name: 'Bench',
    });
  }

  createTrafficLights() {
    const intersections = [
      { x: -45, z: -45 },
      { x: -45, z: -15 },
      { x: -45, z: 15 },
      { x: -45, z: 45 },
      { x: -15, z: -45 },
      { x: -15, z: -15 },
      { x: -15, z: 15 },
      { x: -15, z: 45 },
      { x: 15, z: -45 },
      { x: 15, z: -15 },
      { x: 15, z: 15 },
      { x: 15, z: 45 },
      { x: 45, z: -45 },
      { x: 45, z: -15 },
      { x: 45, z: 15 },
      { x: 45, z: 45 },
    ];

    intersections.forEach((pos) => {
      this.createTrafficLight(pos.x + 5, pos.z + 5, Math.PI * 2);
      this.createTrafficLight(pos.x - 5, pos.z - 5, -Math.PI * 1);
    });
  }

  createTrafficLight(x, z, rotation) {
    const group = new THREE.Group();

    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 2;
    pole.castShadow = true;
    group.add(pole);

    const boxGeometry = new THREE.BoxGeometry(0.6, 1.5, 0.3);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(0, 4.6, 0);
    box.castShadow = true;
    group.add(box);

    const lightGeometry = new THREE.CircleGeometry(0.2, 16);

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
    group.updateMatrixWorld(true);

    const bbox = new THREE.Box3().setFromObject(group);

    this.buildings.push({
      mesh: group,
      boundingBox: bbox,
      name: 'Traffic Light',
    });

    return group;
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

    const hut = new THREE.Group();
    const groundTopY = 0;
    const roofY = 2.6;
    const roofHalfH = 0.08;
    const canopyUnderY = roofY - roofHalfH;
    const eps = 0.01;
    const poleH = Math.max(0.8, canopyUnderY - groundTopY - eps);

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

    const drip = new THREE.Mesh(
      new THREE.BoxGeometry(6.7, 0.06, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
    );
    drip.position.set(0, roofY - 0.06, -3.25);
    hut.add(drip);

    const railMat = new THREE.MeshStandardMaterial({
      color: 0x7b5737,
      roughness: 0.85,
    });
    const railH = 0.7;
    const railTh = 0.08;
    const railBack = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, railH, railTh),
      railMat
    );
    railBack.position.set(0, 0.35 + groundTopY, -3.0);
    const railLeft = new THREE.Mesh(
      new THREE.BoxGeometry(railTh, railH, 6.2),
      railMat
    );
    railLeft.position.set(-3.0, 0.35 + groundTopY, 0);
    const railRight = railLeft.clone();
    railRight.position.x = 3.0;
    hut.add(railBack, railLeft, railRight);
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

    hut.position.set(0, 0, 0);
    group.add(hut);

    const npc1 = characterFactory
      ? characterFactory(0x2563eb, npcScale)
      : makeMinecraftCharacterWithJoints(0x2563eb, npcScale);
    npc1.position.set(-1.25, groundTopY + 0.73, -0.9);
    npc1.rotation.y = THREE.MathUtils.degToRad(25);
    poseSit(npc1);
    hut.add(npc1);

    const npc2 = characterFactory
      ? characterFactory(0x22c55e, npcScale)
      : makeMinecraftCharacterWithJoints(0x22c55e, npcScale);
    npc2.position.set(1.25, groundTopY + 0.73, 0.9);
    npc2.rotation.y = THREE.MathUtils.degToRad(205);
    poseSit(npc2);
    hut.add(npc2);

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

    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);

    this.scene.add(group);

    hut.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(hut);
    this.buildings.push({
      mesh: hut,
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

    const rubber = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.04, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.85 })
    );
    rubber.position.set(-1.8, 0.02, 0.4);
    rubber.receiveShadow = true;
    group.add(rubber);

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

    const groundTopY = 0;
    const canopyHalfH = canopy.geometry.parameters.height / 2;
    const canopyUnderY = canopy.position.y - canopyHalfH;
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

    const lip = new THREE.Mesh(
      new THREE.BoxGeometry(4.3, 0.06, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.6 })
    );
    lip.position.set(0, canopy.position.y - 0.05, -1.6);
    lip.castShadow = true;
    stall.add(lip);

    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.1, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 })
    );
    bench.position.set(0.6, 1.0, 0.1);
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

    const tank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.9, 24),
      new THREE.MeshStandardMaterial({
        color: 0x1e40af,
        metalness: 0.5,
        roughness: 0.4,
      })
    );
    tank.rotation.z = Math.PI / 2;
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

    const hose = new THREE.Group();
    const hoseMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.9,
    });
    const hoseStraight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.1, 12),
      hoseMat
    );
    hoseStraight.rotation.z = Math.PI / 2;
    hoseStraight.position.set(-1.25, 0.5, 0.35);
    hose.add(hoseStraight);
    const elbow = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.03, 8, 20, Math.PI / 2),
      hoseMat
    );
    elbow.rotation.set(0, 0, Math.PI / 2);
    elbow.position.set(-0.7, 0.5, 0.35);
    hose.add(elbow);

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

    const stool = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.38, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.6 })
    );
    stool.position.set(-0.8, 0.19, -0.5);
    stool.castShadow = true;
    stall.add(stool);

    const workLight = new THREE.PointLight(0xffe3b1, 0.9, 10, 2.0);
    workLight.position.set(0, 2.2, 0);
    stall.add(workLight);

    stall.position.set(0, 0, 0.0);
    group.add(stall);

    const mechanic = characterFactory
      ? characterFactory(0x374151, npcScale)
      : makeMinecraftCharacterWithJoints(0x374151, npcScale);

    const standY = 0.45 * npcScale;
    mechanic.position.set(0.2, standY, -0.6 - mechanicBack);
    mechanic.rotation.y = THREE.MathUtils.degToRad(-15);
    poseMechanic(mechanic);
    group.add(mechanic);

    const ambient = new THREE.PointLight(0xffddaa, 0.5, 12, 2.0);
    ambient.position.set(-1.2, 2.0, 0.8);
    group.add(ambient);

    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);

    this.scene.add(group);

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

    const cart = new THREE.Group();

    const cartBody = new THREE.Mesh(
      new THREE.BoxGeometry(3, 1.2, 2),
      new THREE.MeshStandardMaterial({ color: 0x9b9b9b, roughness: 0.9 })
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

    const groundTopY = 0;
    const canopyHalfH = canopy.geometry.parameters.height / 2;
    const canopyUnderY = canopy.position.y - canopyHalfH;
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

    const warm = new THREE.PointLight(0xffe3b1, 0.8, 12, 2.0);
    warm.position.set(-2.6, 2.2, 1.5);
    group.add(warm);

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

  createLapanganBolaJalanan(
    x,
    z,
    {
      scale = 1.4,
      rotate = 0,
      size = { length: 44.5, width: 16 },
      numPlayers = 8,
      teamAColor = 0x2563eb,
      teamBColor = 0x22c55e,
      characterFactory = null,
      registerGoalColliders = true,
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

    const L = size.length;
    const W = size.width;

    const asphalt = new THREE.Mesh(
      new THREE.BoxGeometry(L + 4, 0.05, W + 4),
      new THREE.MeshStandardMaterial({ color: 0x2f2f2f, roughness: 0.95 })
    );
    asphalt.position.set(0, 0.025, 0);
    asphalt.receiveShadow = true;
    group.add(asphalt);

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
    line(L, 0.06, 0.12, 0, 0.03, -W / 2);
    line(L, 0.06, 0.12, 0, 0.03, W / 2);
    line(0.12, 0.06, W, -L / 2, 0.03, 0);
    line(0.12, 0.06, W, L / 2, 0.03, 0);
    line(0.12, 0.06, W, 0, 0.03, 0);
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

    function makeGoal({
      width = 3.0,
      height = 2.0,
      depth = 1.0,
      tube = 0.07,
    } = {}) {
      const g = new THREE.Group();

      const postMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.55,
        metalness: 0.05,
      });

      const cyl = (r, h, mat) =>
        new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), mat);

      const L = width,
        H = height,
        D = depth,
        R = tube;

      const leftPost = cyl(R, H, postMat);
      leftPost.position.set(-L / 2, H / 2, 0);
      const rightPost = cyl(R, H, postMat);
      rightPost.position.set(L / 2, H / 2, 0);

      const crossbar = cyl(R, L, postMat);
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0, H, 0);

      const frontBottom = cyl(R, L, postMat);
      frontBottom.rotation.z = Math.PI / 2;
      frontBottom.position.set(0, R / 2, 0);

      g.add(leftPost, rightPost, crossbar, frontBottom);

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

      const netMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        wireframe: true,
      });

      const netBack = new THREE.Mesh(
        new THREE.PlaneGeometry(L - R * 2, H - R, 8, 6),
        netMat
      );
      netBack.position.set(0, H / 2, -D);
      const netSideL = new THREE.Mesh(
        new THREE.PlaneGeometry(D, H - R, 6, 6),
        netMat
      );
      netSideL.rotation.y = Math.PI / 2;
      netSideL.position.set(-L / 2, H / 2, -D / 2);

      const netSideR = netSideL.clone();
      netSideR.position.x = L / 2;

      const netTop = new THREE.Mesh(
        new THREE.PlaneGeometry(L - R * 2, D, 10, 6),
        netMat
      );
      netTop.rotation.x = Math.PI / 2;
      netTop.position.set(0, H, -D / 2);
      g.add(netBack, netSideL, netSideR, netTop);
      return g;
    }

    const goalLeft = makeGoal({
      width: 5.5,
      height: 3,
      depth: 1.0,
      tube: 0.07,
    });
    goalLeft.position.set(-L / 2 + 0.6, 0, 0);
    goalLeft.rotation.y = 33;
    group.add(goalLeft);

    const goalRight = makeGoal({
      width: 5.5,
      height: 3,
      depth: 1.0,
      tube: 0.07,
    });
    goalRight.position.set(L / 2 - 0.6, 0, 0);
    goalRight.rotation.y = 4.65;
    group.add(goalRight);

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
    );
    ball.position.set(0, 0.22, 0);
    ball.castShadow = true;
    group.add(ball);

    const total = Math.max(2, numPlayers);
    const perTeam = Math.floor(total / 2);
    const spawnRadiusX = L / 2 - 3;
    const spawnRadiusZ = W / 2 - 2;

    function spawnPlayer(isTeamA, idx) {
      const color = isTeamA ? teamAColor : teamBColor;
      const p = characterFactory
        ? characterFactory(color, 1.5)
        : makeMinecraftCharacterWithJoints(color, 1.6);

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

  createLapanganBasketJalanan(
    x,
    z,
    {
      scale = 1.4,
      rotate = 0,
      size = { length: 28, width: 15 },
      numPlayers = 10,
      teamAColor = 0xff6b35,
      teamBColor = 0x004e89,
      characterFactory = null,
      registerRingColliders = true,
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

    function poseJumpShoot(char) {
      const u = char.userData;
      if (!u) return;
      const s = u.scale || 1;

      if (u.leftLeg && u.rightLeg) {
        u.leftLeg.rotation.x = THREE.MathUtils.degToRad(-15);
        u.rightLeg.rotation.x = THREE.MathUtils.degToRad(-15);
        u.leftLeg.position.y = -0.35 * s;
        u.rightLeg.position.y = -0.35 * s;
      }

      if (u.rightArm) {
        u.rightArm.rotation.x = THREE.MathUtils.degToRad(-120);
        u.rightArm.rotation.z = THREE.MathUtils.degToRad(10);
      }
      if (u.leftArm) {
        u.leftArm.rotation.x = THREE.MathUtils.degToRad(-110);
        u.leftArm.rotation.z = THREE.MathUtils.degToRad(-15);
      }

      if (u.body) u.body.rotation.z = THREE.MathUtils.degToRad(-5);
    }

    function poseDribble(char) {
      const u = char.userData;
      if (!u) return;
      const s = u.scale || 1;

      if (u.leftLeg && u.rightLeg) {
        u.leftLeg.rotation.x = THREE.MathUtils.degToRad(10);
        u.rightLeg.rotation.x = THREE.MathUtils.degToRad(-10);
      }

      if (u.rightArm) {
        u.rightArm.rotation.x = THREE.MathUtils.degToRad(45);
        u.rightArm.position.y = 0.4 * s;
      }
      if (u.leftArm) {
        u.leftArm.rotation.x = THREE.MathUtils.degToRad(-20);
      }

      if (u.body) u.body.rotation.z = THREE.MathUtils.degToRad(8);
    }

    const L = size.length;
    const W = size.width;

    const court = new THREE.Mesh(
      new THREE.BoxGeometry(W, 0.15, L),
      new THREE.MeshStandardMaterial({ color: 0xd2691e, roughness: 0.8 })
    );
    court.position.set(0, 0.075, 0);
    court.receiveShadow = true;
    group.add(court);

    const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const lineThickness = 0.1;
    const lineHeight = 0.18;

    function line(w, h, d, px, py, pz) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lineMat);
      m.position.set(px, py, pz);
      m.receiveShadow = true;
      group.add(m);
    }

    line(W, lineHeight, lineThickness, 0, 0.09, -L / 2);
    line(W, lineHeight, lineThickness, 0, 0.09, L / 2);
    line(lineThickness, lineHeight, L, -W / 2, 0.09, 0);
    line(lineThickness, lineHeight, L, W / 2, 0.09, 0);

    line(W, lineHeight, lineThickness, 0, 0.09, 0);

    const centerCircleGeometry = new THREE.RingGeometry(1.8, 2, 32);
    const centerCircle = new THREE.Mesh(centerCircleGeometry, lineMat);
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.set(0, 0.16, 0);
    group.add(centerCircle);

    const centerDot = new THREE.Mesh(
      new THREE.CircleGeometry(0.2, 16),
      lineMat
    );
    centerDot.rotation.x = -Math.PI / 2;
    centerDot.position.set(0, 0.16, 0);
    group.add(centerDot);

    const threePointRadius = 6.75;
    const threePointThickness = 0.1;
    const threePointGeometry = new THREE.RingGeometry(
      threePointRadius,
      threePointRadius + threePointThickness,
      64,
      1,
      0,
      Math.PI
    );

    const topThreePoint = new THREE.Mesh(threePointGeometry, lineMat);
    topThreePoint.rotation.x = -Math.PI / 2;
    topThreePoint.rotation.z = Math.PI;
    topThreePoint.position.set(0, 0.16, -L / 2);
    group.add(topThreePoint);

    const bottomThreePoint = new THREE.Mesh(threePointGeometry, lineMat);
    bottomThreePoint.rotation.x = -Math.PI / 2;
    bottomThreePoint.rotation.z = 0;
    bottomThreePoint.position.set(0, 0.16, L / 2);
    group.add(bottomThreePoint);

    const paintWidth = 4;
    const paintLength = 4.7;

    line(
      lineThickness,
      lineHeight,
      paintLength,
      -paintWidth / 2,
      0.09,
      -L / 2 + paintLength / 2
    );
    line(
      lineThickness,
      lineHeight,
      paintLength,
      paintWidth / 2,
      0.09,
      -L / 2 + paintLength / 2
    );
    line(paintWidth, lineHeight, lineThickness, 0, 0.09, -L / 2 + paintLength);

    line(
      lineThickness,
      lineHeight,
      paintLength,
      -paintWidth / 2,
      0.09,
      L / 2 - paintLength / 2
    );
    line(
      lineThickness,
      lineHeight,
      paintLength,
      paintWidth / 2,
      0.09,
      L / 2 - paintLength / 2
    );
    line(paintWidth, lineHeight, lineThickness, 0, 0.09, L / 2 - paintLength);

    const freeThrowCircleGeometry = new THREE.RingGeometry(1.8, 2, 32);

    const topFreeThrowCircle = new THREE.Mesh(freeThrowCircleGeometry, lineMat);
    topFreeThrowCircle.rotation.x = -Math.PI / 2;
    topFreeThrowCircle.position.set(0, 0.16, -L / 2 + paintLength);
    group.add(topFreeThrowCircle);

    const bottomFreeThrowCircle = new THREE.Mesh(
      freeThrowCircleGeometry,
      lineMat
    );
    bottomFreeThrowCircle.rotation.x = -Math.PI / 2;
    bottomFreeThrowCircle.position.set(0, 0.16, L / 2 - paintLength);
    group.add(bottomFreeThrowCircle);

    function makeBasketRing() {
      const g = new THREE.Group();
      const poleGeometry = new THREE.CylinderGeometry(0.15, 0.2, 4, 8);
      const poleMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.6,
        roughness: 0.4,
      });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.y = 2;
      pole.castShadow = true;
      g.add(pole);
      const armGeometry = new THREE.BoxGeometry(0.15, 0.15, 1.2);
      const arm = new THREE.Mesh(armGeometry, poleMaterial);
      arm.position.set(0, 3.3, -0.6);
      arm.castShadow = true;
      g.add(arm);
      const backboardGeometry = new THREE.BoxGeometry(1.8, 1.05, 0.1);
      const backboardMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        metalness: 0.3,
        roughness: 0.2,
      });
      const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
      backboard.position.set(0, 3.5, -1.2);
      backboard.castShadow = true;
      g.add(backboard);

      const rectangleGeometry = new THREE.BoxGeometry(0.59, 0.45, 0.05);
      const rectangleMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
      });
      const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);
      rectangle.position.set(0, 3.5, -1.25);
      g.add(rectangle);

      const rimGeometry = new THREE.TorusGeometry(0.225, 0.02, 8, 32);
      const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6600,
        metalness: 0.8,
        roughness: 0.2,
      });
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(0, 3.05, -1.35);
      rim.castShadow = true;
      g.add(rim);
      const netMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
      });
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const netSegmentGeometry = new THREE.CylinderGeometry(
          0.01,
          0.01,
          0.4,
          3
        );
        const netSegment = new THREE.Mesh(netSegmentGeometry, netMaterial);
        const radius = 0.225;
        netSegment.position.set(
          Math.cos(angle) * radius,
          2.85,
          -1.35 + Math.sin(angle) * radius
        );
        netSegment.rotation.x = Math.PI / 6;
        g.add(netSegment);
      }

      return g;
    }
    const ringTop = makeBasketRing();
    ringTop.position.set(0, 0, -L / 2 + 1.575);
    ringTop.rotation.y = Math.PI;
    group.add(ringTop);
    const ringBottom = makeBasketRing();
    ringBottom.position.set(0, 0, L / 2 - 1.575);
    ringBottom.rotation.y = 0;
    group.add(ringBottom);

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xff8c42, roughness: 0.7 })
    );
    ball.position.set(0, 0.24, 0);
    ball.castShadow = true;
    group.add(ball);
    const total = Math.max(2, numPlayers);
    const perTeam = Math.floor(total / 2);
    const spawnRadiusX = W / 2 - 2;
    const spawnRadiusZ = L / 2 - 4;

    function spawnPlayer(isTeamA, idx) {
      const color = isTeamA ? teamAColor : teamBColor;
      const p = characterFactory
        ? characterFactory(color, 1.5)
        : makeMinecraftCharacterWithJoints(color, 1.6);

      const side = isTeamA ? -1 : 1;
      const pz = THREE.MathUtils.lerp(
        -spawnRadiusZ * side,
        -2 * side,
        Math.random()
      );
      const px = THREE.MathUtils.lerp(
        -spawnRadiusX,
        spawnRadiusX,
        Math.random()
      );
      p.position.set(px, 0, pz);

      const angleToCenter = Math.atan2(0 - pz, 0 - px);
      p.rotation.y = angleToCenter;

      if (idx === 0 && !isTeamA) {
        p.position.set(0.6, 0, 0.8);
        p.rotation.y = Math.atan2(0 - 0.8, 0 - 0.6);
        poseJumpShoot(p);
      } else if (idx === 0 && isTeamA) {
        p.position.set(-0.4, 0, -1.2);
        p.rotation.y = Math.atan2(0 - -1.2, 0 - -0.4);
        poseDribble(p);
      } else if (idx === 1) {
        poseJumpShoot(p);
      } else {
        poseRun(p, 15 + Math.random() * 15);
      }

      group.add(p);
    }

    for (let i = 0; i < perTeam; i++) spawnPlayer(true, i);
    for (let i = 0; i < perTeam; i++) spawnPlayer(false, i);

    const lightMid = new THREE.PointLight(0xffe8cc, 0.9, 25, 2.0);
    lightMid.position.set(0, 5.5, 0);
    group.add(lightMid);
    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);

    this.scene.add(group);

    if (registerRingColliders) {
      [ringTop, ringBottom].forEach((ring, i) => {
        ring.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(ring);
        this.buildings.push({
          mesh: ring,
          boundingBox: bbox,
          name: i === 0 ? 'Ring Atas' : 'Ring Bawah',
        });
      });
    }

    return group;
  }
  createKebunBunga(
    x,
    z,
    {
      scale = 1.4,
      rotate = 0,
      size = { length: 44.5, width: 18.3 },
      numBeds = 6,
      flowersPerBed = 18,
      withPath = true,
    } = {}
  ) {
    const group = new THREE.Group();
    const L = size.length;
    const W = size.width;

    const colors = {
      grass: 0x3a7a4a,
      soil: 0x7a5a3a,
      path: 0xbfb9a1,
      stem: 0x2f6f3a,
      petals: [
        0xf94144, 0xf3722c, 0xf9c74f, 0x90be6d, 0x577590, 0xf9844a, 0x9b5de5,
      ],
    };

    const grass = new THREE.Mesh(
      new THREE.BoxGeometry(L, 0.06, W),
      new THREE.MeshStandardMaterial({ color: colors.grass, roughness: 0.95 })
    );
    grass.position.set(0, 0.03, 0);
    grass.receiveShadow = true;
    group.add(grass);

    const matSoil = new THREE.MeshStandardMaterial({
      color: colors.soil,
      roughness: 0.9,
    });
    const matPath = new THREE.MeshStandardMaterial({
      color: colors.path,
      roughness: 0.95,
    });
    function box(w, h, d, mat) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function cyl(r, h, mat, seg = 6) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function cone(r, h, mat, seg = 6) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }

    let pathWidth = 2.2;
    let pathGap = 1.2;
    if (withPath) {
      const solidPath = box(L * 0.92, 0.03, pathWidth, matPath);
      solidPath.position.set(0, 0.05, 0);
      group.add(solidPath);
    } else {
      pathWidth = 0;
      pathGap = 0;
    }

    function makeFlower() {
      const g = new THREE.Group();
      const stemMat = new THREE.MeshStandardMaterial({
        color: colors.stem,
        roughness: 0.8,
      });
      const stemH = 0.35 + Math.random() * 0.25;
      const stem = cyl(0.025, stemH, stemMat, 6);
      stem.position.y = stemH / 2;
      g.add(stem);
      const petalColor =
        colors.petals[(Math.random() * colors.petals.length) | 0];
      const petalMat = new THREE.MeshStandardMaterial({
        color: petalColor,
        roughness: 0.7,
      });
      const headY = stemH + 0.02;
      const petals = 5;
      const radius = 0.06;
      for (let i = 0; i < petals; i++) {
        const p = cone(0.06, 0.08, petalMat, 5);
        const ang = (i / petals) * Math.PI * 2;
        p.position.set(Math.cos(ang) * radius, headY, Math.sin(ang) * radius);
        p.rotation.x = Math.PI / 2;
        p.rotation.z = ang;
        g.add(p);
      }
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 6, 4),
        new THREE.MeshStandardMaterial({ color: 0xffef85, roughness: 0.6 })
      );
      core.position.set(0, headY + 0.005, 0);
      core.castShadow = true;
      g.add(core);
      return g;
    }

    const totalBeds = numBeds + 2;
    const rows = 2;
    const cols = Math.ceil(totalBeds / rows);
    const marginX = 1.2;
    const edgeMarginZ = 0.9;
    const reservedMid = pathWidth > 0 ? pathWidth / 2 + pathGap : 0;
    const usableZTop = W / 2 - edgeMarginZ - reservedMid;
    const usableZBottom = -W / 2 + edgeMarginZ + reservedMid;
    const bandTopH = usableZTop - reservedMid;
    const bandBottomH = reservedMid - usableZBottom;
    const bedDTop = Math.min(bandTopH - 0.6, 5.5);
    const bedDBottom = Math.min(bandBottomH - 0.6, 5.5);
    const bedD = Math.min(bedDTop, bedDBottom);
    const bedW = Math.min((L - marginX * (cols + 1)) / cols, 8.0);
    const startX = -(cols * bedW + (cols - 1) * marginX) / 2 + bedW / 2;
    const zTop = reservedMid + bedD / 2 + 0.3;
    const zBottom = -reservedMid - bedD / 2 - 0.3;

    let created = 0;
    for (let r = 0; r < rows; r++) {
      const rowZ = r === 0 ? zBottom : zTop;
      for (let c = 0; c < cols; c++) {
        if (created >= totalBeds) break;
        const bed = box(bedW, 0.05, bedD, matSoil);
        bed.position.set(startX + c * (bedW + marginX), 0.055, rowZ);
        group.add(bed);
        const nx = Math.max(3, Math.floor(Math.sqrt(flowersPerBed) * 1.5));
        const nz = Math.max(2, Math.floor(Math.sqrt(flowersPerBed)));
        for (let i = 0; i < nx; i++) {
          for (let j = 0; j < nz; j++) {
            if (Math.random() > 0.8) continue;
            const fx = (i + 0.5) / nx;
            const fz = (j + 0.5) / nz;
            const flower = makeFlower();
            const jx = (Math.random() - 0.5) * (bedW / nx) * 0.6;
            const jz = (Math.random() - 0.5) * (bedD / nz) * 0.6;
            flower.position.set(
              bed.position.x +
                THREE.MathUtils.lerp(-bedW / 2 + 0.25, bedW / 2 - 0.25, fx) +
                jx,
              0,
              bed.position.z +
                THREE.MathUtils.lerp(-bedD / 2 + 0.25, bedD / 2 - 0.25, fz) +
                jz
            );
            group.add(flower);
          }
        }
        created++;
      }
    }

    const light = new THREE.PointLight(0xfff1c1, 0.65, 26, 2.0);
    light.position.set(0, 3.8, 0);
    group.add(light);

    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);
    this.scene.add(group);
    return group;
  }
}
