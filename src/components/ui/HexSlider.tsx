"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

    const updateValue = useCallback((clientX: number) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
        const newValue = Math.round(min + percent * (max - min));
        onChange(newValue);
    }, [min, max, onChange]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(Math.min(value + 1, max));
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(Math.max(value - 1, min));
        }
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
    }, [isDragging, updateValue]);

    const percent = ((value - min) / (max - min)) * 100;

    return (
        <div
            className={styles.sliderContainer}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            role="slider"
            aria-label={label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
        >
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
