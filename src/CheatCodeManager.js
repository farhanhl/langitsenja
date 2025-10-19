export class CheatCodeManager {
  constructor(game) {
    this.game = game;
    this.inputBuffer = '';
    this.bufferTimeout = null;
    this.maxBufferLength = 20;
    this.resetDelay = 2000; // 2 seconds

    this.cheats = {
      'GODZILLA': () => this.activateGodzilla(),
      'MONSTER': () => this.activateGodzilla(),
      'TORNADO': () => this.activateTornado(),
      'TWISTER': () => this.activateTornado(),
      'UFO': () => this.activateUFO(),
      'ALIEN': () => this.activateUFO(),
      'NIGHT': () => this.activateNight(),
      'RAIN': () => this.activateRain(),
      'CLEAR': () => this.activateClear()
    };

    // Cheat activation sound
    this.cheatSound = new Audio('music/cheat.mp3');
    this.cheatSound.volume = 0.7;

    this.setupKeyListener();
    this.showCheatHint();
  }

  setupKeyListener() {
    window.addEventListener('keypress', (event) => {
      // Ignore if typing in input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const key = event.key.toUpperCase();

      // Only accept letters
      if (key.match(/^[A-Z]$/)) {
        this.inputBuffer += key;

        // Limit buffer length
        if (this.inputBuffer.length > this.maxBufferLength) {
          this.inputBuffer = this.inputBuffer.slice(-this.maxBufferLength);
        }

        // Check for cheat codes
        this.checkCheats();

        // Reset buffer after delay
        clearTimeout(this.bufferTimeout);
        this.bufferTimeout = setTimeout(() => {
          this.inputBuffer = '';
        }, this.resetDelay);

        // Show input in console for debugging
        console.log('Cheat input:', this.inputBuffer);
      }
    });
  }

  checkCheats() {
    for (const [code, action] of Object.entries(this.cheats)) {
      if (this.inputBuffer.includes(code)) {
        this.inputBuffer = ''; // Clear buffer
        this.playCheatSound(); // Play sound effect
        action();
        this.showCheatActivated(code);
        break;
      }
    }
  }

  playCheatSound() {
    try {
      this.cheatSound.currentTime = 0; // Reset to start
      this.cheatSound.play().catch(err => {
        console.log('Could not play cheat sound:', err);
      });
    } catch (error) {
      console.log('Error playing cheat sound:', error);
    }
  }

  activateGodzilla() {
    if (!this.game.godzilla) {
      console.error('Godzilla not initialized');
      return;
    }

    if (this.game.godzilla.isActive()) {
      console.log('🦖 Godzilla is already active!');
      this.showNotification('Godzilla is already rampaging!', 'warning');
      return;
    }

    console.log('🦖 CHEAT ACTIVATED: GODZILLA');
    this.game.godzilla.spawn();
    this.showNotification('🦖 GODZILLA HAS ARRIVED! 🦖', 'danger');
  }

  activateTornado() {
    if (!this.game.tornado) {
      console.error('Tornado not initialized');
      return;
    }

    if (this.game.tornado.isActive()) {
      console.log('🌪️ Tornado is already active!');
      this.showNotification('Tornado is already raging!', 'warning');
      return;
    }

    console.log('🌪️ CHEAT ACTIVATED: TORNADO');
    this.game.tornado.spawn();
    this.showNotification('🌪️ TORNADO HAS SPAWNED! 🌪️', 'danger');
  }

  activateUFO() {
    if (!this.game.ufo) {
      console.error('UFO not initialized');
      return;
    }

    if (this.game.ufo.isActive()) {
      console.log('🛸 UFO is already active!');
      this.showNotification('UFO is already here!', 'warning');
      return;
    }

    console.log('🛸 CHEAT ACTIVATED: UFO');
    this.game.ufo.spawn();
    this.showNotification('🛸 UFO HAS ARRIVED! 🛸', 'info');
  }

  activateNight() {
    if (!this.game.gameManager) {
      console.error('GameManager not initialized');
      return;
    }

    console.log('🌙 CHEAT ACTIVATED: NIGHT MODE');
    this.game.gameManager.activateNightCheat();
    this.showNotification('🌙 NIGHT MODE ACTIVATED! 🌙', 'info');
  }

  activateRain() {
    if (!this.game.gameManager) {
      console.error('GameManager not initialized');
      return;
    }

    console.log('🌧️ CHEAT ACTIVATED: RAIN MODE');
    this.game.gameManager.activateRainCheat();
    this.showNotification('🌧️ RAIN MODE ACTIVATED! 🌧️', 'info');
  }

  activateClear() {
    if (!this.game.gameManager) {
      console.error('GameManager not initialized');
      return;
    }

    console.log('☀️ CHEAT ACTIVATED: CLEAR WEATHER');
    this.game.gameManager.activateClearCheat();
    this.showNotification('☀️ CLEAR WEATHER ACTIVATED! ☀️', 'info');
  }

  showCheatActivated(code) {
    console.log(`✅ CHEAT CODE ACTIVATED: ${code}`);
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `cheat-notification ${type}`;
    notification.textContent = message;

    // Style
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.padding = '15px 30px';
    notification.style.borderRadius = '10px';
    notification.style.fontSize = '20px';
    notification.style.fontWeight = 'bold';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
    notification.style.animation = 'slideDown 0.3s ease-out';

    // Color based on type
    switch (type) {
      case 'danger':
        notification.style.background = 'linear-gradient(135deg, #ff0000, #cc0000)';
        notification.style.color = 'white';
        break;
      case 'warning':
        notification.style.background = 'linear-gradient(135deg, #ffaa00, #ff8800)';
        notification.style.color = 'white';
        break;
      case 'info':
        notification.style.background = 'linear-gradient(135deg, #00aaff, #0088cc)';
        notification.style.color = 'white';
        break;
      default:
        notification.style.background = 'linear-gradient(135deg, #666, #444)';
        notification.style.color = 'white';
    }

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease-in';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  showCheatHint() {
    // Show hint on first load
    const hasSeenHint = localStorage.getItem('cheatHintSeen');

    if (!hasSeenHint) {
      setTimeout(() => {
        this.showNotification('💡 Tip: Try typing secret codes...', 'info');
        localStorage.setItem('cheatHintSeen', 'true');
      }, 5000);
    }
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      top: -100px;
      opacity: 0;
    }
    to {
      top: 20px;
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      top: 20px;
      opacity: 1;
    }
    to {
      top: -100px;
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
