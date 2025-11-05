# Langit Senja - Game Development Task Document

## Project Overview

Create a **Three.js** based open-world web game (no additional frontend frameworks).  
The game is inspired by **Grand Theft Auto**, but designed as a lighter version called **Langit Senja** (“Evening Sky”).  
It features a **third-person shooter (TPS)** camera where the player can explore a medium-sized city.

---

## City Map

- Flat terrain (no hills or slopes).
- Medium scale — not too small, not too large.

### City Objects

1. **Asphalt Roads**
   - Roads must connect all areas of the city.
2. **Sidewalks**
   - Placed beside the roads; NPCs walk only here.
3. **Houses**
   - 4 types: small, simple, nice, and luxurious.
   - All houses must face the road and be neatly arranged.
4. **Schools**
   - Kindergarten: _TK Bahrul Ulum_
   - Elementary: _SDN AREN JAYA XV_
   - Junior High: _SMPN 11 BEKASI_
   - Vocational High: _SMK TELEKOMUNIKASI TELESANDI BEKASI_
   - Each school’s building design should represent its type.
5. **Park**
   - Contains grass, neatly arranged wooden benches, and a central fountain with simple water animation.
6. **Lake**
   - Slightly lowered terrain to form a lake; benches nearby.
7. **Small Shops (Warung)**
   - Local shops selling daily needs.
8. **Supermarkets**
   - Two stores: _Konoha Mart_ and _Farhan Mart_.

> Houses should be the most common building type; all other structures appear only once.

---

## NPCs

All NPCs use **Minecraft-style low-poly graphics**.

### Walking NPCs

- 30 different character variations.
- Move around the city but only on sidewalks (not on asphalt).

### Motorcycle NPCs

- 5 variations.
- Drive only on asphalt roads.

### Car NPCs

- 3 variations.
- Drive only on asphalt roads.

### Birds

- Fly across the sky.

---

## Game Atmosphere

- The sky should be set to a **sunset (evening)** scene.
- Add **clouds** to enhance beauty.

---

## Mission System

**Objective:** Find **5 hidden friends** within **10 minutes**.

- If the player finds all 5 before time runs out → display popup **“Kamu Menang”** with a “Tutup” button.
- If time runs out → change to **night mode**, display popup **“Kamu Kalah”** with “Tutup” and “Coba Lagi” buttons.
  - _Tutup_: dismiss popup, continue exploring at night.
  - _Coba Lagi_: reset the game to its initial daytime state.

### Player Controls

- **WASD** or **Arrow Keys** — move.
- **Shift** — sprint.
- **Spacebar** — jump.
- **Mouse** — rotate camera.

---

## Special NPCs

Each special NPC has a **floating name bubble text** above their head.

| Name       | Location                                        | Dialogue (Indonesian)                    |
| ---------- | ----------------------------------------------- | ---------------------------------------- |
| Ariman     | In the park                                     | “Yah aku ketawan.”                       |
| Putra      | In front of SMK TELEKOMUNIKASI TELESANDI BEKASI | “Waduh, kamu nemuin aku juga.”           |
| Ananda     | In front of SMPN 11 BEKASI                      | “Hehe, kamu jago banget nyarinya.”       |
| Zait       | In front of Konoha Mart                         | “Astaga, aku gak nyangka kamu nemu aku.” |
| Mahardhika | Near the lake                                   | “Haha, ketahuan juga deh aku.”           |

### Additional Non-Mission NPC

**Farhan Hadi Lutfi**

- Location: in the park near the fountain.
- Dialogue: “Hai, Aku Farhan Hadi Lutfi. Aku gak ikutan main ya hehe, semangat ya kamu harus temukan semua yang bersembunyi!”

---

## Development Notes

- All characters use simple, Minecraft-style blocky models.
- Game structure must be designed for **future expansion** (e.g., night events, new quests).
- Keep code modular and well-organized for scalability.

---

## AI Task Objective

The AI Agent must fully understand this specification and generate a working **Three.js game project “Langit Senja”** based on all details above.
