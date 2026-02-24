import { TopBar } from "@/components/TopBar";
import { ProjectList } from "@/components/ProjectList";

const cream = "#FFFDF7";

export default function AllProjectsPage() {
  return (
    <div
      className="min-h-screen p-8"
      style={{ backgroundColor: cream }}
    >
      <TopBar />

      <h1 className="text-4xl font-bold text-black text-center w-full pt-6">
        כל הפרויקטים
      </h1>

      <main className="w-full pt-8 flex flex-col items-start ps-4">
        <ProjectList />
      </main>
    </div>
  );
}
