import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("projectOpenProjects")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project || project.clerkId !== identity.subject) {
      throw new Error("Project not found or access denied");
    }

    const existing = await ctx.db
      .query("projectOpenProjects")
      .withIndex("by_clerk_project", (q) =>
        q.eq("clerkId", identity.subject).eq("projectId", projectId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("projectOpenProjects", {
      projectId,
      clerkId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("projectOpenProjects")
      .withIndex("by_clerk_project", (q) =>
        q.eq("clerkId", identity.subject).eq("projectId", projectId)
      )
      .first();

    if (!existing) return;

    await ctx.db.delete(existing._id);
  },
});

