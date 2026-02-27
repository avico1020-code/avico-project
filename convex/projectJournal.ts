import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const project = await ctx.db.get(projectId);
    if (!project || project.clerkId !== identity.subject) return [];

    return await ctx.db
      .query("projectJournalEntries")
      .withIndex("by_project_created", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    projectId: v.id("projects"),
    text: v.string(),
  },
  handler: async (ctx, { projectId, text }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project || project.clerkId !== identity.subject) {
      throw new Error("Project not found or access denied");
    }

    const trimmed = text.trim();
    if (!trimmed) throw new Error("הטקסט לא יכול להיות ריק");

    return await ctx.db.insert("projectJournalEntries", {
      projectId,
      text: trimmed,
      clerkId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projectJournalEntries"),
    text: v.string(),
  },
  handler: async (ctx, { id, text }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const entry = await ctx.db.get(id);
    if (!entry || entry.clerkId !== identity.subject) {
      throw new Error("רשומה לא נמצאה או שאין הרשאה");
    }

    const trimmed = text.trim();
    if (!trimmed) throw new Error("הטקסט לא יכול להיות ריק");

    await ctx.db.patch(id, { text: trimmed });
  },
});

export const remove = mutation({
  args: { id: v.id("projectJournalEntries") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const entry = await ctx.db.get(id);
    if (!entry || entry.clerkId !== identity.subject) {
      throw new Error("רשומה לא נמצאה או שאין הרשאה");
    }

    await ctx.db.delete(id);
  },
});
