import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    coordinationNumber: v.optional(v.string()),
    planNumber: v.optional(v.string()),
    quoteNumber: v.optional(v.string()),
    description: v.optional(v.string()),
    clerkId: v.string(),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"]),

  projectLinks: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    url: v.string(),
    clerkId: v.string(),
    createdAt: v.number(),
  })
    .index("by_project_id", ["projectId"]),

  projectContacts: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    clerkId: v.string(),
    createdAt: v.number(),
  }).index("by_project_id", ["projectId"]),

  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    fullName: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),
});
