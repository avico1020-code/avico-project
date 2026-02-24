"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const cream = "#FFFDF7";

interface ProjectDetailsProps {
  projectId: Id<"projects">;
}

export function ProjectDetails({ projectId }: ProjectDetailsProps) {
  const project = useQuery(api.projects.get, { id: projectId });

  if (project === undefined) {
    return (
      <main className="w-full pt-8 flex flex-col items-center">
        <p className="text-black/70">טוען פרויקט...</p>
      </main>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div
      className="w-full"
      style={{ backgroundColor: cream }}
    >
      {/* שורה עליונה: כותרת במרכז */}
      <div className="w-full pt-6 px-4">
        <h1 className="text-4xl font-bold text-black text-center">
          {project.name}
        </h1>
      </div>
    </div>
  );
}

