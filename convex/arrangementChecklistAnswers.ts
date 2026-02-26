import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByArrangement = query({
  args: { arrangementId: v.id("projectArrangements") },
  handler: async (ctx, { arrangementId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return {};

    const arrangement = await ctx.db.get(arrangementId);
    if (!arrangement || arrangement.clerkId !== identity.subject) return {};

    const rows = await ctx.db
      .query("arrangementChecklistAnswers")
      .withIndex("by_arrangement_id", (q) => q.eq("arrangementId", arrangementId))
      .collect();

    return Object.fromEntries(rows.map((r) => [r.questionKey, r.answer]));
  },
});

export const setAnswer = mutation({
  args: {
    arrangementId: v.id("projectArrangements"),
    questionKey: v.string(),
    answer: v.string(),
  },
  handler: async (ctx, { arrangementId, questionKey, answer }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const arrangement = await ctx.db.get(arrangementId);
    if (!arrangement || arrangement.clerkId !== identity.subject) {
      throw new Error("Arrangement not found or access denied");
    }

    const existing = await ctx.db
      .query("arrangementChecklistAnswers")
      .withIndex("by_arrangement_and_question", (q) =>
        q.eq("arrangementId", arrangementId).eq("questionKey", questionKey)
      )
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { answer, clerkId: identity.subject, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("arrangementChecklistAnswers", {
      arrangementId,
      questionKey,
      answer,
      clerkId: identity.subject,
      updatedAt: now,
    });
  },
});

export const copyFromArrangement = mutation({
  args: {
    fromArrangementId: v.id("projectArrangements"),
    toArrangementId: v.id("projectArrangements"),
  },
  handler: async (ctx, { fromArrangementId, toArrangementId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const fromArr = await ctx.db.get(fromArrangementId);
    const toArr = await ctx.db.get(toArrangementId);
    if (
      !fromArr ||
      !toArr ||
      fromArr.clerkId !== identity.subject ||
      toArr.clerkId !== identity.subject
    ) {
      throw new Error("Arrangement not found or access denied");
    }

    const sourceRows = await ctx.db
      .query("arrangementChecklistAnswers")
      .withIndex("by_arrangement_id", (q) => q.eq("arrangementId", fromArrangementId))
      .collect();

    const now = Date.now();
    for (const row of sourceRows) {
      const existing = await ctx.db
        .query("arrangementChecklistAnswers")
        .withIndex("by_arrangement_and_question", (q) =>
          q.eq("arrangementId", toArrangementId).eq("questionKey", row.questionKey)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          answer: row.answer,
          clerkId: identity.subject,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("arrangementChecklistAnswers", {
          arrangementId: toArrangementId,
          questionKey: row.questionKey,
          answer: row.answer,
          clerkId: identity.subject,
          updatedAt: now,
        });
      }
    }
  },
});
