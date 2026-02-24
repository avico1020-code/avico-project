import { TopBar } from "@/components/TopBar";
import { ProjectDetails } from "@/components/ProjectDetails";
import { ProjectFieldsPanel } from "@/components/ProjectFieldsPanel";
import { ProjectLinksPanel } from "@/components/ProjectLinksPanel";
import { ProjectNavAndContent } from "@/components/ProjectNavAndContent";
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
      <ProjectNavAndContent projectId={projectId} />
      <div className="fixed right-4 top-[10.5rem] w-[30vw] flex flex-col gap-4">
        <ProjectFieldsPanel projectId={projectId} />
        <ProjectSidePanel projectId={projectId} />
        <ProjectLinksPanel projectId={projectId} />
      </div>
    </div>
  );
}
