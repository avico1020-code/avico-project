"use client";

import { useEffect, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const cream = "#FFFDF7";
const btnClass =
  "rounded-2xl border-2 border-black bg-transparent text-black font-medium px-5 py-2.5 hover:bg-black/5 transition-colors";

interface EditArrangementModalProps {
  arrangementId: Id<"projectArrangements"> | null;
  currentLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditArrangementModal({
  arrangementId,
  currentLabel,
  open,
  onOpenChange,
}: EditArrangementModalProps) {
  const updateArrangement = useMutation(api.projectArrangements.update);
  const [label, setLabel] = useState(currentLabel);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setLabel(currentLabel);
      setError("");
    }
  }, [open, currentLabel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arrangementId) return;
    setError("");
    setSaving(true);
    try {
      await updateArrangement({ id: arrangementId, label });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "אירעה שגיאה");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="rounded-2xl border-2 border-black gap-6 max-w-md"
        style={{ backgroundColor: cream }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-black text-center">
            ערוך כותרת ההסדר
          </DialogTitle>
          <p className="text-black/70 text-sm text-center">
            שינוי הכותרת לא משפיע על תוכן ההסדר
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-right">
            <span className="text-black font-medium text-sm">שם הכפתור</span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="rounded-2xl border-2 border-black bg-white text-black font-medium px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20"
              dir="rtl"
              placeholder="לדוגמה: הריסה א'"
            />
          </label>
          {error && (
            <p className="text-red-600 text-sm" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={saving} className={btnClass} variant="ghost">
            {saving ? "שומר..." : "שמור"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
