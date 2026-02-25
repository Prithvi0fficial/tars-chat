// convex/users.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Store a user in the DB.
 * If the user already exists (by clerkId), returns existing user.
 * Otherwise, inserts a new user.
 */
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

    // Insert new user; `isOnline` will be set separately via setOnlineStatus
    return await ctx.db.insert("users", args);
  },
});

/**
 * Get all users from DB.
 * Used for listing users in the chat app.
 */
export const getUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

/**
 * Set a user's online/offline status.
 * This is separate from storeUser to avoid validation issues.
 */
export const setOnlineStatus = mutation(
  async (
    { db },
    { userId, isOnline }: { userId: string; isOnline: boolean }
  ) => {
    const user = await db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .first();

    if (!user) throw new Error("User not found");

    await db.patch(user._id, { isOnline });
  }
);