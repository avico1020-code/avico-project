"use client";

/**
 * תכנון ההסדרים לפרויקט – תקף לכל הפרויקטים באפליקציה.
 * כל פרויקט מקבל את אותו ממשק (הסדרים, נקודות חשובות, צ'ק-ליסטים) והנתונים נשמרים לפי projectId.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { EditArrangementModal } from "@/components/EditArrangementModal";
import { Label } from "@/components/ui/label";

const ARRANGEMENT_OPTIONS = [
  "הריסה",
  "חפירה ודיפון",
  "בנייה",
  "חסימה הרמטית",
  "חסימת נתיב",
];

/** הסדרים שבהם מוצג צ'ק-ליסט השאלות (שערים, פריקה וטעינה, רדיוסים) */
const CHECKLIST_ARRANGEMENT_TYPES = ["הריסה", "חפירה ודיפון", "בנייה"] as const;

/** הסדרים שבהם מוצג צ'ק-ליסט חסימה (חסימה הרמטית, הרכבת עגורן, יציקת רפסודה) */
const CHECKLIST_ARRANGEMENT_TYPES_BLOCKAGE = ["חסימה הרמטית", "חסימת נתיב"] as const;

type ChecklistCategory = { title: string; questions: { key: string; text: string }[] };

/** קטגוריות ושאלות לצ'ק-ליסט ההסדר (הריסה, חפירה ודיפון, בנייה) */
const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  {
    title: "שערים",
    questions: [
      { key: "gates_1", text: "כמה שערים צריך?" },
      { key: "gates_2", text: "איזה כלים ייכנסו שם?" },
      { key: "gates_3", text: "איפה הכניסה הסופית לאתר?" },
      {
        key: "gates_4",
        text: "במידה וקיימים מכשולים האם יש צורך בהעתקה (חניות נכים, אוטותל, תמרורים, הטמעה של עמודי חשמל)?",
      },
    ],
  },
  {
    title: "פריקה וטעינה",
    questions: [
      { key: "unload_1", text: "באיזה חזית נדרש פריקה וטעינה?" },
      { key: "unload_2", text: "האם יש צורך במספר פריקות וטעינות?" },
      { key: "unload_3", text: "האם האורך מספיק?" },
      { key: "unload_4", text: "האם יש עמודי חשמל בצמוד לפ\"ט?" },
      { key: "unload_5", text: "האם רוחב הכביש מספיק?" },
      { key: "unload_6", text: "האם נדרש לכל השלבים?" },
      { key: "unload_7", text: "האם יש מכשולים בצמוד לפריקה וטעינה כמו עצים?" },
      { key: "unload_8", text: "האם יש צורך להעתיק תמרורים/חניות" },
      { key: "unload_9", text: "האם יש התנגשות עם הסדרים של אתר פעיל סמוך?" },
    ],
  },
  {
    title: "רדיוסים",
    questions: [
      { key: "radii_1", text: "האם יש מכשולים בכניסה/יציאה?" },
      { key: "radii_2", text: "האם נדרש לבצע אין עצירה?" },
      { key: "radii_3", text: "האם יש שינוי בסוג הכלים בין השערים?" },
    ],
  },
];

/** קטגוריות ושאלות לצ'ק-ליסט הסדרי חסימה – חסימה הרמטית (כותרת ראשונה: חסימה הרמטית) */
const CHECKLIST_CATEGORIES_BLOCKAGE_HERMETIC: ChecklistCategory[] = [
  {
    title: "חסימה הרמטית",
    questions: [
      { key: "block_herm_1", text: "באיזה רחוב?" },
      { key: "block_herm_2", text: "לטובת מה משמשת החסימה?" },
    ],
  },
  {
    title: "הרכבת/ פירוק עגורן",
    questions: [
      { key: "block_crane_1", text: "כמה טריילרים צפויים להגיע?" },
      { key: "block_crane_2", text: "מאיפה הכלים מגיעים?" },
      { key: "block_crane_3", text: "האם הכלים מצליחים לעבור ברחובות הסמוכים?" },
      { key: "block_crane_4", text: "כמה שעות נדרש?" },
      { key: "block_crane_5", text: "האם נדרש נוהל אדום לבן?" },
      { key: "block_crane_6", text: "מה רוחב המשאית מנוף כולל רגליים פתוחות?" },
    ],
  },
  {
    title: "יציקת רפסודה",
    questions: [
      { key: "block_raft_1", text: "כמה קו\"ב יוצקים?" },
      { key: "block_raft_2", text: "כמה מיקסרים צפויים להגיע?" },
      { key: "block_raft_3", text: "מאיפה הכלים מגיעים?" },
      { key: "block_raft_4", text: "האם הכלים מצליחים לעבור ברחובות הסמוכים?" },
      { key: "block_raft_5", text: "כמה שעות/ימים נדרש?" },
      { key: "block_raft_6", text: "האם נדרש נוהל אדום לבן?" },
    ],
  },
];

/** קטגוריות ושאלות לצ'ק-ליסט הסדרי חסימה – חסימת נתיב (כותרת ראשונה: חסימת נתיב) */
const CHECKLIST_CATEGORIES_BLOCKAGE_PATH: ChecklistCategory[] = [
  {
    title: "חסימת נתיב",
    questions: [
      { key: "block_herm_1", text: "באיזה רחוב?" },
      { key: "block_herm_2", text: "לטובת מה משמשת החסימה?" },
    ],
  },
  {
    title: "הרכבת/ פירוק עגורן",
    questions: [
      { key: "block_crane_1", text: "כמה טריילרים צפויים להגיע?" },
      { key: "block_crane_2", text: "מאיפה הכלים מגיעים?" },
      { key: "block_crane_3", text: "האם הכלים מצליחים לעבור ברחובות הסמוכים?" },
      { key: "block_crane_4", text: "כמה שעות נדרש?" },
      { key: "block_crane_5", text: "האם נדרש נוהל אדום לבן?" },
      { key: "block_crane_6", text: "מה רוחב המשאית מנוף כולל רגליים פתוחות?" },
    ],
  },
  {
    title: "יציקת רפסודה",
    questions: [
      { key: "block_raft_1", text: "כמה קו\"ב יוצקים?" },
      { key: "block_raft_2", text: "כמה מיקסרים צפויים להגיע?" },
      { key: "block_raft_3", text: "מאיפה הכלים מגיעים?" },
      { key: "block_raft_4", text: "האם הכלים מצליחים לעבור ברחובות הסמוכים?" },
      { key: "block_raft_5", text: "כמה שעות/ימים נדרש?" },
      { key: "block_raft_6", text: "האם נדרש נוהל אדום לבן?" },
    ],
  },
];

const btnClass =
  "rounded-2xl border-2 border-black bg-transparent text-black font-medium px-4 py-2.5 hover:bg-black/5 transition-colors inline-flex items-center gap-2";

interface ArrangementNotesPanelProps {
  arrangementId: Id<"projectArrangements">;
  arrangementType: string;
  initialNotes: string;
  onSaveNotes: (id: Id<"projectArrangements">, notes: string) => void;
}

function ArrangementNotesPanel({
  arrangementId,
  arrangementType,
  initialNotes,
  onSaveNotes,
}: ArrangementNotesPanelProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isEditMode, setIsEditMode] = useState(true);

  useEffect(() => {
    setNotes(initialNotes);
  }, [arrangementId, initialNotes]);

  const handleSave = () => {
    onSaveNotes(arrangementId, notes);
    setIsEditMode(false);
  };

  const handleSwitchToEdit = () => {
    setIsEditMode(true);
  };

  return (
    <div className="w-full mt-2 flex flex-col">
      <div className="h-[5rem] min-h-[5rem] flex flex-col rounded-2xl border border-black/20 bg-white overflow-hidden resize-y">
        <div className="shrink-0 flex flex-row items-center justify-between gap-3 p-4 pb-2">
          <h3 className="text-black font-semibold">נקודות חשובות</h3>
          {isEditMode ? (
            <Button
              type="button"
              onClick={handleSave}
              className="rounded-2xl border-2 border-black bg-black text-white font-medium px-5 py-2.5 hover:bg-black/90 shrink-0"
              aria-label="שמור הערות"
            >
              שמור
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSwitchToEdit}
              variant="ghost"
              className="rounded-2xl border-2 border-black bg-transparent text-black font-medium px-5 py-2.5 hover:bg-black/5 shrink-0"
              aria-label="ערוך הערות"
            >
              עריכה
            </Button>
          )}
        </div>
        <Label htmlFor="arrangement-notes" className="sr-only">
          נקודות חשובות להסדר
        </Label>
        <textarea
          id="arrangement-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          readOnly={!isEditMode}
          placeholder="רשמו כאן הערות לגבי ההסדר..."
          className="flex-1 min-h-0 w-full resize-none p-4 pt-0 text-black/90 text-sm placeholder:text-black/40 focus:outline-none focus:ring-0 border-0 bg-transparent disabled:bg-transparent disabled:cursor-default"
          dir="rtl"
          aria-label="נקודות חשובות להסדר"
        />
      </div>
    </div>
  );
}

interface ArrangementChecklistProps {
  arrangementId: Id<"projectArrangements">;
  categories: ChecklistCategory[];
  previousArrangementId?: Id<"projectArrangements"> | null;
  previousArrangementType?: string;
}

function ArrangementChecklist({
  arrangementId,
  categories,
  previousArrangementId,
  previousArrangementType,
}: ArrangementChecklistProps) {
  const answers = useQuery(api.arrangementChecklistAnswers.listByArrangement, { arrangementId });
  const setAnswerMutation = useMutation(api.arrangementChecklistAnswers.setAnswer);
  const copyFromArrangementMutation = useMutation(
    api.arrangementChecklistAnswers.copyFromArrangement
  );
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    setLocalValues({});
  }, [arrangementId]);

  const handleBlur = useCallback(
    (questionKey: string, value: string) => {
      setAnswerMutation({ arrangementId, questionKey, answer: value });
      setLocalValues((prev) => {
        const next = { ...prev };
        delete next[questionKey];
        return next;
      });
    },
    [arrangementId, setAnswerMutation]
  );

  const getValue = useCallback(
    (questionKey: string) => {
      if (localValues[questionKey] !== undefined) return localValues[questionKey];
      return answers?.[questionKey] ?? "";
    },
    [answers, localValues]
  );

  const handleCopyFromPrevious = useCallback(async () => {
    if (!previousArrangementId) return;
    setCopying(true);
    try {
      await copyFromArrangementMutation({
        fromArrangementId: previousArrangementId,
        toArrangementId: arrangementId,
      });
      setLocalValues({});
    } finally {
      setCopying(false);
    }
  }, [previousArrangementId, arrangementId, copyFromArrangementMutation]);

  return (
    <div className="w-full mt-4 flex flex-col gap-6">
      {previousArrangementId && (
        <div className="flex flex-row justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCopyFromPrevious}
            disabled={copying}
            className="rounded-2xl border-2 border-black bg-transparent text-black font-medium px-5 py-2.5 hover:bg-black/5"
            aria-label="העתק תשובות מההסדר הקודם"
          >
            {copying ? "מעתיק..." : `העתק תשובות מההסדר הקודם${previousArrangementType ? ` (${previousArrangementType})` : ""}`}
          </Button>
        </div>
      )}
      {categories.map((category) => (
        <section
          key={category.title}
          className="flex flex-col gap-3 rounded-2xl border border-black/20 bg-white p-4"
          aria-labelledby={`checklist-${category.title}`}
        >
          <h4
            id={`checklist-${category.title}`}
            className="text-black font-semibold text-lg shrink-0"
          >
            {category.title}
          </h4>
          <div className="flex flex-col gap-4">
            {category.questions.map((q) => (
              <div key={q.key} className="flex flex-col gap-1.5">
                <Label htmlFor={`checklist-${q.key}`} className="text-black/90 text-sm font-medium">
                  {q.text}
                </Label>
                <textarea
                  id={`checklist-${q.key}`}
                  value={getValue(q.key)}
                  onChange={(e) =>
                    setLocalValues((prev) => ({ ...prev, [q.key]: e.target.value }))
                  }
                  onBlur={(e) => handleBlur(q.key, e.target.value.trim())}
                  placeholder="הזן תשובה..."
                  rows={2}
                  className="min-h-[2.5rem] w-full resize-y rounded-xl border border-black/20 bg-white px-3 py-2 text-black/90 text-sm placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                  dir="rtl"
                  aria-label={q.text}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

interface ProjectArrangementsContentProps {
  projectId: Id<"projects">;
}

export function ProjectArrangementsContent({ projectId }: ProjectArrangementsContentProps) {
  const arrangements = useQuery(api.projectArrangements.listByProject, { projectId });
  const addArrangement = useMutation(api.projectArrangements.add);
  const removeArrangement = useMutation(api.projectArrangements.remove);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editingId, setEditingId] = useState<Id<"projectArrangements"> | null>(null);
  const [selectedArrangementId, setSelectedArrangementId] = useState<Id<"projectArrangements"> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateNotesMutation = useMutation(api.projectArrangements.updateNotes);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveNotes = useCallback(
    (id: Id<"projectArrangements">, notes: string) => {
      updateNotesMutation({ id, notes });
    },
    [updateNotesMutation]
  );

  return (
    <div className="w-full flex flex-col flex-1 min-h-0 items-start">
      {/* כפתור עריכת הסדרים – מדליק/מכבה מצב עריכה שבו מופיעים כפתורי עריכה ומחיקה מעל כל הסדר */}
      {arrangements && arrangements.length > 0 && (
        <div className="mb-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsEditingMode((prev) => !prev)}
            className="rounded-2xl border-2 border-black bg-transparent text-black font-medium px-5 py-2.5 hover:bg-black/5 transition-colors"
          >
            {isEditingMode ? "סיום עריכת הסדרים" : "עריכת הסדרים"}
          </Button>
        </div>
      )}

      {/* שורה: ההסדר הראשון שנוסף ראשון, אחריו בהמשך הטור, סרגל הבחירה תמיד בסוף הטור */}
      <div className="flex flex-row flex-wrap gap-3 items-center w-full shrink-0">
        {/* ההסדרים לפי סדר הוספה (ראשון שנוסף = ראשון ברשימה) */}
        {arrangements && arrangements.length > 0 && (
          <>
            {arrangements.map((arr) => (
              <div
                key={arr._id}
                className="group relative shrink-0"
              >
                {/* כפתור ההסדר – טקסט ממורכז, רוחב לפי התוכן */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedArrangementId(arr._id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedArrangementId(arr._id);
                    }
                  }}
                  className="rounded-2xl border-2 border-black bg-transparent text-black font-medium px-4 py-2.5 hover:bg-black/5 transition-colors cursor-pointer inline-flex justify-center items-center text-center min-w-0"
                  aria-label={`${arr.label ?? arr.type}, לחץ לצפייה בתוכן`}
                >
                  <span>{arr.label ?? arr.type}</span>
                </div>

                {/* כפתורי עריכה ומחיקה – מופיעים רק במצב עריכת הסדרים */}
                <div
                  className={`absolute top-0 end-0 -translate-y-1/2 translate-x-1/2 z-10 flex items-center gap-0.5 transition-opacity ${
                    isEditingMode ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                  }`}
                  aria-hidden
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(arr._id);
                    }}
                    className="p-1.5 rounded-lg border-2 border-black bg-[#FFFDF7] shadow hover:bg-black/10 text-black"
                    aria-label="ערוך כותרת ההסדר"
                  >
                    <Pencil className="w-4 h-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const confirmed = typeof window !== "undefined" && window.confirm(`האם למחוק את ההסדר "${arr.type}"?`);
                      if (confirmed) await removeArrangement({ id: arr._id });
                    }}
                    className="p-1.5 rounded-lg border-2 border-black bg-[#FFFDF7] shadow hover:bg-red-50 text-red-700"
                    aria-label="מחק הסדר"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* סרגל בחירה – תמיד בסוף הטור (משמאל בהסדרים ב-RTL) */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={btnClass}
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
            aria-label="הוסף הסדר לפרויקט"
          >
            הוסף הסדר
            <ChevronDown className="w-4 h-4" aria-hidden />
          </Button>
          {dropdownOpen && (
            <div
              className="absolute top-full mt-2 start-0 min-w-[12rem] rounded-2xl border-2 border-black bg-[#FFFDF7] shadow-lg py-2 z-10"
              role="listbox"
            >
              {ARRANGEMENT_OPTIONS.map((type) => (
                <button
                  key={type}
                  type="button"
                  role="option"
                  className="w-full text-right px-4 py-2 hover:bg-black/5 text-black font-medium"
                  onClick={async () => {
                    await addArrangement({ projectId, type });
                    setDropdownOpen(false);
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* חלונית "נקודות חשובות" – רק כחלק ממסך ההסדר (כשיש הסדר נבחר) */}
      {selectedArrangementId && arrangements && arrangements.length > 0 && (
        <>
          <ArrangementNotesPanel
            arrangementId={selectedArrangementId}
            arrangementType={arrangements.find((a) => a._id === selectedArrangementId)?.type ?? ""}
            initialNotes={arrangements.find((a) => a._id === selectedArrangementId)?.notes ?? ""}
            onSaveNotes={saveNotes}
          />
          {/* צ'ק-ליסט שאלות – להסדרים הריסה/חפירה ודיפון/בנייה או חסימה הרמטית/חסימת נתיב */}
          {(() => {
            const arrangementType =
              arrangements.find((a) => a._id === selectedArrangementId)?.type ?? "";
            const isFirstChecklist = CHECKLIST_ARRANGEMENT_TYPES.includes(
              arrangementType as (typeof CHECKLIST_ARRANGEMENT_TYPES)[number]
            );
            const categories = isFirstChecklist
              ? CHECKLIST_CATEGORIES
              : arrangementType === "חסימת נתיב"
                ? CHECKLIST_CATEGORIES_BLOCKAGE_PATH
                : arrangementType === "חסימה הרמטית"
                  ? CHECKLIST_CATEGORIES_BLOCKAGE_HERMETIC
                  : null;
            if (!categories) return null;
            const selectedIndex = arrangements.findIndex((a) => a._id === selectedArrangementId);
            const previousArr =
              selectedIndex > 0 ? arrangements[selectedIndex - 1] : null;
            return (
              <ArrangementChecklist
                arrangementId={selectedArrangementId}
                categories={categories}
                previousArrangementId={previousArr?._id ?? null}
                previousArrangementType={previousArr?.type}
              />
            );
          })()}
        </>
      )}

      <EditArrangementModal
        arrangementId={editingId}
        currentLabel={
          editingId && arrangements
            ? (
                arrangements.find((a) => a._id === editingId)?.label ??
                arrangements.find((a) => a._id === editingId)?.type ??
                ""
              )
            : ""
        }
        open={editingId !== null}
        onOpenChange={(open) => {
          if (!open) setEditingId(null);
        }}
      />
    </div>
  );
}
