"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const cream = "#FFFDF7";
const btnClass =
  "rounded-2xl border-2 border-black bg-transparent text-black font-medium px-5 py-2.5 hover:bg-black/5 transition-colors";

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProjectModal({ open, onOpenChange }: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [coordinationNumber, setCoordinationNumber] = useState("");
  const [planNumber, setPlanNumber] = useState("");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const createProject = useMutation(api.projects.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("שם הפרויקט חובה");
      return;
    }
    setSaving(true);
    try {
      await createProject({
        name: name.trim(),
        coordinationNumber: coordinationNumber.trim() || undefined,
        planNumber: planNumber.trim() || undefined,
        quoteNumber: quoteNumber.trim() || undefined,
      });
      setName("");
      setCoordinationNumber("");
      setPlanNumber("");
      setQuoteNumber("");
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
            פרויקט חדש
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name" className="text-black font-medium">
              שם הפרויקט <span className="text-red-600">*</span>
            </Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl border-2 border-black bg-transparent text-black"
              placeholder="שם הפרויקט"
              required
              dir="rtl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="coordination-number" className="text-black font-medium">
              מספר תיאום
            </Label>
            <Input
              id="coordination-number"
              value={coordinationNumber}
              onChange={(e) => setCoordinationNumber(e.target.value)}
              className="rounded-2xl border-2 border-black bg-transparent text-black"
              placeholder="מספר תיאום"
              dir="rtl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="plan-number" className="text-black font-medium">
              מספר תוכנית
            </Label>
            <Input
              id="plan-number"
              value={planNumber}
              onChange={(e) => setPlanNumber(e.target.value)}
              className="rounded-2xl border-2 border-black bg-transparent text-black"
              placeholder="מספר תוכנית"
              dir="rtl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="quote-number" className="text-black font-medium">
              מספר הצעת מחיר
            </Label>
            <Input
              id="quote-number"
              value={quoteNumber}
              onChange={(e) => setQuoteNumber(e.target.value)}
              className="rounded-2xl border-2 border-black bg-transparent text-black"
              placeholder="מספר הצעת מחיר"
              dir="rtl"
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm" role="alert">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={saving}
            className={btnClass}
          >
            {saving ? "שומר..." : "שמור"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
