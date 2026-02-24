"use client";

import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Save } from "lucide-react";

const cream = "#FFFDF7";
const btnClass =
  "rounded-2xl border-2 border-black bg-transparent text-black font-medium px-4 py-2 hover:bg-black/5 transition-colors inline-flex items-center gap-2";

interface ProjectSidePanelProps {
  projectId: Id<"projects">;
}

export function ProjectSidePanel({ projectId }: ProjectSidePanelProps) {
  const project = useQuery(api.projects.get, { id: projectId });
  const updateDescription = useMutation(api.projects.updateDescription);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const hasDescription = Boolean(project?.description?.trim());

  const handleStartAdd = () => {
    setDraft("");
    setIsEditing(true);
  };

  const handleStartEdit = () => {
    setDraft(project?.description ?? "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDescription({ id: projectId, description: draft.trim() || undefined });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDraft("");
  };

  return (
    <aside
      className="w-full h-[30vh] rounded-2xl border-2 border-black p-5 flex flex-col overflow-hidden shrink-0"
      style={{ backgroundColor: cream }}
      aria-label="תיאור הפרויקט"
    >
      <h2 className="text-xl font-semibold text-black mb-4 text-center shrink-0">
        תיאור הפרויקט
      </h2>

      {project === undefined ? (
        <p className="text-black/70 text-sm">טוען...</p>
      ) : !project ? null : isEditing ? (
        <div className="flex flex-col gap-2 flex-1 min-h-0">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="הוסף תיאור לפרויקט..."
            className="flex-1 min-h-[80px] w-full rounded-2xl border-2 border-black bg-transparent text-black px-3 py-2 text-sm resize-none"
            dir="rtl"
          />
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`${btnClass} px-3 py-2`}
            >
              <Save className="w-4 h-4" aria-hidden />
              {saving ? "שומר..." : "שמור"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={btnClass}
            >
              ביטול
            </button>
          </div>
        </div>
      ) : hasDescription ? (
        <>
          <p className="text-black/80 text-sm flex-1 overflow-auto whitespace-pre-wrap break-words">
            {project.description}
          </p>
          <button
            type="button"
            onClick={handleStartEdit}
            className={`${btnClass} shrink-0 mt-2`}
          >
            עריכה
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={handleStartAdd}
          className={`${btnClass} shrink-0`}
        >
          הוסף תיאור
        </button>
      )}
    </aside>
  );
}
