import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const VALID_STATUSES = ["משימות", "ממתין לוועדה", "תיקונים לאחר וועדה", "התקבל פרוטוקול"] as const;

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const project = await ctx.db.get(projectId);
    if (!project || project.clerkId !== identity.subject) return [];

    return await ctx.db
      .query("projectStatusEntries")
      .withIndex("by_project_created", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    projectId: v.id("projects"),
    status: v.string(),
    text: v.string(),
  },
  handler: async (ctx, { projectId, status, text }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project || project.clerkId !== identity.subject) {
      throw new Error("Project not found or access denied");
    }

    if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      throw new Error("Invalid status value");
    }

    const trimmed = text.trim();
    if (!trimmed) throw new Error("הטקסט לא יכול להיות ריק");

    return await ctx.db.insert("projectStatusEntries", {
      projectId,
      status,
      text: trimmed,
      clerkId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projectStatusEntries"),
    text: v.string(),
  },
  handler: async (ctx, { id, text }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const entry = await ctx.db.get(id);
    if (!entry || entry.clerkId !== identity.subject) {
      throw new Error("Status entry not found or access denied");
    }

    const trimmed = text.trim();
    if (!trimmed) throw new Error("הטקסט לא יכול להיות ריק");

    await ctx.db.patch(id, { text: trimmed });
  },
});

export const remove = mutation({
  args: { id: v.id("projectStatusEntries") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const entry = await ctx.db.get(id);
    if (!entry || entry.clerkId !== identity.subject) {
      throw new Error("Status entry not found or access denied");
    }

    await ctx.db.delete(id);
  },
});

