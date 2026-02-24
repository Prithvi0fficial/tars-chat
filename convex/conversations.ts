import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// create conversation
export const createConversation = mutation({

  args: {

    memberIds: v.array(v.id("users")),

  },

  handler: async (ctx, args) => {

    // check if conversation already exists

    const conversations = await ctx.db.query("conversations").collect();

    const existing = conversations.find(c =>

      c.memberIds.length === args.memberIds.length &&
      c.memberIds.every(id => args.memberIds.includes(id))

    );

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {

      memberIds: args.memberIds,
      isGroup: false,

    });

  },

});



// get conversations
export const getConversations = query({

  handler: async (ctx) => {

    return await ctx.db.query("conversations").collect();

  },

});