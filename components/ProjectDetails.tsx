"use client";

import { useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const cream = "#FFFDF7";

interface ProjectDetailsProps {
  projectId: Id<"projects">;
}

export function ProjectDetails({ projectId }: ProjectDetailsProps) {
  const project = useQuery(api.projects.get, { id: projectId });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [protocolMenuOpen, setProtocolMenuOpen] = useState(false);

  const protocolNumber = useMemo(() => {
    const raw = searchParams?.get("protocol");
    const parsed = raw ? Number(raw) : 1;
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return Math.floor(parsed);
  }, [searchParams]);

  const protocolLabel = useMemo(
    () => `פרוטוקול ${protocolNumber.toString().padStart(2, "0")}`,
    [protocolNumber]
  );

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

  const navigateToProtocol = (num: number) => {
    const safeNum = num < 1 ? 1 : num;
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("protocol", safeNum.toString().padStart(2, "0"));
    router.push(`/projects/${projectId}?${params.toString()}`);
    setProtocolMenuOpen(false);
  };

  return (
    <div className="w-full" style={{ backgroundColor: cream }}>
      {/* שורה עליונה: כותרת במרכז + כפתור פרוטוקול משמאל */}
      <div className="w-full pt-6 px-4 relative flex items-center justify-center">
        <h1 className="text-4xl font-bold text-black text-center">{project.name}</h1>
        {/* כפתור פרוטוקול משמאל לכותרת */}
        <div className="absolute left-4 flex flex-col items-start">
          <div className="relative">
            <button
              type="button"
              onClick={() => setProtocolMenuOpen((prev) => !prev)}
              className="rounded-2xl border-2 border-black bg-transparent text-black text-sm font-medium px-4 py-1.5 hover:bg-black/5 transition-colors"
            >
              {protocolLabel}
            </button>
            {protocolMenuOpen && (
              <div className="absolute top-full mt-2 w-full rounded-2xl border-2 border-black bg-white shadow-lg py-1 z-10">
                {/* רשימת כל הפרוטוקולים הקיימים לפרויקט – מהראשון עד הנוכחי */}
                {Array.from({ length: protocolNumber }, (_, idx) => idx + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => navigateToProtocol(num)}
                    className={`w-full text-right px-3 py-1.5 text-sm hover:bg-black/5 text-black ${
                      num === protocolNumber ? "font-semibold" : ""
                    }`}
                  >
                    {`פרוטוקול ${num.toString().padStart(2, "0")}`}
                  </button>
                ))}
                <div className="border-t border-black/10 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => navigateToProtocol(protocolNumber + 1)}
                    className="w-full text-right px-3 py-2 text-sm hover:bg-black/5 text-black"
                  >
                    פרוטוקול חדש
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
