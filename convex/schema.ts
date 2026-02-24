import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  users: defineTable({

    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.string(),

  }).index("by_clerkId", ["clerkId"]),


  conversations: defineTable({

    memberIds: v.array(v.id("users")),
    isGroup: v.boolean(),
    name: v.optional(v.string()),

  }),


  messages: defineTable({

    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    body: v.string(),
    createdAt: v.number(),

  }).index("by_conversation", ["conversationId"]),

});