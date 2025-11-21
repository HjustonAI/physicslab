"use client";

import { useState, useCallback, useRef } from "react";
import styles from "./ProjectileModule.module.css";
import SimulationCanvas from "../simulation/SimulationCanvas";
import { useGameLoop } from "@/hooks/useGameLoop";
import HexSlider from "../ui/HexSlider";
import Oscilloscope from "../ui/Oscilloscope";

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

    // Data History for Oscilloscopes
    const [heightData, setHeightData] = useState<number[]>([]);
    const [velocityData, setVelocityData] = useState<number[]>([]);

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

            // Record Data
            // Invert Y for height (canvas Y is down)
            const currentHeight = Math.max(0, startPos.y - y);
            // Vertical velocity (invert because up is negative Y)
            const currentVy = -vy;

            setHeightData(prevData => {
                const newData = [...prevData, currentHeight];
                if (newData.length > 100) newData.shift(); // Keep last 100 frames
                return newData;
            });

            setVelocityData(prevData => {
                const newData = [...prevData, currentVy];
                if (newData.length > 100) newData.shift();
                return newData;
            });

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

        setHeightData([]);
        setVelocityData([]);

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
        setHeightData([]);
        setVelocityData([]);
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
                {/* Oscilloscopes Panel */}
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <Oscilloscope
                            data={heightData}
                            label="Height (m)"
                            min={0}
                            max={500}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <Oscilloscope
                            data={velocityData}
                            label="Vertical Velocity (m/s)"
                            min={-100}
                            max={100}
                        />
                    </div>
                </div>

                <div className={styles.controlGroup}>
                    <HexSlider
                        label="Velocity"
                        min={10} max={150}
                        value={velocity}
                        onChange={setVelocity}
                        unit=" m/s"
                    />
                </div>

                <div className={styles.controlGroup}>
                    <HexSlider
                        label="Angle"
                        min={0} max={90}
                        value={angle}
                        onChange={setAngle}
                        unit="°"
                    />
                </div>

                <div className={styles.controlGroup}>
                    <HexSlider
                        label="Gravity"
                        min={1} max={20}
                        value={gravity}
                        onChange={setGravity}
                        unit=" m/s²"
                    />
                </div>

                <button onClick={fire} className={styles.button}>Fire</button>
                <button onClick={reset} className={styles.button}>Reset</button>
            </div>
        </div>
    );
}
