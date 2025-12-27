# 🥚 Egg Rush – Adaptive Difficulty Game

Egg Rush is a browser-based arcade game where players catch falling eggs using a basket.
What makes this game unique is its **AI-powered adaptive difficulty system** that adjusts gameplay in real time based on player performance.

---

## 🎮 Gameplay Overview

- Chickens drop eggs from above
- Move the basket to catch eggs
- Different egg types:
  - 🥚 Normal Egg → +1 point
  - 🌟 Golden Egg → +5 points
  - 💀 Rotten Egg → −2 points
- Missing normal eggs reduces lives (Classic mode)

---

## 🧠 Adaptive Difficulty (AI Feature)

This game includes a **dynamic difficulty adjustment system** inspired by game AI principles.

The game continuously tracks:
- Eggs caught
- Eggs missed
- Accuracy
- Current streak

Based on player accuracy:
- If accuracy is **high**, egg spawn speed increases (harder)
- If accuracy drops, the game **eases difficulty faster** to help the player recover
- Emergency easing prevents unfair difficulty spikes

This creates a **personalized experience for every player**.

> No machine learning model is used — instead, real-time player behavior analytics and adaptive logic are applied (commonly used in commercial games).

---

## 🕹️ Game Modes

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

## 🛠️ Tech Stack

- **HTML5 Canvas** – rendering game graphics
- **CSS3** – UI styling
- **Vanilla JavaScript** – game logic, physics, AI adaptivity
- **Browser Audio API** – sound effects & background music
- **Git & GitHub** – version control

---

## 🚀 How to Run Locally

Because browsers restrict audio autoplay, this game must be run using a local server.

### Option 1: Python (recommended)
```bash
python -m http.server
