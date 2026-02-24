"use client";

import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { ProjectContactsContent } from "@/components/ProjectContactsContent";

const cream = "#FFFDF7";
const btnClass =
  "rounded-2xl border-2 border-black bg-transparent text-black font-medium px-4 py-2.5 hover:bg-black/5 transition-colors inline-flex w-full justify-center whitespace-nowrap";

const TABS = [
  { id: "arrangements", label: "הסדרים לפרויקט" },
  { id: "calendar", label: "יומן פרויקט" },
  { id: "contacts", label: "אנשי קשר" },
  { id: "other", label: "אחר" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface ProjectNavAndContentProps {
  projectId: Id<"projects">;
}

export function ProjectNavAndContent({ projectId }: ProjectNavAndContentProps) {
  const [selectedTab, setSelectedTab] = useState<TabId | null>(null);

  return (
    <div className="mt-4 flex flex-row gap-4 w-full min-h-[calc(100vh-14rem)] pr-[calc(30vw+2rem)]">
      {/* ארבעה כפתורים בפריסה אנכית – צמודים לחלוניות (ראשון ב-DOM = ימין ב-RTL) */}
      <div className="flex flex-col gap-2 shrink-0 w-[11rem]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedTab(tab.id)}
            className={`${btnClass} ${selectedTab === tab.id ? "bg-black/10 ring-2 ring-black" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* שטח תוכן – כל השטח הפנוי משמאל, בלי מסגרת */}
      <div
        className="flex-1 min-w-0 min-h-0 p-6 flex flex-col items-start justify-start"
        style={{ backgroundColor: cream }}
        aria-live="polite"
      >
        {selectedTab === "contacts" ? (
          <ProjectContactsContent projectId={projectId} />
        ) : selectedTab ? (
          <p className="text-black/80 text-lg text-center w-full text-center">
            {TABS.find((t) => t.id === selectedTab)?.label} – תוכן יתווסף בהמשך
          </p>
        ) : (
          <p className="text-black/60 text-center w-full text-center">
            בחר אחד מהכפתורים להצגת התוכן
          </p>
        )}
      </div>
    </div>
  );
}
