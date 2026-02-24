"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ProjectFieldRow } from "@/components/ProjectFieldRow";

const cream = "#FFFDF7";

interface ProjectFieldsPanelProps {
  projectId: Id<"projects">;
}

export function ProjectFieldsPanel({ projectId }: ProjectFieldsPanelProps) {
  const project = useQuery(api.projects.get, { id: projectId });

  if (project === undefined) {
    return (
      <aside
        className="rounded-2xl border-2 border-black p-4 flex flex-col gap-2 shrink-0"
        style={{ backgroundColor: cream }}
        aria-label="שדות פרויקט"
      >
        <p className="text-black/70 text-sm">טוען...</p>
      </aside>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <aside
      className="rounded-2xl border-2 border-black p-4 flex flex-col gap-2 shrink-0"
      style={{ backgroundColor: cream }}
      aria-label="שדות פרויקט"
    >
      <ProjectFieldRow
        projectId={project._id}
        label="מספר תיאום"
        fieldKey="coordinationNumber"
        initialValue={project.coordinationNumber ?? ""}
      />
      <ProjectFieldRow
        projectId={project._id}
        label="מספר תוכנית"
        fieldKey="planNumber"
        initialValue={project.planNumber ?? ""}
      />
      <ProjectFieldRow
        projectId={project._id}
        label="מספר הצעת מחיר"
        fieldKey="quoteNumber"
        initialValue={project.quoteNumber ?? ""}
      />
    </aside>
  );
}
