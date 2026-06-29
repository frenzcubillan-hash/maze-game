Access here:

https://maze-game-biab.vercel.app/


# 🌫️ Fog of War Maze Game

I made this because I wanted to build a maze system that feels alive, unfair, and slightly confusing in a good way.

A procedural **fog-of-war maze game** built with Next.js and Canvas where the player explores a dynamically generated maze, collects a key, and must find the real exit hidden. Only nearby tiles are visible, forcing exploration and memory-based navigation.

---

## 📌 Technologies Used

### Languages
- TypeScript / JavaScript
- HTML
- CSS

### Frameworks & Libraries
- Next.js
- React
- Canvas API

### Tools & Platforms
- VS Code
- Git
- GitHub
- VercelApp

---

## ✨ Features

### 🌫️ Fog of War Vision System
- Only nearby maze areas are visible
- BFS-based light propagation system
- Darkness hides unexplored paths completely

### 🧩 Procedural Maze Generation
- Recursive backtracking algorithm
- Extra random loops for complexity
- Long corridor generation system
- Dead-end detection logic

### 🚪 Fake Exit System
- Multiple exit points generated per maze
- Only ONE real exit is valid
- Fake exits act as visual traps and complexity anchors
- Real exit is randomly selected each run

### 🔑 Key-Based Progression
- Key must be collected before exiting
- Key spawns in valid maze locations
- Prevents direct early exit rushing

### 🎮 Gameplay Mechanics
- Collision detection with maze walls
- Camera smoothing system
- Win condition only triggers after correct exit + key

### 🖼️ Canvas Rendering Engine
- Custom 2D rendering system
- Dynamic lighting intensity effects
- Wall rendering with stroke-based geometry
- Real-time camera translation

### 📱 UI System
- Minimal interface (New Maze, Key status, exit count)
- Win overlay screen
- Responsive centered layout

---

## 🧠 Project Highlights

### 🧠 Learned Procedural Generation
Built a fully dynamic maze system using recursive backtracking combined with extra randomization layers to increase complexity and reduce predictability.

### 🌫️ Learned Fog of War Rendering
Implemented a BFS-based visibility system that simulates limited player vision instead of full map rendering.

### 🎮 Learned Game Loop Architecture
Built a smooth animation loop using requestAnimationFrame with interpolation for player movement and camera motion.

### 🧩 Learned Game Design Logic
Designed a system with:
- Resource gating (key system)
- Exploration-based progression

### ⚡ Learned Canvas Optimization
Efficient rendering of a full grid-based world using minimal redraw logic and visibility-based skipping.

---

## 🚀 Deployment

This project is deployed using:

- Static export from Next.js
- GitHub Pages hosting

To deploy locally:

```bash
npm run build