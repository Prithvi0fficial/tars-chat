"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../../convex/_generated/dataModel";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoaded } = useUser();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ Early guard for TypeScript / auth
  if (!isLoaded || !user) return <div>Loading...</div>;

  // ✅ Conversation ID
  const rawConversationId = params.conversationId as string;
  const conversationId =
    rawConversationId?.length > 20
      ? (rawConversationId as Id<"conversations">)
      : null;

  // ✅ Always call hooks at top
  const conversationQueryArgs = conversationId ? { conversationId } : "skip";
  const conversation = useQuery(api.conversations.getConversation, conversationQueryArgs);
  const messages = useQuery(api.messages.getMessages, conversationQueryArgs);
  const users = useQuery(api.users.getUsers);

  const sendMessage = useMutation(api.messages.sendMessage);
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);
  const setTypingStatus = useMutation(api.users.setTypingStatus);

  // ✅ Protect invalid conversation (stable dependencies)
  useEffect(() => {
    if (!conversationId || conversation === null) {
      router.replace("/");
    }
  }, [conversationId, conversation?._id, router]);

  // ✅ Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  // ✅ Set online/offline status
  useEffect(() => {
    setOnlineStatus({ userId: user.id, isOnline: true });

    const handleBeforeUnload = () =>
      setOnlineStatus({ userId: user.id, isOnline: false });

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      setOnlineStatus({ userId: user.id, isOnline: false });
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user.id, setOnlineStatus]);

  if (!conversationId || !messages || !users || !conversation)
    return <div>Loading...</div>;

  const currentUser = users.find(u => u.clerkId === user.id);
  const otherUser = users.find(
    u => u._id !== currentUser?._id && conversation.memberIds.includes(u._id)
  );

  // ✅ Send message
  const handleSend = async () => {
    if (!message.trim() || !currentUser) return;

    await sendMessage({
      conversationId,
      senderId: currentUser._id,
      body: message,
    });

    setMessage("");
    setTypingStatus({ userId: user.id, conversationId, isTyping: false });
  };

  // ✅ Typing indicator
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setTypingStatus({
      userId: user.id,
      conversationId,
      isTyping: e.target.value.length > 0,
    });
  };

  const getSender = (senderId: string) => users.find(u => u._id === senderId);

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        {otherUser && (
          <>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: otherUser.isOnline ? "green" : "gray",
              }}
            ></div>
            <div>
              <div style={{ fontWeight: 600 }}>{otherUser.name}</div>
              {otherUser.isTyping && (
                <div style={{ fontSize: 12, color: "#555" }}>Typing...</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div
        style={{
          marginBottom: 20,
          minHeight: 300,
          border: "1px solid #ddd",
          padding: 12,
          borderRadius: 8,
          overflowY: "auto",
        }}
      >
        {messages.length === 0 && <p>No messages yet</p>}

        {messages.map(msg => {
          const sender = getSender(msg.senderId);
          const isMe = sender?.clerkId === user.id;
          return (
            <div
              key={msg._id}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  maxWidth: "60%",
                  padding: 10,
                  borderRadius: 10,
                  background: isMe ? "#007bff" : "#f0ecec",
                  color: isMe ? "white" : "black",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  {isMe ? "You" : sender?.name}
                </div>
                <div>{msg.body}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={message}
          onChange={handleTyping}
          placeholder="Type message"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}