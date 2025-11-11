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
    this.createWalkingNPCs();
    this.createVehicleNPCs();
    this.createBirds();
    this.createAirplanes();
    this.createSpecialNPCs();
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
      return;
    }

    for (let i = 0; i < 30; i++) {
      const color = colors[i % colors.length];
      const path =
        this.cityData.sidewalkPaths[i % this.cityData.sidewalkPaths.length];

      if (!path) continue;

      const npc = this.createMinecraftCharacter(color);
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
      return;
    }

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
    const frame = new THREE.Group();
    group.add(frame);
    const tank = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.35, 0.9),
      new THREE.MeshStandardMaterial({
        color: 0x2d2d2d,
        metalness: 0.2,
        roughness: 0.8,
      })
    );
    tank.position.set(0, 0.6, 0);
    tank.castShadow = true;
    frame.add(tank);
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.15, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x000000 })
    );
    seat.position.set(0, 0.85, -0.1);
    seat.castShadow = true;
    frame.add(seat);
    const fenderFront = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.1, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    fenderFront.position.set(0, 0.45, 0.72);
    fenderFront.castShadow = true;
    frame.add(fenderFront);
    const fenderBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.1, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    fenderBack.position.set(0, 0.45, -0.72);
    fenderBack.castShadow = true;
    frame.add(fenderBack);
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.22, 12);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.1,
    });

    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.36, 0.72);
    frame.add(frontWheel);

    const rearWheel = new THREE.Mesh(wheelGeo, wheelMat);
    rearWheel.rotation.z = Math.PI / 2;
    rearWheel.position.set(0, 0.36, -0.72);
    frame.add(rearWheel);

    const shockMat = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 0.6,
    });

    [-0.22, 0.22].forEach((offsetX) => {
      const shockFront = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8),
        shockMat
      );
      shockFront.position.set(offsetX, 0.8, 0.72);
      frame.add(shockFront);
    });

    [-0.25, 0.25].forEach((offsetX) => {
      const shockRear = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.55, 8),
        shockMat
      );
      shockRear.position.set(offsetX, 0.6, -0.55);
      shockRear.rotation.z = 0.4;
      frame.add(shockRear);
    });

    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.07, 0.07),
      new THREE.MeshStandardMaterial({ color: 0x555555 })
    );
    handle.position.set(0, 1.3, 0.8);
    frame.add(handle);

    [-0.35, 0.35].forEach((xOffset) => {
      const grip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.22, 8),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
      );
      grip.rotation.z = Math.PI / 2;
      grip.position.set(xOffset, 1.3, 0.8);
      frame.add(grip);
    });

    const headlight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffee,
        emissiveIntensity: 0.7,
      })
    );
    headlight.rotation.x = Math.PI / 2;
    headlight.position.set(0, 0.9, 1.0);
    headlight.castShadow = true;
    frame.add(headlight);

    const exhaust = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.9, 8),
      new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.7,
        roughness: 0.4,
      })
    );
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(-0.45, 0.45, -0.4);
    frame.add(exhaust);

    const rider = this.createMinecraftCharacter(0x00aaff);
    rider.position.set(0, 1.2, -0.1);
    rider.scale.set(0.9, 0.9, 0.9);
    group.add(rider);
    group.position.y = -0.48;

    return group;
  }

  createCar(color, options = {}) {
    const {
      x = 0,
      z = 0,
      rotationY = 0,
      windowTint = 0x87ceeb,
      registerCollider = false,
      name = 'IndoCar',
    } = options;

    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.2,
      roughness: 0.7,
    });
    const blackMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.1,
      roughness: 0.9,
    });
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xb0b0b0,
      metalness: 0.6,
      roughness: 0.4,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: windowTint,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
      metalness: 0.0,
    });

    const lower = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 4.3), bodyMat);
    lower.position.set(0, 0.6, 0.0);
    lower.castShadow = true;
    group.add(lower);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 2.8), bodyMat);
    cabin.position.set(0, 1.25, -0.2);
    cabin.castShadow = true;
    group.add(cabin);

    const hood = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, 0.35, 1.0),
      bodyMat
    );
    hood.position.set(0, 1.0, 1.2);
    hood.rotation.x = -0.08;
    hood.castShadow = true;
    group.add(hood);

    const bumperF = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.35, 0.45),
      bodyMat
    );
    bumperF.position.set(0, 0.7, 2.15);
    group.add(bumperF);

    const bumperR = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.35, 0.45),
      bodyMat
    );
    bumperR.position.set(0, 0.7, -2.15);
    group.add(bumperR);

    const grille = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.25, 0.06),
      blackMat
    );
    grille.position.set(0, 0.95, 2.05);
    group.add(grille);

    const diffuser = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.2, 0.06),
      blackMat
    );
    diffuser.position.set(0, 0.65, -2.05);
    group.add(diffuser);

    const windscreen = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.6, 0.05),
      glassMat
    );
    windscreen.position.set(0, 1.25, 0.8);
    windscreen.rotation.x = -0.35;
    group.add(windscreen);

    const rearGlass = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.65, 0.05),
      glassMat
    );
    rearGlass.position.set(0, 1.25, -1.6);
    rearGlass.rotation.x = 0.25;
    group.add(rearGlass);

    [-1, 1].forEach((side) => {
      const sideGlass = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.65, 2.4),
        glassMat
      );
      sideGlass.position.set(side * 1.0, 1.25, -0.3);
      group.add(sideGlass);
    });

    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffee,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    });
    const headL = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.2, 0.08),
      headMat
    );
    const headR = headL.clone();
    headL.position.set(-0.65, 0.95, 2.12);
    headR.position.set(0.65, 0.95, 2.12);
    group.add(headL, headR);

    const turnMat = new THREE.MeshStandardMaterial({
      color: 0xffa000,
      emissive: 0xffa000,
      emissiveIntensity: 0.6,
    });
    const turnL = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.12, 0.06),
      turnMat
    );
    const turnR = turnL.clone();
    turnL.position.set(-1.0, 0.9, 2.1);
    turnR.position.set(1.0, 0.9, 2.1);
    group.add(turnL, turnR);

    const tailMat = new THREE.MeshStandardMaterial({
      color: 0xff2b2b,
      emissive: 0xff2b2b,
      emissiveIntensity: 0.8,
    });
    const tailL = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.25, 0.08),
      tailMat
    );
    const tailR = tailL.clone();
    tailL.position.set(-0.75, 0.95, -2.12);
    tailR.position.set(0.75, 0.95, -2.12);
    group.add(tailL, tailR);

    [-1, 1].forEach((side) => {
      const mirror = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.12, 0.2),
        bodyMat
      );
      mirror.position.set(side * 1.15, 1.1, 0.6);
      group.add(mirror);

      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.06, 0.04),
        silverMat
      );
      handle.position.set(side * 0.8, 1.0, 0.1);
      group.add(handle);
    });

    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.35, 14);
    const wheelTireMat = new THREE.MeshStandardMaterial({
      color: 0x151515,
      metalness: 0.1,
      roughness: 0.9,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x9e9e9e,
      metalness: 0.7,
      roughness: 0.35,
    });

    const wheelPos = [
      { x: -1.05, z: 1.45 },
      { x: 1.05, z: 1.45 },
      { x: -1.05, z: -1.45 },
      { x: 1.05, z: -1.45 },
    ];

    wheelPos.forEach((p) => {
      const tire = new THREE.Mesh(wheelGeo, wheelTireMat);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(p.x, 0.55, p.z);
      tire.castShadow = true;
      group.add(tire);

      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.18, 10),
        rimMat
      );
      rim.rotation.z = Math.PI / 2;
      rim.position.set(p.x, 0.55, p.z);
      group.add(rim);
    });

    const plateFront = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.15, 0.02),
      blackMat
    );
    plateFront.position.set(0, 0.7, 2.18);
    group.add(plateFront);

    const plateRear = plateFront.clone();
    plateRear.position.set(0, 0.7, -2.18);
    group.add(plateRear);

    group.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(group);
    const minY = bbox.min.y;
    group.position.y -= minY;
    group.position.x = x;
    group.position.z = z;
    group.rotation.y = rotationY;

    this.scene.add(group);

    if (registerCollider && this.buildings) {
      group.updateMatrixWorld(true);
      const carBox = new THREE.Box3().setFromObject(group);
      this.buildings.push({ mesh: group, boundingBox: carBox, name });
    }

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
    const bodyGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    group.add(body);
    const wingGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.5);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.y = 0.1;
    group.add(wings);

    group.userData.wings = wings;

    return group;
  }

  createAirplanes() {
    for (let i = 0; i < 3; i++) {
      const airplane = this.createAirplane();
      const height = 40 + i * 10;
      const angle = (i * Math.PI * 2) / 3;

      airplane.position.set(
        Math.cos(angle) * 100,
        height,
        Math.sin(angle) * 100
      );

      this.scene.add(airplane);

      this.airplanes.push({
        mesh: airplane,
        speed: 15 + Math.random() * 10,
        angle: angle,
        radius: 100 + i * 20,
        centerX: 0,
        centerZ: 0,
        height: height,
      });
    }
  }

  createAirplane() {
    const group = new THREE.Group();

    const fuselageGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
    const fuselageMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
    });
    const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
    fuselage.rotation.z = Math.PI / 2;
    fuselage.castShadow = true;
    group.add(fuselage);

    const noseGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
    const nose = new THREE.Mesh(noseGeometry, fuselageMaterial);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 2.75;
    nose.castShadow = true;
    group.add(nose);

    const wingGeometry = new THREE.BoxGeometry(0.3, 6, 1.5);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.y = -0.2;
    wings.castShadow = true;
    group.add(wings);

    const tailWingGeometry = new THREE.BoxGeometry(0.2, 3, 1);
    const tailWing = new THREE.Mesh(tailWingGeometry, wingMaterial);
    tailWing.position.set(-2, -0.1, 0);
    tailWing.castShadow = true;
    group.add(tailWing);

    const tailFinGeometry = new THREE.BoxGeometry(0.2, 1, 1.5);
    const tailFin = new THREE.Mesh(tailFinGeometry, wingMaterial);
    tailFin.position.set(-2, 0.5, 0);
    tailFin.castShadow = true;
    group.add(tailFin);

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
        name: 'Zait',
        position: { x: 30, z: 75 },
        dialogue: 'Hahaha kamu pasti kesusahan jalan kesininya ya.',
      },
      {
        name: 'Putra',
        position: { x: -38, z: 80 },
        dialogue: 'Wah kamu jago banget, padahal aku udah ngumpet jauh.',
      },
      {
        name: 'Ariman',
        position: { x: 35, z: -5 },
        dialogue: 'Yah, tadi mau ngumpet tapi diajak ngopi sama temen.',
      },
      {
        name: 'Ananda',
        position: { x: 38, z: -75 },
        dialogue: 'Aduh, udah ngumpet jauh masih ketawan aja.',
      },
      {
        name: 'Mahardhika',
        position: { x: -28, z: 3 },
        dialogue: 'Yah ketawan, yaudah aku jajan dulu deh.',
      },
      {
        name: 'Hari',
        position: { x: -33, z: -93 },
        dialogue: 'Ah ketawan, eh iya Nanda ada di belakang Masjid HAHAHA.',
      },
    ];

    specialCharacters.forEach((char) => {
      const color = this.getRandomColor();
      const npc = this.createMinecraftCharacter(color);
      npc.position.set(char.position.x, 0.9, char.position.z);
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

  getRandomColor() {
    return Math.floor(Math.random() * 0xffffff);
  }

  createFarhanNPC() {
    const farhan = this.createFarhanCharacter();
    farhan.position.set(0, 0.9, -6.5);
    const nameTag = this.createNameTag('Farhan Hadi Lutfi');
    nameTag.position.y = 2.5;
    farhan.add(nameTag);

    this.scene.add(farhan);

    this.specialNPCs.push({
      mesh: farhan,
      name: 'Farhan Hadi Lutfi',
      dialogue:
        'Hai, Aku Farhan Hadi Lutfi. Aku gak ikutan main ya hehe, semangat ya kamu harus temukan semua yang bersembunyi!',
      dialogueNight: 'Sudah malam, atau sudah tau?',
      found: false,
      isMission: false,
      isFarhan: true,
      nameTag: nameTag,
    });
  }

  createFarhanCharacter(scale = 1) {
    const group = new THREE.Group();

    // Create body with gold color (standard Minecraft character body)
    const bodyWidth = 0.8 * scale;
    const bodyHeight = 1.2 * scale;
    const bodyDepth = 0.4 * scale;
    const bodyGeometry = new THREE.BoxGeometry(
      bodyWidth,
      bodyHeight,
      bodyDepth
    );

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000, // gold color
      roughness: 0.8,
      metalness: 0.2,
    });

    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6 * scale;
    body.castShadow = true;
    group.add(body);

    // Add front logo as a separate plane in front of the body
    const textureLoader = new THREE.TextureLoader();
    let logoPlane;

    try {
      const logoTexture = textureLoader.load('src/farhanhl.jpg');
      // Configure the texture to maintain 1:1 aspect ratio
      logoTexture.wrapS = THREE.ClampToEdgeWrapping;
      logoTexture.wrapT = THREE.ClampToEdgeWrapping;
      logoTexture.generateMipmaps = false;
      logoTexture.minFilter = THREE.LinearFilter;

      // Create a plane for the logo
      // To maintain 1:1 aspect ratio, we'll use equal width and height
      const logoSize = Math.min(bodyWidth * 0.8, bodyHeight * 0.6); // Make logo smaller than the body
      const logoGeometry = new THREE.PlaneGeometry(logoSize, logoSize);
      const logoMaterial = new THREE.MeshStandardMaterial({
        map: logoTexture,
        side: THREE.DoubleSide, // Show on both sides if needed, but will be placed at front
        transparent: true, // In case logo has transparency
        roughness: 0.7,
        metalness: 0.3,
      });

      logoPlane = new THREE.Mesh(logoGeometry, logoMaterial);
      // Position the logo in the front center of the body
      logoPlane.position.set(0, 0.6 * scale, bodyDepth / 2 + 0.01); // Slightly in front of the body
      logoPlane.rotation.y = 0; // Face forward
      group.add(logoPlane);
    } catch (error) {
      // If texture fails to load, continue without logo (just the gold body)
      console.warn(
        'Could not load FarhanHL logo texture, using gold body instead'
      );
    }

    // Head (maintain original skin color)
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

    // Arms (use gold color to match theme)
    const armGeometry = new THREE.BoxGeometry(
      0.3 * scale,
      0.9 * scale,
      0.3 * scale
    );
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.6 * scale, 0.6 * scale, 0);
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.6 * scale, 0.6 * scale, 0);
    rightArm.castShadow = true;
    group.add(rightArm);

    // Legs (use dark blue to match original theme)
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
    this.npcs.forEach((npc) => {
      if (npc.type === 'walking') {
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
        npc.mesh.position.y = 0.9;
        npc.mesh.position.z = newPos.z;
        const dx = npc.path.end.x - npc.path.start.x;
        const dz = npc.path.end.z - npc.path.start.z;
        const angle = Math.atan2(dx, dz);
        npc.mesh.rotation.y = angle + (npc.direction < 0 ? Math.PI : 0);
      }
    });

    this.vehicleNPCs.forEach((vehicle) => {
      vehicle.progress +=
        (vehicle.speed * vehicle.direction * delta) /
        this.getPathLength(vehicle.path);

      if (vehicle.progress > 1) {
        vehicle.progress = 0;
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
      vehicle.mesh.position.y = 0.5;
      vehicle.mesh.position.z = newPos.z;
      const dx = vehicle.path.end.x - vehicle.path.start.x;
      const dz = vehicle.path.end.z - vehicle.path.start.z;
      const angle = Math.atan2(dx, dz);
      vehicle.mesh.rotation.set(
        0,
        angle + (vehicle.direction < 0 ? Math.PI : 0),
        0
      );
    });

    this.birds.forEach((bird, index) => {
      bird.angle += (bird.speed * delta) / bird.radius;
      bird.mesh.position.x = bird.centerX + Math.cos(bird.angle) * bird.radius;
      bird.mesh.position.z = bird.centerZ + Math.sin(bird.angle) * bird.radius;
      bird.mesh.rotation.y = bird.angle + Math.PI / 2;
      if (bird.mesh.userData.wings) {
        bird.wingFlapPhase = (bird.wingFlapPhase || 0) + delta * bird.flapSpeed;
        bird.mesh.userData.wings.rotation.z =
          Math.sin(index + bird.wingFlapPhase) * 0.3;
      }
    });

    this.airplanes.forEach((airplane) => {
      airplane.angle += (airplane.speed * delta) / airplane.radius;
      airplane.mesh.position.x =
        airplane.centerX + Math.cos(airplane.angle) * airplane.radius;
      airplane.mesh.position.y = airplane.height;
      airplane.mesh.position.z =
        airplane.centerZ + Math.sin(airplane.angle) * airplane.radius;

      airplane.mesh.rotation.y = airplane.angle + Math.PI / 2;

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
    this.specialNPCs.forEach((npc) => {
      if (!npc.isFarhan) {
        npc.found = false;
        if (npc.nameTag) {
          npc.nameTag.visible = true;
        }
      }
    });
  }
}
