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
import { Tornado } from './Tornado.js';
import { CheatCodeManager } from './CheatCodeManager.js';

class LangitSenja {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        this.renderer.domElement.id = 'gameCanvas';

        // Initialize game systems
        this.clock = new THREE.Clock();
        this.init();
    }

    async init() {
        // Setup lighting
        this.setupLighting();

        // Create sky system
        this.skySystem = new SkySystem(this.scene);

        // Create weather system
        this.weatherSystem = new WeatherSystem(this.scene);

        // Build city
        this.cityBuilder = new CityBuilder(this.scene);
        this.cityData = this.cityBuilder.build();

        // Create player
        this.player = new Player(this.scene, this.camera, this.cityData);

        // Create NPCs
        this.npcManager = new NPCManager(this.scene, this.cityData);
        this.npcManager.createNPCs();

        // Create horror NPC manager
        this.horrorManager = new HorrorNPCManager(this.scene, this.npcManager);

        // Initialize game manager
        this.gameManager = new GameManager(this, this.npcManager, this.skySystem);

        // Create UFO easter egg 🛸 (after gameManager)
        this.ufo = new UFO(this.scene, this.npcManager, this.gameManager);

        // Create Godzilla easter egg 🦖
        this.godzilla = new Godzilla(this.scene, this.cityData, this.npcManager);

        // Create Tornado easter egg 🌪️
        this.tornado = new Tornado(this.scene, this.cityData, this.npcManager);

        // Initialize cheat code system
        this.cheatCodeManager = new CheatCodeManager(this);

        // Hide loading screen
        document.getElementById('loading').style.display = 'none';

        // Start game loop
        this.animate();
    }

    setupLighting() {
        // Ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0xffd5aa, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        this.sunLight = new THREE.DirectionalLight(0xffaa66, 0.8);
        this.sunLight.position.set(100, 150, 100);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.camera.left = -125;
        this.sunLight.shadow.camera.right = 125;
        this.sunLight.shadow.camera.top = 125;
        this.sunLight.shadow.camera.bottom = -125;
        this.sunLight.shadow.camera.far = 500;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);

        // Hemisphere light for sky color
        const hemiLight = new THREE.HemisphereLight(0xff9966, 0x775533, 0.4);
        this.scene.add(hemiLight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        // Update game systems
        this.player.update(delta);
        this.npcManager.update(delta);
        this.gameManager.update(delta);
        this.skySystem.update();

        // Update weather system
        if (this.weatherSystem) {
            this.weatherSystem.update(delta);
        }

        // Update UFO easter egg
        if (this.ufo) {
            this.ufo.update(delta);
        }

        // Update Godzilla easter egg
        if (this.godzilla) {
            this.godzilla.update(delta);
        }

        // Update Tornado easter egg
        if (this.tornado) {
            this.tornado.update(delta);
        }

        // Update horror NPCs
        if (this.horrorManager) {
            this.horrorManager.update(delta);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Global functions for UI
window.closeDialogue = function() {
    document.getElementById('dialogue').style.display = 'none';
};

window.closePopup = function() {
    document.getElementById('winPopup').style.display = 'none';
    document.getElementById('losePopup').style.display = 'none';
};

window.resetGame = function() {
    location.reload();
};

// Toggle Mute function for music
window.toggleMute = function() {
    const muteButton = document.getElementById('muteButton');
    const icon = muteButton.querySelector('.icon');

    if (!window.game || !window.game.gameManager) {
        console.log('Game not initialized yet');
        return;
    }

    const gameManager = window.game.gameManager;

    // Check if music is currently muted
    const isMuted = muteButton.classList.contains('muted');

    if (isMuted) {
        // Unmute
        if (gameManager.dayMusic) gameManager.dayMusic.volume = 0.5;
        if (gameManager.nightMusic) gameManager.nightMusic.volume = 0.5;
        muteButton.classList.remove('muted');
        icon.textContent = '🔊';
        console.log('🔊 Music unmuted');
    } else {
        // Mute
        if (gameManager.dayMusic) gameManager.dayMusic.volume = 0;
        if (gameManager.nightMusic) gameManager.nightMusic.volume = 0;
        muteButton.classList.add('muted');
        icon.textContent = '🔇';
        console.log('🔇 Music muted');
    }
};

// Handle window resize
window.addEventListener('resize', () => {
    if (window.game) {
        window.game.camera.aspect = window.innerWidth / window.innerHeight;
        window.game.camera.updateProjectionMatrix();
        window.game.renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// Start game
window.game = new LangitSenja();
