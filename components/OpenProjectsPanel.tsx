"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useOpenProjects } from "@/components/OpenProjectsContext";

const cream = "#FFFDF7";
const STATUS_OPTIONS = [
  "משימות",
  "ממתין לוועדה",
  "תיקונים לאחר וועדה",
  "התקבל פרוטוקול",
] as const;

function formatStatusDate(ts: number): string {
  return new Date(ts).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function OpenProjectsPanel() {
  const router = useRouter();
  const { openIds, removeOpen } = useOpenProjects();
  const projects = useQuery(api.projects.list);
  const openProjects = projects
    ? projects.filter((p) => openIds.includes(p._id))
    : [];

  const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects"> | null>(null);
  const selectedProject = selectedProjectId
    ? openProjects.find((p) => p._id === selectedProjectId) ?? null
    : null;

  const statusEntries = useQuery(
    api.projectStatus.listByProject,
    selectedProjectId ? { projectId: selectedProjectId } : "skip"
  );
  const addStatusEntry = useMutation(api.projectStatus.add);
  const updateStatusEntry = useMutation(api.projectStatus.update);
  const removeStatusEntry = useMutation(api.projectStatus.remove);

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<Id<"projectStatusEntries"> | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const handleSaveStatus = async () => {
    if (!selectedProjectId || !selectedStatus) return;
    const trimmed = statusText.trim();
    if (!trimmed) return;
    setSavingStatus(true);
    try {
      await addStatusEntry({
        projectId: selectedProjectId,
        status: selectedStatus,
        text: trimmed,
      });
      setStatusText("");
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <>
      <aside
        className="fixed right-4 top-[10.5rem] bottom-4 w-[30vw] min-w-[220px] max-w-[380px] rounded-2xl border-2 border-black p-5 flex flex-col overflow-hidden"
        style={{ backgroundColor: cream }}
        aria-label="פרויקטים פתוחים"
      >
        <div className="mb-4 flex flex-row items-center justify-between gap-2 shrink-0">
          <h2 className="text-xl font-semibold text-black">
            פרויקטים פתוחים
          </h2>
          <button
            type="button"
            className="rounded-2xl border-2 border-black bg-transparent text-black text-sm font-medium px-3 py-1.5 hover:bg-black/5 transition-colors"
          >
            סטטוס
          </button>
        </div>
        <div className="flex flex-col gap-2 overflow-auto">
          {openProjects.length === 0 ? (
            <p className="text-black/60 text-sm text-center py-2">אין פרויקטים פתוחים</p>
          ) : (
            openProjects.map((project) => {
              const isSelected = selectedProjectId === project._id;
              const latestStatus =
                isSelected && statusEntries && statusEntries.length > 0
                  ? statusEntries[0]
                  : null;

              const statusBgClass =
                latestStatus?.status === "משימות"
                  ? "bg-orange-200"
                  : latestStatus?.status === "ממתין לוועדה"
                    ? "bg-green-200"
                    : latestStatus?.status === "תיקונים לאחר וועדה"
                      ? "bg-red-300"
                      : latestStatus?.status === "התקבל פרוטוקול"
                        ? "bg-yellow-500"
                        : "";

              return (
                <button
                  key={project._id}
                  type="button"
                  onClick={() => {
                    setSelectedProjectId(project._id as Id<"projects">);
                    setStatusDropdownOpen(false);
                  }}
                  className="flex items-center justify-between gap-2 rounded-xl border border-black/30 px-3 py-2 bg-white/50 text-right"
                >
                  <div className="flex-1 min-w-0 flex flex-col items-start gap-0.5">
                    <span className="text-black font-semibold text-sm truncate w-full">
                      {project.name}
                    </span>
                    {project.coordinationNumber && (
                      <span className="text-sm font-semibold text-red-600 truncate w-full">
                        {project.coordinationNumber}
                      </span>
                    )}
                  </div>
                  {latestStatus && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium text-black ${statusBgClass} flex items-center justify-center`}
                    >
                      {latestStatus.status}
                    </span>
                  )}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOpen(project._id as Id<"projects">);
                      if (selectedProjectId === project._id) {
                        setSelectedProjectId(null);
                      }
                    }}
                    className="text-black/70 hover:text-black text-xs shrink-0 cursor-pointer"
                    aria-label="הסר מפרויקטים פתוחים"
                  >
                    ✕
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* חלונית פופ-אפ משמאל לחלונית פרויקטים פתוחים – סטטוס ויומן סטטוסים */}
      {selectedProject && (
        <div
          className="fixed top-[10.5rem] bottom-4 rounded-2xl border-2 border-black p-5 flex flex-col w-[28vw] min-w-[220px] max-w-[420px] bg-white/95"
          style={{ right: "calc(30vw + 2.5rem)" }}
          aria-label={`פופ-אפ עבור הפרויקט ${selectedProject.name}`}
        >
          <div className="flex flex-row items-center justify-between gap-2 mb-4">
            <div className="flex flex-col items-start gap-0.5">
              <h3 className="text-xl font-semibold text-black truncate max-w-full">
                {selectedProject.name}
              </h3>
              {selectedProject.coordinationNumber && (
                <span className="text-sm font-semibold text-red-600 truncate max-w-full">
                  {selectedProject.coordinationNumber}
                </span>
              )}
            </div>
            <div className="flex flex-row items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => router.push(`/projects/${selectedProject._id}`)}
                className="rounded-2xl border-2 border-black bg-transparent text-black text-sm font-medium px-3 py-1.5 hover:bg-black/5 transition-colors"
              >
                דף הפרויקט
              </button>
              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                className="text-black/70 hover:text-black text-sm shrink-0"
                aria-label="סגור פופ-אפ פרויקט"
              >
                ✕
              </button>
            </div>
          </div>

          {/* כפתור בחירת סטטוס + סרגל בחירה + כפתור עריכה לשדה הסטטוס */}
          <div className="mb-4 flex flex-row items-center gap-2">
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setStatusDropdownOpen((prev) => !prev)}
                className="w-full max-w-[12rem] rounded-2xl border-2 border-black bg-transparent text-black font-medium px-4 py-2.5 hover:bg-black/5 transition-colors text-right"
              >
                {selectedStatus ?? "בחר סטטוס"}
              </button>
            {statusDropdownOpen && (
              <div className="absolute top-full mt-2 w-full rounded-2xl border-2 border-black bg-white shadow-lg py-1 z-10">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(opt);
                      setStatusDropdownOpen(false);
                    }}
                    className="w-full text-right px-4 py-2 text-sm hover:bg-black/5 text-black"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
            </div>
            {/* כפתור עריכה לסטטוסים (לצד בחירת הסטטוס) */}
            <button
              type="button"
              onClick={() => setIsEditMode((prev) => !prev)}
              className="rounded-2xl border-2 border-black bg-transparent text-black text-sm font-medium px-3 py-2 hover:bg-black/5 transition-colors"
            >
              {isEditMode ? "סיום עריכת טקסט" : "עריכת טקסט"}
            </button>
          </div>

          {/* שדה טקסט + כפתור שמור אחרי בחירת סטטוס */}
          {selectedStatus && (
            <div className="mb-4 flex flex-col gap-2">
              <textarea
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                rows={3}
                className="w-full resize-y min-h-[3rem] rounded-xl border border-black/20 bg-white px-3 py-2 text-black/90 text-sm placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                dir="rtl"
                placeholder={`הזן הערה עבור סטטוס "${selectedStatus}"...`}
                aria-label="הערה לסטטוס"
              />
              <div className="flex flex-row justify-end">
                <button
                  type="button"
                  onClick={handleSaveStatus}
                  disabled={savingStatus || !statusText.trim()}
                  className="rounded-2xl border-2 border-black bg-black text-white font-medium px-4 py-2 hover:bg-black/90 disabled:opacity-60"
                >
                  {savingStatus ? "שומר..." : "שמור"}
                </button>
              </div>
            </div>
          )}

          {/* היסטוריית סטטוסים – מהחדש לישן */}
          <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-2 pt-1">
            {statusEntries && statusEntries.length > 0 ? (
              statusEntries.map((entry) => (
                <div
                  key={entry._id}
                  className="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm text-black flex flex-col gap-1"
                  dir="rtl"
                >
                  <div className="flex flex-row items-start justify-between gap-2">
                    <span className="font-semibold">
                      {formatStatusDate(entry.createdAt)}: {entry.status}
                    </span>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (
                            typeof window !== "undefined" &&
                            window.confirm("האם למחוק את רשומת הסטטוס?")
                          ) {
                            await removeStatusEntry({ id: entry._id });
                          }
                        }}
                        className="text-red-700 hover:text-red-900 text-xs shrink-0"
                      >
                        מחק
                      </button>
                    )}
                  </div>
                  {isEditMode && editingEntryId === entry._id ? (
                    <div className="flex flex-col gap-1">
                      <textarea
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        rows={2}
                        className="w-full resize-y min-h-[3rem] rounded-md border border-black/20 bg-white px-2 py-1 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-1 focus:ring-black/30"
                      />
                      <div className="flex flex-row gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEntryId(null);
                            setEditDraft("");
                          }}
                          className="text-black/70 hover:text-black text-xs px-2 py-1 rounded-md border border-black/20"
                        >
                          ביטול
                        </button>
                        <button
                          type="button"
                          disabled={!editDraft.trim()}
                          onClick={async () => {
                            await updateStatusEntry({ id: entry._id, text: editDraft });
                            setEditingEntryId(null);
                            setEditDraft("");
                          }}
                          className="text-white bg-black hover:bg-black/90 text-xs px-3 py-1 rounded-md disabled:opacity-60"
                        >
                          שמור
                        </button>
                      </div>
                    </div>
                  ) : isEditMode ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEntryId(entry._id);
                        setEditDraft(entry.text);
                      }}
                      className="text-black text-sm text-right leading-relaxed hover:bg-black/5 rounded-md px-1 py-0.5"
                    >
                      {entry.text}
                    </button>
                  ) : (
                    <p className="text-black text-sm leading-relaxed">{entry.text}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-black/60 text-sm">
                אין עדיין סטטוס לפרויקט זה. בחר סטטוס והוסף הערה למעלה.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
