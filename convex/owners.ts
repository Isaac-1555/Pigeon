import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentOwner = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const owner = await ctx.db
      .query("owners")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    return owner;
  },
});

export const createOwner = mutation({
  args: {
    name: v.string(),
    senderEmail: v.optional(v.string()),
    businessName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existingOwner = await ctx.db
      .query("owners")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (existingOwner) {
      await ctx.db.patch(existingOwner._id, {
        name: args.name,
        senderEmail: args.senderEmail,
        businessName: args.businessName,
      });
      return existingOwner._id;
    }

    const ownerId = await ctx.db.insert("owners", {
      name: args.name,
      email: identity.email!,
      senderEmail: args.senderEmail,
      businessName: args.businessName,
      createdAt: Date.now(),
    });

    return ownerId;
  },
});

export const updateOwner = mutation({
  args: {
    name: v.optional(v.string()),
    senderEmail: v.optional(v.string()),
    businessName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const owner = await ctx.db
      .query("owners")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!owner) throw new Error("Owner not found");

    await ctx.db.patch(owner._id, args);
  },
});