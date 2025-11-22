"use client";

import { useState, useCallback, useEffect } from "react";
import styles from "./ProjectileModule.module.css";
import SimulationCanvas from "../simulation/SimulationCanvas";
import { useProjectilePhysics } from "@/hooks/modules/useProjectilePhysics";
import { useTheme } from "@/context/ThemeContext";
import HexSlider from "../ui/HexSlider";
import Oscilloscope from "../ui/Oscilloscope";



export default function ProjectileModule() {
    // Physics Parameters
    const [velocity, setVelocity] = useState(50); // m/s (pixels/s for now)
    const [angle, setAngle] = useState(45); // degrees
    const [gravity, setGravity] = useState(9.8); // m/s^2

    // Simulation State
    // Use state for startPos so it triggers re-renders on resize
    const [startPos, setStartPos] = useState({ x: 100, y: 0 }); // Y will be set on mount

    useEffect(() => {
        const handleResize = () => {
            setStartPos({ x: 100, y: window.innerHeight - 150 });
        };

        // Initial set
        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const { simState, heightData, velocityData, fire, reset } = useProjectilePhysics({
        velocity,
        angle,
        gravity,
        startPos
    });

    // Rendering
    const { theme } = useTheme();
    const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
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

    }, [simState, angle, startPos, theme]);

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
