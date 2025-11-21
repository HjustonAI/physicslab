"use client";

import { useEffect, useRef } from "react";
import styles from "./Oscilloscope.module.css";

interface OscilloscopeProps {
    data: number[];
    label: string;
    min: number;
    max: number;
    color?: string;
}

export default function Oscilloscope({ data, label, min, max, color }: OscilloscopeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Handle DPI
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;

        // Theme
        const theme = document.documentElement.getAttribute("data-theme") || "theory";
        const isTheory = theme === "theory";
        const lineColor = color || (isTheory ? "#c8aa6e" : "#39ff14");

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Draw Grid
        ctx.beginPath();
        ctx.strokeStyle = isTheory ? "rgba(200, 170, 110, 0.2)" : "rgba(57, 255, 20, 0.1)";
        ctx.lineWidth = 1;

        // Horizontal grid lines
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }
        ctx.stroke();

        // Draw Data
        if (data.length === 0) return;

        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;

        if (!isTheory) {
            ctx.shadowBlur = 5;
            ctx.shadowColor = lineColor;
        }

        const stepX = width / (data.length - 1 || 1);
        const range = max - min;

        data.forEach((val, i) => {
            // Normalize value to 0-1, then flip for canvas Y (0 is top)
            const normalized = (val - min) / range;
            const y = height - (normalized * height);
            const x = i * stepX;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();
        ctx.shadowBlur = 0;

        // Scanline effect for Experiment mode
        if (!isTheory && data.length > 0) {
            const lastX = (data.length - 1) * stepX;
            const lastVal = data[data.length - 1];
            const lastY = height - ((lastVal - min) / range * height);

            ctx.beginPath();
            ctx.fillStyle = "#fff";
            ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
            ctx.fill();
        }

    }, [data, min, max, color]);

    return (
        <div className={styles.container}>
            <span className={styles.label}>{label}</span>
            <canvas ref={canvasRef} className={styles.canvas} />
        </div>
    );
}
