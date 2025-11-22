"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import styles from "./OpticsModule.module.css";
import { useTheme } from "@/context/ThemeContext";
import SimulationCanvas from "../simulation/SimulationCanvas";
import HexSlider from "../ui/HexSlider";

import { Point } from "@/types/physics";

interface Ray { start: Point; angle: number; color: string; }
interface Mirror { x1: number; y1: number; x2: number; y2: number; }
interface Lens { x: number; y: number; radius: number; refractiveIndex: number; }

export default function OpticsModule() {
    // State
    const [mirrors, setMirrors] = useState<Mirror[]>([
        { x1: 300, y1: 100, x2: 300, y2: 300 }, // Vertical mirror
        { x1: 500, y1: 400, x2: 700, y2: 400 }, // Horizontal mirror
        { x1: 600, y1: 100, x2: 800, y2: 300 }, // Diagonal mirror
    ]);

    const [lenses, setLenses] = useState<Lens[]>([
        { x: 400, y: 200, radius: 50, refractiveIndex: 1.5 } // Glass sphere
    ]);

    const [lasers, setLasers] = useState<Ray[]>([
        { start: { x: 100, y: 200 }, angle: 0, color: "#ff0000" } // Red laser
    ]);

    // Ray Tracing Logic
    const traceRay = useCallback((ray: Ray, mirrors: Mirror[], lenses: Lens[], depth: number = 0): Point[] => {
        if (depth > 10) return []; // Max recursion depth

        let closestInt: Point | null = null;
        let minDist = Infinity;
        let hitObject: { type: "mirror" | "lens", obj: any, normal?: number } | null = null;

        // Ray direction vector
        const dx = Math.cos(ray.angle);
        const dy = Math.sin(ray.angle);

        // 1. Check Mirrors (Line Segments)
        for (const mirror of mirrors) {
            const x1 = mirror.x1;
            const y1 = mirror.y1;
            const x2 = mirror.x2;
            const y2 = mirror.y2;

            const x3 = ray.start.x;
            const y3 = ray.start.y;
            const x4 = ray.start.x + dx * 2000;
            const y4 = ray.start.y + dy * 2000;

            const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
            if (den === 0) continue;

            const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
            const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

            if (t >= 0 && t <= 1 && u > 0.001) { // u > epsilon to avoid self-intersection
                const intX = x1 + t * (x2 - x1);
                const intY = y1 + t * (y2 - y1);
                const dist = Math.sqrt((intX - x3) ** 2 + (intY - y3) ** 2);

                if (dist < minDist) {
                    minDist = dist;
                    closestInt = { x: intX, y: intY };
                    hitObject = { type: "mirror", obj: mirror };
                }
            }
        }

        // 2. Check Lenses (Circles)
        for (const lens of lenses) {
            // Ray: O + tD
            // Circle: |P - C|^2 = R^2
            // t^2 + 2(D . (O - C))t + |O - C|^2 - R^2 = 0

            const cx = lens.x;
            const cy = lens.y;
            const r = lens.radius;

            const ox = ray.start.x;
            const oy = ray.start.y;

            const lx = ox - cx;
            const ly = oy - cy;

            const a = 1; // D is normalized
            const b = 2 * (dx * lx + dy * ly);
            const c = (lx * lx + ly * ly) - (r * r);

            const disc = b * b - 4 * a * c;

            if (disc >= 0) {
                const sqrtDisc = Math.sqrt(disc);
                const t1 = (-b - sqrtDisc) / (2 * a);
                const t2 = (-b + sqrtDisc) / (2 * a);

                let t = -1;
                if (t1 > 0.001) t = t1;
                else if (t2 > 0.001) t = t2;

                if (t > 0 && t < minDist) {
                    minDist = t;
                    closestInt = { x: ox + t * dx, y: oy + t * dy };

                    // Calculate Normal Angle
                    const nx = (closestInt.x - cx) / r;
                    const ny = (closestInt.y - cy) / r;
                    const normalAngle = Math.atan2(ny, nx);

                    hitObject = { type: "lens", obj: lens, normal: normalAngle };
                }
            }
        }

        // No hit?
        if (!closestInt) {
            closestInt = { x: ray.start.x + dx * 2000, y: ray.start.y + dy * 2000 };
            return [ray.start, closestInt];
        }

        const path = [ray.start, closestInt];

        // Handle Interaction
        if (hitObject) {
            let newAngle = ray.angle;

            if (hitObject.type === "mirror") {
                const m = hitObject.obj as Mirror;
                const mx = m.x2 - m.x1;
                const my = m.y2 - m.y1;
                const normalAngle = Math.atan2(my, mx) - Math.PI / 2;
                newAngle = 2 * normalAngle - ray.angle - Math.PI;
            }
            else if (hitObject.type === "lens") {
                const lens = hitObject.obj as Lens;
                const normal = hitObject.normal!;

                // Determine entering or exiting
                // Dot product of Ray and Normal
                const dot = dx * Math.cos(normal) + dy * Math.sin(normal);

                let n1 = 1; // Air
                let n2 = lens.refractiveIndex; // Lens
                if (dot > 0) {
                    n1 = lens.refractiveIndex;
                    n2 = 1;
                }

                // Snell's Law: n1 sin(theta1) = n2 sin(theta2)
                // theta1 is angle between Ray and Normal
                // We need to be careful with angles here.

                // Let's use vector math for robustness
                // I = incoming vector (dx, dy)
                // N = normal vector (at intersection)
                // if dot(I, N) < 0, entering. N is correct.
                // if dot(I, N) > 0, exiting. N should be flipped for the math.

                let nx = Math.cos(normal);
                let ny = Math.sin(normal);

                if (dx * nx + dy * ny > 0) {
                    // Exiting
                    nx = -nx;
                    ny = -ny;
                    n1 = lens.refractiveIndex;
                    n2 = 1;
                }

                const n = n1 / n2;
                const cosI = - (dx * nx + dy * ny);
                const sinT2 = n * n * (1 - cosI * cosI);

                if (sinT2 > 1) {
                    // Total Internal Reflection
                    // Treat as mirror
                    // R = I - 2(I.N)N
                    // This is effectively reflection
                    const reflectX = dx + 2 * cosI * nx;
                    const reflectY = dy + 2 * cosI * ny;
                    newAngle = Math.atan2(reflectY, reflectX);
                } else {
                    const cosT = Math.sqrt(1 - sinT2);
                    const rx = n * dx + (n * cosI - cosT) * nx;
                    const ry = n * dy + (n * cosI - cosT) * ny;
                    newAngle = Math.atan2(ry, rx);
                }
            }

            const nextRay: Ray = {
                start: closestInt,
                angle: newAngle,
                color: ray.color
            };

            path.push(...traceRay(nextRay, mirrors, lenses, depth + 1).slice(1));
        }

        return path;
    }, []);

    // Interaction State
    const [dragging, setDragging] = useState<{ index: number; type: "mirror_start" | "mirror_end" | "mirror_center" | "lens"; offsetX: number; offsetY: number } | null>(null);
    const [selectedLensIndex, setSelectedLensIndex] = useState<number | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check Lenses first (on top)
        for (let i = 0; i < lenses.length; i++) {
            const lens = lenses[i];
            const dist = Math.hypot(lens.x - x, lens.y - y);
            if (dist < lens.radius) {
                setDragging({ index: i, type: "lens", offsetX: x - lens.x, offsetY: y - lens.y });
                setSelectedLensIndex(i);
                return;
            }
        }

        // Check mirrors
        for (let i = 0; i < mirrors.length; i++) {
            const m = mirrors[i];
            const distStart = Math.hypot(m.x1 - x, m.y1 - y);
            const distEnd = Math.hypot(m.x2 - x, m.y2 - y);
            const centerX = (m.x1 + m.x2) / 2;
            const centerY = (m.y1 + m.y2) / 2;
            const distCenter = Math.hypot(centerX - x, centerY - y);

            if (distStart < 20) {
                setDragging({ index: i, type: "mirror_start", offsetX: 0, offsetY: 0 });
                setSelectedLensIndex(null); // Deselect lens
                return;
            }
            if (distEnd < 20) {
                setDragging({ index: i, type: "mirror_end", offsetX: 0, offsetY: 0 });
                setSelectedLensIndex(null);
                return;
            }
            if (distCenter < 20) {
                setDragging({ index: i, type: "mirror_center", offsetX: x - centerX, offsetY: y - centerY });
                setSelectedLensIndex(null);
                return;
            }
        }

        // Clicked empty space
        setSelectedLensIndex(null);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return;

        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (dragging.type === "lens") {
            setLenses(prev => {
                const newLenses = [...prev];
                newLenses[dragging.index] = {
                    ...newLenses[dragging.index],
                    x: x - dragging.offsetX,
                    y: y - dragging.offsetY
                };
                return newLenses;
            });
        } else {
            setMirrors(prev => {
                const newMirrors = [...prev];
                const m = { ...newMirrors[dragging.index] };

                if (dragging.type === "mirror_start") {
                    m.x1 = x;
                    m.y1 = y;
                } else if (dragging.type === "mirror_end") {
                    m.x2 = x;
                    m.y2 = y;
                } else if (dragging.type === "mirror_center") {
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
        }
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
    const { theme } = useTheme();
    const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
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

        // 1b. Draw Lenses
        for (const lens of lenses) {
            ctx.beginPath();
            ctx.fillText(`n=${lens.refractiveIndex}`, lens.x, lens.y);
        }

        // 2. Ray Trace & Draw Lasers
        for (const laser of lasers) {
            const path = traceRay(laser, mirrors, lenses);

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

    }, [mirrors, lasers, lenses, dragging, traceRay, theme]);

    return (
        <div className={styles.container} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <SimulationCanvas draw={draw} />

            <div className={styles.controls}>
                <button onClick={randomizeMirrors} className={styles.button}>Randomize Mirrors</button>
                <button onClick={() => setLenses([...lenses, { x: 400, y: 300, radius: 40, refractiveIndex: 1.5 }])} className={styles.button}>Add Lens</button>

                {selectedLensIndex !== null && (
                    <div style={{ marginTop: "10px", width: "200px" }}>
                        <HexSlider
                            label="Refractive Index"
                            min={100}
                            max={250}
                            value={lenses[selectedLensIndex].refractiveIndex * 100}
                            onChange={(val) => {
                                const newLenses = [...lenses];
                                newLenses[selectedLensIndex] = { ...newLenses[selectedLensIndex], refractiveIndex: val / 100 };
                                setLenses(newLenses);
                            }}
                            unit=""
                        />
                        <div style={{ fontSize: "0.8rem", textAlign: "center", opacity: 0.7 }}>
                            (1.00 - 2.50)
                        </div>
                    </div>
                )}

                <div className={styles.instruction}>
                    Drag mirrors or lenses. Click lens to edit.
                </div>
            </div>
        </div>
    );
}
