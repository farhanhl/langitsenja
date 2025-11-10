import * as THREE from 'three';

export class GameManager {
  constructor(game, npcManager, skySystem) {
    this.game = game;
    this.npcManager = npcManager;
    this.skySystem = skySystem;

    // Game state
    this.gameState = 'playing'; // playing, won, lost

    // Mission state
    this.missionActive = false; // Will be set to true when user starts the game
    this.timeRemaining = 300; // 5 minutes in seconds (changed from 10)
    this.friendsFound = 0;
    this.totalFriends = 5;

    // Interaction state
    this.nearbyNPC = null;
    this.interactionPromptElement =
      document.getElementById('interactionPrompt');

    // UI elements
    this.timerElement = document.getElementById('timer');
    this.friendCounterElement = document.getElementById('friendCounter');
    this.dialogueElement = document.getElementById('dialogue');

    // Audio system
    this.dayMusic = null;
    this.nightMusic = null;
    this.currentMusic = null;
    this.setupAudio();

    // Setup interaction controls
    this.setupInteractionControls();

    // Show how to play modal first
    this.showHowToPlay();
  }

  setupAudio() {
    // Create day music
    this.dayMusic = new Audio('/music/day.mp3');
    this.dayMusic.loop = true;
    this.dayMusic.volume = 0.5;

    this.nightMusic = new Audio('/music/night.mp3');
    this.nightMusic.loop = true;
    this.nightMusic.volume = 0.5;

    this.foundSound = new Audio('/music/found.mp3');
    this.foundSound.volume = 0.8;

    this.allAudioElements = [this.dayMusic, this.nightMusic, this.foundSound];

    this.audioInitialized = false;
    this.isMuted = false;
  }

  playDayMusic() {
    if (this.currentMusic === 'day') return;

    if (this.nightMusic) {
      this.nightMusic.pause();
      this.nightMusic.currentTime = 0;
    }

    if (this.dayMusic) {
      this.dayMusic.play().catch((err) => {});
      this.currentMusic = 'day';
    }
  }

  playNightMusic() {
    if (this.currentMusic === 'night') return;

    if (this.dayMusic) {
      this.dayMusic.pause();
      this.dayMusic.currentTime = 0;
    }

    if (this.nightMusic) {
      this.nightMusic.play().catch((err) => {});
      this.currentMusic = 'night';
    }
  }

  setupInteractionControls() {
    // Interaction key (E)
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'e') {
        this.tryInteract();
      }
    });
  }

  activateRainCheat() {
    if (this.game.weatherSystem) {
      if (!this.game.weatherSystem.isRaining) {
        this.game.weatherSystem.startRain();
        this.showNotification('🌧️ Cuaca menjadi hujan...');
      } else {
        this.game.weatherSystem.stopRain();
        this.showNotification('🌧️ Hujan berhenti...');
      }
    } else {
    }
  }

  activateClearCheat() {
    if (this.game.weatherSystem) {
      this.game.weatherSystem.stopRain();
      this.showNotification('☀️ Cuaca kembali cerah!');
    } else {
    }
  }

  activateNightCheat() {
    if (this.gameState === 'lost') {
      return;
    }
    this.lose();
  }

  startMission() {
    this.updateUI();
  }

  update(delta) {
    this.checkNPCProximity();
    if (!this.missionActive || this.isPaused) return;

    // Update timer
    this.timeRemaining -= delta;
    this.updateUI();

    // Check if time is up
    if (this.timeRemaining <= 0) {
      this.lose();
      return;
    }
  }

  checkNPCProximity() {
    const playerPosition = this.game.player.getPosition();
    const npc = this.npcManager.checkNPCProximity(playerPosition, 3);

    if (this.gameState === 'lost') {
      if (npc && npc.isFarhan) {
        this.nearbyNPC = npc;
        this.showInteractionPrompt(npc.name);
      } else {
        this.nearbyNPC = null;
        this.hideInteractionPrompt();
      }
    } else {
      if (npc && !npc.found) {
        this.nearbyNPC = npc;
        this.showInteractionPrompt(npc.name);
      } else {
        this.nearbyNPC = null;
        this.hideInteractionPrompt();
      }
    }
  }

  tryInteract() {
    if (this.gameState === 'lost') {
      if (!this.nearbyNPC || !this.nearbyNPC.isFarhan) {
        return;
      }
      const npc = this.nearbyNPC;
      this.hideInteractionPrompt();
      this.showDialogue(npc.name, npc.dialogueNight);
      return;
    }

    if (!this.nearbyNPC || this.nearbyNPC.found) return;

    const npc = this.nearbyNPC;
    npc.found = true;
    this.hideInteractionPrompt();
    this.showDialogue(npc.name, npc.dialogue);
    if (npc.isMission !== false) {
      this.friendsFound++;
      this.updateUI();
      this.playFoundSound();
      if (npc.nameTag) {
        npc.nameTag.visible = false;
      }
      if (this.friendsFound >= this.totalFriends) {
        setTimeout(() => {
          this.win();
        }, 2000);
      }
    }
  }

  playFoundSound() {
    try {
      if (this.foundSound) {
        this.foundSound.currentTime = 0;
        this.foundSound.play().catch((err) => {});
      }
    } catch (error) {}
  }

  showInteractionPrompt(npcName) {
    if (this.interactionPromptElement) {
      this.interactionPromptElement.textContent = `Tekan [E] untuk berbicara dengan ${npcName}`;
      this.interactionPromptElement.style.display = 'block';
    }
  }

  hideInteractionPrompt() {
    if (this.interactionPromptElement) {
      this.interactionPromptElement.style.display = 'none';
    }
  }

  showDialogue(name, message) {
    const dialogueBox = document.getElementById('dialogue');
    const nameElement = dialogueBox.querySelector('.npc-name');
    const messageElement = dialogueBox.querySelector('.message');

    nameElement.textContent = name;
    messageElement.textContent = message;
    dialogueBox.style.display = 'block';

    // Auto-close after 3 seconds
    setTimeout(() => {
      this.closeDialogue();
    }, 6000);
  }

  closeDialogue() {
    document.getElementById('dialogue').style.display = 'none';
  }

  win() {
    this.missionActive = false;
    this.gameState = 'won';
    // Keep playing day music
    this.playDayMusic();
    document.getElementById('winPopup').style.display = 'block';
  }

  lose() {
    this.missionActive = false;
    if (this.gameState == 'playing') {
      this.gameState = 'lost';
      document.getElementById('losePopup').style.display = 'block';
    }
    this.skySystem.transitionToNight();

    this.playNightMusic();
    if (this.game.horrorManager) {
      setTimeout(() => {
        this.game.horrorManager.transformToHorror();
      }, 2000);
    }

    this.showNotification(
      '👻 Kamu terlambat mencari temanmu, segera pulang atau kamu akan bertemu mereka...'
    );
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 150px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(150, 0, 0, 0.95);
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 20px;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 0 30px rgba(255, 0, 0, 0.6);
      text-align: center;
      max-width: 80%;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  showHowToPlay() {
    const howToPlayModal = document.getElementById('howToPlay');
    const startGameBtn = document.getElementById('startGameBtn');

    if (howToPlayModal && startGameBtn) {
      howToPlayModal.style.display = 'flex';

      // Add event listener to the start button
      startGameBtn.addEventListener('click', () => {
        this.startGame();
      });

      // Also allow keyboard to start the game
      const startGameKey = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          this.startGame();
          document.removeEventListener('keydown', startGameKey);
        }
      };

      document.addEventListener('keydown', startGameKey);
    }
  }

  startGame() {
    const howToPlayModal = document.getElementById('howToPlay');
    if (howToPlayModal) {
      howToPlayModal.style.display = 'none';
    }

    this.missionActive = true;
    this.isPaused = false;
    this.startMission();

    this.audioInitialized = true;
    this.playDayMusic();
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      if (this.currentMusic === 'day' && this.dayMusic) {
        this.dayMusic.pause();
      } else if (this.currentMusic === 'night' && this.nightMusic) {
        this.nightMusic.pause();
      }
      this.showPauseMenu();
    } else {
      if (this.currentMusic === 'day' && this.dayMusic) {
        this.dayMusic.play().catch((err) => {});
      } else if (this.currentMusic === 'night' && this.nightMusic) {
        this.nightMusic.play().catch((err) => {});
      }
      this.hidePauseMenu();
    }
  }

  showPauseMenu() {
    const pauseMenu = document.getElementById('pauseMenu');

    if (!pauseMenu) {
      const newPauseMenu = document.createElement('div');
      const cheatsUnlocked = this.gameState === 'won';
      console.log(cheatsUnlocked);
      console.log(this.gameState);
      newPauseMenu.id = 'pauseMenu';
      newPauseMenu.className = 'modal';
      newPauseMenu.innerHTML = `
  <div class="modal-content">
    <h2 class="modal-title">Langit Senja</h2>

    <div class="control-section">
      <strong class="control-title">Kontrol:</strong>
      <div class="control-parent">
        <p class="control-list"><span class="control-list-span">WASD / Arrow</span> - Bergerak</p>
        <p class="control-list"><span class="control-list-span">Shift</span> - Lari</p>
        <p class="control-list"><span class="control-list-span">Spacebar</span> - Lompat</p>
        <p class="control-list"><span class="control-list-span">Mouse</span> - Putar Kamera</p>
        <p class="control-list"><span class="control-list-span">E</span> - Berinteraksi</p>
        <p class="control-list"><span class="control-list-span">F</span> - Fullscreen</p>
        <p class="control-list"><span class="control-list-span">ESC</span> - Menu Pause</p>
      </div>
    </div>

    ${
      cheatsUnlocked
        ? `
    <div class="control-section" id="cheatSection">
      <strong class="control-title">Cheat:</strong>
      <div class="control-parent">
        <p class="control-list"><span class="control-list-span">GODZILLA</span> - Memanggil Godzilla</p>
        <p class="control-list"><span class="control-list-span">SANTA</span> - Memanggil Santa</p>
        <p class="control-list"><span class="control-list-span">HOREG</span> - Rombongan sound Horeg</p>
        <p class="control-list"><span class="control-list-span">TORNADO</span> - Memanggil Tornado</p>
        <p class="control-list"><span class="control-list-span">UFO</span> - UFO menculik orang</p>
        <p class="control-list"><span class="control-list-span">NIGHT</span> - Ubah waktu malam</p>
        <p class="control-list"><span class="control-list-span">RAIN</span> - Cuaca hujan</p>
        <p class="control-list"><span class="control-list-span">CLEAR</span> - Cuaca cerah</p>
      </div>
    </div>
    `
        : ''
    }

    <div class="button-list">
      <button id="resumeBtn">Lanjutkan</button>
    </div>
    <div class="button-list">
      <button id="muteToggleBtn">🔊 Suara: ON</button>
    </div>
    <div class="button-list">
      <button id="quitBtn">Keluar</button>
    </div>
  </div>
`;

      document.body.appendChild(newPauseMenu);

      document.getElementById('resumeBtn').addEventListener('click', () => {
        this.togglePause();
      });

      document.getElementById('muteToggleBtn').addEventListener('click', () => {
        window.toggleMute();
      });

      // Update mute button text based on current mute status
      const muteToggleBtn = document.getElementById('muteToggleBtn');
      if (muteToggleBtn) {
        if (this.isMuted) {
          muteToggleBtn.textContent = '🔇 Suara: OFF';
        } else {
          muteToggleBtn.textContent = '🔊 Suara: ON';
        }
      }

      document.getElementById('quitBtn').addEventListener('click', () => {
        this.quitToMenu();
      });
    } else {
      pauseMenu.style.display = 'flex';
      this.updateMuteDisplay();
    }
  }

  hidePauseMenu() {
    const pauseMenu = document.getElementById('pauseMenu');
    if (pauseMenu) {
      pauseMenu.style.display = 'none';
    }
  }

  updateMuteDisplay() {
    const muteToggleBtn = document.getElementById('muteToggleBtn');
    if (muteToggleBtn) {
      if (this.isMuted) {
        muteToggleBtn.textContent = '🔇 Suara: OFF';
      } else {
        muteToggleBtn.textContent = '🔊 Suara: ON';
      }
    }
  }

  quitToMenu() {
    this.missionActive = false;
    this.isPaused = false;

    if (this.dayMusic) {
      this.dayMusic.pause();
      this.dayMusic.currentTime = 0;
    }
    if (this.nightMusic) {
      this.nightMusic.pause();
      this.nightMusic.currentTime = 0;
    }
    this.currentMusic = null;

    this.friendsFound = 0;
    this.timeRemaining = 300;
    this.updateUI();

    if (this.npcManager) {
      this.npcManager.resetNPCs();
    }

    if (this.dialogueElement) {
      this.dialogueElement.style.display = 'none';
    }
    document.getElementById('winPopup').style.display = 'none';
    document.getElementById('losePopup').style.display = 'none';
    this.hidePauseMenu();

    // Show how to play again
    this.showHowToPlay();
  }

  updateUI() {
    // Update timer - ensure values are never negative
    let displayMinutes, displaySeconds;

    // If remaining time is positive, compute normally; if zero or negative, show 00:00
    if (this.timeRemaining > 0) {
      displayMinutes = Math.floor(this.timeRemaining / 60);
      displaySeconds = Math.floor(this.timeRemaining % 60);
    } else {
      displayMinutes = 0;
      displaySeconds = 0;
    }

    this.timerElement.textContent = `${displayMinutes}:${displaySeconds
      .toString()
      .padStart(2, '0')}`;

    this.friendCounterElement.textContent = `Teman Ditemukan: ${this.friendsFound}/${this.totalFriends}`;

    if (this.timeRemaining < 60) {
      this.timerElement.style.color = '#ff4444';
    } else if (this.timeRemaining < 180) {
      this.timerElement.style.color = '#ffaa44';
    } else {
      this.timerElement.style.color = 'white';
    }
  }

  // Centralized mute functionality
  addAudioElement(audioElement) {
    if (!this.allAudioElements.includes(audioElement)) {
      this.allAudioElements.push(audioElement);
    }
  }

  muteAllAudio() {
    this.allAudioElements.forEach((audio) => {
      if (audio && typeof audio.pause === 'function') {
        // Store original volume to restore later
        if (audio.volume !== 0) {
          audio._originalVolume = audio.volume;
        }
        audio.volume = 0;
      }
    });
    this.isMuted = true;
  }

  unmuteAllAudio() {
    this.allAudioElements.forEach((audio) => {
      if (audio) {
        // Restore original volume or set to default
        audio.volume = audio._originalVolume || 0.5;
      }
    });
    this.isMuted = false;
  }

  toggleMute() {
    if (this.isMuted) {
      this.unmuteAllAudio();
      return false; // returns false because it's now unmuted
    } else {
      this.muteAllAudio();
      return true; // returns true because it's now muted
    }
  }
}
