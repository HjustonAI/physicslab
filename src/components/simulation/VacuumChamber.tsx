"use client";
import { useState, useEffect } from "react";
import styles from "./VacuumChamber.module.css";

export default function VacuumChamber({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<"theory" | "experiment">("theory");

    // Listen for theme changes from the global attribute
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
                    const theme = document.documentElement.getAttribute("data-theme");
                    setMode(theme as "theory" | "experiment" || "theory");
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        // Initial set
        const currentTheme = document.documentElement.getAttribute("data-theme");
        setMode(currentTheme as "theory" | "experiment" || "theory");

        return () => observer.disconnect();
    }, []);

    return (
        <div className={styles.chamber} data-mode={mode}>
            <div className={styles.canvasContainer}>
                {children}
            </div>
        </div>
    );
}
