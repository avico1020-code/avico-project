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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const cream = "#FFFDF7";
const btnClass =
  "rounded-2xl border-2 border-black bg-transparent text-black font-medium px-5 py-2.5 hover:bg-black/5 transition-colors";

interface ContactForEdit {
  _id: Id<"projectContacts">;
  name: string;
  phone: string;
  email: string;
}

interface AddContactModalProps {
  projectId: Id<"projects">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: ContactForEdit | null;
}

export function AddContactModal({ projectId, open, onOpenChange, contact }: AddContactModalProps) {
  const [name, setName] = useState(contact?.name ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const createContact = useMutation(api.projectContacts.create);
  const updateContact = useMutation(api.projectContacts.update);

  // כאשר פותחים את החלונית במצב עריכה – נטען את הערכים הקיימים.
  // כאשר פותחים במצב הוספה – ננקה את השדות.
  useEffect(() => {
    if (open && contact) {
      setName(contact.name ?? "");
      setPhone(contact.phone ?? "");
      setEmail(contact.email ?? "");
    }
    if (open && !contact) {
      setName("");
      setPhone("");
      setEmail("");
    }
  }, [open, contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (contact) {
        await updateContact({
          id: contact._id,
          name,
          phone,
          email,
        });
      } else {
        await createContact({
          projectId,
          name,
          phone,
          email,
        });
      }
      setName("");
      setPhone("");
      setEmail("");
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
            {contact ? "ערוך איש קשר" : "הוסף איש קשר"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact-name" className="text-black font-medium">
              שם איש קשר <span className="text-red-600">*</span>
            </Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl border-2 border-black bg-transparent text-black"
              placeholder="ישראל ישראלי"
              dir="rtl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact-phone" className="text-black font-medium">
              טלפון
            </Label>
            <Input
              id="contact-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-2xl border-2 border-black bg-transparent text-black"
              placeholder="050-1234567"
              dir="rtl"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact-email" className="text-black font-medium">
              כתובת מייל
            </Label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl border-2 border-black bg-transparent text-black"
              placeholder="name@example.com"
              dir="ltr"
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

