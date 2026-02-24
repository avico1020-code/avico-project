import { TopBar } from "@/components/TopBar";
import { ProjectDetails } from "@/components/ProjectDetails";
import { ProjectSidePanel } from "@/components/ProjectSidePanel";
import type { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const cream = "#FFFDF7";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

const RESERVED_SEGMENTS = ["watchlist", "new"];

export default async function ProjectPage(props: ProjectPageProps) {
  const params = await props.params;
  const rawId = params.id;

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  if (RESERVED_SEGMENTS.includes(rawId)) {
    redirect("/projects");
  }

  const projectId = rawId as Id<"projects">;

  return (
    <div
      className="min-h-screen p-8"
      style={{ backgroundColor: cream }}
    >
      <TopBar />
      <ProjectDetails projectId={projectId} />
      <ProjectSidePanel projectId={projectId} />
    </div>
  );
}
