import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    coordinationNumber: v.optional(v.string()),
    planNumber: v.optional(v.string()),
    quoteNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    if (!args.name.trim()) {
      throw new Error("שם הפרויקט חובה");
    }
    return await ctx.db.insert("projects", {
      name: args.name.trim(),
      coordinationNumber: args.coordinationNumber?.trim() || undefined,
      planNumber: args.planNumber?.trim() || undefined,
      quoteNumber: args.quoteNumber?.trim() || undefined,
      clerkId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    return await ctx.db
      .query("projects")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const project = await ctx.db.get(id);
    if (!project || project.clerkId !== identity.subject) {
      return null;
    }
    return project;
  },
});

export const updateFields = mutation({
  args: {
    id: v.id("projects"),
    coordinationNumber: v.optional(v.string()),
    planNumber: v.optional(v.string()),
    quoteNumber: v.optional(v.string()),
  },
  handler: async (ctx, { id, coordinationNumber, planNumber, quoteNumber }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const project = await ctx.db.get(id);
    if (!project || project.clerkId !== identity.subject) {
      throw new Error("Project not found or access denied");
    }

    const patch: Record<string, string | undefined> = {};
    if (coordinationNumber !== undefined) {
      patch.coordinationNumber = coordinationNumber.trim() || undefined;
    }
    if (planNumber !== undefined) {
      patch.planNumber = planNumber.trim() || undefined;
    }
    if (quoteNumber !== undefined) {
      patch.quoteNumber = quoteNumber.trim() || undefined;
    }

    if (Object.keys(patch).length === 0) return;

    await ctx.db.patch(id, patch);
  },
});

export const updateDescription = mutation({
  args: { id: v.id("projects"), description: v.optional(v.string()) },
  handler: async (ctx, { id, description }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const project = await ctx.db.get(id);
    if (!project || project.clerkId !== identity.subject) {
      throw new Error("Project not found or access denied");
    }
    await ctx.db.patch(id, {
      description: description === undefined ? undefined : description.trim() || undefined,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const project = await ctx.db.get(id);
    if (!project || project.clerkId !== identity.subject) {
      throw new Error("Project not found or access denied");
    }
    await ctx.db.delete(id);
  },
});
