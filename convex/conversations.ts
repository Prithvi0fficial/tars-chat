import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// create conversation
export const createConversation = mutation({
  args: {
    memberIds: v.array(v.id("users")),
  },

  handler: async (ctx, args) => {
    const sortedMembers = [...args.memberIds].sort();

    const conversations = await ctx.db.query("conversations").collect();

    const existing = conversations.find(c => {
      if (c.memberIds.length !== sortedMembers.length) return false;
      return [...c.memberIds].sort().every((id, i) => id === sortedMembers[i]);
    });

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      memberIds: sortedMembers,
      isGroup: sortedMembers.length > 2,
    });
  },
});
// get conversations
export const getConversations = query({
  args: { userId: v.id("users") },

  handler: async (ctx, args) => {
    const conversations = await ctx.db.query("conversations").collect();

    return conversations.filter(c =>
      c.memberIds.includes(args.userId)
    );
  },
});
