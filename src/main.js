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

class LangitSenja {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);
    this.renderer.domElement.id = 'gameCanvas';
    this.clock = new THREE.Clock();
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
    this.godzilla = new Godzilla(this.scene, this.cityData, this.npcManager, this.gameManager);
    this.horeg = new Horeg(this.scene, this.cityData, this.npcManager, this.gameManager);
    this.santa = new Santa(
      this.scene,
      this.cityData,
      this.npcManager,
      this.weatherSystem,
      this.skySystem,
      this.gameManager
    );
    this.tornado = new Tornado(this.scene, this.cityData, this.npcManager, this.gameManager);
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
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.scene.add(this.sunLight);
    const hemiLight = new THREE.HemisphereLight(0xff9966, 0x775533, 0.4);
    this.scene.add(hemiLight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    this.player.update(delta);
    this.npcManager.update(delta);
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

    this.renderer.render(this.scene, this.camera);
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
  
  // Use the centralized mute toggle function
  const isNowMuted = gameManager.toggleMute();

  if (isNowMuted) {
    muteButton.classList.add('muted');
    icon.textContent = '🔇';
  } else {
    muteButton.classList.remove('muted');
    icon.textContent = '🔊';
  }
};

window.addEventListener('resize', () => {
  if (window.game) {
    window.game.camera.aspect = window.innerWidth / window.innerHeight;
    window.game.camera.updateProjectionMatrix();
    window.game.renderer.setSize(window.innerWidth, window.innerHeight);
  }
});

window.addEventListener(
  'keydown',
  (e) => {
    if (e.key === 'Escape') {
      if (window.game && window.game.gameManager) {
        const howToPlayModal = document.getElementById('howToPlay');
        const pauseMenu = document.getElementById('pauseMenu');

        const howToPlayVisible =
          howToPlayModal && howToPlayModal.style.display !== 'none';
        const pauseMenuVisible =
          pauseMenu && pauseMenu.style.display !== 'none';
        if (!howToPlayVisible) {
          if (pauseMenuVisible) {
            window.game.gameManager.togglePause();
          } else {
            window.game.gameManager.togglePause();
          }
        }
      }
      e.preventDefault();
    }
  },
  true
);

window.addEventListener(
  'keydown',
  (e) => {
    if (e.key.toLowerCase() === 'm') {
      window.toggleMute();
      e.preventDefault();
    }
  },
  true
);

window.game = new LangitSenja();
