"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./HexSlider.module.css";

interface HexSliderProps {
    label: string;
    min: number;
    max: number;
    value: number;
    onChange: (value: number) => void;
    unit?: string;
}

export default function HexSlider({ label, min, max, value, onChange, unit = "" }: HexSliderProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        updateValue(e.clientX);
    };

    const updateValue = (clientX: number) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
        const newValue = Math.round(min + percent * (max - min));
        onChange(newValue);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                updateValue(e.clientX);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, min, max, onChange]);

    const percent = ((value - min) / (max - min)) * 100;

    return (
        <div className={styles.sliderContainer}>
            <div className={styles.label}>
                <span>{label}</span>
                <span>{value}{unit}</span>
            </div>
            <div className={styles.track} ref={trackRef} onMouseDown={handleMouseDown}>
                <div className={styles.fill} style={{ width: `${percent}%` }} />
                <div className={styles.thumb} style={{ left: `${percent}%` }} />
            </div>
        </div>
    );
}
