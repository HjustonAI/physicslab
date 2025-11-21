import VacuumChamber from "@/components/simulation/VacuumChamber";
import ProjectileModule from "@/components/modules/ProjectileModule";

export default function Home() {
  return (
    <main>
      <VacuumChamber>
        <ProjectileModule />
      </VacuumChamber>
    </main>
  );
}
