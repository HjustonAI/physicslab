"use client";

import { useState, useEffect } from "react";
import styles from "./InstrumentPanel.module.css";

export default function InstrumentPanel() {
    const [theme, setTheme] = useState<"theory" | "experiment">("theory");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "theory" ? "experiment" : "theory"));
    };

    return (
        <div className={styles.panel}>
            <div className={`${styles.corner} ${styles.topLeft}`} />
            <div className={`${styles.corner} ${styles.topRight}`} />
            <div className={`${styles.corner} ${styles.bottomLeft}`} />
            <div className={`${styles.corner} ${styles.bottomRight}`} />

            <div className={styles.controls}>
                <button onClick={toggleTheme} className={styles.toggleBtn}>
                    Switch to {theme === "theory" ? "Experiment" : "Theory"}
                </button>
            </div>
        </div>
    );
}
