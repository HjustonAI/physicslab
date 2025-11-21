# How It Was Built: Phase 6 Data Visualization

This document explains how we built the real-time `Oscilloscope` component to visualize physics data.

## 1. Canvas-Based Graphing

We chose to use the HTML5 Canvas API for the oscilloscope instead of a charting library (like Chart.js or Recharts) for two reasons:
1.  **Performance**: We need to update the graph 60 times per second (60 FPS) to match the physics loop. Canvas is extremely fast for this.
2.  **Aesthetics**: We wanted a very specific "retro sci-fi" look (glowing lines, scan effects) that is hard to customize in standard libraries.

### The Rendering Logic
The `Oscilloscope` component takes an array of numbers (`data`) and renders them as a line.

1.  **Normalization**:
    To draw the data on the canvas, we first normalize the values to a 0-1 range:
    ```typescript
    const normalized = (val - min) / (max - min);
    ```
    Then we map this to the canvas height. Note that Canvas Y coordinates start at 0 at the *top*, so we have to invert it:
    ```typescript
    const y = height - (normalized * height);
    ```

2.  **Drawing the Line**:
    We iterate through the data array, calculating the X position based on the index:
    ```typescript
    const stepX = width / (data.length - 1);
    const x = i * stepX;
    ```
    We use `ctx.lineTo(x, y)` to connect the points.

## 2. The "Hextech" Visuals

The visual style changes completely based on the `data-theme` attribute.

### Theory Mode (The Chart)
*   **Concept**: A physical paper chart recording data with ink.
*   **Implementation**:
    *   Background: Dark Navy (Blueprint style).
    *   Grid: Fine, faint lines (`rgba(200, 170, 110, 0.2)`).
    *   Line: Solid Gold (`#c8aa6e`).
    *   No glow effects.

### Experiment Mode (The Oscilloscope)
*   **Concept**: A glowing CRT screen in a Zaun lab.
*   **Implementation**:
    *   Background: Black.
    *   Grid: Faint green.
    *   Line: Neon Green (`#39ff14`).
    *   **Bloom**: We use `ctx.shadowBlur = 5` and `ctx.shadowColor` to make the line appear to glow.
    *   **Scanline Dot**: We draw a bright white circle at the very last data point to simulate the electron beam's current position.

## 3. Integration with Physics

In `ProjectileModule.tsx`, we added state to hold the history of values:
```typescript
const [heightData, setHeightData] = useState<number[]>([]);
```

Inside the game loop (`update` function), we push the current physics values into these arrays:
```typescript
setHeightData(prev => {
    const newData = [...prev, currentHeight];
    if (newData.length > 100) newData.shift(); // Keep last 100 frames
    return newData;
});
```
This creates a "rolling window" of data that flows across the screen.
