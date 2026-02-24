"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Id } from "@/convex/_generated/dataModel";

type OpenProjectsContextValue = {
  openIds: Id<"projects">[];
  addOpen: (id: Id<"projects">) => void;
  removeOpen: (id: Id<"projects">) => void;
};

const OpenProjectsContext = createContext<OpenProjectsContextValue | null>(null);

export function OpenProjectsProvider({ children }: { children: ReactNode }) {
  const [openIds, setOpenIds] = useState<Id<"projects">[]>([]);

  const addOpen = useCallback((id: Id<"projects">) => {
    setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeOpen = useCallback((id: Id<"projects">) => {
    setOpenIds((prev) => prev.filter((x) => x !== id));
  }, []);

  return (
    <OpenProjectsContext.Provider value={{ openIds, addOpen, removeOpen }}>
      {children}
    </OpenProjectsContext.Provider>
  );
}

export function useOpenProjects() {
  const ctx = useContext(OpenProjectsContext);
  if (!ctx) {
    throw new Error("useOpenProjects must be used within OpenProjectsProvider");
  }
  return ctx;
}
