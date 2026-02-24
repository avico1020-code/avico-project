"use client";

import { useState } from "react";
import { NewProjectModal } from "@/components/NewProjectModal";

const btnClass =
  "rounded-2xl border-2 border-black bg-transparent text-black font-medium px-5 py-2.5 hover:bg-black/5 transition-colors inline-flex items-center gap-2";

export function NewProjectTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={btnClass}
      >
        פרויקט חדש
      </button>
      <NewProjectModal open={open} onOpenChange={setOpen} />
    </>
  );
}
