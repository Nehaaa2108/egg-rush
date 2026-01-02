# Egg Rush – Adaptive Difficulty Game

Egg Rush is a browser-based arcade game where players catch falling eggs using a basket.
What makes this game unique is its **AI-inspired adaptive difficulty system** that adjusts gameplay in real time based on player performance.

---

##  Gameplay Overview

- Chickens drop eggs from above
- Move the basket to catch eggs
- Different egg types:
  - Normal Egg → +1 point
  - Golden Egg → +5 points
  - Rotten Egg → −2 points
- Missing normal eggs reduces lives (Classic mode)

---

## Adaptive Difficulty (Game AI Feature)

This game includes a **dynamic difficulty adjustment system** inspired by game AI principles.

The game continuously tracks:
- Eggs caught
- Eggs missed
- Accuracy
- Current streak

Based on player performance:
- High accuracy → egg spawn speed increases (harder)
- Low accuracy → difficulty eases to help recovery
- Emergency easing prevents unfair difficulty spikes

This creates a **personalized experience for every playthrough**.

> No machine learning model is used — instead, real-time player behavior analytics and rule-based adaptive logic are applied (a common approach in commercial games).

---

##  Game Modes

### Classic Mode
- Limited lives
- Game ends when lives reach zero
- Adaptive difficulty + survival challenge

### Timer Mode
- 60-second gameplay
- No lives lost
- Score as high as possible before time runs out
- Adaptive difficulty adjusts within the time window

---

## Controls

- Mouse movement – move the basket
- Keyboard (optional) – Arrow keys or A/D

> ⚠️ This game is optimized for desktop browsers. Mobile support is limited.

---

## Tech Stack

- **HTML5 Canvas** – rendering game graphics
- **CSS3** – UI styling
- **Vanilla JavaScript** – game logic, collision handling, adaptive difficulty
- **Browser Audio API** – sound effects & background music
- **Git & GitHub** – version control

---

## How to Run Locally

To ensure sound effects and background music work correctly, the game should be run using a local server (due to browser autoplay restrictions).

### Using Python
```bash
python -m http.server
