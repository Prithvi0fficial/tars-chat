import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_message_user_emoji", (q) =>
        q
          .eq("messageId", args.messageId)
          .eq("userId", args.userId)
          .eq("emoji", args.emoji)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("reactions", {
        messageId: args.messageId,
        userId: args.userId,
        emoji: args.emoji,
      });
    }
  },
});

export const getReactionsByMessage = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) =>
        q.eq("messageId", args.messageId)
      )
      .collect();
  },
});