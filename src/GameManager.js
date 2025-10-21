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
    this.dayMusic = new Audio('music/day.mp3');
    this.dayMusic.loop = true;
    this.dayMusic.volume = 0.5;

    // Create night music
    this.nightMusic = new Audio('music/night.mp3');
    this.nightMusic.loop = true;
    this.nightMusic.volume = 0.5;

    // Create special NPC found sound
    this.foundSound = new Audio('music/found.mp3');
    this.foundSound.volume = 0.8;

    // Flag to track if audio is initialized
    this.audioInitialized = false;

    // Audio prompt will be shown when user starts the game
  }

  showAudioPrompt() {
    const audioPrompt = document.getElementById('audioPrompt');
    const startBtn = document.getElementById('startAudioBtn');

    if (audioPrompt && startBtn) {
      audioPrompt.style.display = 'block';

      startBtn.addEventListener('click', () => {
        this.audioInitialized = true;
        this.playDayMusic();
        audioPrompt.style.display = 'none';
        console.log('🎵 Audio system initialized');
      });

      // Also allow keyboard/click anywhere to start
      const startAudio = (e) => {
        if (!this.audioInitialized) {
          this.audioInitialized = true;
          this.playDayMusic();
          audioPrompt.style.display = 'none';
          console.log('🎵 Audio system initialized');

          document.removeEventListener('keydown', startAudio);
        }
      };

      document.addEventListener('keydown', startAudio);
    }
  }

  playDayMusic() {
    if (this.currentMusic === 'day') return;

    // Stop night music if playing
    if (this.nightMusic) {
      this.nightMusic.pause();
      this.nightMusic.currentTime = 0;
    }

    // Play day music
    if (this.dayMusic) {
      this.dayMusic.play().catch((err) => {
        console.log('Day music autoplay prevented:', err);
      });
      this.currentMusic = 'day';
    }
  }

  playNightMusic() {
    if (this.currentMusic === 'night') return;

    // Stop day music if playing
    if (this.dayMusic) {
      this.dayMusic.pause();
      this.dayMusic.currentTime = 0;
    }

    // Play night music
    if (this.nightMusic) {
      this.nightMusic.play().catch((err) => {
        console.log('Night music autoplay prevented:', err);
      });
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
    console.log('🌧️ Toggling rain...');
    if (this.game.weatherSystem) {
      if (!this.game.weatherSystem.isRaining) {
        this.game.weatherSystem.startRain();
        this.showNotification('🌧️ Cuaca menjadi hujan...');
      } else {
        this.game.weatherSystem.stopRain();
        this.showNotification('🌧️ Hujan berhenti...');
      }
    } else {
      console.error('⚠️ Weather system not found!');
    }
  }

  activateClearCheat() {
    console.log('☀️ Clearing weather...');
    if (this.game.weatherSystem) {
      this.game.weatherSystem.stopRain();
      this.showNotification('☀️ Cuaca kembali cerah!');
    } else {
      console.error('⚠️ Weather system not found!');
    }
  }

  activateNightCheat() {
    if (this.gameState === 'lost') {
      console.log('⚠️ Already in night mode!');
      return;
    }
    console.log('🌙 Forcing night mode via cheat code...');
    this.lose();
  }

  startMission() {
    console.log('Mission started!');
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

    // Debug logging
    if (npc) {
      console.log(
        '🔍 NPC detected:',
        npc.name,
        '| isFarhan:',
        npc.isFarhan,
        '| found:',
        npc.found
      );
    }

    // Special handling for night mode
    if (this.gameState === 'lost') {
      // Only allow interaction with Farhan at night
      if (npc && npc.isFarhan) {
        // Always show prompt for Farhan at night, even if found during day
        this.nearbyNPC = npc;
        this.showInteractionPrompt(npc.name);
        console.log('🌙 Farhan detected at night, showing prompt');
      } else {
        this.nearbyNPC = null;
        this.hideInteractionPrompt();
      }
    } else {
      // Normal day behavior
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
    console.log('🎮 tryInteract called | gameState:', this.gameState);
    console.log(
      '🎮 nearbyNPC:',
      this.nearbyNPC?.name,
      '| isFarhan:',
      this.nearbyNPC?.isFarhan
    );

    // Special handling for night mode
    if (this.gameState === 'lost') {
      // Only Farhan can be interacted with at night
      if (!this.nearbyNPC || !this.nearbyNPC.isFarhan) {
        console.log('❌ Not Farhan or no nearby NPC at night');
        console.log('   nearbyNPC exists:', !!this.nearbyNPC);
        console.log('   nearbyNPC.isFarhan:', this.nearbyNPC?.isFarhan);
        console.log('   nearbyNPC.name:', this.nearbyNPC?.name);
        return;
      }

      const npc = this.nearbyNPC;

      // Hide interaction prompt
      this.hideInteractionPrompt();

      // Show night dialogue
      console.log('💬 Showing Farhan night dialogue');
      this.showDialogue(npc.name, npc.dialogueNight);

      return;
    }

    // Normal day behavior
    if (!this.nearbyNPC || this.nearbyNPC.found) return;

    const npc = this.nearbyNPC;

    // Mark as found
    npc.found = true;

    // Hide interaction prompt
    this.hideInteractionPrompt();

    // Show dialogue
    this.showDialogue(npc.name, npc.dialogue);

    // Check if it's a mission NPC (not Farhan)
    if (npc.isMission !== false) {
      this.friendsFound++;
      this.updateUI();

      // Play found sound effect 🎵
      this.playFoundSound();

      // Hide name tag after found
      if (npc.nameTag) {
        npc.nameTag.visible = false;
      }

      // Check win condition
      if (this.friendsFound >= this.totalFriends) {
        setTimeout(() => {
          this.win();
        }, 2000); // Delay to show last dialogue
      }
    }
  }

  playFoundSound() {
    try {
      if (this.foundSound) {
        this.foundSound.currentTime = 0; // Reset to start
        this.foundSound.play().catch((err) => {
          console.log('Could not play found sound:', err);
        });
        console.log('🎵 Playing found.mp3 sound effect!');
      }
    } catch (error) {
      console.log('Error playing found sound:', error);
    }
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
    console.log('You win!');
  }

  lose() {
    this.missionActive = false;
    if (this.gameState == 'playing') {
      this.gameState = 'lost';
      document.getElementById('losePopup').style.display = 'block';
    }
    this.skySystem.transitionToNight();

    // Switch to night music
    this.playNightMusic();

    // Transform NPCs to horror creatures
    console.log('🌙 Night has fallen... Horror awakens!');
    if (this.game.horrorManager) {
      setTimeout(() => {
        this.game.horrorManager.transformToHorror();
      }, 2000);
    }

    this.showNotification(
      '👻 Kamu terlambat mencari temanmu, segera pulang atau kamu akan bertemu mereka...'
    );
    console.log('You lose!');
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

    // Start mission first to initialize timer
    this.missionActive = true;
    this.isPaused = false; // Add pause state
    this.startMission();

    // Initialize audio
    this.audioInitialized = true;
    this.playDayMusic();

    console.log('🎮 Game started! Mission active.');
  }

  togglePause() {
    if (!this.missionActive) return; // Don't pause if mission is not active
    
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      // Pause music when game is paused
      if (this.currentMusic === 'day' && this.dayMusic) {
        this.dayMusic.pause();
      } else if (this.currentMusic === 'night' && this.nightMusic) {
        this.nightMusic.pause();
      }
      this.showPauseMenu();
    } else {
      // Resume music when game is resumed
      if (this.currentMusic === 'day' && this.dayMusic) {
        this.dayMusic.play().catch((err) => {
          console.log('Day music resume prevented:', err);
        });
      } else if (this.currentMusic === 'night' && this.nightMusic) {
        this.nightMusic.play().catch((err) => {
          console.log('Night music resume prevented:', err);
        });
      }
      this.hidePauseMenu();
    }
    
    console.log(this.isPaused ? '⏸️ Game paused' : '▶️ Game resumed');
  }

  showPauseMenu() {
    // Show pause UI
    const pauseMenu = document.getElementById('pauseMenu');
    
    if (!pauseMenu) {
      // Create pause menu element if it doesn't exist
      const newPauseMenu = document.createElement('div');
      newPauseMenu.id = 'pauseMenu';
      newPauseMenu.className = 'modal';
      newPauseMenu.innerHTML = `
        <div class="modal-content">
          <h2>Permainan Dijeda ⏸️</h2>
          <div class="instructions">
            <p>Permainan saat ini dijeda.</p>
            <p>Tekan ESC lagi atau klik tombol "Lanjutkan" untuk melanjutkan permainan.</p>
          </div>
          <button id="resumeBtn">Lanjutkan (ESC)</button>
          <button id="quitBtn" class="secondary">Keluar ke Menu</button>
        </div>
      `;
      document.body.appendChild(newPauseMenu);
      
      // Add event listeners to the buttons
      document.getElementById('resumeBtn').addEventListener('click', () => {
        this.togglePause();
      });
      
      document.getElementById('quitBtn').addEventListener('click', () => {
        this.quitToMenu();
      });
    } else {
      pauseMenu.style.display = 'flex';
    }
  }

  hidePauseMenu() {
    const pauseMenu = document.getElementById('pauseMenu');
    if (pauseMenu) {
      pauseMenu.style.display = 'none';
    }
  }

  quitToMenu() {
    // Reset game state to show how to play again
    this.missionActive = false;
    this.isPaused = false;
    
    // Stop any playing music
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
    this.timeRemaining = 300; // Reset timer
    this.updateUI(); // Update UI to show reset values
    
    // Reset NPC states
    if (this.npcManager) {
      this.npcManager.resetNPCs();
    }
    
    // Hide any active dialogue or popups
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
    // Update timer
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = Math.floor(this.timeRemaining % 60);
    this.timerElement.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, '0')}`;

    // Update friend counter
    this.friendCounterElement.textContent = `Teman Ditemukan: ${this.friendsFound}/${this.totalFriends}`;

    // Change timer color when low on time
    if (this.timeRemaining < 60) {
      this.timerElement.style.color = '#ff4444';
    } else if (this.timeRemaining < 180) {
      this.timerElement.style.color = '#ffaa44';
    } else {
      this.timerElement.style.color = 'white';
    }
  }
}
