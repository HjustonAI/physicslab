# How It Was Built: Phase 2 The Simulation Engine

This document explains the core mechanics behind the physics engine and the visual container.

## 1. The Game Loop (`useGameLoop`)

In standard web development, things happen when events occur (clicks, data loads). In a physics simulation, things happen **every frame**. We need a loop that runs 60 (or more) times per second.

### Why `requestAnimationFrame`?
We don't use `setInterval` because it's imprecise and doesn't sync with the monitor's refresh rate. `requestAnimationFrame` tells the browser "I want to paint something new," ensuring smooth motion and pausing when the tab is inactive (saving battery).

### The `deltaTime` Concept
Physics equations usually look like `position = position + velocity * time`.
If we just did `x += 5` every frame, the object would move faster on a 144Hz monitor than on a 60Hz monitor.
To fix this, we calculate `deltaTime` (the time passed since the last frame) and use it in our math:
`x += velocity * deltaTime`
This ensures the object moves at the same speed in "real world" units regardless of frame rate.

```typescript
// src/hooks/useGameLoop.ts
const animate = (time: number) => {
  const deltaTime = time - previousTimeRef.current;
  callback(deltaTime); // Run physics with exact time difference
  requestAnimationFrame(animate); // Schedule next frame
};
```

## 2. The Simulation Canvas

We use the HTML5 `<canvas>` API for high-performance 2D rendering.

### Responsive Resizing
Canvas elements have two sizes:
1.  **CSS Size**: How big it looks on screen.
2.  **Internal Resolution (`width` / `height` attributes)**: How many pixels it actually has.

If these don't match, the image looks blurry. Our `SimulationCanvas` component listens for window resize events and updates the internal resolution to match the CSS size, ensuring crisp rendering on any screen.

## 3. The Vacuum Chamber Visuals

The "Vacuum Chamber" component is purely visual but crucial for the vibe. We used advanced CSS gradients to create the textures without needing heavy image files.

### Theory Mode (Blueprint)
We used `linear-gradient` to create a grid pattern.
```css
background-image: 
  linear-gradient(var(--border-color) 1px, transparent 1px),
  linear-gradient(90deg, var(--border-color) 1px, transparent 1px);
```

### Experiment Mode (Industrial)
We used a `radial-gradient` for the dark lighting and a `repeating-linear-gradient` for the "hazard glass" texture.
```css
background: radial-gradient(circle at center, #1a1a1a 0%, #000000 100%);
/* The subtle diagonal lines */
background: repeating-linear-gradient(45deg, ...);
```

## 4. React Integration
The `VacuumChamber` component holds the **State** (ball position, physics mode). It passes a `draw` function down to the `SimulationCanvas`. This keeps the rendering logic close to the state logic, making it easy to manage.
