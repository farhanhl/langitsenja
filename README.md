# Langit Senja (Evening Sky)

A Three.js-based open-world web game inspired by Grand Theft Auto, featuring a medium-sized city exploration experience with a mission-based gameplay.

## Game Overview

**Langit Senja** is a lightweight third-person shooter (TPS) style game where players explore a vibrant city during sunset. The main objective is to find 5 hidden friends within 10 minutes while exploring the beautifully crafted blocky city.

## Features

### City Environment
- **Flat terrain** with organized city layout
- **Road network** connecting all areas
- **Sidewalks** for pedestrian NPCs
- **Various buildings:**
  - 40+ houses (4 types: small, simple, nice, luxurious)
  - 4 schools with unique designs
  - Park with fountain and benches
  - Lake with scenic surroundings
  - Supermarkets and local shops

### NPCs
- **30 walking NPCs** - Different colored characters walking on sidewalks
- **5 motorcycles** - Driving on roads
- **3 cars** - Different colors, driving on roads
- **10 birds** - Flying across the sky
- **5 mission NPCs** - Special characters to find
- **1 helper NPC** - Farhan Hadi Lutfi (non-mission character)

All characters use Minecraft-style low-poly graphics for consistent visual style.

### Game Mechanics

#### Controls
- **WASD** or **Arrow Keys** - Move player
- **Shift** - Sprint
- **Spacebar** - Jump
- **Mouse** - Rotate camera (click to lock pointer)

#### Mission System
- **Objective:** Find 5 hidden friends within 10 minutes
- **Win condition:** Find all 5 friends before time runs out
- **Lose condition:** Time expires before finding all friends

#### Special NPCs to Find

| Name      | Location                      | Dialogue                                 |
| --------- | ----------------------------- | ---------------------------------------- |
| Ariman    | Park                          | "Yah aku ketawan."                       |
| Putra     | SMK TELESANDI                 | "Waduh, kamu nemuin aku juga."           |
| Ananda    | SMPN 11 BEKASI                | "Hehe, kamu jago banget nyarinya."       |
| Zait      | Konoha Mart                   | "Astaga, aku gak nyangka kamu nemu aku." |
| Mahardika | Lake                          | "Haha, ketahuan juga deh aku."           |

### Atmosphere
- **Sunset sky** with gradient colors
- **Animated clouds** drifting across the sky
- **Day/night transition** when losing (night mode)
- **Dynamic lighting** with shadows

## How to Play

1. **Open `index.html`** in a modern web browser (Chrome, Firefox, Edge recommended)
2. **Click on the screen** to lock the mouse pointer for camera control
3. **Explore the city** using WASD or Arrow keys
4. **Find the 5 special NPCs** marked with floating name tags
5. **Get close to them** to trigger dialogue and mark them as found
6. **Complete the mission** before the 10-minute timer runs out!

### Win/Lose Conditions

**Win:**
- Find all 5 friends within 10 minutes
- Popup appears: "Kamu Menang! 🎉"
- Click "Tutup" to close and continue exploring

**Lose:**
- Time runs out before finding all friends
- Sky transitions to night mode
- Popup appears: "Kamu Kalah 😢"
- Options:
  - "Tutup" - Close popup and explore at night
  - "Coba Lagi" - Restart the game

## Technical Details

### Technologies Used
- **Three.js r160** - 3D graphics library
- **Vanilla JavaScript** (ES6 modules)
- **HTML5 Canvas**
- **WebGL**

### Project Structure
```
/
├── index.html           # Main HTML entry point
├── src/
│   ├── main.js          # Game initialization and loop
│   ├── Player.js        # Player character and controls
│   ├── CityBuilder.js   # City generation and buildings
│   ├── NPCManager.js    # NPC creation and management
│   ├── SkySystem.js     # Sky, clouds, and day/night cycle
│   └── GameManager.js   # Mission system and game logic
└── README.md           # This file
```

### Key Classes

- **LangitSenja** - Main game class, handles scene and rendering
- **Player** - Player character with third-person camera
- **CityBuilder** - Generates city layout, buildings, roads
- **NPCManager** - Manages all NPCs (walking, vehicles, birds, special)
- **SkySystem** - Handles sky, clouds, and lighting transitions
- **GameManager** - Manages mission objectives, timer, win/lose states

## Development Features

- **Modular code structure** for easy expansion
- **Collision detection** for buildings and terrain
- **Pathfinding system** for NPCs (sidewalks and roads)
- **Dynamic UI** showing timer and progress
- **Shader-based sky** for smooth gradients
- **Future-ready** architecture for additional features

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ⚠️ Requires WebGL support

## Performance Tips

- Close other browser tabs for better performance
- Game runs best on modern GPUs
- If experiencing lag, try reducing browser window size

## Credits

**Game Design:** Based on task.md specifications
**Development:** AI-generated Three.js implementation
**Art Style:** Minecraft-inspired low-poly graphics
**Location Names:** Real schools and places from Bekasi, Indonesia

## Future Expansion Ideas

- Additional missions and quests
- More interactive buildings (enter shops, schools)
- Vehicle riding mechanics
- Day/night cycle with time-based events
- Save/load game progress
- Sound effects and background music
- Minimap for navigation
- Additional NPCs and dialogue trees

---

**Enjoy exploring Langit Senja! 🌆**
