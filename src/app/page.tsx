"use client";

import { useState } from "react";
import VacuumChamber from "@/components/simulation/VacuumChamber";
import ProjectileModule from "@/components/modules/ProjectileModule";
import OpticsModule from "@/components/modules/OpticsModule";

export default function Home() {
  const [activeModule, setActiveModule] = useState<"kinematics" | "optics">("kinematics");

  return (
    <main>
      <VacuumChamber>
        {activeModule === "kinematics" ? <ProjectileModule /> : <OpticsModule />}
      </VacuumChamber>

      {/* Module Switcher UI - Absolute positioned over the chamber */}
      <div style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 200,
        display: "flex",
        gap: "10px"
      }}>
        <button
          onClick={() => setActiveModule("kinematics")}
          style={{
            padding: "10px 20px",
            background: activeModule === "kinematics" ? "var(--accent-primary)" : "rgba(0,0,0,0.5)",
            color: activeModule === "kinematics" ? "var(--bg-primary)" : "var(--text-primary)",
            border: "1px solid var(--accent-primary)",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase"
          }}
        >
          Kinematics
        </button>
        <button
          onClick={() => setActiveModule("optics")}
          style={{
            padding: "10px 20px",
            background: activeModule === "optics" ? "var(--accent-primary)" : "rgba(0,0,0,0.5)",
            color: activeModule === "optics" ? "var(--bg-primary)" : "var(--text-primary)",
            border: "1px solid var(--accent-primary)",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase"
          }}
        >
          Optics
        </button>
      </div>
    </main>
  );
}
