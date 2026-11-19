import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const NOTEBOOK_STATUS_OPTIONS = [
  "בשרטוט",
  "ממתין לאישור לקוח",
  "ממתין לוועדה",
  "סבב חתימות-אגף תנועה",
  "סבב חתימות-משטרה",
  "סבב חתימות-אופיר כהן",
  "פרוטוקול חתום",
  "לשבת עם שירן",
  "ממתין לארגון אתר",
] as const;

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("notebookTasks")
      .withIndex("by_clerk_created", (q) => q.eq("clerkId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx, { name, description }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const trimmedName = name.trim();
    if (!trimmedName) throw new Error("שם המשימה לא יכול להיות ריק");

    const trimmedDescription = description.trim();
    if (!trimmedDescription) throw new Error("תיאור המשימה לא יכול להיות ריק");

    return await ctx.db.insert("notebookTasks", {
      name: trimmedName,
      description: trimmedDescription,
      clerkId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const updateDescription = mutation({
  args: {
    id: v.id("notebookTasks"),
    description: v.string(),
  },
  handler: async (ctx, { id, description }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const task = await ctx.db.get(id);
    if (!task || task.clerkId !== identity.subject) {
      throw new Error("Task not found or access denied");
    }

    const trimmedDescription = description.trim();
    if (!trimmedDescription) throw new Error("תיאור המשימה לא יכול להיות ריק");

    await ctx.db.patch(id, { description: trimmedDescription });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("notebookTasks"),
    status: v.string(),
  },
  handler: async (ctx, { id, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const task = await ctx.db.get(id);
    if (!task || task.clerkId !== identity.subject) {
      throw new Error("Task not found or access denied");
    }

    if (!NOTEBOOK_STATUS_OPTIONS.includes(status as (typeof NOTEBOOK_STATUS_OPTIONS)[number])) {
      throw new Error("Invalid status value");
    }

    await ctx.db.patch(id, { status });
  },
});
