# 🎵 Audio Files - Langit Senja

## Required Audio Files

This directory should contain the following audio files for the game to work properly:

### 📻 Background Music

1. **day.mp3**
   - Background music during daytime
   - Should be loopable
   - Recommended: Upbeat, cheerful melody
   - Volume: 50% (adjustable)

2. **night.mp3**
   - Background music during nighttime
   - Should be loopable
   - Recommended: Calm, mysterious melody
   - Volume: 50% (adjustable)

### 🎵 Sound Effects

3. **cheat.mp3**
   - Plays when any cheat code is activated
   - Recommended: Power-up sound, achievement sound, or dramatic effect
   - Duration: 1-3 seconds
   - Volume: 70%
   - Triggered by: GODZILLA, TORNADO, UFO, NIGHT, RAIN, CLEAR cheat codes

4. **found.mp3**
   - Plays when player finds and interacts with a special NPC (friend)
   - Recommended: Success chime, happy notification, or discovery sound
   - Duration: 1-3 seconds
   - Volume: 80%
   - Triggered by: Finding any of the 5 mission NPCs

---

## File Format Recommendations

- **Format:** MP3 (most compatible)
- **Sample Rate:** 44.1kHz or 48kHz
- **Bit Rate:** 128-192 kbps (good quality, reasonable file size)
- **Mono/Stereo:** Stereo for music, Mono acceptable for short SFX

---

## Implementation Details

### CheatCodeManager.js
```javascript
this.cheatSound = new Audio('music/cheat.mp3');
this.cheatSound.volume = 0.7;
```

### GameManager.js
```javascript
this.dayMusic = new Audio('music/day.mp3');
this.dayMusic.loop = true;
this.dayMusic.volume = 0.5;

this.nightMusic = new Audio('music/night.mp3');
this.nightMusic.loop = true;
this.nightMusic.volume = 0.5;

this.foundSound = new Audio('music/found.mp3');
this.foundSound.volume = 0.8;
```

---

## Free Audio Resources (Recommendations)

### For Background Music:
- **Pixabay Music:** https://pixabay.com/music/
- **FreePD:** https://freepd.com/
- **Incompetech:** https://incompetech.com/music/
- **Bensound:** https://www.bensound.com/

### For Sound Effects:
- **Freesound:** https://freesound.org/
- **Zapsplat:** https://www.zapsplat.com/
- **Mixkit:** https://mixkit.co/free-sound-effects/

---

## Current Status

⚠️ **Note:** Audio files are not included in the repository.
You need to add your own audio files or use the recommended sources above.

---

## Testing Without Audio Files

The game will work without audio files, but you'll see console warnings:
- `Could not play cheat sound: ...`
- `Could not play found sound: ...`

All audio playback uses try-catch blocks, so missing files won't break the game.

---

## Mute Feature

Users can toggle audio on/off using the mute button in the bottom-right corner:
- 🔊 = Audio ON
- 🔇 = Audio OFF

The mute button controls:
- Background music (day.mp3 / night.mp3)
- Does NOT affect sound effects (cheat.mp3 / found.mp3)

If you want the mute button to also affect sound effects, you can modify the volume control in `main.js`.
