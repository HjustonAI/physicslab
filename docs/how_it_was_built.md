# How It Was Built: Phase 1 Foundation

This document explains the technical decisions and implementation details behind the initial setup of the Arcane Physics Lab.

## 1. The "Dual Theme" System (CSS Variables)

The core visual requirement was a switch between "Theory" (Piltover) and "Experiment" (Zaun) modes. Instead of using a heavy CSS-in-JS library, we used **CSS Variables (Custom Properties)** for performance and simplicity.

### How it works:
1.  **Definition**: In `src/app/globals.css`, we defined two sets of variables.
    *   The `:root` selector holds the default (Theory) values.
    *   The `[data-theme="experiment"]` selector overrides these values when that attribute is present.

```css
:root {
  --bg-primary: #1a1e2e; /* Navy Blue */
  --text-primary: #c8aa6e; /* Gold */
}

[data-theme="experiment"] {
  --bg-primary: #0a0a0a; /* Dark Iron */
  --text-primary: #39ff14; /* Neon Green */
}
```

2.  **Usage**: We use these variables in our CSS instead of hardcoded colors.
    ```css
    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
    }
    ```

3.  **Switching**: The `InstrumentPanel` component toggles this state.
    ```tsx
    // src/components/ui/InstrumentPanel.tsx
    useEffect(() => {
      document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);
    ```
    When `theme` changes, React updates the `data-theme` attribute on the `<html>` tag, and the browser instantly repaints with the new colors.

## 2. Next.js App Router Structure

We used the modern **App Router** (`src/app/`) which allows for:
*   **Layouts (`layout.tsx`)**: Wraps all pages. We put the `InstrumentPanel` here so it persists across all page navigations.
*   **Fonts**: We used `next/font/google` to load "Cinzel" (for that elegant Piltover look) and "Roboto Mono" (for the scientific data look) without layout shift.

## 3. The Instrument Panel Overlay

The `InstrumentPanel` is designed as a "heads-up display" (HUD) that sits *on top* of everything.

*   **`pointer-events: none`**: This is a crucial CSS property. It allows clicks to pass *through* the transparent parts of the panel so you can interact with the simulation underneath, while keeping the buttons (`pointer-events: auto`) clickable.
*   **`position: fixed`**: Keeps the panel locked to the screen even if the content scrolls.

## 4. Git & Deployment

We initialized a Git repository to track changes. This allows us to "save points" (commits) and push our code to remote servers (like GitHub) for backup and collaboration.
