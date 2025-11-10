import * as THREE from 'three';
import { CityBuilder } from './CityBuilder.js';
import { Player } from './Player.js';
import { NPCManager } from './NPCManager.js';
import { GameManager } from './GameManager.js';
import { SkySystem } from './SkySystem.js';
import { UFO } from './UFO.js';
import { HorrorNPCManager } from './HorrorNPCManager.js';
import { WeatherSystem } from './WeatherSystem.js';
import { Godzilla } from './Godzilla.js';
import { Horeg } from './Horeg.js';
import { Santa } from './Santa.js';
import { Tornado } from './Tornado.js';
import { CheatCodeManager } from './CheatCodeManager.js';
import { ObjectPool } from './ObjectPool.js';
import { FrustumCuller } from './FrustumCuller.js';
import { BatchRenderer } from './BatchRenderer.js';
import { DistanceCuller } from './DistanceCuller.js';
import { LODManager } from './LODManager.js';

class LangitSenja {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
    this.renderer.physicallyCorrectLights = false;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.renderer.setClearAlpha(1);

    document.body.appendChild(this.renderer.domElement);
    this.renderer.domElement.id = 'gameCanvas';
    this.clock = new THREE.Clock();

    this.onResize = this.handleResize.bind(this);
    this.onEscapeKey = this.handleEscapeKey.bind(this);
    this.onMKey = this.handleMKey.bind(this);
    this.onFKey = this.handleFKey.bind(this);

    this.init();
  }

  async init() {
    this.setupLighting();
    this.skySystem = new SkySystem(this.scene);
    this.weatherSystem = new WeatherSystem(this.scene);
    this.cityBuilder = new CityBuilder(this.scene);
    this.cityData = this.cityBuilder.build();
    this.player = new Player(
      this.scene,
      this.camera,
      this.cityData,
      this.gameManager
    );
    this.npcManager = new NPCManager(this.scene, this.cityData);
    this.npcManager.createNPCs();
    this.horrorManager = new HorrorNPCManager(this.scene, this.npcManager);
    this.gameManager = new GameManager(this, this.npcManager, this.skySystem);
    this.ufo = new UFO(this.scene, this.npcManager, this.gameManager);
    this.godzilla = new Godzilla(
      this.scene,
      this.cityData,
      this.npcManager,
      this.gameManager
    );
    this.horeg = new Horeg(
      this.scene,
      this.cityData,
      this.npcManager,
      this.gameManager
    );
    this.santa = new Santa(
      this.scene,
      this.cityData,
      this.npcManager,
      this.weatherSystem,
      this.skySystem,
      this.gameManager
    );
    this.tornado = new Tornado(
      this.scene,
      this.cityData,
      this.npcManager,
      this.gameManager
    );
    this.cheatCodeManager = new CheatCodeManager(this);
    document.getElementById('loading').style.display = 'none';
    this.animate();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffd5aa, 0.6);
    this.scene.add(ambientLight);
    this.sunLight = new THREE.DirectionalLight(0xffaa66, 0.8);
    this.sunLight.position.set(75, 112.5, 75);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.left = -93.75;
    this.sunLight.shadow.camera.right = 93.75;
    this.sunLight.shadow.camera.top = 93.75;
    this.sunLight.shadow.camera.bottom = -93.75;
    this.sunLight.shadow.camera.far = 375;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.bias = 0.0005;
    this.sunLight.shadow.normalBias = 0.5;
    this.sunLight.shadow.radius = 2;
    this.scene.add(this.sunLight);
    const hemiLight = new THREE.HemisphereLight(0xff9966, 0x775533, 0.4);
    this.scene.add(hemiLight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    if (this.frustumCuller) {
      this.frustumCuller.updateFrustum();
      if (this.npcManager) {
        this.npcManager.update(delta, this.frustumCuller);
      }
    } else {
      this.npcManager.update(delta);
    }

    this.player.update(delta);
    this.gameManager.update(delta);
    this.skySystem.update();

    if (this.weatherSystem) {
      this.weatherSystem.update(delta);
    }

    if (this.ufo) {
      this.ufo.update(delta);
    }

    if (this.godzilla) {
      this.godzilla.update(delta);
    }

    if (this.horeg) {
      this.horeg.update(delta);
    }

    if (this.santa) {
      this.santa.update(delta);
    }

    if (this.tornado) {
      this.tornado.update(delta);
    }

    if (this.horrorManager) {
      this.horrorManager.update(delta);
    }

    if (this.batchRenderer) {
      this.batchRenderer.update();
    }

    if (this.distanceCuller && this.player) {
      this.distanceCuller.player = this.player;
      if (this.npcManager && this.npcManager.npcs) {
        this.distanceCuller.updateVisibility(
          this.npcManager.npcs.map((npc) => npc.mesh)
        );
      }
      if (this.npcManager && this.npcManager.vehicleNPCs) {
        this.distanceCuller.updateVisibility(
          this.npcManager.vehicleNPCs.map((vehicle) => vehicle.mesh)
        );
      }
    }

    if (this.lodManager) {
      this.lodManager.player = this.player;
      this.lodManager.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  handleResize() {
    if (this) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  handleEscapeKey(e) {
    if (e.key === 'Escape') {
      if (this && this.gameManager) {
        const howToPlayModal = document.getElementById('howToPlay');
        const pauseMenu = document.getElementById('pauseMenu');

        const howToPlayVisible =
          howToPlayModal && howToPlayModal.style.display !== 'none';
        const pauseMenuVisible =
          pauseMenu && pauseMenu.style.display !== 'none';
        if (!howToPlayVisible) {
          if (pauseMenuVisible) {
            this.gameManager.togglePause();
          } else {
            this.gameManager.togglePause();
          }
        }
      }
      e.preventDefault();
    }
  }

  handleMKey(e) {
    if (e.key.toLowerCase() === 'm') {
      window.toggleMute();
      e.preventDefault();
    }
  }

  handleFKey(e) {
    if (e.key.toLowerCase() === 'f') {
      window.toggleFullscreen();
      e.preventDefault();
    }
  }

  destroy() {
    if (this.player && typeof this.player.destroy === 'function') {
      this.player.destroy();
    }

    if (this.ufo && typeof this.ufo.destroy === 'function') {
      this.ufo.destroy();
    }

    if (
      this.cheatCodeManager &&
      typeof this.cheatCodeManager.destroy === 'function'
    ) {
      this.cheatCodeManager.destroy();
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    window.removeEventListener('resize', this.onResize || this.handleResize);
    window.removeEventListener(
      'keydown',
      this.onEscapeKey || this.handleEscapeKey,
      true
    );
    window.removeEventListener('keydown', this.onMKey || this.handleMKey, true);
    window.removeEventListener('keydown', this.onFKey || this.handleFKey, true);
  }
}

window.closeDialogue = function () {
  document.getElementById('dialogue').style.display = 'none';
};

window.closePopup = function () {
  document.getElementById('winPopup').style.display = 'none';
  document.getElementById('losePopup').style.display = 'none';
};

window.resetGame = function () {
  if (window.game && typeof window.game.destroy === 'function') {
    window.game.destroy();
  }
  location.reload();
};

window.toggleMute = function () {
  const muteButton = document.getElementById('muteButton');
  const icon = muteButton.querySelector('.icon');

  if (!window.game || !window.game.gameManager) {
    return;
  }

  const gameManager = window.game.gameManager;
  const wasMuted = gameManager.isMuted;

  const isNowMuted = gameManager.toggleMute();

  if (isNowMuted) {
    muteButton.classList.add('muted');
    icon.textContent = '🔇';
  } else {
    muteButton.classList.remove('muted');
    icon.textContent = '🔊';
  }
};

window.toggleFullscreen = function () {
  const elem = document.documentElement;

  const isFs =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement;

  try {
    if (!isFs) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  } catch (err) {
    console.error('Fullscreen error:', err);
  }
};

window.game = new LangitSenja();

window.addEventListener('resize', window.game.handleResize.bind(window.game));

window.addEventListener(
  'keydown',
  window.game.handleEscapeKey.bind(window.game),
  true
);
window.addEventListener(
  'keydown',
  window.game.handleMKey.bind(window.game),
  true
);

window.addEventListener(
  'keydown',
  window.game.handleFKey.bind(window.game),
  true
);
