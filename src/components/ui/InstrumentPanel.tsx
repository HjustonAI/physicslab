"use client";

import { useTheme } from "@/context/ThemeContext";
import styles from "./InstrumentPanel.module.css";

export default function InstrumentPanel() {
    const { theme, toggleTheme } = useTheme();

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
