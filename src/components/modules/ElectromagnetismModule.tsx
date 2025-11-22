"use client";

import { useState, useCallback } from "react";
import styles from "./ElectromagnetismModule.module.css";
import { useTheme } from "@/context/ThemeContext";
import SimulationCanvas from "../simulation/SimulationCanvas";

interface Charge {
    x: number;
    y: number;
    q: number; // Charge magnitude (e.g., +1, -1)
}

export default function ElectromagnetismModule() {
    // State
    const [charges, setCharges] = useState<Charge[]>([
        { x: 300, y: 300, q: 1 },  // Positive
        { x: 500, y: 300, q: -1 }  // Negative
    ]);

    // Interaction State
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    // Physics Constants
    const k = 10000; // Coulomb constant scaling factor for visualization

    // Render
    const { theme } = useTheme();
    const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const isTheory = theme === "theory";

        ctx.clearRect(0, 0, width, height);

        // 1. Draw Electric Field Grid
        const gridSize = 30;
        const rows = Math.ceil(height / gridSize);
        const cols = Math.ceil(width / gridSize);

        ctx.lineWidth = 1;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * gridSize;
                const y = r * gridSize;

                // Calculate E-field at this point
                let Ex = 0;
                let Ey = 0;

                for (const charge of charges) {
                    const dx = x - charge.x;
                    const dy = y - charge.y;
                    const r2 = dx * dx + dy * dy;
                    const r = Math.sqrt(r2);

                    if (r < 10) continue; // Avoid singularity

                    // E = k * q / r^2 * r_hat
                    // r_hat = (dx/r, dy/r)
                    // E = k * q / r^3 * (dx, dy)

                    const E = k * charge.q / (r * r2); // Using r^3 in denominator effectively
                    Ex += E * dx;
                    Ey += E * dy;
                }

                // Visualize Vector
                const mag = Math.sqrt(Ex * Ex + Ey * Ey);
                if (mag > 0.1) {
                    const angle = Math.atan2(Ey, Ex);
                    // Clamp length for visuals
                    const len = Math.min(gridSize * 0.8, mag * 500);
                    const opacity = Math.min(1, mag * 100);

                    ctx.strokeStyle = isTheory
                        ? `rgba(200, 170, 110, ${opacity})`
                        : `rgba(100, 200, 255, ${opacity})`;

                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
                    ctx.stroke();

                    // Arrowhead (optional, maybe just lines for now to keep it clean)
                }
            }
        }

        // 2. Draw Charges
        for (const charge of charges) {
            ctx.beginPath();
            ctx.arc(charge.x, charge.y, 15, 0, Math.PI * 2);

            if (charge.q > 0) {
                ctx.fillStyle = "#ff4444"; // Red for Positive
                ctx.strokeStyle = "#ffaaaa";
            } else {
                ctx.fillStyle = "#4444ff"; // Blue for Negative
                ctx.strokeStyle = "#aaaaff";
            }

            ctx.fill();
            ctx.lineWidth = 2;
            ctx.stroke();

            // Symbol
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(charge.q > 0 ? "+" : "-", charge.x, charge.y);
        }

    }, [charges, theme]);

    // Interaction Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (let i = 0; i < charges.length; i++) {
            const charge = charges[i];
            const dist = Math.hypot(charge.x - x, charge.y - y);
            if (dist < 20) {
                setDraggingIndex(i);
                return;
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggingIndex === null) return;

        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setCharges(prev => {
            const newCharges = [...prev];
            newCharges[draggingIndex] = { ...newCharges[draggingIndex], x, y };
            return newCharges;
        });
    };

    const handleMouseUp = () => {
        setDraggingIndex(null);
    };

    return (
        <div className={styles.container} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <SimulationCanvas draw={draw} />

            <div className={styles.controls}>
                <button onClick={() => setCharges([...charges, { x: 400, y: 300, q: 1 }])} className={styles.button}>Add + Charge</button>
                <button onClick={() => setCharges([...charges, { x: 400, y: 300, q: -1 }])} className={styles.button}>Add - Charge</button>
                <button onClick={() => setCharges([])} className={styles.button}>Clear</button>
                <div className={styles.instruction}>
                    Drag charges to move them
                </div>
            </div>
        </div>
    );
}
