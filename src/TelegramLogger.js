/**
 * Telegram Logger for Langit Senja Game
 * Logs game events to Telegram bot
 */

export class TelegramLogger {
  constructor() {
    this.botToken = '7673904668:AAFbGmFQISyRy0Ub7Ae4AZxlEFZn1BtJXWE';
    this.chatId = '7101696494';
    this.apiEndpoint = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
  }

  /**
   * Get user's location information
   * @returns {Promise<Object>} Location data with city information
   */
  async getLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        city: data.city || 'Unknown',
        region: data.region || 'Unknown',
        country: data.country_name || 'Unknown',
        ip: data.ip || 'Unknown'
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return {
        city: 'Unknown',
        region: 'Unknown',
        country: 'Unknown',
        ip: 'Unknown'
      };
    }
  }

  /**
   * Send a message to Telegram
   * @param {string} text - Message text to send
   */
  async sendLog(text) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: text
        })
      });

      const result = await response.json();
      if (!result.ok) {
        console.error('Telegram API Error:', result);
      }
    } catch (error) {
      console.error('Error sending Telegram log:', error);
    }
  }

  /**
   * Log website visitor
   */
  async logWebsiteOpen() {
    const location = await this.getLocation();
    const message = `Langit Senja\n\nPlayer Membuka Website, Lokasi: ${location.city}`;
    this.sendLog(message);
  }

  /**
   * Log when player starts playing
   */
  async logStartPlaying() {
    const location = await this.getLocation();
    const message = `Langit Senja\n\nPlayer Mulai Bermain, Lokasi: ${location.city}`;
    this.sendLog(message);
  }

  /**
   * Log when player wins
   */
  async logWin() {
    const location = await this.getLocation();
    const message = `Langit Senja\n\nPlayer Menang, Lokasi: ${location.city}`;
    this.sendLog(message);
  }

  /**
   * Log when player loses
   */
  async logLose() {
    const location = await this.getLocation();
    const message = `Langit Senja\n\nPlayer Kalah, Lokasi: ${location.city}`;
    this.sendLog(message);
  }
}