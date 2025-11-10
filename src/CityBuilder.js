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
    this.createTambalBan(-25, 30, { scale: 1.5, rotate: 90 });
    this.createWarkop(-35, 30, { rotate: 270 });
    this.createAngkringan(0, -35, { scale: 1.5, rotate: 180 });
    this.createPosRonda(25, 0, { rotate: 270 });
    this.createWarkop(35, 0, { rotate: 90 });
    this.createPertamini(-35, 0, { rotate: 270 });
    this.createGerobakBakso(-25, 0, { rotate: 90, scale: 1.6 });
    this.createGerobakBatagor(-30, -25, { scale: 1.5 });
    this.createGerobakSeblak(-30, -35, { scale: 1.5, rotate: 180 });

    this.createPertamini(35, 30, { rotate: 90 });
    this.createGerobakSeblak(25, 30, { rotate: 270 });

    this.createPlangDisewakan(30, -30, { rotate: 270 });

    this.createLapanganBolaJalanan(-30, -72, {
      numPlayers: 4,
      rotate: 90,
      scale: 0.9,
    });
    this.createKebunBunga(0, -72, {
      rotate: 90,
      scale: 0.98,
    });
    this.createMasjid(30, -72, {
      rotate: 90,
      scale: 0.98,
    });
    this.createRumahMakanPadang(-30, 71, {
      rotate: 270,
      scale: 0.98,
    });
    this.createTamanLabirin(30, 72.2, {
      rotate: 270,
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
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: 0x6b8e23,
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = false;

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
    sidewalk.receiveShadow = false;

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
    const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const sidewalkMaterial = new THREE.MeshLambertMaterial({
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
      road.receiveShadow = false;
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
      new THREE.MeshLambertMaterial({ color: 0x2563eb })
    );
    stool.position.set(-0.8, 0.19, -0.5);
    stool.castShadow = false;
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
      new THREE.MeshLambertMaterial({ color: 0x9b9b9b })
    );
    cartBody.position.set(0, 0.8, 0);
    cartBody.castShadow = true;
    cart.add(cartBody);

    const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
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
      new THREE.MeshLambertMaterial({ color: 0xff6347 })
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

  createMasjid(
    x,
    z,
    {
      scale = 1.4,
      rotate = 0,
      size = { length: 44.5, width: 18.2 },
      name = 'Masjid',
      withMinaret = true,
      minarets = 2,
      withCourtyard = true,
      registerColliders = true,
    } = {}
  ) {
    const group = new THREE.Group();
    const L = size.length;
    const W = size.width;

    const colors = {
      wall: 0xefe8d8,
      accent: 0xc9a227,
      dome: 0x2f855a,
      roof: 0x1f6f4a,
      tile: 0xd9d4c7,
      door: 0x8b5e3c,
      window: 0x9bc1e2,
      stone: 0xb8b2a7,
    };

    function box(w, h, d, mat) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function cyl(r, h, mat, seg = 12) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function cone(r, h, mat, seg = 12) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function ico(r, mat, det = 0) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, det), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }

    const matWall = new THREE.MeshStandardMaterial({
      color: colors.wall,
      roughness: 0.85,
    });
    const matAccent = new THREE.MeshStandardMaterial({
      color: colors.accent,
      roughness: 0.5,
      metalness: 0.3,
    });
    const matDome = new THREE.MeshStandardMaterial({
      color: colors.dome,
      roughness: 0.6,
      metalness: 0.1,
    });
    const matRoof = new THREE.MeshStandardMaterial({
      color: colors.roof,
      roughness: 0.7,
    });
    const matTile = new THREE.MeshStandardMaterial({
      color: colors.tile,
      roughness: 0.95,
    });
    const matDoor = new THREE.MeshStandardMaterial({
      color: colors.door,
      roughness: 0.8,
    });
    const matWindow = new THREE.MeshStandardMaterial({
      color: colors.window,
      roughness: 0.2,
      metalness: 0.05,
      opacity: 0.75,
      transparent: true,
    });
    const matStone = new THREE.MeshStandardMaterial({
      color: colors.stone,
      roughness: 0.9,
    });

    const basePadX = L * 0.92;
    const basePadZ = W * 0.92;
    if (withCourtyard) {
      const courtyard = box(basePadX, 0.06, basePadZ, matTile);
      courtyard.position.set(0, 0.03, 0);
      courtyard.receiveShadow = true;
      group.add(courtyard);
    }

    const hallW = Math.min(L * 0.58, 26);
    const hallD = Math.min(W * 0.7, 10.5);
    const hallH = 5.2;
    const hallBase = box(hallW, hallH, hallD, matWall);
    hallBase.position.set(0, hallH / 2, 0);
    group.add(hallBase);

    const socle = box(hallW + 0.6, 0.3, hallD + 0.6, matStone);
    socle.position.set(0, 0.15, 0);
    group.add(socle);

    const roofH = 0.6;
    const roof = box(hallW + 0.2, roofH, hallD + 0.2, matRoof);
    roof.position.set(0, hallH + roofH / 2, 0);
    group.add(roof);

    const domeR = Math.min(hallW, hallD) * 0.28;
    const dome = ico(domeR, matDome, 0);
    dome.position.set(0, hallH + roofH + domeR * 0.95, 0);
    group.add(dome);

    const finialBase = cyl(0.12, 0.4, matAccent, 10);
    finialBase.position.set(0, dome.position.y + domeR * 0.95 + 0.2, 0);
    const finialCone = cone(0.18, 0.5, matAccent, 10);
    finialCone.position.set(0, finialBase.position.y + 0.45, 0);
    group.add(finialBase, finialCone);

    const porchW = hallW * 0.9;
    const porchD = Math.min(W * 0.18, 2.6);
    const porchH = 3.0;
    const porch = box(porchW, porchH, porchD, matWall);
    porch.position.set(0, porchH / 2, -hallD / 2 - porchD / 2);
    group.add(porch);

    const porchRoof = box(porchW + 0.1, 0.4, porchD + 0.1, matRoof);
    porchRoof.position.set(porch.position.x, porchH + 0.2, porch.position.z);
    group.add(porchRoof);

    const doorW = porchW * 0.28;
    const doorH = 2.2;
    const door = box(doorW, doorH, 0.12, matDoor);
    door.position.set(0, doorH / 2, porch.position.z - porchD / 2);
    group.add(door);

    const archW = doorW + 0.4;
    const archH = doorH + 0.5;
    const archFrame = box(archW, archH, 0.18, matAccent);
    archFrame.position.set(door.position.x, archH / 2, door.position.z + 0.04);
    group.add(archFrame);

    if (withMinaret && minarets > 0) {
      const towerH = 9.5;
      const shaftR = 0.45;
      const balconyR = 0.7;
      const topConeH = 1.2;
      const positions = [];
      if (minarets === 1) {
        positions.push([hallW / 2 + 1.4, -hallD / 2 - 0.8]);
      } else {
        positions.push(
          [-hallW / 2 - 1.4, -hallD / 2 - 0.8],
          [hallW / 2 + 1.4, -hallD / 2 - 0.8]
        );
      }
      positions.forEach(([px, pz]) => {
        const base = box(1.2, 0.3, 1.2, matStone);
        base.position.set(px, 0.15, pz);
        const shaft = cyl(shaftR, towerH, matWall, 10);
        shaft.position.set(px, towerH / 2, pz);
        const belt = cyl(shaftR + 0.08, 0.2, matAccent, 10);
        belt.position.set(px, 2.2, pz);
        const balcony = cyl(balconyR, 0.18, matAccent, 12);
        balcony.position.set(px, 5.6, pz);
        const lantern = box(0.6, 0.6, 0.6, matRoof);
        lantern.position.set(px, 6.2, pz);
        const coneTop = cone(0.45, topConeH, matAccent, 10);
        coneTop.position.set(px, 6.2 + topConeH / 2 + 0.3, pz);
        group.add(base, shaft, belt, balcony, lantern, coneTop);
      });
    }

    const plazaH = 0.06;
    const plaza = box(L, plazaH, W, matTile);
    plaza.position.set(0, 0.03, 0);
    group.add(plaza);

    const light = new THREE.PointLight(0xfff1c1, 0.8, 28, 2.0);
    light.position.set(0, 7.5, 0);
    group.add(light);

    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);
    this.scene.add(group);

    if (registerColliders && this && this.buildings) {
      hallBase.updateMatrixWorld(true);
      const bbox = new THREE.Box3().setFromObject(hallBase);
      this.buildings.push({ mesh: hallBase, boundingBox: bbox, name });
      porch.updateMatrixWorld(true);
      const bbox2 = new THREE.Box3().setFromObject(porch);
      this.buildings.push({
        mesh: porch,
        boundingBox: bbox2,
        name: name + ' Porch',
      });
    }

    return group;
  }

  createRumahMakanPadang(
    x,
    z,
    {
      scale = 1.4,
      rotate = 0,
      size = { length: 50, width: 20.3 },
      name = 'Rumah Makan Padang',
      withSign = true,
      withEtalase = true,
      registerColliders = true,
      diningOffsetZ = 1.6,
    } = {}
  ) {
    const group = new THREE.Group();
    const L = size.length;
    const W = size.width;

    const colors = {
      wall: 0xf0e9da,
      trim: 0x8b5e3c,
      roof: 0x2b2b2b,
      accent: 0xc62828,
      glass: 0x9bc1e2,
      base: 0xb8b2a7,
      tile: 0xded9cf,
      seat: 0x6d4c41,
      table: 0x8d6e63,
      pillar: 0x947155,
      fascia: 0x1f2937,
    };

    function box(w, h, d, mat) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function cyl(r, h, mat, seg = 10) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function cone(r, h, mat, seg = 8) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }

    const matWall = new THREE.MeshStandardMaterial({
      color: colors.wall,
      roughness: 0.9,
    });
    const matTrim = new THREE.MeshStandardMaterial({
      color: colors.trim,
      roughness: 0.8,
    });
    const matRoof = new THREE.MeshStandardMaterial({
      color: colors.roof,
      roughness: 0.7,
    });
    const matAccent = new THREE.MeshStandardMaterial({
      color: colors.accent,
      roughness: 0.6,
      metalness: 0.15,
    });
    const matGlass = new THREE.MeshStandardMaterial({
      color: colors.glass,
      roughness: 0.2,
      metalness: 0.05,
      transparent: true,
      opacity: 0.6,
    });
    const matBase = new THREE.MeshStandardMaterial({
      color: colors.base,
      roughness: 0.95,
    });
    const matTile = new THREE.MeshStandardMaterial({
      color: colors.tile,
      roughness: 0.95,
    });
    const matSeat = new THREE.MeshStandardMaterial({
      color: colors.seat,
      roughness: 0.8,
    });
    const matTable = new THREE.MeshStandardMaterial({
      color: colors.table,
      roughness: 0.8,
    });
    const matPillar = new THREE.MeshStandardMaterial({
      color: colors.pillar,
      roughness: 0.8,
    });
    const matFascia = new THREE.MeshStandardMaterial({
      color: colors.fascia,
      roughness: 0.7,
    });

    const ground = box(L * 0.92, 0.06, W * 0.9, matTile);
    ground.position.set(0, 0.03, 0);
    group.add(ground);

    const bodyW = Math.min(L * 0.56, 24);
    const bodyD = Math.min(W * 0.56, 9.0);
    const bodyH = 4.6;

    const buildingGroup = new THREE.Group();

    const base = box(bodyW + 0.8, 0.28, bodyD + 0.8, matBase);
    base.position.set(0, 0.14, 0);
    buildingGroup.add(base);

    const hall = box(bodyW, bodyH, bodyD, matWall);
    hall.position.set(0, bodyH / 2 + 0.28, 0);
    buildingGroup.add(hall);

    const cornerP = 0.12;
    const c1 = cyl(cornerP, bodyH + 0.2, matPillar);
    c1.position.set(
      -bodyW / 2 + 0.22,
      (bodyH + 0.2) / 2 + 0.28,
      -bodyD / 2 + 0.22
    );
    const c2 = c1.clone();
    c2.position.z = bodyD / 2 - 0.22;
    const c3 = c1.clone();
    c3.position.x = bodyW / 2 - 0.22;
    const c4 = c2.clone();
    c4.position.x = bodyW / 2 - 0.22;
    buildingGroup.add(c1, c2, c3, c4);

    const crown = box(bodyW + 0.3, 0.2, bodyD + 0.3, matFascia);
    crown.position.set(0, bodyH + 0.38, 0);
    buildingGroup.add(crown);

    const roofBase = box(bodyW + 0.5, 0.36, bodyD + 0.5, matRoof);
    roofBase.position.set(0, crown.position.y + 0.26, 0);
    buildingGroup.add(roofBase);

    const ridgeLen = bodyW * 0.92;
    const ridge = box(ridgeLen, 0.2, 0.42, matRoof);
    ridge.position.set(0, roofBase.position.y + 0.28, 0);
    buildingGroup.add(ridge);

    function addGonjong(side = 1, lift = 1.7, r = 0.48) {
      const tip = cone(r, lift, matRoof, 6);
      tip.rotation.z = Math.PI / 2;
      tip.position.set(
        (ridgeLen / 2 + 0.36) * side,
        ridge.position.y + 0.26,
        0
      );
      const cap = cyl(0.085, 0.3, matAccent, 8);
      cap.position.set(tip.position.x, tip.position.y + lift * 0.45, 0);
      buildingGroup.add(tip, cap);
    }
    addGonjong(1);
    addGonjong(-1);

    const fasciaFront = box(bodyW + 0.6, 0.14, 0.08, matAccent);
    fasciaFront.position.set(
      0,
      roofBase.position.y + 0.04,
      -(bodyD + 0.5) / 2 + 0.06
    );
    const fasciaBack = fasciaFront.clone();
    fasciaBack.position.z = (bodyD + 0.5) / 2 - 0.06;
    buildingGroup.add(fasciaFront, fasciaBack);

    const porchD = Math.min(W * 0.16, 2.2);
    const porchH = 3.2;
    const porch = box(bodyW * 0.9, porchH, porchD, matWall);
    porch.position.set(0, porchH / 2 + 0.28, -bodyD / 2 - porchD / 2 + 0.05);
    buildingGroup.add(porch);

    const porchRoof = box(
      porch.geometry.parameters.width + 0.2,
      0.22,
      porchD + 0.18,
      matRoof
    );
    porchRoof.position.set(
      0,
      porch.position.y + porchH / 2 + 0.12,
      porch.position.z
    );
    buildingGroup.add(porchRoof);

    const doorW = 1.9;
    const doorH = 2.5;
    const door = box(doorW, doorH, 0.12, matTrim);
    door.position.set(0, doorH / 2 + 0.28, porch.position.z - porchD / 2);
    buildingGroup.add(door);

    const canopy = box(
      porch.geometry.parameters.width + 5,
      0.14,
      1.2,
      matAccent
    );
    canopy.position.set(0, porchRoof.position.y + 0.42, door.position.z + 0.58);
    buildingGroup.add(canopy);

    if (withSign) {
      const sign = box(
        porch.geometry.parameters.width * 0.72,
        0.42,
        0.08,
        matAccent
      );
      sign.position.set(
        canopy.position.x,
        canopy.position.y + 0.36,
        canopy.position.z + 0.02
      );
      buildingGroup.add(sign);
    }

    if (withEtalase) {
      const caseW = porch.geometry.parameters.width * 0.86;
      const caseH = 1.05;
      const caseD = 0.64;
      const baseCase = box(caseW, 0.24, caseD, matTrim);
      baseCase.position.set(
        0,
        0.28 + 0.12,
        porch.position.z - porchD / 2 + 0.36
      );
      const frame = box(caseW, 0.06, caseD, matTrim);
      frame.position.set(
        baseCase.position.x,
        0.28 + caseH + 0.03,
        baseCase.position.z
      );
      const glassFront = box(caseW, caseH, 0.04, matGlass);
      glassFront.position.set(
        frame.position.x,
        0.28 + caseH / 2 + 0.03,
        frame.position.z + caseD / 2 - 0.02
      );
      const glassTop = box(caseW, 0.04, caseD, matGlass);
      glassTop.position.set(
        frame.position.x,
        frame.position.y + 0.05,
        frame.position.z
      );
      buildingGroup.add(baseCase, frame, glassFront, glassTop);
    }

    group.add(buildingGroup);

    function buildDining(sideOffset, zOffset) {
      const diningW = Math.min((L - bodyW) * 0.42, 9.6) - 2;
      const diningD = Math.min(W * 0.68, bodyD + 1.8);
      const diningX = sideOffset * (bodyW / 2 + diningW / 2 + 1.0);
      const diningZ = 0 + zOffset;

      const awning = box(diningW + 0.2, 0.16, diningD * 0.92 + 2, matAccent);
      awning.position.set(diningX, 2.8, diningZ);
      group.add(awning);

      const awnLegR = 0.07;
      const legCount = 4;
      for (let i = 0; i < legCount; i++) {
        const t = -diningD / 2 + (i / (legCount - 1)) * diningD;
        const lx = diningX - sideOffset * (diningW / 2 - 0.12);
        const rx = diningX + sideOffset * (diningW / 2 - 0.12);
        const l = cyl(awnLegR, 2.8, matTrim);
        l.position.set(lx, 1.4, diningZ + t);
        const r = cyl(awnLegR, 2.8, matTrim);
        r.position.set(rx, 1.4, diningZ + t);
        group.add(l, r);
      }

      const rows = 2;
      const cols = 2;
      const colGap = diningW * 0.32;
      const rowGap = 1.4;
      const startX = diningX - sideOffset * ((colGap * (cols - 1)) / 2);
      const startZ = diningZ - (rowGap * (rows - 1)) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tx = startX + sideOffset * (c * colGap);
          const tz = startZ + r * rowGap;

          const table = box(1.0, 0.08, 0.6, matTable);
          table.position.set(tx, 0.58, tz);

          const leg1 = cyl(0.06, 0.55, matTable);
          leg1.position.set(tx - 0.42, 0.305, tz - 0.22);
          const leg2 = cyl(0.06, 0.55, matTable);
          leg2.position.set(tx + 0.42, 0.305, tz - 0.22);
          const leg3 = cyl(0.06, 0.55, matTable);
          leg3.position.set(tx - 0.42, 0.305, tz + 0.22);
          const leg4 = cyl(0.06, 0.55, matTable);
          leg4.position.set(tx + 0.42, 0.305, tz + 0.22);

          const benchL = box(0.9, 0.06, 0.28, matSeat);
          benchL.position.set(tx, 0.36, tz - 0.5);
          const benchR = box(0.9, 0.06, 0.28, matSeat);
          benchR.position.set(tx, 0.36, tz + 0.5);

          group.add(table, leg1, leg2, leg3, leg4, benchL, benchR);
        }
      }
    }

    buildDining(1, diningOffsetZ);
    buildDining(-1, diningOffsetZ);

    const lightFront = new THREE.PointLight(0xfff1c1, 0.8, 24, 2.0);
    lightFront.position.set(0, bodyH + 3.0, -bodyD / 2 - 0.8);
    group.add(lightFront);

    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);
    this.scene.add(group);

    if (registerColliders && this) {
      this.buildings = this.buildings || [];
      group.updateMatrixWorld(true);
      buildingGroup.updateMatrixWorld(true);
      const bbox = new THREE.Box3().setFromObject(buildingGroup);
      this.buildings.push({ mesh: buildingGroup, boundingBox: bbox, name });
    }

    return group;
  }

  createTamanLabirin(
    x,
    z,
    {
      scale = 1.4,
      rotate = 0,
      size = { length: 44, width: 19 },
      registerColliders = true,

      rows = 11,
      cols = 17,
      margin = 1.2,
      wallThickness = 0.25,
      wallHeight = 1.8,
      pathHeight = 0.08,

      pathColor = 0xc9c3a1,
      hedgeColor = 0x2f6f3a,
      curbColor = 0x8b5e3c,
      grassColor = 0x3a7a4a,

      colliderEndGap = 0.12,
      colliderThicknessScale = 0.7,
    } = {}
  ) {
    const group = new THREE.Group();
    const L = size.length;
    const W = size.width;

    function box(w, h, d, mat) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }

    const self = this;
    function regCollider(mesh, name) {
      if (!registerColliders) return;
      try {
        if (typeof self.addColliderFromObject === 'function') {
          self.addColliderFromObject(mesh, name);
        } else if (self && self.buildings) {
          mesh.updateMatrixWorld(true);
          const bbox = new THREE.Box3().setFromObject(mesh);
          self.buildings.push({ mesh, boundingBox: bbox, name });
        }
      } catch (_) {}
    }

    const matGrass = new THREE.MeshStandardMaterial({
      color: grassColor,
      roughness: 0.95,
    });
    const matPath = new THREE.MeshStandardMaterial({
      color: pathColor,
      roughness: 0.92,
    });
    const matHedge = new THREE.MeshStandardMaterial({
      color: hedgeColor,
      roughness: 0.65,
    });
    const matCurb = new THREE.MeshStandardMaterial({
      color: curbColor,
      roughness: 0.85,
    });
    const matGhost = new THREE.MeshStandardMaterial({
      visible: false,
      color: 0x000000,
    });

    const grass = box(L, 0.06, W, matGrass);
    grass.position.set(0, 0.03, 0);
    group.add(grass);

    const innerL = L - 2 * margin;
    const innerW = W - 2 * margin;

    const path = box(innerL, pathHeight, innerW, matPath);
    path.position.set(0, pathHeight / 2, 0);
    group.add(path);

    const curbH = 0.2,
      curbT = 0.22;
    const curb1 = box(L, curbH, curbT, matCurb);
    curb1.position.set(0, curbH / 2, -W / 2 + curbT / 2);
    const curb2 = box(L, curbH, curbT, matCurb);
    curb2.position.set(0, curbH / 2, W / 2 - curbT / 2);
    const curb3 = box(curbT, curbH, W, matCurb);
    curb3.position.set(-L / 2 + curbT / 2, curbH / 2, 0);
    const curb4 = box(curbT, curbH, W, matCurb);
    curb4.position.set(L / 2 - curbT / 2, curbH / 2, 0);
    group.add(curb1, curb2, curb3, curb4);

    rows = Math.max(5, Math.floor(rows));
    cols = Math.max(5, Math.floor(cols));

    const cellW = innerL / cols;
    const cellH = innerW / rows;

    const originX = -innerL / 2;
    const originZ = -innerW / 2;

    function makeGrid(r, c) {
      const g = new Array(r);
      for (let i = 0; i < r; i++) {
        g[i] = new Array(c);
        for (let j = 0; j < c; j++) {
          g[i][j] = {
            visited: false,
            walls: { N: true, E: true, S: true, W: true },
          };
        }
      }
      return g;
    }
    const grid = makeGrid(rows, cols);

    function neighbors(r, c) {
      const list = [];
      if (r > 0) list.push({ r: r - 1, c, dir: 'N', opp: 'S' });
      if (c < cols - 1) list.push({ r, c: c + 1, dir: 'E', opp: 'W' });
      if (r < rows - 1) list.push({ r: r + 1, c, dir: 'S', opp: 'N' });
      if (c > 0) list.push({ r, c: c - 1, dir: 'W', opp: 'E' });
      return list;
    }

    (function carve() {
      const stack = [];
      let cr = rows - 1,
        cc = Math.floor(cols / 2);
      grid[cr][cc].visited = true;
      stack.push({ r: cr, c: cc });

      while (stack.length) {
        const cur = stack[stack.length - 1];
        const cand = neighbors(cur.r, cur.c).filter(
          (n) => !grid[n.r][n.c].visited
        );
        if (!cand.length) {
          stack.pop();
          continue;
        }
        const pick = cand[(Math.random() * cand.length) | 0];
        grid[cur.r][cur.c].walls[pick.dir] = false;
        grid[pick.r][pick.c].walls[pick.opp] = false;
        grid[pick.r][pick.c].visited = true;
        stack.push({ r: pick.r, c: pick.c });
      }

      const southC = Math.floor(cols / 2);
      grid[rows - 1][southC].walls.S = false;
      const northC = (Math.random() * cols) | 0;
      grid[0][northC].walls.N = false;
    })();

    const wallsGroup = new THREE.Group();
    const colliderMeshes = [];

    function makeWallSegment({
      w_vis,
      d_vis,
      h,
      posX,
      posZ,
      axis,
      name,
      isBoundaryA = false,
      isBoundaryB = false,
    }) {
      const vis = box(w_vis, h, d_vis, matHedge);
      vis.position.set(posX, pathHeight + h / 2, posZ);
      wallsGroup.add(vis);

      const shrinkA = isBoundaryA ? 0 : colliderEndGap;
      const shrinkB = isBoundaryB ? 0 : colliderEndGap;

      let w_col = w_vis,
        d_col = d_vis;

      if (axis === 'X') {
        w_col = Math.max(0.001, w_vis - (shrinkA + shrinkB));
        d_col = Math.max(0.001, d_vis * colliderThicknessScale);

        const shift = (shrinkB - shrinkA) / 2;
        const col = box(w_col, h, d_col, matGhost);
        col.position.set(posX + shift, pathHeight + h / 2, posZ);
        col.visible = false;
        wallsGroup.add(col);
        colliderMeshes.push({ mesh: col, name: name + '_col' });
      } else {
        d_col = Math.max(0.001, d_vis - (shrinkA + shrinkB));
        w_col = Math.max(0.001, w_vis * colliderThicknessScale);

        const shift = (shrinkB - shrinkA) / 2;
        const col = box(w_col, h, d_col, matGhost);
        col.position.set(posX, pathHeight + h / 2, posZ + shift);
        col.visible = false;
        wallsGroup.add(col);
        colliderMeshes.push({ mesh: col, name: name + '_col' });
      }

      return vis;
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        if (cell.walls.N) {
          const w = cellW;
          const d = wallThickness;
          const h = wallHeight;
          const x = originX + c * cellW + w / 2;
          const z = originZ + r * cellH;
          makeWallSegment({
            w_vis: w,
            d_vis: d,
            h,
            posX: x,
            posZ: z,
            axis: 'X',
            name: `MazeWall_N_${r}_${c}`,
            isBoundaryA: c === 0,
            isBoundaryB: c === cols - 1,
          });
        }

        if (cell.walls.W) {
          const w = wallThickness;
          const d = cellH;
          const h = wallHeight;
          const x = originX + c * cellW;
          const z = originZ + r * cellH + d / 2;
          makeWallSegment({
            w_vis: w,
            d_vis: d,
            h,
            posX: x,
            posZ: z,
            axis: 'Z',
            name: `MazeWall_W_${r}_${c}`,
            isBoundaryA: r === rows - 1,
            isBoundaryB: r === 0,
          });
        }

        if (c === cols - 1 && cell.walls.E) {
          const w = wallThickness;
          const d = cellH;
          const h = wallHeight;
          const x = originX + (c + 1) * cellW;
          const z = originZ + r * cellH + d / 2;
          makeWallSegment({
            w_vis: w,
            d_vis: d,
            h,
            posX: x,
            posZ: z,
            axis: 'Z',
            name: `MazeWall_E_${r}_${c}`,
            isBoundaryA: r === rows - 1,
            isBoundaryB: r === 0,
          });
        }

        if (r === rows - 1 && cell.walls.S) {
          const w = cellW;
          const d = wallThickness;
          const h = wallHeight;
          const x = originX + c * cellW + w / 2;
          const z = originZ + (r + 1) * cellH;
          makeWallSegment({
            w_vis: w,
            d_vis: d,
            h,
            posX: x,
            posZ: z,
            axis: 'X',
            name: `MazeWall_S_${r}_${c}`,
            isBoundaryA: c === 0,
            isBoundaryB: c === cols - 1,
          });
        }
      }
    }

    group.add(wallsGroup);

    const entranceC = Math.floor(cols / 2);
    const rampW = cellW * 0.6;
    const rampD = wallThickness * 0.9;
    const rampH = pathHeight + 0.02;
    const ramp = box(rampW, rampH, rampD, matPath);
    ramp.position.set(
      originX + entranceC * cellW + cellW / 2,
      rampH / 2,
      originZ + rows * cellH + rampD / 2
    );
    group.add(ramp);

    const light = new THREE.PointLight(
      0xfff1c1,
      0.5,
      Math.max(L, W) * 1.2,
      2.0
    );
    light.position.set(0, 4.2, 0);
    group.add(light);

    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);
    this.scene.add(group);

    if (registerColliders) {
      for (const { mesh, name } of colliderMeshes) regCollider(mesh, name);
    }

    return group;
  }

  createWarkop(
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
    group.add(makeMat(-2.6, 1.5, 0x6b4f35), makeMat(2.6, 1.2, 0x5a3d2b));

    const cart = new THREE.Group();

    const cartBody = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.25, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x8b5e3c, roughness: 0.85 })
    );
    cartBody.position.set(0, 0.8, 0);
    cartBody.castShadow = true;
    cart.add(cartBody);

    const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.12, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x2f2f2f });
    [
      [-1.3, -0.85],
      [1.3, -0.85],
      [-1.3, 0.85],
      [1.3, 0.85],
    ].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(wx, 0.2, wz);
      w.rotation.z = Math.PI / 2;
      w.castShadow = true;
      cart.add(w);
    });

    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(3.7, 0.1, 2.6),
      new THREE.MeshStandardMaterial({ color: 0xd8c7a4, roughness: 0.7 })
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
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x5b5b5b });
    [
      [-1.7, -1.2],
      [1.7, -1.2],
      [-1.7, 1.2],
      [1.7, 1.2],
    ].forEach(([px, pz]) => {
      const p = new THREE.Mesh(poleGeo, poleMat);
      p.position.set(px, groundTopY + poleHeight / 2, pz);
      p.castShadow = true;
      p.receiveShadow = true;
      cart.add(p);
    });

    const menuBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 1.2, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 })
    );
    menuBoard.position.set(-2.1, 0.65, -0.2);
    menuBoard.castShadow = true;
    cart.add(menuBoard);

    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.22, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x2b2b2b, emissive: 0x000000 })
    );
    sign.position.set(0, 2.15, 1.05);
    cart.add(sign);
    function addSignText(str, startX, y, z, scaleX = 0.08, space = 0.06) {
      for (let i = 0; i < str.length; i++) {
        if (str[i] === ' ') {
          startX += space * 2;
          continue;
        }
        const letter = new THREE.Mesh(
          new THREE.BoxGeometry(scaleX, 0.14, 0.02),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
        );
        letter.position.set(startX + i * (scaleX + space), y, z);
        cart.add(letter);
      }
    }
    addSignText('WARUNG KOPI', -0.9, 2.16, 1.12, 0.09, 0.05);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xffb347,
        emissive: 0xffb347,
        emissiveIntensity: 0.9,
      })
    );
    bulb.position.set(0, 2.25, 0);
    cart.add(bulb);
    const point = new THREE.PointLight(0xffe0b5, 1.0, 10, 2.0);
    point.position.set(0, 2.25, 0);
    cart.add(point);

    const top = new THREE.Mesh(
      new THREE.BoxGeometry(3.1, 0.08, 1.9),
      new THREE.MeshStandardMaterial({ color: 0x9c6b3a, roughness: 0.7 })
    );
    top.position.set(0, 1.45, 0);
    cart.add(top);

    const kettleBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.22, 16),
      new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.7,
        roughness: 0.3,
      })
    );
    kettleBody.position.set(-0.9, 1.55, -0.4);
    cart.add(kettleBody);
    const kettleLid = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.08, 16),
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.7 })
    );
    kettleLid.position.set(-0.9, 1.69, -0.4);
    cart.add(kettleLid);
    const kettleHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.03, 8, 16, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    kettleHandle.rotation.y = Math.PI / 2;
    kettleHandle.position.set(-0.9, 1.72, -0.4);
    cart.add(kettleHandle);

    for (let i = 0; i < 5; i++) {
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.055, 0.1, 12),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.6 })
      );
      cup.position.set(-0.2 + i * 0.12, 1.5, 0.55);
      cart.add(cup);
    }

    const jar1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.22, 14),
      new THREE.MeshStandardMaterial({ color: 0x5c3b27, roughness: 0.8 })
    );
    jar1.position.set(0.6, 1.55, 0.4);
    cart.add(jar1);
    const jar2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.22, 14),
      new THREE.MeshStandardMaterial({ color: 0xc2a97a, roughness: 0.8 })
    );
    jar2.position.set(0.9, 1.55, 0.4);
    cart.add(jar2);

    const dripper = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.1, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 })
    );
    dripper.rotation.x = Math.PI;
    dripper.position.set(0.2, 1.54, -0.1);
    cart.add(dripper);
    const server = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.18, 12),
      new THREE.MeshStandardMaterial({
        color: 0x3b2f2f,
        metalness: 0.1,
        roughness: 0.9,
      })
    );
    server.position.set(0.2, 1.47, -0.28);
    cart.add(server);

    const grinderBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.12, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x6f4e37, roughness: 0.75 })
    );
    grinderBase.position.set(-0.4, 1.52, 0.1);
    cart.add(grinderBase);
    const grinderTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.1, 12),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    grinderTop.position.set(-0.4, 1.62, 0.1);
    cart.add(grinderTop);
    const grinderHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.02, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    grinderHandle.position.set(-0.32, 1.66, 0.1);
    cart.add(grinderHandle);

    const stove = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.12, 0.32),
      new THREE.MeshStandardMaterial({ color: 0x355e9a })
    );
    stove.position.set(1.05, 1.46, -0.45);
    stove.castShadow = true;
    cart.add(stove);
    const fire = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.16, 8),
      new THREE.MeshStandardMaterial({
        color: 0xff4500,
        emissive: 0xff4500,
        emissiveIntensity: 1,
      })
    );
    fire.position.set(1.05, 1.56, -0.45);
    cart.add(fire);

    cart.position.set(0, 0, -1.8);
    group.add(cart);

    const vendor = characterFactory
      ? characterFactory(0x8b4513, npcScale)
      : makeMinecraftCharacterWithJoints(0x8b4513, npcScale);
    const standY = 1 * npcScale;
    vendor.position.set(0, standY, -2.9 - vendorBack);
    poseVendor(vendor);
    group.add(vendor);

    const sitSpots = [
      { x: -2.8, z: 1.3, face: 15 },
      { x: 2.6, z: 1.1, face: 160 },
    ];
    function makeGlass(color = 0x3b2f2f) {
      return new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.055, 0.12, 12),
        new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
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

      const glass = makeGlass(0x3b2f2f);
      if (npc.userData?.rightArm) {
        const s = npc.userData.scale || 1;
        glass.position.set(0, -0.32 * s, 0.12 * s);
        npc.userData.rightArm.add(glass);
      } else {
        glass.position.set(spot.x + 0.18, 0.06, spot.z + 0.06);
        group.add(glass);
      }
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
    this.buildings &&
      this.buildings.push({
        mesh: cart,
        boundingBox: cartBox,
        name: 'Warung Kopi - Gerobak',
      });

    return group;
  }

  createPertamini(
    x,
    z,
    {
      scale = 1.35,
      rotate = 0,
      registerColliders = true,

      hasCanopy = true,
      pumpsCount = 1,
      brandColor = 0xe11d48,
      trimColor = 0xffffff,
      baseColor = 0x222222,
      floorColor = 0xbdbdbd,
      poleColor = 0x5b5b5b,

      pricePertalite = 10000,
      pricePertamax = 13500,

      withVendor = true,
      npcScale = 0.9,
      npcColor = 0x2563eb,
      vendorOffsetZ = 1.0,
    } = {}
  ) {
    const group = new THREE.Group();

    function box(w, h, d, mat) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function cyl(r, h, mat, seg = 20) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }

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

    const self = this;
    function regCollider(mesh, name) {
      if (!registerColliders) return;
      try {
        if (typeof self.addColliderFromObject === 'function') {
          self.addColliderFromObject(mesh, name);
        } else if (self && self.buildings) {
          mesh.updateMatrixWorld(true);
          const bbox = new THREE.Box3().setFromObject(mesh);
          self.buildings.push({ mesh, boundingBox: bbox, name });
        }
      } catch (_) {}
    }

    const matFloor = new THREE.MeshStandardMaterial({
      color: floorColor,
      roughness: 0.95,
    });
    const matBrand = new THREE.MeshStandardMaterial({
      color: brandColor,
      roughness: 0.6,
    });
    const matTrim = new THREE.MeshStandardMaterial({
      color: trimColor,
      roughness: 0.6,
    });
    const matBase = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 0.7,
    });
    const matPole = new THREE.MeshStandardMaterial({
      color: poleColor,
      roughness: 0.6,
      metalness: 0.2,
    });
    const matGlass = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      roughness: 0.2,
      metalness: 0.0,
    });
    const matHose = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.9,
    });
    const matJerry = new THREE.MeshStandardMaterial({
      color: 0xcc0000,
      roughness: 0.7,
    });

    const marka = box(
      2.2,
      0.01,
      0.06,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
    );
    marka.position.set(0, 0.09, 1.2);
    group.add(marka);

    let canopy;
    if (hasCanopy) {
      canopy = box(6.0, 0.12, 3.0, matTrim);
      canopy.position.set(0, 3.0, 0);
      group.add(canopy);

      const strip = box(6.0, 0.08, 0.2, matBrand);
      strip.position.set(0, 3.06, 1.4);
      group.add(strip);

      const groundY = 0;
      const canopyUnderY = canopy.position.y - 0.06;
      const poleH = Math.max(0.1, canopyUnderY - groundY - 0.01);
      const poleGeo = new THREE.CylinderGeometry(0.09, 0.09, poleH, 16);
      [
        [-2.7, -1.2],
        [2.7, -1.2],
        [-2.7, 1.2],
        [2.7, 1.2],
      ].forEach(([px, pz]) => {
        const p = new THREE.Mesh(poleGeo, matPole);
        p.position.set(px, groundY + poleH / 2, pz);
        p.castShadow = true;
        p.receiveShadow = true;
        group.add(p);
      });

      const lamp = new THREE.PointLight(0xffe0b5, 0.85, 12, 2.0);
      lamp.position.set(0, 2.7, 0);
      group.add(lamp);
    }

    const pumpsGroup = new THREE.Group();

    function makePump(nameTag = 'Pump') {
      const g = new THREE.Group();

      const base = box(1.1, 0.12, 0.9, matBase);
      base.position.set(0, 0.06, 0);
      g.add(base);

      const body = box(1.0, 1.6, 0.7, matTrim);
      body.position.set(0, 0.06 + 0.8, 0);
      g.add(body);

      const head = box(1.02, 0.18, 0.72, matBrand);
      head.position.set(0, 0.06 + 1.6 + 0.09, 0);
      g.add(head);

      const glass = box(0.82, 0.5, 0.04, matGlass);
      glass.position.set(0, 0.06 + 1.05, 0.37);
      g.add(glass);

      const frame = box(0.86, 0.56, 0.02, matBase);
      frame.position.set(0, 0.06 + 1.05, 0.39);
      g.add(frame);

      const digit = box(
        0.12,
        0.06,
        0.01,
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      const digits = [];
      for (let i = 0; i < 4; i++) {
        const d = digit.clone();
        d.position.set(-0.24 + i * 0.16, 0.06 + 1.05, 0.395);
        digits.push(d);
        g.add(d);
      }

      const hose = cyl(0.025, 0.9, matHose, 12);
      hose.rotation.x = Math.PI / 2;
      hose.position.set(0.45, 0.06 + 1.0, 0.2);
      g.add(hose);

      const nozzle = box(
        0.18,
        0.06,
        0.05,
        new THREE.MeshStandardMaterial({ color: 0x444444 })
      );
      nozzle.position.set(0.55, 0.06 + 0.8, 0.25);
      g.add(nozzle);

      const label = box(0.7, 0.12, 0.02, matBrand);
      label.position.set(0, 0.06 + 0.55, 0.39);
      g.add(label);

      g.userData = { nameTag, colliders: [base, body, head] };
      return g;
    }

    const spacing = 1.5;
    const count = Math.max(1, Math.min(2, Math.floor(pumpsCount)));
    for (let i = 0; i < count; i++) {
      const pump = makePump(`Pump_${i + 1}`);
      const offsetX = count === 1 ? 0 : -spacing / 2 + i * spacing;
      pump.position.set(offsetX, 0, 0);
      pumpsGroup.add(pump);
    }
    pumpsGroup.position.set(0, 0, 0);
    group.add(pumpsGroup);

    const priceBoard = new THREE.Group();
    const board = box(1.2, 1.4, 0.1, matBase);
    board.position.set(0, 0.7, 0);
    priceBoard.add(board);

    const header = box(1.18, 0.18, 0.12, matBrand);
    header.position.set(0, 1.35, 0.01);
    priceBoard.add(header);

    function addPriceRow(y, labelBlocks = 5) {
      const row = new THREE.Group();
      const label = box(
        0.28,
        0.08,
        0.02,
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      label.position.set(-0.36, y, 0.055);
      row.add(label);
      for (let i = 0; i < labelBlocks; i++) {
        const digit = box(
          0.09,
          0.06,
          0.02,
          new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        digit.position.set(-0.15 + i * 0.12, y, 0.055);
        row.add(digit);
      }
      return row;
    }
    priceBoard.add(addPriceRow(1.02));
    priceBoard.add(addPriceRow(0.78));

    priceBoard.position.set(-2.2, 0, -0.2);
    group.add(priceBoard);

    const stash = new THREE.Group();
    const drum = cyl(
      0.3,
      0.9,
      new THREE.MeshStandardMaterial({ color: 0x9e1b32, roughness: 0.6 }),
      20
    );
    drum.position.set(0, 0.45, 0);
    stash.add(drum);

    for (let i = 0; i < 3; i++) {
      const j = box(0.26, 0.34, 0.16, matJerry);
      j.position.set(0.5 + i * 0.28, 0.17, -0.1 + (i % 2) * 0.18);
      stash.add(j);
    }
    stash.position.set(2.2, 0, -0.2);
    group.add(stash);

    if (withVendor) {
      const vendor = makeMinecraftCharacterWithJoints(npcColor, npcScale);
      if (vendor.userData?.leftArm)
        vendor.userData.leftArm.rotation.x = THREE.MathUtils.degToRad(-15);
      if (vendor.userData?.rightArm)
        vendor.userData.rightArm.rotation.x = THREE.MathUtils.degToRad(-5);
      const standY = 1 * npcScale;
      vendor.position.set(0.9, standY, vendorOffsetZ);
      group.add(vendor);
    }

    const warm = new THREE.PointLight(0xffe3b1, 0.7, 10, 2.0);
    warm.position.set(0, 2.2, 1.2);
    group.add(warm);

    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);
    this.scene.add(group);

    if (registerColliders) {
      pumpsGroup.traverse((obj) => {
        if (obj?.userData?.colliders) {
          for (const m of obj.userData.colliders)
            regCollider(m, 'Pertamini_Pump');
        }
      });
      regCollider(priceBoard, 'Pertamini_Board');
      regCollider(stash, 'Pertamini_Stash');
      if (hasCanopy) {
        regCollider(group, 'Pertamini_Area');
      }
    }

    return group;
  }

  createGerobakBakso(
    x,
    z,
    {
      scale = 1.4,
      rotate = 0,
      characterFactory = null,
      npcScale = 0.9,
      vendorBack = 0.6,
      registerColliders = true,
      colors = {
        wood: 0x8b5e3c,
        trim: 0x6b4f2a,
        metal: 0x7a7a7a,
        wheel: 0x2f2f2f,
        glass: 0xffffff,
        signBg: 0x111111,
        signText: 0xffffff,
        tarp: 0xd8c7a4,
        stove: 0x355e9a,
        bowl: 0xeeeeee,
        condimentA: 0xc28436,
        condimentB: 0xd64545,
        condimentC: 0xc9b458,
        lamp: 0xffb347,
      },
    } = {}
  ) {
    const group = new THREE.Group();

    function box(w, h, d, mat) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function cyl(r, h, mat, seg = 20) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function cone(r, h, mat, seg = 12) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }

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

    function poseVendor(char) {
      if (!char?.userData) return;
      if (char.userData.leftArm)
        char.userData.leftArm.rotation.x = THREE.MathUtils.degToRad(-18);
      if (char.userData.rightArm)
        char.userData.rightArm.rotation.x = THREE.MathUtils.degToRad(-8);
    }

    const matWood = new THREE.MeshStandardMaterial({
      color: colors.wood,
      roughness: 0.85,
    });
    const matTrim = new THREE.MeshStandardMaterial({
      color: colors.trim,
      roughness: 0.8,
    });
    const matMetal = new THREE.MeshStandardMaterial({
      color: colors.metal,
      roughness: 0.5,
      metalness: 0.3,
    });
    const matWheel = new THREE.MeshStandardMaterial({ color: colors.wheel });
    const matGlass = new THREE.MeshStandardMaterial({
      color: colors.glass,
      transparent: true,
      opacity: 0.15,
      roughness: 0.2,
    });
    const matSignBg = new THREE.MeshStandardMaterial({
      color: colors.signBg,
      roughness: 0.6,
    });
    const matSignTx = new THREE.MeshStandardMaterial({
      color: colors.signText,
      roughness: 0.6,
    });
    const matTarp = new THREE.MeshStandardMaterial({
      color: colors.tarp,
      roughness: 0.7,
    });
    const matStove = new THREE.MeshStandardMaterial({
      color: colors.stove,
      roughness: 0.6,
    });
    const matBowl = new THREE.MeshStandardMaterial({
      color: colors.bowl,
      roughness: 0.6,
    });
    const matCondA = new THREE.MeshStandardMaterial({
      color: colors.condimentA,
      roughness: 0.8,
    });
    const matCondB = new THREE.MeshStandardMaterial({
      color: colors.condimentB,
      roughness: 0.8,
    });
    const matCondC = new THREE.MeshStandardMaterial({
      color: colors.condimentC,
      roughness: 0.8,
    });
    const matLamp = new THREE.MeshStandardMaterial({
      color: colors.lamp,
      emissive: colors.lamp,
      emissiveIntensity: 0.9,
    });

    const cart = new THREE.Group();

    const base = box(3.2, 0.14, 1.6, matTrim);
    base.position.set(0, 0.07, 0);
    cart.add(base);

    const body = box(3.2, 1.0, 1.6, matWood);
    body.position.set(0, 0.64, 0);
    cart.add(body);

    const glassFront = box(3.0, 0.7, 0.06, matGlass);
    glassFront.position.set(0, 1.1, 0.83);
    cart.add(glassFront);

    const counter = box(3.2, 0.06, 1.6, matTrim);
    counter.position.set(0, 1.2, 0);
    cart.add(counter);

    const canopy = box(3.4, 0.1, 1.8, matTarp);
    canopy.position.set(0, 2.2, 0);
    cart.add(canopy);

    const groundTopY = 0;
    const canopyUnderY = canopy.position.y - 0.05;
    const poleH = Math.max(0.1, canopyUnderY - groundTopY - 0.01);
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, poleH, 12);
    const poleMat = matMetal;
    [
      [-1.55, -0.75],
      [1.55, -0.75],
      [-1.55, 0.75],
      [1.55, 0.75],
    ].forEach(([px, pz]) => {
      const p = new THREE.Mesh(poleGeo, poleMat);
      p.position.set(px, groundTopY + poleH / 2, pz);
      p.castShadow = true;
      p.receiveShadow = true;
      cart.add(p);
    });

    const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.14, 16);
    [
      [-1.2, -0.8],
      [1.2, -0.8],
    ].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(wheelGeo, matWheel);
      w.position.set(wx, 0.26, wz);
      w.rotation.z = Math.PI / 2;
      cart.add(w);
    });

    const sign = box(2.4, 0.22, 0.08, matSignBg);
    sign.position.set(0, 2.0, 0.86);
    cart.add(sign);
    function addFlatText(
      str,
      centerX,
      y,
      z,
      charW = 0.12,
      charH = 0.14,
      space = 0.04
    ) {
      const startX =
        centerX -
        (str.replace(/ /g, '').length * charW + (str.length - 1) * space) / 2;
      let idx = 0;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === ' ') {
          idx++;
          continue;
        }
        const letter = box(charW, charH, 0.02, matSignTx);
        letter.position.set(startX + i * (charW + space), y, z);
        cart.add(letter);
        idx++;
      }
    }
    addFlatText('BAKSO', 0, 2.02, 0.9, 0.16, 0.16, 0.05);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      matLamp
    );
    bulb.position.set(0, 2.0, 0);
    cart.add(bulb);
    const lamp = new THREE.PointLight(colors.lamp, 0.95, 10, 2.0);
    lamp.position.set(0, 2.0, 0);
    cart.add(lamp);

    const pot = cyl(0.32, 0.32, matMetal, 20);
    pot.position.set(-0.8, 1.28, -0.35);
    cart.add(pot);
    const lid = cone(0.34, 0.14, matMetal, 16);
    lid.position.set(-0.8, 1.47, -0.35);
    cart.add(lid);
    const vent = cyl(0.05, 0.12, matMetal, 12);
    vent.position.set(-0.8, 1.57, -0.35);
    cart.add(vent);

    const stove = box(0.5, 0.12, 0.4, matStove);
    stove.position.set(-0.1, 1.26, -0.35);
    cart.add(stove);
    const fire = cone(
      0.08,
      0.16,
      new THREE.MeshStandardMaterial({
        color: 0xff4500,
        emissive: 0xff4500,
        emissiveIntensity: 1,
      }),
      8
    );
    fire.position.set(-0.1, 1.36, -0.35);
    cart.add(fire);

    for (let i = 0; i < 5; i++) {
      const bowl = cyl(0.11, 0.06, matBowl, 12);
      bowl.position.set(0.65, 1.26 + i * 0.055, 0.32);
      cart.add(bowl);
    }

    const bottles = [
      { x: 0.35, z: 0.35, mat: matCondB },
      { x: 0.5, z: 0.35, mat: matCondC },
      { x: 0.65, z: 0.35, mat: matCondA },
    ];
    bottles.forEach(({ x, z, mat }) => {
      const b = cyl(0.05, 0.16, mat, 12);
      b.position.set(x, 1.34, z);
      cart.add(b);
      const cap = cone(0.055, 0.06, mat, 8);
      cap.position.set(x, 1.46, z);
      cart.add(cap);
    });

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        const food = box(
          0.12,
          0.06,
          0.12,
          new THREE.MeshStandardMaterial({ color: 0xd2a679 })
        );
        food.position.set(-0.6 + i * 0.6, 1.05, 0.55 - j * 0.25);
        cart.add(food);
      }
    }

    const ladle = new THREE.Group();
    const handle = box(0.22, 0.02, 0.02, matMetal);
    handle.position.set(0.11, 0, 0);
    ladle.add(handle);
    const cup = cyl(0.04, 0.03, matMetal, 10);
    cup.rotation.x = Math.PI / 2;
    cup.position.set(0.21, -0.02, 0);
    ladle.add(cup);

    const vendor = characterFactory
      ? characterFactory(0xb45309, npcScale)
      : makeMinecraftCharacterWithJoints(0xb45309, npcScale);
    const standY = 1 * npcScale;
    vendor.position.set(0, standY, -1.7 - vendorBack);
    poseVendor(vendor);
    group.add(vendor);

    if (vendor.userData?.rightArm) {
      const s = vendor.userData.scale || 1;
      const l = ladle.clone();
      l.position.set(0.05 * s, -0.35 * s, 0.1 * s);
      l.rotation.z = THREE.MathUtils.degToRad(-15);
      vendor.userData.rightArm.add(l);
    }

    cart.position.set(0, 0, 0);
    group.add(cart);

    const warm = new THREE.PointLight(0xffe3b1, 0.75, 10, 2.0);
    warm.position.set(0.6, 1.8, 0.9);
    group.add(warm);

    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);
    this.scene.add(group);

    if (registerColliders) {
      const self = this;
      function regCollider(mesh, name) {
        try {
          if (typeof self.addColliderFromObject === 'function') {
            self.addColliderFromObject(mesh, name);
          } else if (self && self.buildings) {
            mesh.updateMatrixWorld(true);
            const bbox = new THREE.Box3().setFromObject(mesh);
            self.buildings.push({ mesh, boundingBox: bbox, name });
          }
        } catch (_) {}
      }

      regCollider(body, 'GerobakBakso_Body');
      regCollider(counter, 'GerobakBakso_Counter');
    }

    return group;
  }

  createGerobakBatagor(
    x,
    z,
    {
      scale = 1.4,
      rotate = 0,
      characterFactory = null,
      npcScale = 0.9,
      vendorBack = 0.6,
      registerColliders = true,
      colors = {
        wood: 0x8b5e3c,
        trim: 0x6b4f2a,
        metal: 0x7a7a7a,
        wheel: 0x2f2f2f,
        glass: 0xffffff,
        tarp: 0xd8c7a4,
        fryer: 0x3b3b3b,
        oil: 0xe6b800,
        stove: 0x355e9a,
        bowl: 0xededed,
        sambal: 0xd64545,
        kecap: 0x27211a,
        kacang: 0xc28436,
        signBg: 0x111111,
        signText: 0xffffff,
        lamp: 0xffb347,
      },
    } = {}
  ) {
    const group = new THREE.Group();

    function box(w, h, d, mat) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function cyl(r, h, mat, seg = 20) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function cone(r, h, mat, seg = 12) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }

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
    function poseVendor(char) {
      if (!char?.userData) return;
      if (char.userData.leftArm)
        char.userData.leftArm.rotation.x = THREE.MathUtils.degToRad(-18);
      if (char.userData.rightArm)
        char.userData.rightArm.rotation.x = THREE.MathUtils.degToRad(-6);
    }

    const matWood = new THREE.MeshStandardMaterial({
      color: colors.wood,
      roughness: 0.85,
    });
    const matTrim = new THREE.MeshStandardMaterial({
      color: colors.trim,
      roughness: 0.8,
    });
    const matMetal = new THREE.MeshStandardMaterial({
      color: colors.metal,
      roughness: 0.5,
      metalness: 0.3,
    });
    const matWheel = new THREE.MeshStandardMaterial({ color: colors.wheel });
    const matGlass = new THREE.MeshStandardMaterial({
      color: colors.glass,
      transparent: true,
      opacity: 0.15,
      roughness: 0.2,
    });
    const matTarp = new THREE.MeshStandardMaterial({
      color: colors.tarp,
      roughness: 0.7,
    });
    const matFryer = new THREE.MeshStandardMaterial({
      color: colors.fryer,
      roughness: 0.6,
      metalness: 0.2,
    });
    const matOil = new THREE.MeshStandardMaterial({
      color: colors.oil,
      roughness: 0.9,
      transparent: true,
      opacity: 0.85,
    });
    const matStove = new THREE.MeshStandardMaterial({
      color: colors.stove,
      roughness: 0.6,
    });
    const matBowl = new THREE.MeshStandardMaterial({
      color: colors.bowl,
      roughness: 0.6,
    });
    const matSambal = new THREE.MeshStandardMaterial({
      color: colors.sambal,
      roughness: 0.8,
    });
    const matKecap = new THREE.MeshStandardMaterial({
      color: colors.kecap,
      roughness: 0.8,
    });
    const matKacang = new THREE.MeshStandardMaterial({
      color: colors.kacang,
      roughness: 0.8,
    });
    const matSignBg = new THREE.MeshStandardMaterial({
      color: colors.signBg,
      roughness: 0.6,
    });
    const matSignTx = new THREE.MeshStandardMaterial({
      color: colors.signText,
      roughness: 0.6,
    });
    const matLamp = new THREE.MeshStandardMaterial({
      color: colors.lamp,
      emissive: colors.lamp,
      emissiveIntensity: 0.9,
    });

    const cart = new THREE.Group();

    const base = box(3.1, 0.14, 1.6, matTrim);
    base.position.set(0, 0.07, 0);
    cart.add(base);

    const body = box(3.1, 1.0, 1.6, matWood);
    body.position.set(0, 0.64, 0);
    cart.add(body);

    const glassFront = box(2.9, 0.7, 0.06, matGlass);
    glassFront.position.set(0, 1.08, 0.82);
    cart.add(glassFront);

    const counter = box(3.1, 0.06, 1.6, matTrim);
    counter.position.set(0, 1.2, 0);
    cart.add(counter);

    const canopy = box(3.3, 0.1, 1.8, matTarp);
    canopy.position.set(0, 2.1, 0);
    cart.add(canopy);

    const groundTopY = 0;
    const canopyUnderY = canopy.position.y - 0.05;
    const poleH = Math.max(0.1, canopyUnderY - groundTopY - 0.01);
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, poleH, 12);
    [
      [-1.5, -0.75],
      [1.5, -0.75],
      [-1.5, 0.75],
      [1.5, 0.75],
    ].forEach(([px, pz]) => {
      const p = new THREE.Mesh(poleGeo, matMetal);
      p.position.set(px, groundTopY + poleH / 2, pz);
      p.castShadow = true;
      p.receiveShadow = true;
      cart.add(p);
    });

    const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.14, 16);
    [
      [-1.1, -0.8],
      [1.1, -0.8],
    ].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(wheelGeo, matWheel);
      w.position.set(wx, 0.26, wz);
      w.rotation.z = Math.PI / 2;
      cart.add(w);
    });

    const sign = box(2.3, 0.22, 0.08, matSignBg);
    sign.position.set(0, 1.95, 0.86);
    cart.add(sign);
    function addFlatText(
      str,
      centerX,
      y,
      z,
      charW = 0.13,
      charH = 0.15,
      space = 0.05
    ) {
      const visibleChars = str.replace(/ /g, '').length;
      const totalW = visibleChars * charW + (str.length - 1) * space;
      let cursor = centerX - totalW / 2;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === ' ') {
          cursor += space;
          continue;
        }
        const letter = box(charW, charH, 0.02, matSignTx);
        letter.position.set(cursor + charW / 2, y, z);
        cart.add(letter);
        cursor += charW + space;
      }
    }
    addFlatText('BATAGOR', 0, 1.97, 0.9);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), matLamp);
    bulb.position.set(0, 1.9, 0);
    cart.add(bulb);
    const lamp = new THREE.PointLight(colors.lamp, 0.95, 10, 2.0);
    lamp.position.set(0, 1.9, 0);
    cart.add(lamp);

    const fryer = box(0.6, 0.14, 0.42, matFryer);
    fryer.position.set(-0.8, 1.26, -0.35);
    cart.add(fryer);
    const oil = box(0.56, 0.04, 0.38, matOil);
    oil.position.set(-0.8, 1.29, -0.35);
    cart.add(oil);

    const stove = box(0.7, 0.12, 0.5, matStove);
    stove.position.set(-0.8, 1.2, -0.35);
    cart.add(stove);

    const steamerBase = cyl(0.22, 0.16, matMetal, 16);
    steamerBase.position.set(0.15, 1.28, -0.25);
    cart.add(steamerBase);
    const steamerTier = cyl(0.22, 0.14, matMetal, 16);
    steamerTier.position.set(0.15, 1.38, -0.25);
    cart.add(steamerTier);
    const steamerLid = cone(0.24, 0.12, matMetal, 16);
    steamerLid.position.set(0.15, 1.49, -0.25);
    cart.add(steamerLid);

    for (let i = 0; i < 6; i++) {
      const bowl = cyl(0.1, 0.055, matBowl, 12);
      bowl.position.set(0.65, 1.24 + i * 0.05, 0.35);
      cart.add(bowl);
    }

    const bottles = [
      { x: 0.35, z: 0.35, mat: matSambal },
      { x: 0.5, z: 0.35, mat: matKecap },
      { x: 0.65, z: 0.35, mat: matKacang },
    ];
    bottles.forEach(({ x, z, mat }) => {
      const b = cyl(0.05, 0.16, mat, 12);
      b.position.set(x, 1.33, z);
      cart.add(b);
      const cap = cone(0.055, 0.06, mat, 8);
      cap.position.set(x, 1.44, z);
      cart.add(cap);
    });

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        const item = box(
          0.12,
          0.06,
          0.12,
          new THREE.MeshStandardMaterial({ color: 0xd9b382 })
        );
        item.position.set(-0.2 + i * 0.24, 1.24, 0.5 - j * 0.22);
        cart.add(item);
      }
    }

    const tongs = new THREE.Group();
    const barA = box(0.22, 0.02, 0.02, matMetal);
    barA.position.set(0.11, 0, 0.01);
    tongs.add(barA);
    const barB = box(0.22, 0.02, 0.02, matMetal);
    barB.position.set(0.11, 0, -0.01);
    tongs.add(barB);
    const tip = box(0.04, 0.02, 0.04, matMetal);
    tip.position.set(0.22, 0, 0);
    tongs.add(tip);

    const vendor = characterFactory
      ? characterFactory(0xb45309, npcScale)
      : makeMinecraftCharacterWithJoints(0xb45309, npcScale);
    const standY = 1 * npcScale;
    vendor.position.set(0, standY, -1.7 - vendorBack);
    poseVendor(vendor);
    group.add(vendor);

    if (vendor.userData?.rightArm) {
      const s = vendor.userData.scale || 1;
      const t = tongs.clone();
      t.position.set(0.06 * s, -0.33 * s, 0.08 * s);
      t.rotation.z = THREE.MathUtils.degToRad(-10);
      vendor.userData.rightArm.add(t);
    }

    cart.position.set(0, 0, 0);
    group.add(cart);

    const warm = new THREE.PointLight(colors.lamp, 0.75, 10, 2.0);
    warm.position.set(0.5, 1.8, 0.9);
    group.add(warm);

    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);
    this.scene.add(group);

    if (registerColliders) {
      const self = this;
      function regCollider(mesh, name) {
        try {
          if (typeof self.addColliderFromObject === 'function') {
            self.addColliderFromObject(mesh, name);
          } else if (self && self.buildings) {
            mesh.updateMatrixWorld(true);
            const bbox = new THREE.Box3().setFromObject(mesh);
            self.buildings.push({ mesh, boundingBox: bbox, name });
          }
        } catch (_) {}
      }
      regCollider(body, 'GerobakBatagor_Body');
      regCollider(counter, 'GerobakBatagor_Counter');
    }

    return group;
  }

  createGerobakSeblak(
    x,
    z,
    {
      scale = 1.4,
      rotate = 0,
      characterFactory = null,
      npcScale = 0.9,
      vendorBack = 0.6,
      registerColliders = true,
      colors = {
        wood: 0x8b5e3c,
        trim: 0x6b4f2a,
        metal: 0x7a7a7a,
        wheel: 0x2f2f2f,
        glass: 0xffffff,
        tarp: 0xd8c7a4,
        stove: 0x355e9a,
        wok: 0x3b3b3b,
        gas: 0x5cb85c,
        bowl: 0xededed,
        oil: 0xe6b800,
        sambal: 0xd64545,
        cikur: 0xc28436,
        kecap: 0x27211a,
        signBg: 0x111111,
        signText: 0xffffff,
        lamp: 0xffb347,
      },
    } = {}
  ) {
    const group = new THREE.Group();

    function box(w, h, d, mat) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function cyl(r, h, mat, seg = 20) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }
    function cone(r, h, mat, seg = 12) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }

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
    function poseVendor(char) {
      if (!char?.userData) return;
      if (char.userData.leftArm)
        char.userData.leftArm.rotation.x = THREE.MathUtils.degToRad(-18);
      if (char.userData.rightArm)
        char.userData.rightArm.rotation.x = THREE.MathUtils.degToRad(-8);
    }

    const matWood = new THREE.MeshStandardMaterial({
      color: colors.wood,
      roughness: 0.85,
    });
    const matTrim = new THREE.MeshStandardMaterial({
      color: colors.trim,
      roughness: 0.8,
    });
    const matMetal = new THREE.MeshStandardMaterial({
      color: colors.metal,
      roughness: 0.5,
      metalness: 0.3,
    });
    const matWheel = new THREE.MeshStandardMaterial({ color: colors.wheel });
    const matGlass = new THREE.MeshStandardMaterial({
      color: colors.glass,
      transparent: true,
      opacity: 0.15,
      roughness: 0.2,
    });
    const matTarp = new THREE.MeshStandardMaterial({
      color: colors.tarp,
      roughness: 0.7,
    });
    const matStove = new THREE.MeshStandardMaterial({
      color: colors.stove,
      roughness: 0.6,
    });
    const matWok = new THREE.MeshStandardMaterial({
      color: colors.wok,
      roughness: 0.6,
      metalness: 0.2,
    });
    const matGas = new THREE.MeshStandardMaterial({
      color: colors.gas,
      roughness: 0.7,
    });
    const matBowl = new THREE.MeshStandardMaterial({
      color: colors.bowl,
      roughness: 0.6,
    });
    const matOil = new THREE.MeshStandardMaterial({
      color: colors.oil,
      roughness: 0.9,
      transparent: true,
      opacity: 0.85,
    });
    const matSambal = new THREE.MeshStandardMaterial({
      color: colors.sambal,
      roughness: 0.8,
    });
    const matCikur = new THREE.MeshStandardMaterial({
      color: colors.cikur,
      roughness: 0.8,
    });
    const matKecap = new THREE.MeshStandardMaterial({
      color: colors.kecap,
      roughness: 0.8,
    });
    const matSignBg = new THREE.MeshStandardMaterial({
      color: colors.signBg,
      roughness: 0.6,
    });
    const matSignTx = new THREE.MeshStandardMaterial({
      color: colors.signText,
      roughness: 0.6,
    });
    const matLamp = new THREE.MeshStandardMaterial({
      color: colors.lamp,
      emissive: colors.lamp,
      emissiveIntensity: 0.9,
    });

    const cart = new THREE.Group();

    const base = box(3.1, 0.14, 1.6, matTrim);
    base.position.set(0, 0.07, 0);
    cart.add(base);
    const body = box(3.1, 1.0, 1.6, matWood);
    body.position.set(0, 0.64, 0);
    cart.add(body);

    const glassFront = box(2.9, 0.7, 0.06, matGlass);
    glassFront.position.set(0, 1.08, 0.82);
    cart.add(glassFront);
    const counter = box(3.1, 0.06, 1.6, matTrim);
    counter.position.set(0, 1.2, 0);
    cart.add(counter);

    const canopy = box(3.3, 0.1, 1.8, matTarp);
    canopy.position.set(0, 2.1, 0);
    cart.add(canopy);
    const groundTopY = 0;
    const poleH = Math.max(0.1, canopy.position.y - 0.05 - groundTopY - 0.01);
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, poleH, 12);
    [
      [-1.5, -0.75],
      [1.5, -0.75],
      [-1.5, 0.75],
      [1.5, 0.75],
    ].forEach(([px, pz]) => {
      const p = new THREE.Mesh(poleGeo, matMetal);
      p.position.set(px, groundTopY + poleH / 2, pz);
      p.castShadow = true;
      p.receiveShadow = true;
      cart.add(p);
    });

    const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.14, 16);
    [
      [-1.1, -0.8],
      [1.1, -0.8],
    ].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(wheelGeo, matWheel);
      w.position.set(wx, 0.26, wz);
      w.rotation.z = Math.PI / 2;
      cart.add(w);
    });

    const sign = box(2.0, 0.22, 0.08, matSignBg);
    sign.position.set(0, 1.95, 0.86);
    cart.add(sign);
    function addFlatText(
      str,
      centerX,
      y,
      z,
      charW = 0.13,
      charH = 0.15,
      space = 0.05
    ) {
      const visible = str.replace(/ /g, '').length;
      const totalW = visible * charW + (str.length - 1) * space;
      let cursor = centerX - totalW / 2;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === ' ') {
          cursor += space;
          continue;
        }
        const letter = box(charW, charH, 0.02, matSignTx);
        letter.position.set(cursor + charW / 2, y, z);
        cart.add(letter);
        cursor += charW + space;
      }
    }
    addFlatText('SEBLAK', 0, 1.97, 0.9);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), matLamp);
    bulb.position.set(0, 1.9, 0);
    cart.add(bulb);
    const lamp = new THREE.PointLight(colors.lamp, 0.95, 10, 2.0);
    lamp.position.set(0, 1.9, 0);
    cart.add(lamp);

    const stove = box(0.7, 0.12, 0.5, matStove);
    stove.position.set(-0.8, 1.2, -0.35);
    cart.add(stove);
    const wok = cyl(0.32, 0.14, matWok, 16);
    wok.position.set(-0.8, 1.29, -0.35);
    cart.add(wok);
    const oil = cyl(0.3, 0.04, matOil, 16);
    oil.position.set(-0.8, 1.31, -0.35);
    cart.add(oil);
    const rail = box(1.2, 0.08, 0.5, matTrim);
    rail.position.set(0.2, 1.26, -0.25);
    cart.add(rail);
    for (let i = 0; i < 4; i++) {
      const bin = box(0.26, 0.12, 0.22, matMetal);
      bin.position.set(-0.38 + i * 0.32, 1.29, -0.25);
      cart.add(bin);
    }
    const topColors = [0xd9b382, 0xffe199, 0xc97f6b, 0xc28436];
    for (let i = 0; i < 4; i++) {
      const fill = box(
        0.24,
        0.06,
        0.2,
        new THREE.MeshStandardMaterial({ color: topColors[i], roughness: 0.9 })
      );
      fill.position.set(-0.38 + i * 0.32, 1.32, -0.25);
      cart.add(fill);
    }

    const bottles = [
      { x: 0.35, z: 0.35, mat: matSambal },
      { x: 0.5, z: 0.35, mat: matCikur },
      { x: 0.65, z: 0.35, mat: matKecap },
    ];
    bottles.forEach(({ x, z, mat }) => {
      const b = cyl(0.05, 0.16, mat, 12);
      b.position.set(x, 1.33, z);
      cart.add(b);
      const cap = cone(0.055, 0.06, mat, 8);
      cap.position.set(x, 1.44, z);
      cart.add(cap);
    });

    for (let i = 0; i < 6; i++) {
      const bowl = cyl(0.1, 0.055, matBowl, 12);
      bowl.position.set(0.65, 1.24 + i * 0.05, 0.35);
      cart.add(bowl);
    }

    const gas = cyl(0.16, 0.36, matGas, 16);
    gas.position.set(-1.35, 0.26, -0.2);
    cart.add(gas);
    const gasTop = box(0.18, 0.08, 0.18, matGas);
    gasTop.position.set(-1.35, 0.44, -0.2);
    cart.add(gasTop);

    const spatula = new THREE.Group();
    const handle = box(0.22, 0.02, 0.02, matMetal);
    handle.position.set(0.11, 0, 0);
    spatula.add(handle);
    const head = box(0.06, 0.02, 0.08, matMetal);
    head.position.set(0.22, 0, 0);
    spatula.add(head);

    const vendor = characterFactory
      ? characterFactory(0xb45309, npcScale)
      : makeMinecraftCharacterWithJoints(0xb45309, npcScale);
    const standY = 1 * npcScale;
    vendor.position.set(0, standY, -1.7 - vendorBack);
    poseVendor(vendor);
    group.add(vendor);

    if (vendor.userData?.rightArm) {
      const s = vendor.userData.scale || 1;
      const sp = spatula.clone();
      sp.position.set(0.06 * s, -0.33 * s, 0.08 * s);
      sp.rotation.z = THREE.MathUtils.degToRad(-10);
      vendor.userData.rightArm.add(sp);
    }

    cart.position.set(0, 0, 0);
    group.add(cart);

    const warm = new THREE.PointLight(colors.lamp, 0.75, 10, 2.0);
    warm.position.set(0.5, 1.8, 0.9);
    group.add(warm);

    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);
    this.scene.add(group);

    if (registerColliders) {
      const self = this;
      function regCollider(mesh, name) {
        try {
          if (typeof self.addColliderFromObject === 'function') {
            self.addColliderFromObject(mesh, name);
          } else if (self && self.buildings) {
            mesh.updateMatrixWorld(true);
            const bbox = new THREE.Box3().setFromObject(mesh);
            self.buildings.push({ mesh, boundingBox: bbox, name });
          }
        } catch (_) {}
      }
      regCollider(body, 'GerobakSeblak_Body');
      regCollider(counter, 'GerobakSeblak_Counter');
    }

    return group;
  }

  createPlangDisewakan(
    x,
    z,
    {
      scale = 1.3,
      rotate = 0,
      registerColliders = true,
      colors = {
        board: 0xffffff,
        border: 0x333333,
        text: 0xff0000,
        pole: 0x444444,
      },
    } = {}
  ) {
    const group = new THREE.Group();

    function box(w, h, d, mat) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.castShadow = m.receiveShadow = true;
      return m;
    }

    const matBoard = new THREE.MeshStandardMaterial({ color: colors.board });
    const matBorder = new THREE.MeshStandardMaterial({ color: colors.border });
    const matText = new THREE.MeshStandardMaterial({ color: colors.text });
    const matPole = new THREE.MeshStandardMaterial({ color: colors.pole });

    const boardW = 3.2;
    const boardH = 1.4;

    const board = box(boardW, boardH, 0.12, matBoard);
    board.position.set(0, 1.8, 0);
    group.add(board);

    const frameT = box(boardW + 0.1, 0.08, 0.14, matBorder);
    const frameB = box(boardW + 0.1, 0.08, 0.14, matBorder);
    const frameL = box(0.08, boardH, 0.14, matBorder);
    const frameR = box(0.08, boardH, 0.14, matBorder);

    frameT.position.set(0, 1.8 + boardH / 2 + 0.04, 0);
    frameB.position.set(0, 1.8 - boardH / 2 - 0.04, 0);
    frameL.position.set(-boardW / 2 - 0.04, 1.8, 0);
    frameR.position.set(boardW / 2 + 0.04, 1.8, 0);

    group.add(frameT, frameB, frameL, frameR);

    function addCanvasTextLabel({
      text = 'DISEWAKAN',
      w = 2.9,
      h = 1.0,
      y = 1.8,
      z = 0.061,
      fg = '#ff0000',
      bg = 'transparent',
      font = 'Bold 140px Arial',
      align = 'center',
      baseline = 'middle',
    }) {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (bg !== 'transparent') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.fillStyle = fg;
      ctx.font = font;
      ctx.textAlign = align;
      ctx.textBaseline = baseline;

      let size = 140;
      do {
        ctx.font = `bold ${size}px Arial`;
        size -= 6;
      } while (ctx.measureText(text).width > canvas.width * 0.9 && size > 40);

      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const tex = new THREE.CanvasTexture(canvas);
      tex.anisotropy = 4;
      tex.needsUpdate = true;

      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: bg === 'transparent',
      });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      plane.position.set(0, y, z);
      plane.renderOrder = 2;
      group.add(plane);

      return plane;
    }

    addCanvasTextLabel({
      text: 'DISEWAKAN',
      w: 2.9,
      h: 0.8,
      y: 1.8,
      z: 0.07,
      fg: '#ff0000',
      bg: 'transparent',
    });

    const pole = box(0.18, 2.2, 0.18, matPole);
    pole.position.set(0, 1.1, -0.1);
    group.add(pole);

    group.position.set(x, 0, z);
    group.scale.set(scale, scale, scale);
    group.rotation.y = THREE.MathUtils.degToRad(rotate);
    group.updateMatrixWorld(true);
    this.scene.add(group);

    if (registerColliders) {
      const self = this;
      function reg(mesh, name) {
        try {
          mesh.updateMatrixWorld(true);
          if (typeof self.addColliderFromObject === 'function') {
            self.addColliderFromObject(mesh, name);
          } else if (self.buildings) {
            const bbox = new THREE.Box3().setFromObject(mesh);
            self.buildings.push({ mesh, boundingBox: bbox, name });
          }
        } catch (_) {}
      }
      reg(board, 'PlangDisewakan_Board');
      reg(pole, 'PlangDisewakan_Pole');
    }

    return group;
  }
}
