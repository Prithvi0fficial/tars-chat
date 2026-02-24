import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    body: v.string(),
  },

  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      body: args.body,
      createdAt: Date.now(),
      isDeleted: false,
    });
  },
});

// real time message
export const getMessages = query({
  args: { conversationId: v.id("conversations") },

  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", q =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
  },
});
//  Delete Message
export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },

  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      body: "This message was deleted",
      isDeleted: true,
    });
  },
});