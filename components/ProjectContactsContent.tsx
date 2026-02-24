"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { AddContactModal } from "@/components/AddContactModal";

interface ProjectContactsContentProps {
  projectId: Id<"projects">;
}

export function ProjectContactsContent({ projectId }: ProjectContactsContentProps) {
  const contacts = useQuery(api.projectContacts.listByProject, { projectId });
  const removeContact = useMutation(api.projectContacts.remove);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"projectContacts"> | null>(null);

  return (
    <div className="w-full flex flex-col gap-4 items-start">
      {/* כפתור הוסף איש קשר */}
      {contacts && contacts.length > 0 ? null : (
        <Button
          type="button"
          onClick={() => {
            setEditingId(null);
            setOpen(true);
          }}
          className="rounded-2xl border-2 border-black bg-transparent text-black font-medium px-5 py-2.5 hover:bg-black/5 transition-colors"
          variant="ghost"
        >
          הוסף איש קשר
        </Button>
      )}

      {/* רשימת אנשי קשר בפריסה טורית – רק ערכים, ברורים וקריאים */}
      {contacts && contacts.length > 0 && (
        <div className="flex flex-col gap-3 w-full text-base text-black font-semibold">
          {contacts.map((contact) => (
            <div
              key={contact._id}
              className="flex flex-row flex-wrap gap-6 items-center"
            >
              {contact.name && <span>{contact.name}</span>}
              {contact.phone && <span>{contact.phone}</span>}
              {contact.email && <span>{contact.email}</span>}
              <div className="flex flex-row gap-2 ml-auto">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="rounded-2xl border-2 border-black bg-transparent text-black px-3 py-1 hover:bg-black/5"
                  onClick={() => {
                    setEditingId(contact._id);
                    setOpen(true);
                  }}
                >
                  עריכה
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="rounded-2xl border-2 border-black bg-transparent text-red-700 px-3 py-1 hover:bg-red-50"
                  onClick={async () => {
                    await removeContact({ id: contact._id });
                  }}
                >
                  מחק
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* כפתור הוסף איש קשר לאחר שקיימים פריטים – שורה מתחת לרשימה */}
      {contacts && contacts.length > 0 && (
        <Button
          type="button"
          onClick={() => {
            setEditingId(null);
            setOpen(true);
          }}
          className="rounded-2xl border-2 border-black bg-transparent text-black font-medium px-5 py-2.5 hover:bg-black/5 transition-colors"
          variant="ghost"
        >
          הוסף איש קשר
        </Button>
      )}

      <AddContactModal
        projectId={projectId}
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setEditingId(null);
          }
          setOpen(next);
        }}
        contact={
          editingId && contacts
            ? (contacts.find((c) => c._id === editingId) ?? null)
            : null
        }
      />
    </div>
  );
}

