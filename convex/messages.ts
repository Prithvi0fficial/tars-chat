// convex/messages.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";



/**
 * ✅ Send Message
 */
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

      seenBy: [args.senderId], // sender already seen

    });

  },

});





/**
 * ✅ Get Messages (WhatsApp style)
 */
export const getMessages = query({

  args: {

    conversationId: v.id("conversations"),

  },


  handler: async (ctx, args) => {


    return await ctx.db

      .query("messages")

      .withIndex(
        "by_conversation",
        q => q.eq("conversationId", args.conversationId)
      )

      .order("asc")

      .collect();

  },

});






/**
 * ✅ Mark as Seen (Blue tick)
 */
export const markAsSeen = mutation({

  args: {

    messageId: v.id("messages"),

    userId: v.id("users"),

  },


  handler: async (ctx, args) => {


    const message = await ctx.db.get(args.messageId);


    if (!message) return;


    if (message.seenBy?.includes(args.userId))
      return;



    await ctx.db.patch(args.messageId, {

      seenBy: [...(message.seenBy || []), args.userId],

    });

  },

});







/**
 * ✅ Delete message
 */
export const deleteMessage = mutation({

  args: {

    messageId: v.id("messages"),

  },


  handler: async (ctx, args) => {


    await ctx.db.patch(args.messageId, {

      body: "This message was deleted",

      isDeleted: true,

    });

  },

});