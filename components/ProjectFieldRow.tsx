"use client";

import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

type FieldKey = "coordinationNumber" | "planNumber" | "quoteNumber";

const rowClass = "flex flex-row items-center gap-2 w-full flex-wrap";

interface ProjectFieldRowProps {
  projectId: Id<"projects">;
  label: string;
  fieldKey: FieldKey;
  initialValue?: string;
}

export function ProjectFieldRow({ projectId, label, fieldKey, initialValue }: ProjectFieldRowProps) {
  const [value, setValue] = useState(initialValue ?? "");
  const [lastSaved, setLastSaved] = useState(initialValue ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const updateFields = useMutation(api.projects.updateFields);

  const isDirty = value.trim() !== (lastSaved ?? "").trim();

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      await updateFields({
        id: projectId,
        coordinationNumber: fieldKey === "coordinationNumber" ? value : undefined,
        planNumber: fieldKey === "planNumber" ? value : undefined,
        quoteNumber: fieldKey === "quoteNumber" ? value : undefined,
      });
      setLastSaved(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "אירעה שגיאה");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={rowClass}>
      <Label htmlFor={fieldKey} className="text-black font-medium shrink-0 w-[7.5rem] text-right">
        {label}
      </Label>
      <Input
        id={fieldKey}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-2xl border-2 border-black bg-transparent text-black flex-1 min-w-0"
        dir="rtl"
      />
      <Button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className={`rounded-2xl border-2 border-black px-3 py-2 flex items-center justify-center shrink-0 ${
          isDirty
            ? "bg-orange-400 hover:bg-orange-500 text-black"
            : "bg-gray-300 hover:bg-gray-400 text-black"
        }`}
      >
        <Save className="w-4 h-4" aria-hidden />
        <span className="sr-only">שמור</span>
      </Button>
      {error && (
        <p className="text-red-600 text-sm w-full basis-full" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

