# How It Was Built: Phase 7 Project Refinement

This document explains the "invisible" but crucial work done to polish the application: Responsiveness and Accessibility.

## 1. Responsive Canvas Simulation

### The Problem
HTML5 Canvas doesn't automatically handle window resizing. If you draw a projectile at `y = 500` and then resize the window to be 400px tall, the projectile disappears off-screen.
Also, in our `ProjectileModule`, the "ground" was hardcoded to `window.innerHeight - 150` *only once* when the component mounted.

### The Solution
We implemented a dynamic coordinate system that listens to the window resize event.

1.  **State for Dimensions**: We moved `startPos` into React state.
    ```typescript
    const [startPos, setStartPos] = useState({ x: 100, y: 0 });
    ```

2.  **Resize Listener**:
    ```typescript
    useEffect(() => {
        const handleResize = () => {
            // Recalculate ground position based on new window height
            setStartPos({ x: 100, y: window.innerHeight - 150 });
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    ```

3.  **Effect Dependency**: Crucially, we added an effect to update the simulation state when `startPos` changes, ensuring the "cannon" moves with the window.

## 2. Accessible Custom Sliders

### The Problem
Our `HexSlider` is a custom `<div>` component, not a native `<input type="range">`. This means:
*   It had no keyboard support (Arrow keys didn't work).
*   Screen readers didn't know it was a slider.

### The Solution
We manually implemented the standard ARIA Slider pattern.

1.  **Keyboard Support**: We added a `keydown` handler.
    ```typescript
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowRight") onChange(value + 1);
        if (e.key === "ArrowLeft") onChange(value - 1);
    };
    ```

2.  **Focusability**: We added `tabIndex={0}` to make the `div` focusable via the Tab key.

3.  **ARIA Attributes**: We added roles and properties so screen readers can announce the value.
    ```tsx
    <div 
        role="slider" 
        aria-valuenow={value} 
        aria-valuemin={min} 
        aria-valuemax={max} 
        aria-label={label}
    >
    ```

Now, a user can Tab to the slider and use Arrow keys to adjust the physics parameters, making the lab accessible to keyboard users.
