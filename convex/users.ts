import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const storeUser = mutation({

  args: {

    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.string(),

  },

  handler: async (ctx, args) => {

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      return existingUser;
    }

    return await ctx.db.insert("users", args);

  },

});
export const getUsers = query({

  handler: async (ctx) => {

    return await ctx.db.query("users").collect();

  },

});