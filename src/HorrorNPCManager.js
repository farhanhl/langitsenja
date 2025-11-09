import * as THREE from 'three';

export class HorrorNPCManager {
  constructor(scene, npcManager) {
    this.scene = scene;
    this.npcManager = npcManager;
    this.isHorrorMode = false;
    this.originalNPCData = [];
  }

  transformToHorror() {
    if (this.isHorrorMode) return;
    this.isHorrorMode = true;
    this.originalNPCData = [];
    this.npcManager.npcs.forEach((npc, index) => {
      if (npc.type === 'walking') {
        this.originalNPCData.push({
          npc: npc,
          originalMesh: npc.mesh,
        });

        this.scene.remove(npc.mesh);

        const horrorType = index % 5;
        let newMesh;

        switch (horrorType) {
          case 0:
            newMesh = this.createGhost();
            break;
          case 1:
            newMesh = this.createZombie();
            break;
          case 2:
            newMesh = this.createMonster();
            break;
          case 3:
            newMesh = this.createTuyul();
            break;
          case 4:
            newMesh = this.createKuntilanak();
            break;
        }

        newMesh.position.copy(npc.mesh.position);
        newMesh.rotation.copy(npc.mesh.rotation);

        this.scene.add(newMesh);

        npc.mesh = newMesh;
        npc.isHorror = true;
        npc.horrorType = horrorType;

        if (horrorType === 0) {
          npc.floatOffset = Math.random() * Math.PI * 2;
        }

        if (horrorType === 3) {
          npc.runCycleOffset = Math.random() * Math.PI * 2;
          npc.speedMultiplier = 3.5 + Math.random() * 1.5;
          npc.nextTurnTime = 0;
          npc.tuyulDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            Math.random() * Math.PI * 2
          );
          npc.groundOffset = 0.02;
          npc.mesh.rotation.x = 0.12;
        }

        if (horrorType === 4) {
          npc.floatPhase = Math.random() * Math.PI * 2;
          npc.hoverAmp = 0.35 + Math.random() * 0.25; // amplitudo naik-turun
          npc.flightHeight = 1.6 + Math.random() * 0.9; // ketinggian dari tanah
          npc.kuntiDir = new THREE.Vector3(0, 0, -1)
            .applyAxisAngle(
              new THREE.Vector3(0, 1, 0),
              Math.random() * Math.PI * 2
            )
            .normalize();
          npc.kuntiSpeed = 1.2 + Math.random() * 0.6; // kecepatan glide dasar
          npc.nextGlideTurn =
            performance.now() * 0.001 + (1.2 + Math.random() * 2.0);
          npc.lungeCooldown = 1.5 + Math.random() * 2.0; // jeda antar lunge (inisialisasi SEKALI)
          npc.lungeTime = 0; // sisa durasi dash
          npc.lungeSpeed = 6.0 + Math.random() * 3.0; // speed dash awal (akan diacak lagi tiap trigger)
          npc.swayPhase = Math.random() * Math.PI * 2; // untuk sway kiri/kanan
        }
      }
    });
  }

  createGhost() {
    const group = new THREE.Group();
    const bodyGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      emissive: 0xaaaaff,
      emissiveIntensity: 0.3,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75;
    group.add(body);

    const headGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      emissive: 0xaaaaff,
      emissiveIntensity: 0.4,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.7;
    group.add(head);

    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1,
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 1.75, 0.35);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 1.75, 0.35);
    group.add(rightEye);

    const tailGeometry = new THREE.ConeGeometry(0.3, 0.8, 8);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.y = -0.1;
    tail.rotation.x = Math.PI;
    group.add(tail);

    return group;
  }

  createZombie() {
    const group = new THREE.Group();
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x556b2f,
      roughness: 0.9,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    group.add(body);
    const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x6b8e23,
      roughness: 0.8,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    head.rotation.z = 0.1;
    group.add(head);

    const eyeGeometry = new THREE.CircleGeometry(0.1, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 1,
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 1.55, 0.31);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 1.55, 0.31);
    group.add(rightEye);

    const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.6, 0.3, 0);
    leftArm.rotation.z = 0.3;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.6, 0.3, 0);
    rightArm.rotation.z = -0.3;
    group.add(rightArm);

    const legGeometry = new THREE.BoxGeometry(0.3, 0.9, 0.3);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.25, -0.45, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.25, -0.45, 0);
    group.add(rightLeg);

    return group;
  }

  createMonster() {
    const group = new THREE.Group();
    const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.6);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x330000,
      roughness: 0.9,
      emissive: 0x220000,
      emissiveIntensity: 0.2,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75;
    group.add(body);

    const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x440000,
      roughness: 0.8,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.8;
    group.add(head);

    const eyeGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1,
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 1.85, 0.41);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 1.85, 0.41);
    group.add(rightEye);

    const hornGeometry = new THREE.ConeGeometry(0.15, 0.5, 6);
    const hornMaterial = new THREE.MeshStandardMaterial({ color: 0x220000 });

    const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    leftHorn.position.set(-0.3, 2.3, 0);
    leftHorn.rotation.z = -0.3;
    group.add(leftHorn);

    const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    rightHorn.position.set(0.3, 2.3, 0);
    rightHorn.rotation.z = 0.3;
    group.add(rightHorn);

    const armGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.7, 0.6, 0);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.7, 0.6, 0);
    group.add(rightArm);

    const clawGeometry = new THREE.ConeGeometry(0.15, 0.3, 4);
    const clawMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });

    for (let i = 0; i < 3; i++) {
      const leftClaw = new THREE.Mesh(clawGeometry, clawMaterial);
      leftClaw.position.set(-0.7 - 0.15 + i * 0.15, 0, 0);
      leftClaw.rotation.x = Math.PI;
      group.add(leftClaw);

      const rightClaw = new THREE.Mesh(clawGeometry, clawMaterial);
      rightClaw.position.set(0.7 - 0.15 + i * 0.15, 0, 0);
      rightClaw.rotation.x = Math.PI;
      group.add(rightClaw);
    }

    const legGeometry = new THREE.BoxGeometry(0.35, 1, 0.35);
    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    leftLeg.position.set(-0.3, -0.5, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    rightLeg.position.set(0.3, -0.5, 0);
    group.add(rightLeg);
    group.scale.set(1.2, 1.2, 1.2);

    return group;
  }

  // 2) --- Tambahkan mesh tuyul ---
  createTuyul() {
    const group = new THREE.Group();

    // Skala kecil (anak), sedikit bungkuk
    const scale = 0.8;

    // Badan (tanpa baju)
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.5 * scale, 0.7 * scale, 0.3 * scale),
      new THREE.MeshStandardMaterial({ color: 0xffe0bd, roughness: 0.8 })
    );
    body.position.y = 0.55 * scale;
    body.castShadow = true;
    group.add(body);

    // Kepala botak (agak pucat)
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.28 * scale, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffe6d0, roughness: 0.6 })
    );
    head.position.y = 1.05 * scale;
    group.add(head);

    // Mata hijau menyala (biar seram sedikit)
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x00ff66,
      emissive: 0x00ff66,
      emissiveIntensity: 1,
    });
    const eyeGeo = new THREE.SphereGeometry(0.05 * scale, 8, 8);
    const le = new THREE.Mesh(eyeGeo, eyeMat);
    le.position.set(-0.08 * scale, 1.07 * scale, 0.15 * scale);
    const re = le.clone();
    re.position.x *= -1;
    group.add(le, re);

    // Celana pendek hijau kusam
    const shorts = new THREE.Mesh(
      new THREE.BoxGeometry(0.52 * scale, 0.3 * scale, 0.32 * scale),
      new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.9 })
    );
    shorts.position.y = 0.3 * scale;
    group.add(shorts);

    // Tangan kurus (untuk ayunan saat lari)
    const armGeo = new THREE.BoxGeometry(
      0.12 * scale,
      0.42 * scale,
      0.12 * scale
    );
    const armMat = new THREE.MeshStandardMaterial({
      color: 0xffe0bd,
      roughness: 0.8,
    });
    const lArm = new THREE.Mesh(armGeo, armMat);
    lArm.position.set(-0.34 * scale, 0.52 * scale, 0);
    const rArm = lArm.clone();
    rArm.position.x *= -1;
    lArm.castShadow = rArm.castShadow = true;
    group.add(lArm, rArm);

    // Kaki (untuk animasi langkah)
    const legGeo = new THREE.BoxGeometry(
      0.12 * scale,
      0.46 * scale,
      0.12 * scale
    );
    const legMat = new THREE.MeshStandardMaterial({
      color: 0xffe0bd,
      roughness: 0.9,
    });
    const lLeg = new THREE.Mesh(legGeo, legMat);
    lLeg.position.set(-0.14 * scale, 0.06 * scale, 0);
    const rLeg = lLeg.clone();
    rLeg.position.x *= -1;
    lLeg.castShadow = rLeg.castShadow = true;
    group.add(lLeg, rLeg);

    // Sedikit bungkuk ke depan (gaya lari tuyul)
    group.rotation.x = 0.05;

    // simpan referensi untuk animasi
    group.userData = {
      lArm,
      rArm,
      lLeg,
      rLeg,
    };

    return group;
  }

  createKuntilanak() {
    const g = new THREE.Group();

    // Gaun putih (sedikit transparan, bisa 'bernapas' via scale di update)
    const dress = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 1.9, 24),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.9,
        metalness: 0.0,
        transparent: true,
        opacity: 0.92,
        emissive: 0x1a1a1a,
        emissiveIntensity: 0.25,
      })
    );
    dress.position.y = 0.95;
    dress.castShadow = true;
    g.add(dress);

    // Kepala
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffe6d0, roughness: 0.6 })
    );
    head.position.y = 2.02;
    g.add(head);

    // Rambut panjang hitam
    const hair = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 1.1, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 1.0 })
    );
    hair.position.set(0, 1.5, -0.18);
    g.add(hair);

    // Mata merah emissive
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xaa0000,
      emissive: 0xaa0000,
      emissiveIntensity: 0.85,
    });
    const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const le = new THREE.Mesh(eyeGeo, eyeMat);
    const re = new THREE.Mesh(eyeGeo, eyeMat);
    le.position.set(-0.09, 2.05, 0.24);
    re.position.set(0.09, 2.05, 0.24);
    g.add(le, re);

    // Lengan
    const armGeo = new THREE.BoxGeometry(0.1, 0.6, 0.1);
    const armMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
    });
    const lArm = new THREE.Mesh(armGeo, armMat);
    const rArm = new THREE.Mesh(armGeo, armMat);
    lArm.position.set(-0.47, 1.38, 0.05);
    rArm.position.set(0.47, 1.38, 0.05);
    lArm.rotation.z = 0.28;
    rArm.rotation.z = -0.28;
    g.add(lArm, rArm);

    // Pose awal: sedikit lean back
    g.rotation.x = -0.03;

    // simpan referensi parts (untuk animasi ringan)
    g.userData = { dress, lArm, rArm, hair };

    return g;
  }

  update(delta) {
    if (!this.isHorrorMode) return;
    const t = performance.now() * 0.001;

    this.npcManager.npcs.forEach((npc) => {
      if (!npc.isHorror) return;

      switch (npc.horrorType) {
        case 0: // Ghost - floating
          if (npc.floatOffset !== undefined) {
            npc.mesh.position.y =
              0.9 + Math.sin(Date.now() * 0.002 + npc.floatOffset) * 0.3;
          }
          break;

        case 1: // Zombie
          // (tetap seperti semula, bisa tambah sway kalau mau)
          break;

        case 2: // Monster - breathing
          {
            const s = 1.2 + Math.sin(Date.now() * 0.003) * 0.05;
            npc.mesh.scale.set(s, s, s);
          }
          break;

        // --- PERBAIKI animasi & gerak TUYUL di update() (case 3) ---
        case 3: {
          // Tuyul - lari cepat & nempel tanah
          const parts = npc.mesh.userData || {};
          const runFreq = 12; // lebih tinggi => lebih cepat cadence
          const ampArm = 0.9;
          const ampLeg = 1.15;

          const phase = runFreq * t + (npc.runCycleOffset || 0);
          if (parts.lArm && parts.rArm) {
            parts.lArm.rotation.x = Math.sin(phase) * ampArm;
            parts.rArm.rotation.x = -Math.sin(phase) * ampArm;
          }
          if (parts.lLeg && parts.rLeg) {
            parts.lLeg.rotation.x = -Math.sin(phase) * ampLeg;
            parts.rLeg.rotation.x = Math.sin(phase) * ampLeg;
          }

          // Kecepatan lari lebih tinggi
          const baseSpeed = npc.baseSpeed ?? 2.2;
          const speed = baseSpeed * (npc.speedMultiplier ?? 4.2);

          // Arah: belok jarang tapi lebih tajam
          npc.nextTurnTime = npc.nextTurnTime || 0;
          if (t > npc.nextTurnTime) {
            npc.nextTurnTime = t + (1.2 + Math.random() * 1.8);
            const turn = (Math.random() - 0.5) * 1.0; // -0.5..0.5 rad (lebih tajam)
            npc.mesh.rotation.y += turn;
            npc.tuyulDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(
              new THREE.Vector3(0, 1, 0),
              npc.mesh.rotation.y
            );
          }

          // Translasi maju
          const move = speed * delta;
          if (npc.tuyulDir) {
            npc.mesh.position.addScaledVector(npc.tuyulDir, move);
          } else {
            npc.mesh.translateZ(-move);
          }

          // Nempel tanah (HILANGKAN bounce). Pakai resolver kalau ada.
          const groundY = 0.5;
          npc.mesh.position.y = groundY + (npc.groundOffset || 0.02);

          break;
        }

        case 4: {
          // Kuntilanak - hover + glide + lunge
          const now = performance.now() * 0.001;
          const parts = npc.mesh.userData || {};
          const groundY = this.getGroundY ? this.getGroundY(npc.mesh) : 0;

          // Hover baseline di atas tanah + osilasi
          npc.floatPhase = (npc.floatPhase || 0) + delta * 1.2;
          const hover = Math.sin(npc.floatPhase) * (npc.hoverAmp || 0.4);
          const baseFlight = groundY + (npc.flightHeight || 2.0) + hover;

          // "Breathing" gaun (skala halus)
          if (parts.dress) {
            const breathe = 1.0 + Math.sin(now * 1.5) * 0.04;
            parts.dress.scale.set(1.0, breathe, 1.0);
          }

          // Goyang lengan & rambut ringan
          if (parts.lArm && parts.rArm) {
            const a = Math.sin(now * 2.0) * 0.12;
            parts.lArm.rotation.x = a * 0.5;
            parts.rArm.rotation.x = -a * 0.5;
          }
          if (parts.hair) {
            parts.hair.rotation.x = -0.1 + Math.sin(now * 1.6) * 0.05;
          }

          // Drift/glide: arah berubah berkala saat tidak lunge
          if (!npc.kuntiDir || npc.kuntiDir.lengthSq() === 0) {
            npc.kuntiDir = new THREE.Vector3(0, 0, -1);
          }
          if ((npc.lungeTime || 0) <= 0 && now > (npc.nextGlideTurn || 0)) {
            npc.nextGlideTurn = now + (1.2 + Math.random() * 2.0);
            const turn = (Math.random() - 0.5) * 0.7;
            npc.mesh.rotation.y += turn;
            npc.kuntiDir
              .set(0, 0, -1)
              .applyAxisAngle(new THREE.Vector3(0, 1, 0), npc.mesh.rotation.y)
              .normalize();
          }

          // Sway kiri-kanan tipis saat glide
          npc.swayPhase = (npc.swayPhase || 0) + delta * 1.4;
          const sway = Math.sin(npc.swayPhase) * 0.06;
          const swayRight = new THREE.Vector3()
            .crossVectors(npc.kuntiDir, new THREE.Vector3(0, 1, 0))
            .normalize();
          const swayOffset = swayRight.multiplyScalar(sway);

          // Timer lunge: kurangi stabil (hindari random setiap frame)
          if (npc.lungeCooldown == null)
            npc.lungeCooldown = 1.5 + Math.random() * 2.0;
          npc.lungeCooldown -= delta;

          // Trigger lunge sesekali
          if (npc.lungeCooldown <= 0 && (npc.lungeTime || 0) <= 0) {
            npc.lungeTime = 0.35 + Math.random() * 0.25; // durasi dash
            npc.lungeSpeed = 6.0 + Math.random() * 3.0; // speed dash
            npc.lungeCooldown = 2.0 + Math.random() * 3.0; // reset cooldown
            npc.mesh.rotation.x = -0.08; // condong saat dash
          }

          // Kecepatan
          let speed = npc.kuntiSpeed || 1.4;
          if ((npc.lungeTime || 0) > 0) {
            speed = npc.lungeSpeed;
            npc.lungeTime -= delta;

            // sedikit turun saat menyambar
            const lungeDrop =
              Math.sin(Math.max(npc.lungeTime, 0) * Math.PI) * 0.08;
            // gunakan target Y yang dilandaikan
            npc.mesh.position.y +=
              (baseFlight - lungeDrop - npc.mesh.position.y) *
              Math.min(1, delta * 8);

            if (npc.lungeTime <= 0) {
              npc.mesh.rotation.x = -0.03; // kembali hover
            }
          } else {
            // ikuti target hover secara halus
            npc.mesh.position.y +=
              (baseFlight - npc.mesh.position.y) * Math.min(1, delta * 6);
          }

          // Gerak horizontal (glide + sway)
          const move = speed * delta;
          npc.mesh.position.addScaledVector(npc.kuntiDir, move);
          npc.mesh.position.add(swayOffset);

          // Hadapkan ke arah gerak dengan lerp
          const dir = npc.kuntiDir;
          const targetYaw = Math.atan2(-dir.x, -dir.z);
          const curYaw = npc.mesh.rotation.y;
          let dYaw = targetYaw - curYaw;
          while (dYaw > Math.PI) dYaw -= Math.PI * 2;
          while (dYaw < -Math.PI) dYaw += Math.PI * 2;
          npc.mesh.rotation.y += dYaw * Math.min(1, delta * 4);

          break;
        }
      }
    });
  }

  restoreNormal() {
    if (!this.isHorrorMode) return;
    this.originalNPCData.forEach((data) => {
      this.scene.remove(data.npc.mesh);
      this.scene.add(data.originalMesh);
      data.npc.mesh = data.originalMesh;
      data.npc.isHorror = false;
      delete data.npc.horrorType;
      delete data.npc.floatOffset;
    });

    this.isHorrorMode = false;
    this.originalNPCData = [];
  }
}
