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
      .query("projectContacts")
      .withIndex("by_project_id", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    phone: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { projectId, name, phone, email }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project || project.clerkId !== identity.subject) {
      throw new Error("Project not found or access denied");
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      throw new Error("שם איש קשר הוא שדה חובה");
    }

    return await ctx.db.insert("projectContacts", {
      projectId,
      name: trimmedName,
      phone: trimmedPhone,
      email: trimmedEmail,
      clerkId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projectContacts"),
    name: v.string(),
    phone: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { id, name, phone, email }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const contact = await ctx.db.get(id);
    if (!contact || contact.clerkId !== identity.subject) {
      throw new Error("Contact not found or access denied");
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      throw new Error("שם איש קשר הוא שדה חובה");
    }

    await ctx.db.patch(id, {
      name: trimmedName,
      phone: trimmedPhone,
      email: trimmedEmail,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("projectContacts") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const contact = await ctx.db.get(id);
    if (!contact || contact.clerkId !== identity.subject) {
      throw new Error("Contact not found or access denied");
    }

    await ctx.db.delete(id);
  },
});


