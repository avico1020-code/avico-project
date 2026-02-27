"use client";

import { useCallback, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";

function formatEntryDate(ts: number): string {
  return new Date(ts).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface ProjectJournalContentProps {
  projectId: Id<"projects">;
}

export function ProjectJournalContent({ projectId }: ProjectJournalContentProps) {
  const entries = useQuery(api.projectJournal.listByProject, { projectId });
  const addEntry = useMutation(api.projectJournal.add);
  const updateEntry = useMutation(api.projectJournal.update);
  const removeEntry = useMutation(api.projectJournal.remove);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<Id<"projectJournalEntries"> | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await addEntry({ projectId, text: trimmed });
      setText("");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = useCallback((entry: { _id: Id<"projectJournalEntries">; text: string }) => {
    setEditingId(entry._id);
    setEditDraft(entry.text);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft("");
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editingId) return;
    const trimmed = editDraft.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await updateEntry({ id: editingId, text: trimmed });
      setEditingId(null);
      setEditDraft("");
    } finally {
      setSaving(false);
    }
  }, [editingId, editDraft, updateEntry]);

  const handleDelete = useCallback(
    async (id: Id<"projectJournalEntries">) => {
      if (typeof window === "undefined" || !window.confirm("האם למחוק את הרשומה?")) return;
      await removeEntry({ id });
    },
    [removeEntry]
  );

  return (
    <div className="w-full flex flex-col gap-6 items-start">
      {/* חלונית עליונה – הזנת טקסט וכפתור שמור */}
      <section
        className="w-full rounded-2xl border border-black/20 bg-white p-4 flex flex-col gap-3"
        aria-labelledby="journal-new-entry"
      >
        <h2 id="journal-new-entry" className="text-black font-semibold text-lg shrink-0">
          רשומת יומן חדשה
        </h2>
        <Label htmlFor="journal-text" className="sr-only">
          הזן הערה ליומן
        </Label>
        <textarea
          id="journal-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="הזן כאן את ההערה..."
          rows={3}
          className="w-full resize-y min-h-[4rem] rounded-xl border border-black/20 bg-white px-3 py-2 text-black/90 text-sm placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
          dir="rtl"
          aria-label="הערה ליומן"
        />
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving || !text.trim()}
          className="rounded-2xl border-2 border-black bg-black text-white font-medium px-5 py-2.5 hover:bg-black/90 shrink-0 self-end"
          aria-label="שמור הערה"
        >
          {saving ? "שומר..." : "שמור"}
        </Button>
      </section>

      {/* רשימת ההערות – מהחדש לישן: תאריך : מלל; עריכה ומחיקה */}
      {entries && entries.length > 0 && (
        <section
          className="w-full flex flex-col gap-4"
          aria-label="הערות יומן"
        >
          {entries.map((entry) => (
            <div
              key={entry._id}
              className="w-full rounded-2xl border border-black/20 bg-white p-4 flex flex-col gap-2"
            >
              {editingId === entry._id ? (
                <>
                  <Label htmlFor={`journal-edit-${entry._id}`} className="sr-only">
                    ערוך רשומה
                  </Label>
                  <textarea
                    id={`journal-edit-${entry._id}`}
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    rows={3}
                    className="w-full resize-y min-h-[3rem] rounded-xl border border-black/20 bg-white px-3 py-2 text-black/90 text-base font-semibold placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                    dir="rtl"
                    aria-label="ערוך רשומה"
                  />
                  <div className="flex flex-row gap-2 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={cancelEdit}
                      className="rounded-2xl border-2 border-black/30 text-black font-medium px-4 py-2 hover:bg-black/5"
                    >
                      ביטול
                    </Button>
                    <Button
                      type="button"
                      onClick={saveEdit}
                      disabled={saving || !editDraft.trim()}
                      className="rounded-2xl border-2 border-black bg-black text-white font-medium px-4 py-2 hover:bg-black/90"
                    >
                      {saving ? "שומר..." : "שמור"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-row items-start justify-between gap-3">
                    <p
                      className="text-black text-base font-semibold leading-relaxed flex-1 min-w-0"
                      dir="rtl"
                    >
                      <span className="text-black/90 font-semibold">
                        {formatEntryDate(entry.createdAt)}:
                      </span>{" "}
                      {entry.text}
                    </p>
                    <div className="flex flex-row gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(entry)}
                        className="rounded-lg border border-black/30 hover:bg-black/10 text-black h-8 w-8"
                        aria-label="ערוך רשומה"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(entry._id)}
                        className="rounded-lg border border-black/30 hover:bg-red-50 text-red-700 h-8 w-8"
                        aria-label="מחק רשומה"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </section>
      )}

      {entries && entries.length === 0 && (
        <p className="text-black/60 text-sm">אין עדיין רשומות ביומן. הוסף הערה למעלה.</p>
      )}
    </div>
  );
}
