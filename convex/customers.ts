import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCustomers = query({
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
      .query("customers")
      .withIndex("by_owner", (q) => q.eq("ownerId", owner._id))
      .collect();
  },
});

export const addCustomer = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    product: v.string(),
    issue: v.string(),
    priority: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const owner = await ctx.db
      .query("owners")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!owner) throw new Error("Owner not found");

    const customerId = await ctx.db.insert("customers", {
      ownerId: owner._id,
      name: args.name,
      email: args.email,
      phone: args.phone,
      product: args.product,
      issue: args.issue,
      priority: args.priority,
      currentStepId: undefined,
      estimatedDate: undefined,
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return customerId;
  },
});

export const updateCustomerStep = mutation({
  args: {
    customerId: v.id("customers"),
    stepId: v.optional(v.string()),
    estimatedDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.db.patch(args.customerId, {
      currentStepId: args.stepId,
      estimatedDate: args.estimatedDate,
      updatedAt: Date.now(),
    });
  },
});

export const deleteCustomer = mutation({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.db.delete(args.customerId);
  },
});