# How It Was Built: Phase 5 Advanced Interactivity

This document explains how we added direct manipulation and custom UI components to the Physics Lab.

## 1. Drag & Drop on Canvas

Implementing Drag & Drop on an HTML5 Canvas is harder than with DOM elements because the canvas is just one single image to the browser. We have to handle the logic ourselves.

### The Algorithm
1.  **Hit Testing (`mousedown`)**:
    *   When the user clicks, we calculate the mouse position relative to the canvas.
    *   We loop through our list of objects (Mirrors) and check if the mouse is close to any of them.
    *   We check three points: Start Endpoint, End Endpoint, and Center.
    *   If a hit is found, we set the `dragging` state: `{ index: 0, type: "center", offsetX: ... }`.
    *   *Crucial*: We store the `offsetX` and `offsetY` so the object doesn't "snap" to the mouse center when dragging starts.

2.  **Moving (`mousemove`)**:
    *   If `dragging` is not null, we update the object's coordinates based on the new mouse position minus the offset.
    *   React's `setMirrors` triggers a re-render, calling `draw()` with the new positions.

3.  **Releasing (`mouseup`)**:
    *   We simply set `dragging` to `null`.

## 2. Custom "Hextech" UI Components

We replaced the standard `<input type="range">` with a custom `<HexSlider>` component to match our "Scientific Hextech" aesthetic.

### Theming with CSS Variables
The component uses the same `data-theme` attribute as the rest of the app, but we handle the styling deep inside the CSS Module.

*   **Theory Mode**:
    *   Background: `rgba(0, 0, 0, 0.3)` (Dark glass)
    *   Thumb: Brass/Gold border, transparent center.
    *   Fill: Solid Gold.
*   **Experiment Mode**:
    *   Background: Black.
    *   Thumb: Neon Green glow.
    *   Fill: Neon Green with `box-shadow` for bloom.

### React Logic
The slider is a `<div>` (track) with two children: a `<div>` for the fill and a `<div>` for the thumb.
We calculate the percentage based on `(value - min) / (max - min)`.
We listen for `mousedown` on the track, and then attach `mousemove` and `mouseup` listeners to the **window** (not the element). This ensures that if the user drags outside the slider while holding the mouse down, it still works (a common UI pitfall).
