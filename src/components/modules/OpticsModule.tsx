"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import styles from "./OpticsModule.module.css";
import SimulationCanvas from "../simulation/SimulationCanvas";

interface Point { x: number; y: number; }
interface Ray { start: Point; angle: number; color: string; }
interface Mirror { x1: number; y1: number; x2: number; y2: number; }

export default function OpticsModule() {
    // State
    const [mirrors, setMirrors] = useState<Mirror[]>([
        { x1: 300, y1: 100, x2: 300, y2: 300 }, // Vertical mirror
        { x1: 500, y1: 400, x2: 700, y2: 400 }, // Horizontal mirror
        { x1: 600, y1: 100, x2: 800, y2: 300 }, // Diagonal mirror
    ]);

    const [lasers, setLasers] = useState<Ray[]>([
        { start: { x: 100, y: 200 }, angle: 0, color: "#ff0000" } // Red laser
    ]);

    // Ray Tracing Logic
    const traceRay = (ray: Ray, mirrors: Mirror[], depth: number = 0): Point[] => {
        if (depth > 10) return []; // Max recursion depth

        let closestInt: Point | null = null;
        let minDist = Infinity;
        let hitMirror: Mirror | null = null;

        // Ray direction vector
        const dx = Math.cos(ray.angle);
        const dy = Math.sin(ray.angle);

        // Check intersection with all mirrors
        for (const mirror of mirrors) {
            const x1 = mirror.x1;
            const y1 = mirror.y1;
            const x2 = mirror.x2;
            const y2 = mirror.y2;

            // Line-Line Intersection (Ray vs Mirror Segment)
            const x3 = ray.start.x;
            const y3 = ray.start.y;
            const x4 = ray.start.x + dx * 2000; // Far point
            const y4 = ray.start.y + dy * 2000;

            const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
            if (den === 0) continue; // Parallel

            const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
            const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

            if (t >= 0 && t <= 1 && u >= 0) {
                const intX = x1 + t * (x2 - x1);
                const intY = y1 + t * (y2 - y1);

                const dist = Math.sqrt((intX - x3) ** 2 + (intY - y3) ** 2);

                if (dist < minDist && dist > 0.1) { // Avoid self-intersection
                    minDist = dist;
                    closestInt = { x: intX, y: intY };
                    hitMirror = mirror;
                }
            }
        }

        // Check bounds (screen edges) if no mirror hit
        if (!closestInt) {
            // Just project far out for now
            closestInt = { x: ray.start.x + dx * 2000, y: ray.start.y + dy * 2000 };
            return [ray.start, closestInt];
        }

        // Calculate Reflection
        const path = [ray.start, closestInt];

        if (hitMirror) {
            // Normal vector of the mirror
            const mx = hitMirror.x2 - hitMirror.x1;
            const my = hitMirror.y2 - hitMirror.y1;
            const normalAngle = Math.atan2(my, mx) - Math.PI / 2;

            // Reflection formula: r = d - 2(d.n)n
            // Or simpler with angles: angleOfReflection = 2 * normalAngle - angleOfIncidence - PI
            const reflectAngle = 2 * normalAngle - ray.angle - Math.PI;

            const reflectedRay: Ray = {
                start: closestInt,
                angle: reflectAngle,
                color: ray.color
            };

            path.push(...traceRay(reflectedRay, mirrors, depth + 1).slice(1));
        }

        return path;
    };

    // Interaction State
    const [dragging, setDragging] = useState<{ index: number; type: "start" | "end" | "center"; offsetX: number; offsetY: number } | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check mirrors
        for (let i = 0; i < mirrors.length; i++) {
            const m = mirrors[i];
            const distStart = Math.hypot(m.x1 - x, m.y1 - y);
            const distEnd = Math.hypot(m.x2 - x, m.y2 - y);
            const centerX = (m.x1 + m.x2) / 2;
            const centerY = (m.y1 + m.y2) / 2;
            const distCenter = Math.hypot(centerX - x, centerY - y);

            if (distStart < 20) {
                setDragging({ index: i, type: "start", offsetX: 0, offsetY: 0 });
                return;
            }
            if (distEnd < 20) {
                setDragging({ index: i, type: "end", offsetX: 0, offsetY: 0 });
                return;
            }
            if (distCenter < 20) {
                setDragging({ index: i, type: "center", offsetX: x - centerX, offsetY: y - centerY });
                return;
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return;

        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setMirrors(prev => {
            const newMirrors = [...prev];
            const m = { ...newMirrors[dragging.index] };

            if (dragging.type === "start") {
                m.x1 = x;
                m.y1 = y;
            } else if (dragging.type === "end") {
                m.x2 = x;
                m.y2 = y;
            } else if (dragging.type === "center") {
                const dx = m.x2 - m.x1;
                const dy = m.y2 - m.y1;
                const cx = x - dragging.offsetX;
                const cy = y - dragging.offsetY;
                m.x1 = cx - dx / 2;
                m.y1 = cy - dy / 2;
                m.x2 = cx + dx / 2;
                m.y2 = cy + dy / 2;
            }

            newMirrors[dragging.index] = m;
            return newMirrors;
        });
    };

    const handleMouseUp = () => {
        setDragging(null);
    };

    // Interaction (Simple drag for mirrors - placeholder for now)
    // For this phase, we'll just randomize mirrors to show interactivity
    const randomizeMirrors = () => {
        setMirrors(prev => prev.map(m => ({
            ...m,
            x1: Math.random() * 800 + 100,
            y1: Math.random() * 600 + 100,
            x2: Math.random() * 800 + 100,
            y2: Math.random() * 600 + 100,
        })));
    };

    // Render
    const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const theme = document.documentElement.getAttribute("data-theme") || "theory";
        const isTheory = theme === "theory";

        ctx.clearRect(0, 0, width, height);

        // 1. Draw Mirrors
        for (let i = 0; i < mirrors.length; i++) {
            const mirror = mirrors[i];

            // Highlight if dragging
            const isDragging = dragging?.index === i;

            ctx.beginPath();
            ctx.moveTo(mirror.x1, mirror.y1);
            ctx.lineTo(mirror.x2, mirror.y2);

            ctx.lineWidth = isDragging ? 6 : 4;
            ctx.strokeStyle = isTheory ? "#c8aa6e" : "#e0e0e0"; // Gold or Silver
            if (isDragging) ctx.strokeStyle = isTheory ? "#e0c080" : "#ffffff";

            ctx.stroke();

            // Draw "glass" look
            if (!isTheory) {
                ctx.lineWidth = 8;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
                ctx.stroke();
            }

            // Draw Handles (Circles at ends)
            ctx.fillStyle = isTheory ? "#c8aa6e" : "#39ff14";
            ctx.beginPath(); ctx.arc(mirror.x1, mirror.y1, 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(mirror.x2, mirror.y2, 5, 0, Math.PI * 2); ctx.fill();
            // Center handle
            ctx.fillStyle = isTheory ? "#1a1e2e" : "#000";
            ctx.strokeStyle = isTheory ? "#c8aa6e" : "#39ff14";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc((mirror.x1 + mirror.x2) / 2, (mirror.y1 + mirror.y2) / 2, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // 2. Ray Trace & Draw Lasers
        for (const laser of lasers) {
            const path = traceRay(laser, mirrors);

            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x, path[i].y);
            }

            // Laser Style
            ctx.strokeStyle = laser.color;
            ctx.lineWidth = 2;

            if (!isTheory) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = laser.color;
                ctx.globalCompositeOperation = "screen"; // Additive blending for light
            }

            ctx.stroke();

            // Reset styles
            ctx.shadowBlur = 0;
            ctx.globalCompositeOperation = "source-over";
        }

        // Draw Laser Source
        for (const laser of lasers) {
            ctx.beginPath();
            ctx.arc(laser.start.x, laser.start.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = laser.color;
            ctx.fill();
        }

    }, [mirrors, lasers, dragging]);

    return (
        <div className={styles.container} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <SimulationCanvas draw={draw} />

            <div className={styles.controls}>
                <button onClick={randomizeMirrors} className={styles.button}>Randomize Mirrors</button>
                <div className={styles.instruction}>
                    Drag mirrors by ends or center
                </div>
            </div>
        </div>
    );
}
