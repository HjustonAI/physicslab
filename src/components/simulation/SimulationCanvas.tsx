"use client";

import { useRef, useEffect } from "react";

interface SimulationCanvasProps {
    draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
    className?: string;
}

export default function SimulationCanvas({ draw, className }: SimulationCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                // Initial draw after resize
                draw(ctx, canvas.width, canvas.height);
            }
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas(); // Call once on mount

        return () => {
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [draw]);

    // Re-draw when draw function changes (usually driven by the game loop in the parent)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        draw(ctx, canvas.width, canvas.height);
    }, [draw]);

    return <canvas ref={canvasRef} className={className} style={{ display: "block" }} />;
}
