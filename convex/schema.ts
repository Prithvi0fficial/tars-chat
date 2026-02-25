import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.string(),
    isOnline: v.optional(v.boolean()), //  new field/optional
  }).index("by_clerkId", ["clerkId"]),

  conversations: defineTable({
    memberIds: v.array(v.id("users")),
    isGroup: v.boolean(),
    name: v.optional(v.string()),
  }).index("by_member", ["memberIds"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    body: v.string(),
    createdAt: v.number(),
    isDeleted: v.boolean(),
  }).index("by_conversation", ["conversationId"]),

  reactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  }).index("by_message", ["messageId"]),
});