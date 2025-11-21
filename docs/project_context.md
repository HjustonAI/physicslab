# Project Context: Arcane Physics Lab

## 1. Vision & Philosophy
**Goal**: Create the best physics learning website by focusing on "Learning by Doing".
**Core Concept**: "The Artificer's Lab". A scientific, interactive playground where users experiment with physics concepts using high-fidelity tools.
**Visual Style**: "Scientific Hextech" (inspired by *Arcane*).
-   **Theory Mode (Piltover)**: Da Vinci-style blueprints, fine gold grids, brass instruments, elegant serif typography.
-   **Experiment Mode (Zaun)**: Industrial vacuum chambers, holographic data overlays, neon green/purple energy, raw oscilloscope traces.

## 2. Technology Stack
-   **Framework**: Next.js (App Router)
-   **Styling**: Vanilla CSS with CSS Variables (for performance and complex theming).
-   **Simulation**: HTML5 Canvas API (custom physics loop).
-   **State Management**: React Context (for Theme switching and Simulation state).

## 3. Architecture: Modular Monolith
The project is structured to be modular from the start to allow for future separation if needed.
-   `app/`: Next.js App Router pages.
-   `modules/`: Self-contained physics modules (e.g., `kinematics`, `optics`).
-   `components/ui/`: Reusable "Hextech" UI components (Buttons, Sliders, Panels).
-   `components/simulation/`: The core physics engine and canvas wrappers.
-   `lib/`: Physics math utilities and constants.

## 4. Design System: "Scientific Hextech"
### The Duality
The site features a toggle (or split-screen) between two modes:
1.  **Theory (Blueprint Mode)**:
    -   Background: Deep Navy Blue (`#1a1e2e`).
    -   Accents: Brass/Gold (`#c8aa6e`), Chalkboard White.
    -   Vibe: Precision, Academic, "The Architect".
2.  **Experiment (Hologram Mode)**:
    -   Background: Dark Iron/Industrial.
    -   Accents: Radium Green (`#39ff14`), Neon Purple (`#2d1b4e`).
    -   Vibe: Chaos, Energy, "The Inventor".

### Key UI Elements
-   **Instrument Panel**: Controls look like physical scientific instruments (screws, metal textures, analog gauges).
-   **Heads-Up Display (HUD)**: Real-time physics data (velocity vectors, acceleration graphs) projected as holograms over the simulation.

## 5. Roadmap
### Phase 1: Foundation
-   [ ] Initialize Next.js project.
-   [ ] Configure CSS Variables for the dual theme.
-   [ ] Build the "Instrument Panel" layout shell.

### Phase 2: The Simulation Engine
-   [ ] Create `SimulationCanvas` component.
-   [ ] Implement the game loop (requestAnimationFrame).
-   [ ] Build the "Vacuum Chamber" visual container.

### Phase 3: First Module (Kinematics)
-   [ ] Implement Projectile Motion logic.
-   [ ] Add interactive sliders for Gravity, Velocity, Angle.
-   [ ] Visualize data with holographic vectors.

## 6. Current Status
-   **Planning**: Complete.
-   **Design**: Concept approved ("Scientific Hextech").
-   **Next Step**: Initialize codebase and build the foundation.
