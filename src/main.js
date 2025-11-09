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
    
    // Bind event handlers for proper removal
    this.onResize = this.handleResize.bind(this);
    this.onEscapeKey = this.handleEscapeKey.bind(this);
    this.onMKey = this.handleMKey.bind(this);
    
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

  destroy() {
    // Clean up the player
    if (this.player && typeof this.player.destroy === 'function') {
      this.player.destroy();
    }
    
    // Clean up the UFO
    if (this.ufo && typeof this.ufo.destroy === 'function') {
      this.ufo.destroy();
    }
    
    // Clean up the cheat code manager
    if (this.cheatCodeManager && typeof this.cheatCodeManager.destroy === 'function') {
      this.cheatCodeManager.destroy();
    }
    
    // Clean up the renderer
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.onResize || this.handleResize);
    window.removeEventListener('keydown', this.onEscapeKey || this.handleEscapeKey, true);
    window.removeEventListener('keydown', this.onMKey || this.handleMKey, true);
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

window.game = new LangitSenja();

// Add event listeners after game object is created
window.addEventListener('resize', window.game.handleResize.bind(window.game));

window.addEventListener('keydown', window.game.handleEscapeKey.bind(window.game), true);
window.addEventListener('keydown', window.game.handleMKey.bind(window.game), true);
