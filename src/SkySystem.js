import * as THREE from 'three';

export class SkySystem {
  constructor(scene) {
    this.scene = scene;
    this.isNight = false;
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
    this.clouds = [];

    this.createSky();
    this.createClouds();
  }

  createSky() {
    // Create gradient sky using a large sphere
    const skyGeometry = new THREE.SphereGeometry(300, 32, 32);

    // Create custom shader for gradient sky
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

    // Add sun
    const sunGeometry = new THREE.SphereGeometry(10, 16, 16);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      emissive: 0xffaa00,
    });
    this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
    this.sun.position.set(100, 50, -100);
    this.scene.add(this.sun);

    // Add sun glow
    const glowGeometry = new THREE.SphereGeometry(15, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.3,
    });
    this.sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.sunGlow.position.copy(this.sun.position);
    this.scene.add(this.sunGlow);

    // Add moon (initially hidden)
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

    // Add moon glow
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

    // Create cloud using multiple spheres
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
    console.log('transitionToNight called, isNight:', this.isNight);
    if (this.isNight) {
      console.log('Already night, skipping transition');
      return;
    }
    this.isNight = true;
    console.log('Starting night transition...');

    // Animate sky color transition
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    const startColors = {
      top: this.sunsetColors.top.clone(),
      middle: this.sunsetColors.middle.clone(),
      bottom: this.sunsetColors.bottom.clone(),
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Interpolate colors
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

      // Fade out sun and fade in moon
      if (this.sun && this.sun.material) {
        this.sun.material.opacity = 1 - progress;
        this.sun.material.transparent = true;
      }
      if (this.sunGlow && this.sunGlow.material) {
        this.sunGlow.material.opacity = 0.3 * (1 - progress);
      }

      // Fade in moon
      if (this.moon && this.moon.material) {
        this.moon.material.opacity = progress;
      }
      if (this.moonGlow && this.moonGlow.material) {
        this.moonGlow.material.opacity = 0.2 * progress;
      }

      // Add stars
      if (progress > 0.5 && !this.stars) {
        this.createStars();
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        console.log('Night transition complete!');
        // Ensure sun is completely hidden
        if (this.sun) this.sun.visible = false;
        if (this.sunGlow) this.sunGlow.visible = false;
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
    // Move clouds
    this.clouds.forEach((cloud) => {
      cloud.mesh.position.x += cloud.direction.x * cloud.speed * 0.01;
      cloud.mesh.position.z += cloud.direction.z * cloud.speed * 0.01;

      // Wrap around
      if (cloud.mesh.position.x > 200) cloud.mesh.position.x = -200;
      if (cloud.mesh.position.x < -200) cloud.mesh.position.x = 200;
      if (cloud.mesh.position.z > 200) cloud.mesh.position.z = -200;
      if (cloud.mesh.position.z < -200) cloud.mesh.position.z = 200;
    });

    // Rotate sun glow for effect
    if (this.sunGlow) {
      this.sunGlow.rotation.y += 0.001;
    }

    // Rotate moon glow for effect
    if (this.moonGlow && this.isNight) {
      this.moonGlow.rotation.y += 0.0005;
    }
  }
}
