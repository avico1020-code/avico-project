"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type OpenProjectsContextValue = {
  openIds: Id<"projects">[];
  addOpen: (id: Id<"projects">) => Promise<void>;
  removeOpen: (id: Id<"projects">) => Promise<void>;
};

const OpenProjectsContext = createContext<OpenProjectsContextValue | null>(null);

export function OpenProjectsProvider({ children }: { children: ReactNode }) {
  const openProjects = useQuery(api.projectOpenProjects.listForUser, {});
  const addMutation = useMutation(api.projectOpenProjects.add);
  const removeMutation = useMutation(api.projectOpenProjects.remove);

  const openIds: Id<"projects">[] =
    openProjects?.map((row) => row.projectId as Id<"projects">) ?? [];

  const addOpen = useCallback(
    async (id: Id<"projects">) => {
      await addMutation({ projectId: id });
    },
    [addMutation]
  );

  const removeOpen = useCallback(
    async (id: Id<"projects">) => {
      await removeMutation({ projectId: id });
    },
    [removeMutation]
  );

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
