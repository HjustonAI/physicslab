# How It Was Built: Phase 3 Kinematics Module

This document explains how we built the interactive Projectile Motion module.

## 1. Component Architecture

We moved from a monolithic "Vacuum Chamber" to a composable architecture.
*   **`VacuumChamber`**: Now acts as a *Layout Container*. It handles the background visuals (Grid vs. Industrial) but doesn't know about the physics inside.
*   **`ProjectileModule`**: Contains the specific physics logic and UI. It renders *inside* the Vacuum Chamber.

This allows us to easily swap in new modules (like Optics or Electromagnetism) without rewriting the container code.

## 2. The Physics Logic

We use a simple **Euler Integration** method for the physics.
State variables:
*   `x`, `y`: Position
*   `vx`, `vy`: Velocity components

Every frame (approx. 16ms), we update:
1.  **Gravity**: `vy += gravity * deltaTime` (Velocity increases downwards)
2.  **Position**: `x += vx * deltaTime`, `y += vy * deltaTime`

### The "Fire" Calculation
When the user clicks Fire, we convert the Angle (degrees) and Velocity (magnitude) into X and Y components using Trigonometry:
```typescript
const rad = (angle * Math.PI) / 180;
const vx = velocity * Math.cos(rad);
const vy = -velocity * Math.sin(rad); // Negative Y is "up" in Canvas
```

## 3. React State vs. Refs

We used a trick here.
*   **React State (`useState`)**: Good for UI (sliders, buttons) that need to re-render the DOM.
*   **Refs (`useRef`)**: Good for the *Animation Loop*.
    *   Why? If we used `useState` inside the `requestAnimationFrame` loop, it would trigger React re-renders 60 times a second, which is slow.
    *   Instead, we keep the physics state in a `useRef` (or just mutate a local object if we don't need React to know) for the high-speed loop, and only trigger React updates when necessary (like when a slider moves).
    *   *Correction*: In our current implementation, we *are* using `setSimState` inside the loop. React is fast enough for this simple demo, but for complex games, we would switch to a Ref-based approach entirely and only sync to React for the UI.

## 4. Visualizing the Trajectory

We draw the path by storing a history of points (`path: {x, y}[]`).
*   **Theory Mode**: We use `ctx.setLineDash([5, 5])` to create that "blueprint" dashed line look.
*   **Experiment Mode**: We add a `shadowBlur` (glow) to the projectile to make it look like a plasma ball.
