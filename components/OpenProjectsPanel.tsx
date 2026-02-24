"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOpenProjects } from "@/components/OpenProjectsContext";

const cream = "#FFFDF7";

export function OpenProjectsPanel() {
  const { openIds, removeOpen } = useOpenProjects();
  const projects = useQuery(api.projects.list);
  const openProjects = projects
    ? projects.filter((p) => openIds.includes(p._id))
    : [];

  return (
    <aside
      className="fixed right-4 top-[10.5rem] bottom-4 w-[30vw] min-w-[220px] max-w-[380px] rounded-2xl border-2 border-black p-5 flex flex-col overflow-hidden"
      style={{ backgroundColor: cream }}
      aria-label="פרויקטים פתוחים"
    >
      <h2 className="text-xl font-semibold text-black mb-4 text-center shrink-0">
        פרויקטים פתוחים
      </h2>
      <div className="flex flex-col gap-2 overflow-auto">
        {openProjects.length === 0 ? (
          <p className="text-black/60 text-sm text-center py-2">אין פרויקטים פתוחים</p>
        ) : (
          openProjects.map((project) => (
            <div
              key={project._id}
              className="flex items-center justify-between gap-2 rounded-xl border border-black/30 px-3 py-2 bg-white/50"
            >
              <Link
                href={`/projects/${project._id}`}
                className="text-black font-medium text-sm truncate flex-1 min-w-0"
              >
                {project.name}
                {project.coordinationNumber ? ` ${project.coordinationNumber}` : ""}
              </Link>
              <button
                type="button"
                onClick={() => removeOpen(project._id)}
                className="text-black/70 hover:text-black text-xs shrink-0"
                aria-label="הסר מפרויקטים פתוחים"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
