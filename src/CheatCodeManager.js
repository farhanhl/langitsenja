export class CheatCodeManager {
  constructor(game) {
    this.game = game;
    this.inputBuffer = '';
    this.bufferTimeout = null;
    this.cheatHintTimeout = null;
    this.maxBufferLength = 20;
    this.resetDelay = 2000;

    this.cheats = {
      GODZILLA: () => this.activateGodzilla(),
      SANTA: () => this.activateSanta(),
      HOREG: () => this.activateHoreg(),
      TORNADO: () => this.activateTornado(),
      UFO: () => this.activateUFOCheat(),
      NIGHT: () => this.activateNight(),
      RAIN: () => this.activateRain(),
      CLEAR: () => this.activateClear(),
    };

    this.cheatSound = new Audio('music/cheat.mp3');
    this.cheatSound.volume = 0.7;

    if (
      this.game.gameManager &&
      typeof this.game.gameManager.addAudioElement === 'function'
    ) {
      this.game.gameManager.addAudioElement(this.cheatSound);
    }

    this.boundKeyPress = this.handleKeyPress.bind(this);

    this.setupKeyListener();
    this.showCheatHint();
  }

  setupKeyListener() {
    window.addEventListener('keypress', this.boundKeyPress);
  }

  handleKeyPress(event) {
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA'
    ) {
      return;
    }

    const key = event.key.toUpperCase();

    if (key.match(/^[A-Z]$/)) {
      this.inputBuffer += key;

      if (this.inputBuffer.length > this.maxBufferLength) {
        this.inputBuffer = this.inputBuffer.slice(-this.maxBufferLength);
      }
      this.checkCheats();

      clearTimeout(this.bufferTimeout);
      this.bufferTimeout = setTimeout(() => {
        this.inputBuffer = '';
      }, this.resetDelay);
    }
  }

  checkCheats() {
    for (const [code, action] of Object.entries(this.cheats)) {
      if (this.inputBuffer.includes(code)) {
        this.inputBuffer = '';
        this.playCheatSound();
        action();
        break;
      }
    }
  }

  playCheatSound() {
    try {
      this.cheatSound.currentTime = 0;
      this.cheatSound.play().catch((err) => {});
    } catch (error) {}
  }

  activateGodzilla() {
    if (!this.game.godzilla) {
      return;
    }

    if (this.game.godzilla.isActive()) {
      this.showNotification('GODZILLA is already active!', 'warning');
      return;
    }

    this.game.godzilla.spawn();
    this.showNotification('GODZILLA Activated', 'danger');
  }

  activateSanta() {
    if (!this.game.santa) {
      return;
    }

    if (this.game.santa.isActive()) {
      this.showNotification('SANTA is already active!', 'warning');
      return;
    }

    this.game.santa.spawn();
    this.showNotification('SANTA Activated', 'danger');
  }

  activateHoreg() {
    if (!this.game.horeg) {
      return;
    }

    if (this.game.horeg.isActive()) {
      this.showNotification('HOREG is already active!', 'warning');
      return;
    }

    this.game.horeg.spawn();
    this.showNotification('HOREG Activated', 'danger');
  }

  activateTornado() {
    if (!this.game.tornado) {
      return;
    }

    if (this.game.tornado.isActive()) {
      this.showNotification('TORNADO is already active!', 'warning');
      return;
    }

    this.game.tornado.spawn();
    this.showNotification('TORNADO Activated', 'danger');
  }

  activateUFOCheat() {
    if (!this.game.ufo) {
      return;
    }

    if (this.game.gameManager && this.game.gameManager.gameState === 'lost') {
      this.showNotification('UFO tidak bisa dipanggil malam hari', 'warning');
      return;
    }

    if (this.game.ufo.isActive()) {
      this.showNotification('UFO is already active!', 'warning');
      return;
    } else {
      this.game.ufo.activateUFO();
      this.showNotification('UFO Activated', 'danger');
    }
  }

  activateNight() {
    if (!this.game.gameManager) {
      return;
    }

    this.game.gameManager.activateNightCheat();
    this.showNotification('NIGHT Activated', 'danger');
  }

  activateRain() {
    if (!this.game.gameManager) {
      return;
    }

    this.game.gameManager.activateRainCheat();
    this.showNotification('RAIN Activated', 'danger');
  }

  activateClear() {
    if (!this.game.gameManager) {
      return;
    }

    this.game.gameManager.activateClearCheat();
    this.showNotification('CLEAR Activated', 'danger');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `cheat-notification ${type}`;
    notification.textContent = message;
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

    switch (type) {
      case 'danger':
        notification.style.background =
          'linear-gradient(135deg, #ff0000, #cc0000)';
        notification.style.color = 'white';
        break;
      case 'warning':
        notification.style.background =
          'linear-gradient(135deg, #ffaa00, #ff8800)';
        notification.style.color = 'white';
        break;
      case 'info':
        notification.style.background =
          'linear-gradient(135deg, #00aaff, #0088cc)';
        notification.style.color = 'white';
        break;
      default:
        notification.style.background = 'linear-gradient(135deg, #666, #444)';
        notification.style.color = 'white';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease-in';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  showCheatHint() {
    const hasSeenHint = localStorage.getItem('cheatHintSeen');

    if (!hasSeenHint) {
      this.cheatHintTimeout = setTimeout(() => {
        this.showNotification('💡 Tip: Try typing secret codes...', 'danger');
        localStorage.setItem('cheatHintSeen', 'true');
      }, 5000);
    }
  }

  destroy() {
    window.removeEventListener('keypress', this.boundKeyPress);

    if (this.bufferTimeout) {
      clearTimeout(this.bufferTimeout);
    }
    if (this.cheatHintTimeout) {
      clearTimeout(this.cheatHintTimeout);
    }
  }
}

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
