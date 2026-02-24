import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// Create conversation
export const createConversation = mutation({

  args: {

    memberIds: v.array(v.id("users")),

  },

  handler: async (ctx, args) => {

    return await ctx.db.insert("conversations", {

      memberIds: args.memberIds,
      isGroup: false,

    });

  },

});



// Get conversations of user

export const getUserConversations = query({

  args: {

    userId: v.id("users"),

  },

  handler: async (ctx, args) => {

    return await ctx.db
      .query("conversations")
      .collect();

  },

});