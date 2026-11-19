"use client";

import { useMutation, useQuery } from "convex/react";
import { type MouseEvent, useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const cream = "#FFFDF7";

const STATUS_OPTIONS = [
  "בשרטוט",
  "ממתין לאישור לקוח",
  "ממתין לוועדה",
  "סבב חתימות-אגף תנועה",
  "סבב חתימות-משטרה",
  "סבב חתימות-אופיר כהן",
  "פרוטוקול חתום",
  "לשבת עם שירן",
  "ממתין לארגון אתר",
] as const;

const SIGNATURE_ROUND_COLOR = "#7C3AED"; // סגול – לכל סבבי החתימות

const STATUS_COLORS: Record<string, string> = {
  בשרטוט: "#2563EB", // כחול
  "ממתין לאישור לקוח": "#EA580C", // כתום
  "ממתין לוועדה": "#16A34A", // ירוק
  "סבב חתימות-אגף תנועה": SIGNATURE_ROUND_COLOR,
  "סבב חתימות-משטרה": SIGNATURE_ROUND_COLOR,
  "סבב חתימות-אופיר כהן": SIGNATURE_ROUND_COLOR,
  "פרוטוקול חתום": "#CA8A04", // צהוב-זהב
  "לשבת עם שירן": "#6B7280", // אפור
  "ממתין לארגון אתר": "#DC2626", // אדום
};

function getStatusColor(status?: string): string | null {
  if (!status) return null;
  return STATUS_COLORS[status] ?? null;
}

type TaskItem = {
  _id: Id<"notebookTasks">;
  name: string;
  description: string;
  status?: string;
};

export function HomeSidePanel() {
  const tasks = useQuery(api.notebookTasks.listForUser, {});
  const addTask = useMutation(api.notebookTasks.add);
  const updateDescription = useMutation(api.notebookTasks.updateDescription);
  const updateStatus = useMutation(api.notebookTasks.updateStatus);

  const [popupOpen, setPopupOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [statusMenu, setStatusMenu] = useState<{
    taskId: Id<"notebookTasks">;
    left: number;
    top?: number;
    bottom?: number;
  } | null>(null);

  const [hoveredTask, setHoveredTask] = useState<{
    task: TaskItem;
    top: number;
  } | null>(null);

  const [statusesOverviewOpen, setStatusesOverviewOpen] = useState(false);

  // סנכרון משימה נבחרת אחרי עדכון מהשרת
  useEffect(() => {
    if (!selectedTask || !tasks) return;
    const fresh = tasks.find((t) => t._id === selectedTask._id);
    if (
      fresh &&
      (fresh.description !== selectedTask.description ||
        fresh.status !== selectedTask.status ||
        fresh.name !== selectedTask.name)
    ) {
      setSelectedTask(fresh);
    }
  }, [tasks, selectedTask]);

  const handleOpenPopup = () => {
    setSelectedTask(null);
    setStatusMenu(null);
    setStatusesOverviewOpen(false);
    setIsEditingDescription(false);
    setTaskName("");
    setTaskDescription("");
    setPopupOpen(true);
  };

  const handleToggleStatusesOverview = () => {
    setPopupOpen(false);
    setSelectedTask(null);
    setStatusMenu(null);
    setHoveredTask(null);
    setStatusesOverviewOpen((prev) => !prev);
  };

  const tasksByStatus = STATUS_OPTIONS.map((status) => ({
    status,
    color: getStatusColor(status),
    tasks: (tasks ?? []).filter((t) => t.status === status),
  })).filter((group) => group.tasks.length > 0);

  const tasksWithoutStatus = (tasks ?? []).filter((t) => !t.status);

  const handleClosePopup = () => {
    setPopupOpen(false);
    setTaskName("");
    setTaskDescription("");
  };

  const handleSave = async () => {
    const trimmedName = taskName.trim();
    const trimmedDescription = taskDescription.trim();
    if (!trimmedName || !trimmedDescription) return;

    setSaving(true);
    try {
      await addTask({ name: trimmedName, description: trimmedDescription });
      handleClosePopup();
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTask = (task: TaskItem) => {
    setPopupOpen(false);
    setStatusesOverviewOpen(false);
    setHoveredTask(null);
    setStatusMenu(null);
    setIsEditingDescription(false);
    setEditDraft("");
    setSelectedTask(task);
  };

  const handleStartEdit = () => {
    if (!selectedTask) return;
    setEditDraft(selectedTask.description);
    setIsEditingDescription(true);
  };

  const handleCancelEdit = () => {
    setIsEditingDescription(false);
    setEditDraft("");
  };

  const handleSaveEdit = async () => {
    if (!selectedTask) return;
    const trimmed = editDraft.trim();
    if (!trimmed) return;

    setSavingEdit(true);
    try {
      await updateDescription({
        id: selectedTask._id,
        description: trimmed,
      });
      setSelectedTask({ ...selectedTask, description: trimmed });
      setIsEditingDescription(false);
      setEditDraft("");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCloseSelected = () => {
    setSelectedTask(null);
    setIsEditingDescription(false);
    setEditDraft("");
  };

  const handleToggleStatusMenu = (
    e: MouseEvent<HTMLButtonElement>,
    taskId: Id<"notebookTasks">
  ) => {
    e.stopPropagation();
    setHoveredTask(null);
    if (statusMenu?.taskId === taskId) {
      setStatusMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuEstimatedHeight = STATUS_OPTIONS.length * 40 + 16;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const openAbove = spaceBelow < menuEstimatedHeight;

    setStatusMenu({
      taskId,
      left: rect.left,
      ...(openAbove ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
    });
  };

  const handleSelectStatus = async (taskId: Id<"notebookTasks">, status: string) => {
    await updateStatus({ id: taskId, status });
    setStatusMenu(null);
  };

  return (
    <>
      <aside
        className="fixed right-4 top-[10.5rem] bottom-4 w-[30vw] min-w-[220px] max-w-[380px] rounded-2xl border-2 border-black p-5 flex flex-col overflow-hidden"
        style={{ backgroundColor: cream }}
        aria-label="מחברת"
      >
        <div className="mb-4 flex flex-row items-center justify-between gap-2 shrink-0">
          <h2 className="text-xl font-semibold text-black">מחברת</h2>
          <div className="flex flex-row items-center gap-2">
            <button
              type="button"
              onClick={handleToggleStatusesOverview}
              className={`rounded-2xl border-2 border-black text-sm font-medium px-3 py-1.5 transition-colors ${
                statusesOverviewOpen
                  ? "bg-black text-white"
                  : "bg-transparent text-black hover:bg-black/5"
              }`}
              aria-expanded={statusesOverviewOpen}
            >
              סטטוסים
            </button>
            <button
              type="button"
              onClick={handleOpenPopup}
              className="w-9 h-9 rounded-full border-2 border-black bg-transparent text-black text-xl font-semibold leading-none flex items-center justify-center hover:bg-black/5 transition-colors"
              aria-label="הוסף משימה"
              title="הוסף משימה"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2 overflow-auto">
          {tasks === undefined ? (
            <p className="text-black/60 text-sm text-center py-2">טוען...</p>
          ) : tasks.length === 0 ? (
            <p className="text-black/60 text-sm text-center py-2">אין משימות עדיין</p>
          ) : (
            tasks.map((task) => {
              const isSelected = selectedTask?._id === task._id;
              const statusColor = getStatusColor(task.status);
              return (
                <div key={task._id} className="flex flex-row items-center gap-2" dir="rtl">
                  <button
                    type="button"
                    onClick={() => handleSelectTask(task)}
                    onMouseEnter={(e) => {
                      if (statusMenu) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredTask({
                        task,
                        top: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredTask(null)}
                    className={`flex-1 min-w-0 rounded-xl border px-3 py-2 text-right transition-colors ${
                      isSelected
                        ? "border-black bg-white"
                        : "border-black/30 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`משימה: ${task.name}`}
                  >
                    <span className="text-black font-semibold text-sm truncate block">
                      *{task.name}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleToggleStatusMenu(e, task._id)}
                    className="shrink-0 w-4 h-4 rounded-full border border-black/20 hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: statusColor ?? "transparent",
                    }}
                    aria-label={
                      task.status
                        ? `סטטוס: ${task.status}. לחץ לשינוי`
                        : `בחר סטטוס למשימה ${task.name}`
                    }
                    aria-expanded={statusMenu?.taskId === task._id}
                    title={task.status ?? "בחר סטטוס"}
                  />
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* תפריט סטטוס */}
      {statusMenu && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="סגור תפריט סטטוס"
            onClick={() => setStatusMenu(null)}
          />
          <div
            className="fixed z-50 min-w-[12rem] max-w-[16rem] max-h-[min(20rem,calc(100vh-1rem))] overflow-y-auto rounded-2xl border-2 border-black bg-white shadow-lg py-1"
            style={{
              top: statusMenu.top,
              bottom: statusMenu.bottom,
              left: Math.max(8, statusMenu.left - 40),
            }}
            role="listbox"
            aria-label="בחירת סטטוס משימה"
            dir="rtl"
          >
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={tasks?.find((t) => t._id === statusMenu.taskId)?.status === opt}
                onClick={() => handleSelectStatus(statusMenu.taskId, opt)}
                className="w-full flex flex-row items-center gap-2 text-right px-4 py-2 text-sm text-black hover:bg-black/5"
                dir="rtl"
              >
                <span
                  className="block w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                  style={{ backgroundColor: getStatusColor(opt) ?? "transparent" }}
                  aria-hidden="true"
                />
                <span>{opt}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* סקירת סטטוסים – משימות לפי סוג פעולה */}
      {statusesOverviewOpen && (
        <div
          className="fixed top-[10.5rem] bottom-4 z-20 w-[28vw] min-w-[240px] max-w-[380px] rounded-2xl border-2 border-black p-5 flex flex-col gap-3 bg-white/95 shadow-lg overflow-hidden"
          style={{ right: "calc(min(30vw, 380px) + 2rem)" }}
          aria-label="משימות לפי סטטוס"
          role="dialog"
        >
          <div className="flex flex-row items-center justify-between gap-2 shrink-0">
            <h3 className="text-xl font-semibold text-black">סטטוסים</h3>
            <button
              type="button"
              onClick={() => setStatusesOverviewOpen(false)}
              className="text-black/70 hover:text-black text-sm shrink-0"
              aria-label="סגור סטטוסים"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-4" dir="rtl">
            {tasksByStatus.length === 0 && tasksWithoutStatus.length === 0 ? (
              <p className="text-black/60 text-sm text-center py-2">אין עדיין משימות עם סטטוס</p>
            ) : (
              <>
                {tasksByStatus.map((group) => (
                  <section key={group.status} className="flex flex-col gap-2">
                    <div className="flex flex-row items-center gap-2">
                      <span
                        className="inline-block w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: group.color ?? "transparent" }}
                        aria-hidden="true"
                      />
                      <h4 className="text-sm font-semibold text-black">
                        {group.status}
                        <span className="text-black/50 font-normal"> ({group.tasks.length})</span>
                      </h4>
                    </div>
                    <ul className="flex flex-col gap-1.5 pr-1">
                      {group.tasks.map((task) => (
                        <li key={task._id}>
                          <button
                            type="button"
                            onClick={() => handleSelectTask(task)}
                            className="w-full text-right rounded-xl border border-black/20 bg-white/70 px-3 py-2 text-sm font-medium text-black hover:bg-white transition-colors"
                          >
                            *{task.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}

                {tasksWithoutStatus.length > 0 && (
                  <section className="flex flex-col gap-2">
                    <div className="flex flex-row items-center gap-2">
                      <span
                        className="inline-block w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 bg-transparent"
                        aria-hidden="true"
                      />
                      <h4 className="text-sm font-semibold text-black">
                        ללא סטטוס
                        <span className="text-black/50 font-normal">
                          {" "}
                          ({tasksWithoutStatus.length})
                        </span>
                      </h4>
                    </div>
                    <ul className="flex flex-col gap-1.5 pr-1">
                      {tasksWithoutStatus.map((task) => (
                        <li key={task._id}>
                          <button
                            type="button"
                            onClick={() => handleSelectTask(task)}
                            className="w-full text-right rounded-xl border border-black/20 bg-white/70 px-3 py-2 text-sm font-medium text-black hover:bg-white transition-colors"
                          >
                            *{task.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* תצוגה מהירה בריחוף */}
      {hoveredTask && !selectedTask && !popupOpen && !statusMenu && !statusesOverviewOpen && (
        <div
          className="fixed z-30 max-w-[280px] rounded-xl border-2 border-black bg-white px-3 py-2 shadow-lg pointer-events-none"
          style={{
            right: "calc(min(30vw, 380px) + 2.25rem)",
            top: hoveredTask.top,
          }}
          role="tooltip"
          dir="rtl"
        >
          <p className="text-black text-sm leading-relaxed whitespace-pre-wrap">
            {hoveredTask.task.description}
          </p>
          {hoveredTask.task.status && (
            <p className="mt-2 text-sm font-medium text-black/70 flex flex-row items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full border border-black/20 shrink-0"
                style={{
                  backgroundColor: getStatusColor(hoveredTask.task.status) ?? "transparent",
                }}
                aria-hidden="true"
              />
              {hoveredTask.task.status}
            </p>
          )}
        </div>
      )}

      {/* תצוגת תיאור בלחיצה + עריכה */}
      {selectedTask && (
        <div
          className="fixed top-[10.5rem] z-20 w-[28vw] min-w-[240px] max-w-[380px] rounded-2xl border-2 border-black p-5 flex flex-col gap-4 bg-white/95 shadow-lg"
          style={{ right: "calc(min(30vw, 380px) + 2rem)" }}
          aria-label={`תיאור המשימה ${selectedTask.name}`}
          role="dialog"
        >
          <div className="flex flex-row items-center justify-between gap-2">
            <h3 className="text-xl font-semibold text-black truncate" dir="rtl">
              *{selectedTask.name}
            </h3>
            <div className="flex flex-row items-center gap-2 shrink-0">
              {!isEditingDescription && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="rounded-2xl border-2 border-black bg-transparent text-black text-sm font-medium px-3 py-1.5 hover:bg-black/5 transition-colors"
                >
                  עריכת תיאור
                </button>
              )}
              <button
                type="button"
                onClick={handleCloseSelected}
                className="text-black/70 hover:text-black text-sm"
                aria-label="סגור תיאור משימה"
              >
                ✕
              </button>
            </div>
          </div>

          {isEditingDescription ? (
            <div className="flex flex-col gap-2" dir="rtl">
              <label htmlFor="notebook-edit-description" className="text-sm font-medium text-black">
                תיאור
              </label>
              <textarea
                id="notebook-edit-description"
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                rows={5}
                className="w-full resize-y min-h-[5rem] rounded-xl border border-black/20 bg-white px-3 py-2 text-black text-sm placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                autoFocus={true}
              />
              <div className="flex flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-2xl border-2 border-black bg-transparent text-black text-sm font-medium px-3 py-1.5 hover:bg-black/5"
                >
                  ביטול
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit || !editDraft.trim()}
                  className="rounded-2xl border-2 border-black bg-black text-white text-sm font-medium px-4 py-1.5 hover:bg-black/90 disabled:opacity-60"
                >
                  {savingEdit ? "שומר..." : "שמור"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2" dir="rtl">
              <p className="text-black text-sm leading-relaxed whitespace-pre-wrap">
                {selectedTask.description}
              </p>
              {selectedTask.status && (
                <p className="text-sm font-medium text-black/70 flex flex-row items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full border border-black/20 shrink-0"
                    style={{
                      backgroundColor: getStatusColor(selectedTask.status) ?? "transparent",
                    }}
                    aria-hidden="true"
                  />
                  {selectedTask.status}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {popupOpen && (
        <div
          className="fixed top-[10.5rem] z-20 w-[28vw] min-w-[240px] max-w-[380px] rounded-2xl border-2 border-black p-5 flex flex-col gap-4 bg-white/95 shadow-lg"
          style={{ right: "calc(min(30vw, 380px) + 2rem)" }}
          aria-label="הוספת משימה חדשה"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex flex-row items-center justify-between gap-2">
            <h3 className="text-xl font-semibold text-black">משימה חדשה</h3>
            <button
              type="button"
              onClick={handleClosePopup}
              className="text-black/70 hover:text-black text-sm shrink-0"
              aria-label="סגור"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-1.5" dir="rtl">
            <label htmlFor="notebook-task-name" className="text-sm font-medium text-black">
              שם המשימה
            </label>
            <input
              id="notebook-task-name"
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full rounded-xl border border-black/20 bg-white px-3 py-2 text-black text-sm placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
              placeholder="לדוגמה: יהודה הלוי 74"
              autoFocus={true}
            />
          </div>

          <div className="flex flex-col gap-1.5" dir="rtl">
            <label htmlFor="notebook-task-description" className="text-sm font-medium text-black">
              תיאור
            </label>
            <textarea
              id="notebook-task-description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows={4}
              className="w-full resize-y min-h-[5rem] rounded-xl border border-black/20 bg-white px-3 py-2 text-black text-sm placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
              placeholder="לדוגמה: להוסיף הסדר חסימה ולשלוח ללקוח"
            />
          </div>

          <div className="flex flex-row justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !taskName.trim() || !taskDescription.trim()}
              className="rounded-2xl border-2 border-black bg-black text-white font-medium px-4 py-2 hover:bg-black/90 disabled:opacity-60"
            >
              {saving ? "שומר..." : "שמור"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
