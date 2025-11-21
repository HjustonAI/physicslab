# How It Was Built: Phase 4 Optics Module

This document explains the implementation of the Ray Tracing engine for the Optics module.

## 1. The Core Concept: Ray Casting

Unlike the Kinematics module which uses *integration* (moving over time), the Optics module uses *geometric calculation* (instantaneous paths).

We define a **Ray** as a starting point $(x, y)$ and an angle $\theta$.
We define a **Mirror** as a line segment from $(x_1, y_1)$ to $(x_2, y_2)$.

### The Algorithm
1.  **Cast a Ray**: Calculate a "far point" in the direction of the ray (e.g., 2000 pixels away).
2.  **Find Intersections**: Check if this line segment intersects with any Mirror line segment.
    *   We use the standard **Line-Line Intersection Formula** (based on determinants).
3.  **Find Closest Hit**: If the ray hits multiple mirrors, we only care about the *closest* one. We calculate the distance to each intersection and pick the minimum.
4.  **Reflect**: If we hit a mirror, we calculate the new ray.
    *   **Normal Vector**: The vector perpendicular to the mirror surface.
    *   **Reflection Formula**: The angle of reflection is calculated relative to the normal.
    *   $\theta_{new} = 2 \times \theta_{normal} - \theta_{incidence} - \pi$
5.  **Recurse**: The reflected ray becomes the new starting ray. We repeat the process (up to a max depth, e.g., 10 bounces) to prevent infinite loops.

## 2. Rendering the Laser

To make the laser look like light, we use **Additive Blending** in the Canvas API.
```typescript
ctx.globalCompositeOperation = "screen"; // or "lighter"
ctx.shadowBlur = 10;
ctx.shadowColor = laser.color;
```
This makes overlapping beams get brighter, simulating real light physics.

## 3. The Module Switcher

We added a simple state `activeModule` in `page.tsx` to toggle between the two modules.
```typescript
{activeModule === "kinematics" ? <ProjectileModule /> : <OpticsModule />}
```
This demonstrates the power of our modular architecture—the `VacuumChamber` container remains constant while the content inside changes completely.
