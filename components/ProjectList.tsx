"use client";

import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Trash2 } from "lucide-react";
import { useOpenProjects } from "@/components/OpenProjectsContext";

const cardClass =
  "rounded-2xl border-2 border-black bg-transparent text-black font-medium px-4 py-3 hover:bg-black/5 transition-colors flex items-center gap-2 w-full";
const btnIconClass =
  "rounded-xl border-2 border-black bg-transparent text-black p-1.5 hover:bg-black/5 transition-colors inline-flex items-center justify-center shrink-0";

export function ProjectList() {
  const projects = useQuery(api.projects.list);
  const removeProject = useMutation(api.projects.remove);
  const { addOpen, openIds } = useOpenProjects();

  if (projects === undefined) {
    return <p className="text-black/70">טוען...</p>;
  }

  if (projects.length === 0) {
    return (
      <p className="text-black/70">
        אין עדיין פרויקטים. צור פרויקט חדש מהשורה העליונה.
      </p>
    );
  }

  return (
    <div className="w-full grid grid-cols-5 gap-3">
      {projects.map((project) => (
        <div
          key={project._id}
          className="flex items-center gap-2"
        >
          <div className={cardClass}>
            <Link
              href={`/projects/${project._id}`}
              className="flex flex-col items-center justify-center text-center min-w-0 flex-1 gap-0.5"
            >
              <span className="font-medium truncate w-full">{project.name}</span>
              {project.coordinationNumber != null &&
                project.coordinationNumber !== "" && (
                  <span className="text-sm text-black/80">
                    {project.coordinationNumber}
                  </span>
                )}
            </Link>
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await addOpen(project._id);
              }}
              className={`${btnIconClass} ${
                openIds.includes(project._id as any)
                  ? "bg-orange-300 hover:bg-orange-400"
                  : ""
              }`}
              aria-label="הוסף לפרויקטים פתוחים"
            >
              <Plus className="size-5" aria-hidden />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("האם אתה בטוח שברצונך למחוק את הפרויקט?")) {
                removeProject({ id: project._id });
              }
            }}
            className={btnIconClass}
            aria-label="מחק פרויקט"
          >
            <Trash2 className="size-5" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
