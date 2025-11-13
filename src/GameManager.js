import * as THREE from 'three';
import { TelegramLogger } from './TelegramLogger.js';

export class GameManager {
  constructor(game, npcManager, skySystem) {
    this.game = game;
    this.npcManager = npcManager;
    this.skySystem = skySystem;

    this.gameState = 'playing'; // playing, won, lost
    
    // Initialize Telegram logger
    this.telegramLogger = new TelegramLogger();

    this.missionActive = false;
    this.timeRemaining = 300;
    this.friendsFound = 0;
    this.totalFriends = 6;

    this.nearbyNPC = null;
    this.interactionPromptElement =
      document.getElementById('interactionPrompt');

    this.timerElement = document.getElementById('timer');
    this.friendCounterElement = document.getElementById('friendCounter');
    this.dialogueElement = document.getElementById('dialogue');

    this.dayMusic = null;
    this.nightMusic = null;
    this.currentMusic = null;
    this.setupAudio();

    this.setupInteractionControls();

    this.showHowToPlay();
  }

  setupAudio() {
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

    this.timeRemaining -= delta;
    this.updateUI();

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
    this.playDayMusic();
    document.getElementById('winPopup').style.display = 'block';
    
    // Log when player wins
    if (this.telegramLogger) {
      this.telegramLogger.logWin();
    }
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
    
    // Log when player loses
    if (this.telegramLogger) {
      this.telegramLogger.logLose();
    }
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

      startGameBtn.addEventListener('click', () => {
        this.startGame();
      });

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
    
    // Log when player starts playing
    if (this.telegramLogger) {
      this.telegramLogger.logStartPlaying();
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.toggleMute();
      this.showPauseMenu();
    } else {
      this.toggleMute();
      this.hidePauseMenu();
    }
  }

  showPauseMenu() {
    let pauseMenu = document.getElementById('pauseMenu');
    const cheatsUnlocked = this.gameState === 'won';

    const cheatHTML = `
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
        <p class="control-list"><span class="control-list-span">KANGAROO</span> - Lompat lebih tinggi</p>
        <p class="control-list"><span class="control-list-span">FLASH</span> - Lari lebih cepat</p>
      </div>
    </div>
  `;

    if (!pauseMenu) {
      pauseMenu = document.createElement('div');
      pauseMenu.id = 'pauseMenu';
      pauseMenu.className = 'modal';
      pauseMenu.innerHTML = `
      <div class="modal-content">
        <h2 class="modal-title">Langit Senja</h2>

        <div class="control-section" id="controlSection">
          <strong class="control-title">Kontrol:</strong>
          <div class="control-parent">
            <p class="control-list"><span class="control-list-span">WASD / Arrow</span> - Bergerak</p>
            <p class="control-list"><span class="control-list-span">Shift</span> - Lari</p>
            <p class="control-list"><span class="control-list-span">Spacebar</span> - Lompat</p>
            <p class="control-list"><span class="control-list-span">Mouse</span> - Putar Kamera</p>
            <p class="control-list"><span class="control-list-span">E</span> - Berinteraksi</p>
            <p class="control-list"><span class="control-list-span">F11</span> - Fullscreen</p>
            <p class="control-list"><span class="control-list-span">M</span> - Mute</p>
            <p class="control-list"><span class="control-list-span">ESC</span> - Menu Pause</p>
          </div>
        </div>
        <div class="button-full">
          <button id="muteToggleBtn">Suara: ON/OFF</button>
        </div>

        <div class="button-row">
          <button id="resumeBtn">Lanjutkan</button>
          <button id="quitBtn" class="secondary">Keluar</button>
        </div>
        <p style="margin-top: 10px"> Developed with ❤️ by <a href="https://farhanhl.dev" style="color: white;" target="_blank" rel="noopener noreferrer"> Farhan Hadi Lutfi </a></p>
      </div>
    `;
      document.body.appendChild(pauseMenu);

      const resumeBtn = pauseMenu.querySelector('#resumeBtn');
      const muteToggleBtn = pauseMenu.querySelector('#muteToggleBtn');
      const quitBtn = pauseMenu.querySelector('#quitBtn');

      resumeBtn &&
        resumeBtn.addEventListener('click', () => this.togglePause());
      muteToggleBtn &&
        muteToggleBtn.addEventListener('click', () => {
          if (typeof window.toggleMute === 'function') window.toggleMute();
          this.isMuted = !!this.isMuted;
          muteToggleBtn.textContent = this.isMuted
            ? '🔇 Suara: OFF'
            : '🔊 Suara: ON';
        });
      quitBtn && quitBtn.addEventListener('click', () => this.quitToMenu());
    }

    const controlSection = pauseMenu.querySelector('#controlSection');
    const cheatSection = pauseMenu.querySelector('#cheatSection');

    if (cheatsUnlocked && !cheatSection && controlSection) {
      controlSection.insertAdjacentHTML('afterend', cheatHTML);
    } else if (!cheatsUnlocked && cheatSection) {
      cheatSection.remove();
    }

    const muteToggleBtn = pauseMenu.querySelector('#muteToggleBtn');
    if (muteToggleBtn) {
      muteToggleBtn.textContent = this.isMuted
        ? '🔇 Suara: OFF'
        : '🔊 Suara: ON';
    }

    pauseMenu.style.display = 'flex';
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
    this.showHowToPlay();
  }

  updateUI() {
    let displayMinutes, displaySeconds;
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

  addAudioElement(audioElement) {
    if (!this.allAudioElements.includes(audioElement)) {
      this.allAudioElements.push(audioElement);
    }
  }

  muteAllAudio() {
    this.allAudioElements.forEach((audio) => {
      if (audio && typeof audio.pause === 'function') {
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
        audio.volume = audio._originalVolume || 0.5;
      }
    });
    this.isMuted = false;
  }

  toggleMute() {
    if (this.isMuted) {
      this.unmuteAllAudio();
      return false;
    } else {
      this.muteAllAudio();
      return true;
    }
  }
}
