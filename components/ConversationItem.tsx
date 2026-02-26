"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function ConversationItem({
    conversation,
    currentUser,
    users
}: any) {

    const router = useRouter();

    const otherUser =
        users.find(
            (u: any) =>
                conversation.memberIds.includes(u._id)
                &&
                u._id !== currentUser._id
        );

    const lastMessage =
        useQuery(
            api.messages.getLastMessage,
            {
                conversationId: conversation._id
            }
        );

    const unread =
        useQuery(
            api.messages.getUnreadCount,
            {
                conversationId: conversation._id,
                userId: currentUser._id
            }
        );

    if (!otherUser)
        return null;

return (
  
  <div
    onClick={() => router.push(`/chat/${conversation._id}`)}
    className="flex gap-3 p-4 border-b cursor-pointer hover:bg-gray-50"

    
  >
    {/* Profile avatar with online badge */}
<div className="relative w-12 h-12 flex-shrink-0">

  {/* profile image */}
  <img
    src={otherUser.image || "/default-avatar.png"}
    alt={otherUser.name}
    className="w-12 h-12 rounded-full object-cover"
  />

  {/* online indicator */}
  {otherUser.isOnline && (
    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
  )}

</div>
    {/* Online dot
    <div
      className={`w-2.5 h-2.5 rounded-full mt-2 ${
        otherUser.isOnline ? "bg-green-500" : "bg-red-500"
      }`}
    /> */}

    {/* Content (VERY IMPORTANT min-w-0) */}
    <div className="flex-1 min-w-0">
      {/* Name */}
      <div
        className={`truncate ${
          (unread ?? 0) > 0 ? "font-semibold" : ""
        }`}
      >
        {otherUser.name}
      </div>

      {/* Last message */}
      <div
        className={`text-sm text-gray-500 truncate ${
          (unread ?? 0) > 0 ? "font-semibold" : ""
        }`}
      >
        {lastMessage && (
          <>
            {lastMessage.senderId === currentUser._id ? "You: " : ""}
            {lastMessage.body}
          </>
        )}
      </div>
    </div>

    {/* Right side */}
    <div className="text-right flex flex-col items-end">
      <div className="text-xs text-gray-500">
        {lastMessage &&
          new Date(lastMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
      </div>

      {unread! > 0 && (
        <div className="bg-green-500 text-white rounded-full px-2 text-xs mt-1">
          {unread}
        </div>
      )}
    </div>
  </div>
);
}