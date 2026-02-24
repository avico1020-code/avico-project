"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ProjectFieldRow } from "@/components/ProjectFieldRow";
import { AddLinkModal } from "@/components/AddLinkModal";

const cream = "#FFFDF7";
const btnClass =
  "rounded-2xl border-2 border-black bg-transparent text-black font-medium px-4 py-2 hover:bg-black/5 transition-colors inline-flex";

interface ProjectDetailsProps {
  projectId: Id<"projects">;
}

export function ProjectDetails({ projectId }: ProjectDetailsProps) {
  const [addLinkOpen, setAddLinkOpen] = useState(false);
  const project = useQuery(api.projects.get, { id: projectId });
  const links = useQuery(api.projectLinks.listByProject, { projectId });

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
      className="min-h-[calc(100vh-4rem)]"
      style={{ backgroundColor: cream }}
    >
      {/* שורה עליונה: כותרת במרכז, שדות מימין */}
      <div className="w-full grid grid-cols-[1fr_auto_1fr] items-start pt-6 px-4 gap-4">
        <div />
        <h1 className="text-4xl font-bold text-black text-center">
          {project.name}
        </h1>
        <div className="flex flex-row flex-wrap items-start justify-end gap-4">
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
        </div>
      </div>

      {/* שורת קישורים + כפתור הוסף קישור */}
      <div className="w-full flex flex-row flex-wrap items-center gap-3 justify-end px-4 pt-6">
        <button
          type="button"
          onClick={() => setAddLinkOpen(true)}
          className={btnClass}
        >
          הוסף קישור
        </button>
        {links?.map((link) => (
          <a
            key={link._id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={btnClass}
          >
            {link.name}
          </a>
        ))}
      </div>

      <AddLinkModal
        projectId={projectId}
        open={addLinkOpen}
        onOpenChange={setAddLinkOpen}
      />
    </div>
  );
}

