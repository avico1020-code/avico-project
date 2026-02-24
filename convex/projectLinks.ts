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
      .query("projectLinks")
      .withIndex("by_project_id", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    url: v.string(),
  },
  handler: async (ctx, { projectId, name, url }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const project = await ctx.db.get(projectId);
    if (!project || project.clerkId !== identity.subject) {
      throw new Error("Project not found or access denied");
    }
    const trimmedUrl = url.trim();
    if (!trimmedUrl) throw new Error("קישור חובה");
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      throw new Error("יש להזין קישור תקין (מתחיל ב-http או https)");
    }
    return await ctx.db.insert("projectLinks", {
      projectId,
      name: name.trim() || trimmedUrl,
      url: trimmedUrl,
      clerkId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("projectLinks") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const link = await ctx.db.get(id);
    if (!link || link.clerkId !== identity.subject) {
      throw new Error("Link not found or access denied");
    }
    await ctx.db.delete(id);
  },
});
