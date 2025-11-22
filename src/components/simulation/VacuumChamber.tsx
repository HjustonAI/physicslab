"use client";
import { useTheme } from "@/context/ThemeContext";
import styles from "./VacuumChamber.module.css";

export default function VacuumChamber({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();

    return (
        <div className={styles.chamber} data-mode={theme}>
            <div className={styles.canvasContainer}>
                {children}
            </div>
        </div>
    );
}
