"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AddLinkModal } from "@/components/AddLinkModal";

const cream = "#FFFDF7";
const btnClass =
  "rounded-2xl border-2 border-black bg-transparent text-black font-medium px-4 py-2 hover:bg-black/5 transition-colors inline-flex";

interface ProjectLinksPanelProps {
  projectId: Id<"projects">;
}

export function ProjectLinksPanel({ projectId }: ProjectLinksPanelProps) {
  const [addLinkOpen, setAddLinkOpen] = useState(false);
  const links = useQuery(api.projectLinks.listByProject, { projectId });

  return (
    <aside
      className="rounded-2xl border-2 border-black p-4 flex flex-col gap-3 shrink-0"
      style={{ backgroundColor: cream }}
      aria-label="קישורים חיצוניים"
    >
      <h2 className="text-xl font-semibold text-black text-center shrink-0">
        קישורים חיצוניים
      </h2>
      <div className="flex flex-row flex-wrap items-center gap-2 justify-end">
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
    </aside>
  );
}
