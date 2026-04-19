import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSteps = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const owner = await ctx.db
      .query("owners")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!owner) return [];

    return await ctx.db
      .query("processSteps")
      .withIndex("by_owner", (q) => q.eq("ownerId", owner._id))
      .collect();
  },
});

export const addStep = mutation({
  args: {
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const owner = await ctx.db
      .query("owners")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!owner) throw new Error("Owner not found");

    const existingSteps = await ctx.db
      .query("processSteps")
      .withIndex("by_owner", (q) => q.eq("ownerId", owner._id))
      .collect();

    const stepId = await ctx.db.insert("processSteps", {
      ownerId: owner._id,
      label: args.label,
      order: existingSteps.length,
    });

    return stepId;
  },
});

export const updateStep = mutation({
  args: {
    stepId: v.id("processSteps"),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.db.patch(args.stepId, { label: args.label });
  },
});

export const deleteStep = mutation({
  args: {
    stepId: v.id("processSteps"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.db.delete(args.stepId);
  },
});

export const reorderSteps = mutation({
  args: {
    stepIds: v.array(v.id("processSteps")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    for (let i = 0; i < args.stepIds.length; i++) {
      await ctx.db.patch(args.stepIds[i], { order: i });
    }
  },
});