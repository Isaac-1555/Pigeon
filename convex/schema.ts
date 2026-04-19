import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  owners: defineTable({
    name: v.string(),
    email: v.string(),
    senderEmail: v.optional(v.string()),
    businessName: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  processSteps: defineTable({
    ownerId: v.id("owners"),
    label: v.string(),
    order: v.number(),
  }).index("by_owner", ["ownerId"]),

  emailTemplates: defineTable({
    ownerId: v.id("owners"),
    stepId: v.string(),
    subject: v.string(),
    body: v.string(),
  }).index("by_owner", ["ownerId"]),

  customers: defineTable({
    ownerId: v.id("owners"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    product: v.string(),
    issue: v.string(),
    priority: v.optional(v.string()),
    currentStepId: v.optional(v.string()),
    estimatedDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerId"]),
});

export default schema;