// convex/conversations.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";



/**
 * ✅ Create or return existing conversation
 */
export const createConversation = mutation({

  args: {
    memberIds: v.array(v.id("users")),
  },

  handler: async (ctx, args) => {

    const sortedMembers = [...args.memberIds].sort();


    const conversations = await ctx.db
      .query("conversations")
      .collect();


    const existing = conversations.find(c =>

      c.memberIds.length === sortedMembers.length &&

      [...c.memberIds]
        .sort()
        .every((id, i) => id === sortedMembers[i])

    );


    if (existing) return existing._id;


    return await ctx.db.insert("conversations", {

      memberIds: sortedMembers,

      isGroup: sortedMembers.length > 2,

    });

  },

});




/**
 * ✅ WhatsApp style chat list
 */
export const getConversations = query({

  args: {
    userId: v.id("users"),
  },


  handler: async (ctx, args) => {

    const conversations = await ctx.db
      .query("conversations")
      .collect();



    const results = await Promise.all(

      conversations

        .filter(c => c.memberIds.includes(args.userId))

        .map(async (conversation) => {


          // get other member
          const otherUserId = conversation.memberIds
            .find(id => id !== args.userId);


          const otherUser =
            otherUserId
              ? await ctx.db.get(otherUserId)
              : null;



          // get last message
          const lastMessage = await ctx.db
            .query("messages")
            .withIndex(
              "by_conversation",
              q => q.eq("conversationId", conversation._id)
            )
            .order("desc")
            .first();




          // unread count
          const unreadMessages = await ctx.db
            .query("messages")
            .withIndex(
              "by_conversation",
              q => q.eq("conversationId", conversation._id)
            )
            .collect();



          const unreadCount = unreadMessages
            .filter(m => m.senderId !== args.userId)
            .length;




          return {

            ...conversation,


            otherUser,


            lastMessage: lastMessage?.body || "",


            lastMessageTime: lastMessage?.createdAt || 0,


            unreadCount,

          };

        })

    );




    // sort by latest message
    return results.sort(

      (a, b) => b.lastMessageTime - a.lastMessageTime

    );

  },

});





/**
 * ✅ Get single conversation
 */
export const getConversation = query({

  args: {
    conversationId: v.id("conversations"),
  },

  handler: async (ctx, args) => {

    return await ctx.db.get(args.conversationId);

  },

});