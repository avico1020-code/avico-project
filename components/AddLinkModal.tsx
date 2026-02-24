"use client";

import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
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

interface AddLinkModalProps {
  projectId: Id<"projects">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLinkModal({ projectId, open, onOpenChange }: AddLinkModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const createLink = useMutation(api.projectLinks.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createLink({
        projectId,
        name: name.trim() || url.trim(),
        url: url.trim(),
      });
      setName("");
      setUrl("");
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
            הוסף קישור
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-name" className="text-black font-medium">
              שם הקישור
            </Label>
            <Input
              id="link-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl border-2 border-black bg-transparent text-black"
              placeholder="שם להצגה"
              dir="rtl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-url" className="text-black font-medium">
              קישור <span className="text-red-600">*</span>
            </Label>
            <Input
              id="link-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rounded-2xl border-2 border-black bg-transparent text-black"
              placeholder="https://..."
              dir="ltr"
              required
            />
          </div>
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
