"use client";

import { useState, useCallback, useRef } from "react";
import styles from "./ProjectileModule.module.css";
import SimulationCanvas from "../simulation/SimulationCanvas";
import { useGameLoop } from "@/hooks/useGameLoop";

interface ProjectileState {
    x: number;
    y: number;
    vx: number;
    vy: number;
    isFlying: boolean;
    path: { x: number; y: number }[];
}

export default function ProjectileModule() {
    // Physics Parameters
    const [velocity, setVelocity] = useState(50); // m/s (pixels/s for now)
    const [angle, setAngle] = useState(45); // degrees
    const [gravity, setGravity] = useState(9.8); // m/s^2

    // Simulation State
    const startPos = { x: 100, y: window.innerHeight - 150 }; // Initial position
    const [simState, setSimState] = useState<ProjectileState>({
        x: startPos.x,
        y: startPos.y,
        vx: 0,
        vy: 0,
        isFlying: false,
        path: [],
    });

    const stateRef = useRef(simState);
    stateRef.current = simState;

    // Physics Update Loop
    const update = useCallback((deltaTime: number) => {
        if (!stateRef.current.isFlying) return;

        setSimState((prev) => {
            const dt = deltaTime / 100; // Time scaling
            let { x, y, vx, vy, path } = prev;

            // Apply Gravity
            vy += gravity * dt;

            // Update Position
            x += vx * dt;
            y += vy * dt;

            // Ground Collision (Simple floor at startPos.y)
            if (y > startPos.y) {
                y = startPos.y;
                return { ...prev, x, y, isFlying: false, path: [...path, { x, y }] };
            }

            // Record path every few frames or distance (optimization)
            // For now, just push every frame is fine for short flights
            return { ...prev, x, y, vx, vy, path: [...path, { x, y }] };
        });
    }, [gravity, startPos.y]);

    useGameLoop(update);

    // Controls
    const fire = () => {
        const rad = (angle * Math.PI) / 180;
        const vx = velocity * Math.cos(rad);
        const vy = -velocity * Math.sin(rad); // Negative because Y is down in canvas

        setSimState({
            x: startPos.x,
            y: startPos.y,
            vx,
            vy,
            isFlying: true,
            path: [{ x: startPos.x, y: startPos.y }],
        });
    };

    const reset = () => {
        setSimState({
            x: startPos.x,
            y: startPos.y,
            vx: 0,
            vy: 0,
            isFlying: false,
            path: [],
        });
    };

    // Rendering
    const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const theme = document.documentElement.getAttribute("data-theme") || "theory";
        const isTheory = theme === "theory";
        const color = isTheory ? "#c8aa6e" : "#39ff14";

        ctx.clearRect(0, 0, width, height);

        // 1. Draw Cannon (Visual only)
        ctx.save();
        ctx.translate(startPos.x, startPos.y);
        ctx.rotate(-(angle * Math.PI) / 180);
        ctx.fillStyle = color;
        ctx.fillRect(0, -5, 40, 10); // Simple barrel
        ctx.restore();

        // 2. Draw Trajectory Path
        if (simState.path.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.setLineDash(isTheory ? [5, 5] : []); // Dashed for theory
            ctx.moveTo(simState.path[0].x, simState.path[0].y);
            for (const p of simState.path) {
                ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // 3. Draw Projectile
        ctx.beginPath();
        ctx.arc(simState.x, simState.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = color;

        if (!isTheory) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
        }

        ctx.fill();
        ctx.shadowBlur = 0;

        // 4. Draw Predicted Path (Ghost line) - Optional, maybe for next step

    }, [simState, angle, startPos]);

    return (
        <div className={styles.container}>
            <SimulationCanvas draw={draw} />

            <div className={styles.controls}>
                <div className={styles.controlGroup}>
                    <label className={styles.label}>Velocity</label>
                    <input
                        type="range"
                        min="10" max="150"
                        value={velocity}
                        onChange={(e) => setVelocity(Number(e.target.value))}
                        className={styles.input}
                    />
                    <span className={styles.value}>{velocity} m/s</span>
                </div>

                <div className={styles.controlGroup}>
                    <label className={styles.label}>Angle</label>
                    <input
                        type="range"
                        min="0" max="90"
                        value={angle}
                        onChange={(e) => setAngle(Number(e.target.value))}
                        className={styles.input}
                    />
                    <span className={styles.value}>{angle}°</span>
                </div>

                <div className={styles.controlGroup}>
                    <label className={styles.label}>Gravity</label>
                    <input
                        type="range"
                        min="1" max="20"
                        value={gravity}
                        onChange={(e) => setGravity(Number(e.target.value))}
                        className={styles.input}
                    />
                    <span className={styles.value}>{gravity} m/s²</span>
                </div>

                <button onClick={fire} className={styles.button}>Fire</button>
                <button onClick={reset} className={styles.button}>Reset</button>
            </div>
        </div>
    );
}
