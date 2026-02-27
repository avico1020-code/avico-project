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
      .query("projectArrangements")
      .withIndex("by_project_id", (q) => q.eq("projectId", projectId))
      .order("asc")
      .collect();
  },
});

const VALID_TYPES = ["הריסה", "חפירה ודיפון", "בנייה", "חסימה הרמטית", "חסימת נתיב"];

export const add = mutation({
  args: {
    projectId: v.id("projects"),
    type: v.string(),
  },
  handler: async (ctx, { projectId, type }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project || project.clerkId !== identity.subject) {
      throw new Error("Project not found or access denied");
    }

    if (!VALID_TYPES.includes(type)) {
      throw new Error("Invalid arrangement type");
    }

    return await ctx.db.insert("projectArrangements", {
      projectId,
      type,
      label: type,
      clerkId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projectArrangements"),
    label: v.string(),
  },
  handler: async (ctx, { id, label }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const row = await ctx.db.get(id);
    if (!row || row.clerkId !== identity.subject) {
      throw new Error("Arrangement not found or access denied");
    }

    const trimmed = label.trim();
    if (!trimmed) {
      throw new Error("Label cannot be empty");
    }

    await ctx.db.patch(id, { label: trimmed });
  },
});

export const updateNotes = mutation({
  args: {
    id: v.id("projectArrangements"),
    notes: v.string(),
  },
  handler: async (ctx, { id, notes }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const row = await ctx.db.get(id);
    if (!row || row.clerkId !== identity.subject) {
      throw new Error("Arrangement not found or access denied");
    }

    await ctx.db.patch(id, { notes });
  },
});

export const remove = mutation({
  args: { id: v.id("projectArrangements") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const row = await ctx.db.get(id);
    if (!row || row.clerkId !== identity.subject) {
      throw new Error("Arrangement not found or access denied");
    }

    await ctx.db.delete(id);
  },
});
