import * as THREE from 'three';

export class SkySystem {
  constructor(scene) {
    this.scene = scene;
    this.isNight = false;
    this.isSnowy = false;
    this.originalSkyState = null;
    this.sunsetColors = {
      top: new THREE.Color(0xff6b35),
      middle: new THREE.Color(0xff8c42),
      bottom: new THREE.Color(0xffa450),
    };
    this.nightColors = {
      top: new THREE.Color(0x000428),
      middle: new THREE.Color(0x004e92),
      bottom: new THREE.Color(0x001a33),
    };
    this.snowyColors = {
      top: new THREE.Color(0x87ceeb),
      middle: new THREE.Color(0xb0e0e6),
      bottom: new THREE.Color(0xe0f6ff),
    };
    this.brightColors = {
      top: new THREE.Color(0x87ceeb),
      middle: new THREE.Color(0xb0e0e6),
      bottom: new THREE.Color(0xe0f6ff),
    };
    this.clouds = [];

    this.createSky();
    this.createClouds();
  }

  createSky() {
    const skyGeometry = new THREE.SphereGeometry(300, 32, 32);

    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: this.sunsetColors.top },
        middleColor: { value: this.sunsetColors.middle },
        bottomColor: { value: this.sunsetColors.bottom },
      },
      vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
      fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 middleColor;
                uniform vec3 bottomColor;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition).y;
                    vec3 color;
                    if (h > 0.0) {
                        color = mix(middleColor, topColor, h);
                    } else {
                        color = mix(bottomColor, middleColor, h + 1.0);
                    }
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
      side: THREE.BackSide,
    });

    this.skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(this.skyMesh);

    const sunGeometry = new THREE.SphereGeometry(10, 16, 16);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      emissive: 0xffaa00,
    });
    this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
    this.sun.position.set(100, 50, -100);
    this.scene.add(this.sun);

    const glowGeometry = new THREE.SphereGeometry(15, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.3,
    });
    this.sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.sunGlow.position.copy(this.sun.position);
    this.scene.add(this.sunGlow);

    const moonGeometry = new THREE.SphereGeometry(8, 16, 16);
    const moonMaterial = new THREE.MeshBasicMaterial({
      color: 0xddddff,
      emissive: 0x888899,
      transparent: true,
      opacity: 0,
    });
    this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
    this.moon.position.set(100, 50, -100);
    this.scene.add(this.moon);

    const moonGlowGeometry = new THREE.SphereGeometry(12, 16, 16);
    const moonGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xaaaacc,
      transparent: true,
      opacity: 0,
    });
    this.moonGlow = new THREE.Mesh(moonGlowGeometry, moonGlowMaterial);
    this.moonGlow.position.copy(this.moon.position);
    this.scene.add(this.moonGlow);
  }

  createClouds() {
    const cloudCount = 20;

    for (let i = 0; i < cloudCount; i++) {
      const cloud = this.createCloud();
      cloud.position.set(
        (Math.random() - 0.5) * 400,
        40 + Math.random() * 30,
        (Math.random() - 0.5) * 400
      );
      cloud.rotation.y = Math.random() * Math.PI * 2;

      this.scene.add(cloud);
      this.clouds.push({
        mesh: cloud,
        speed: 1 + Math.random() * 2,
        direction: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          0,
          (Math.random() - 0.5) * 0.5
        ).normalize(),
      });
    }
  }

  createCloud() {
    const group = new THREE.Group();
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      roughness: 1,
    });

    const sphereCount = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < sphereCount; i++) {
      const size = 2 + Math.random() * 3;
      const geometry = new THREE.SphereGeometry(size, 8, 8);
      const sphere = new THREE.Mesh(geometry, cloudMaterial);

      sphere.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 8
      );

      group.add(sphere);
    }

    return group;
  }

  transitionToNight() {
    if (this.isNight) {
      return;
    }
    this.isNight = true;
    const duration = 2000;
    const startTime = Date.now();
    const startColors = {
      top: this.sunsetColors.top.clone(),
      middle: this.sunsetColors.middle.clone(),
      bottom: this.sunsetColors.bottom.clone(),
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      this.skyMesh.material.uniforms.topColor.value.lerpColors(
        startColors.top,
        this.nightColors.top,
        progress
      );
      this.skyMesh.material.uniforms.middleColor.value.lerpColors(
        startColors.middle,
        this.nightColors.middle,
        progress
      );
      this.skyMesh.material.uniforms.bottomColor.value.lerpColors(
        startColors.bottom,
        this.nightColors.bottom,
        progress
      );

      if (this.sun && this.sun.material) {
        this.sun.material.opacity = 1 - progress;
        this.sun.material.transparent = true;
      }
      if (this.sunGlow && this.sunGlow.material) {
        this.sunGlow.material.opacity = 0.3 * (1 - progress);
      }

      if (this.moon && this.moon.material) {
        this.moon.material.opacity = progress;
      }
      if (this.moonGlow && this.moonGlow.material) {
        this.moonGlow.material.opacity = 0.2 * progress;
      }

      if (progress > 0.5 && !this.stars) {
        this.createStars();
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (this.sun) this.sun.visible = false;
        if (this.sunGlow) this.sunGlow.visible = false;
      }
    };

    animate();
  }

  saveOriginalState() {
    this.originalSkyState = {
      top: this.skyMesh.material.uniforms.topColor.value.clone(),
      middle: this.skyMesh.material.uniforms.middleColor.value.clone(),
      bottom: this.skyMesh.material.uniforms.bottomColor.value.clone(),
      isNight: this.isNight,
    };
  }

  transitionToSnowy() {
    if (this.isSnowy) {
      return;
    }

    this.saveOriginalState();
    this.isSnowy = true;
    const duration = 2000;
    const startTime = Date.now();

    const startColors = {
      top: this.originalSkyState.top.clone(),
      middle: this.originalSkyState.middle.clone(),
      bottom: this.originalSkyState.bottom.clone(),
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      this.skyMesh.material.uniforms.topColor.value.lerpColors(
        startColors.top,
        this.snowyColors.top,
        progress
      );
      this.skyMesh.material.uniforms.middleColor.value.lerpColors(
        startColors.middle,
        this.snowyColors.middle,
        progress
      );
      this.skyMesh.material.uniforms.bottomColor.value.lerpColors(
        startColors.bottom,
        this.snowyColors.bottom,
        progress
      );

      if (this.isNight) {
        if (this.moon && this.moon.material) {
          this.moon.material.opacity = 1 - progress;
        }
        if (this.moonGlow && this.moonGlow.material) {
          this.moonGlow.material.opacity = 0.2 * (1 - progress);
        }

        if (this.sun && this.sun.material) {
          this.sun.material.opacity = progress;
          this.sun.material.transparent = true;
        }
        if (this.sunGlow && this.sunGlow.material) {
          this.sunGlow.material.opacity = 0.3 * progress;
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (this.moon) this.moon.visible = false;
        if (this.moonGlow) this.moonGlow.visible = false;
        if (this.sun) this.sun.visible = true;
        if (this.sunGlow) this.sunGlow.visible = true;
      }
    };

    animate();
  }

  restoreOriginalState() {
    if (!this.isSnowy || !this.originalSkyState) {
      return;
    }

    this.isSnowy = false;

    const duration = 2000;
    const startTime = Date.now();
    const startColors = {
      top: this.snowyColors.top.clone(),
      middle: this.snowyColors.middle.clone(),
      bottom: this.snowyColors.bottom.clone(),
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      this.skyMesh.material.uniforms.topColor.value.lerpColors(
        startColors.top,
        this.originalSkyState.top,
        progress
      );
      this.skyMesh.material.uniforms.middleColor.value.lerpColors(
        startColors.middle,
        this.originalSkyState.middle,
        progress
      );
      this.skyMesh.material.uniforms.bottomColor.value.lerpColors(
        startColors.bottom,
        this.originalSkyState.bottom,
        progress
      );

      if (this.originalSkyState.isNight) {
        if (this.moon && this.moon.material) {
          this.moon.material.opacity = progress;
        }
        if (this.moonGlow && this.moonGlow.material) {
          this.moonGlow.material.opacity = 0.2 * progress;
        }
      }

      if (this.originalSkyState.isNight) {
        if (this.sun && this.sun.material) {
          this.sun.material.opacity = 1 - progress;
          this.sun.material.transparent = true;
        }
        if (this.sunGlow && this.sunGlow.material) {
          this.sunGlow.material.opacity = 0.3 * (1 - progress);
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isNight = this.originalSkyState.isNight;
        if (this.originalSkyState.isNight) {
          if (this.moon) this.moon.visible = true;
          if (this.moonGlow) this.moonGlow.visible = true;
          if (this.sun) this.sun.visible = false;
          if (this.sunGlow) this.sunGlow.visible = false;
        } else {
          if (this.moon) this.moon.visible = false;
          if (this.moonGlow) this.moonGlow.visible = false;
          if (this.sun) this.sun.visible = true;
          if (this.sunGlow) this.sunGlow.visible = true;
        }

        this.originalSkyState = null;
      }
    };

    animate();
  }

  createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
    });

    const starVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 600;
      const y = Math.random() * 200 + 50;
      const z = (Math.random() - 0.5) * 600;
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starVertices, 3)
    );
    this.stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.stars);
  }

  update() {
    this.clouds.forEach((cloud) => {
      cloud.mesh.position.x += cloud.direction.x * cloud.speed * 0.01;
      cloud.mesh.position.z += cloud.direction.z * cloud.speed * 0.01;

      if (cloud.mesh.position.x > 200) cloud.mesh.position.x = -200;
      if (cloud.mesh.position.x < -200) cloud.mesh.position.x = 200;
      if (cloud.mesh.position.z > 200) cloud.mesh.position.z = -200;
      if (cloud.mesh.position.z < -200) cloud.mesh.position.z = 200;
    });

    if (this.sunGlow) {
      this.sunGlow.rotation.y += 0.001;
    }

    if (this.moonGlow && this.isNight) {
      this.moonGlow.rotation.y += 0.0005;
    }
  }
}
