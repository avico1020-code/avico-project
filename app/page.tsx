import { HomeSidePanel } from "@/components/HomeSidePanel";
import { OpenProjectsPanel } from "@/components/OpenProjectsPanel";
import { TopBar } from "@/components/TopBar";

const cream = "#FFFDF7";

export default function Home() {
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: cream }}>
      <TopBar />

      <h1 className="text-4xl font-bold text-black text-center w-full pt-6">Dashboard</h1>

      <main className="w-full pt-8 pr-[calc(2*min(30vw,380px)+3.5rem)] flex flex-col items-center" />

      <OpenProjectsPanel />
      <HomeSidePanel />
    </div>
  );
}
