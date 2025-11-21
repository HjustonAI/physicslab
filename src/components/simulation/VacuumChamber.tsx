"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./VacuumChamber.module.css";
import SimulationCanvas from "./SimulationCanvas";
import { useGameLoop } from "@/hooks/useGameLoop";

export default function VacuumChamber() {
    const [mode, setMode] = useState<"theory" | "experiment">("theory");

    // Listen for theme changes from the global attribute
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
                    const theme = document.documentElement.getAttribute("data-theme");
                    setMode(theme as "theory" | "experiment" || "theory");
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        // Initial set
        const currentTheme = document.documentElement.getAttribute("data-theme");
        setMode(currentTheme as "theory" | "experiment" || "theory");

        return () => observer.disconnect();
    }, []);

    // Demo Physics State
    const [ball, setBall] = useState({ x: 100, y: 100, vx: 2, vy: 2, radius: 20 });

    // Physics Update
    const update = useCallback((deltaTime: number) => {
        setBall((prev) => {
            let { x, y, vx, vy, radius } = prev;

            // Simple Euler integration
            // deltaTime is in ms, so we scale it down
            const dt = deltaTime / 16;

            x += vx * dt;
            y += vy * dt;

            // Bounce off walls (assuming 1920x1080 for sim space, but we'll handle bounds in draw for now or just hardcode)
            // Actually, we need canvas dimensions for proper collision. 
            // For this demo, we'll just let it bounce in a fixed box or handle it in the draw/update loop if we had ref to dims.
            // Let's just make it bounce off arbitrary bounds for the demo visual
            if (x > window.innerWidth - radius || x < radius) vx *= -1;
            if (y > window.innerHeight - radius || y < radius) vy *= -1;

            return { x, y, vx, vy, radius };
        });
    }, []);

    useGameLoop(update);

    // Render
    const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.clearRect(0, 0, width, height);

        // Draw Ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);

        if (mode === "theory") {
            ctx.fillStyle = "#c8aa6e"; // Gold
            ctx.strokeStyle = "#c8aa6e";
            ctx.stroke();
            // Blueprint style: empty circle with crosshair
            ctx.beginPath();
            ctx.moveTo(ball.x - ball.radius, ball.y);
            ctx.lineTo(ball.x + ball.radius, ball.y);
            ctx.moveTo(ball.x, ball.y - ball.radius);
            ctx.lineTo(ball.x, ball.y + ball.radius);
            ctx.stroke();
        } else {
            ctx.fillStyle = "#39ff14"; // Neon Green
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#39ff14";
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }, [ball, mode]);

    return (
        <div className={styles.chamber} data-mode={mode}>
            <div className={styles.canvasContainer}>
                <SimulationCanvas draw={draw} />
            </div>
        </div>
    );
}
