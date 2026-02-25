// convex/users.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// ✅ Store user safely
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
      .withIndex("by_clerkId", q => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {

      // update latest info
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        image: args.image,
      });

      return existingUser._id;
    }


    // create new user
    return await ctx.db.insert("users", {
      ...args,
      isOnline: true,
      isTyping: false,
    });

  },
});



/**
 * ✅ Get all users
 */
export const getUsers = query({

  handler: async (ctx) => {

    return await ctx.db
      .query("users")
      .collect();

  },

});



/**
 * ✅ PRODUCTION SAFE ONLINE STATUS
 * Never throws error
 */
export const setOnlineStatus = mutation({

  args: {
    userId: v.string(),
    isOnline: v.boolean(),
  },

  handler: async (ctx, args) => {

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", q => q.eq("clerkId", args.userId))
      .unique();


    // ✅ If user not exist → create safely
    if (!user) {

      await ctx.db.insert("users", {

        clerkId: args.userId,
        name: "User",
        email: "",
        image: "",
        isOnline: args.isOnline,
        isTyping: false,

      });

      return;

    }


    // ✅ Update existing user
    await ctx.db.patch(user._id, {

      isOnline: args.isOnline,

    });

  },

});



/**
 * ✅ Typing status safe
 */
export const setTypingStatus = mutation({

  args: {
    userId: v.string(),
    conversationId: v.id("conversations"),
    isTyping: v.boolean(),
  },

  handler: async (ctx, args) => {

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", q =>
        q.eq("clerkId", args.userId)
      )
      .first();

    if (!user) return; // production safe

    await ctx.db.patch(user._id, {
      isTyping: args.isTyping
    });

  },

});