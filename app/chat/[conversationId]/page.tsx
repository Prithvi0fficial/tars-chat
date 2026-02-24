"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.conversationId as any;

  const { user } = useUser();
  const [message, setMessage] = useState("");

  const users = useQuery(api.users.getUsers);
  const messages = useQuery(api.messages.getMessages, { conversationId });

  const sendMessage = useMutation(api.messages.sendMessage);

  const currentUser = users?.find((u) => u.clerkId === user?.id);

  const handleSend = async () => {
    if (!message.trim() || !currentUser) return;

    await sendMessage({
      conversationId,
      senderId: currentUser._id,
      body: message,
    });

    setMessage("");
  };

  if (!messages || !users) return <div>Loading...</div>;

  // helper → find sender info
  const getSender = (senderId: string) =>
    users.find((u) => u._id === senderId);

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h1>Chat</h1>

      {/* message list */}
      <div style={{ marginBottom: 20 }}>
        {messages.length === 0 && <p>No messages yet</p>}

        {messages.map((msg) => {
          const sender = getSender(msg.senderId);
          const isMe = sender?.clerkId === user?.id;

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
                  background: isMe ? "#007bff" : "#eee",
                  color: isMe ? "white" : "black",
                }}
              >
                {/* sender name */}
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  {isMe ? "You" : sender?.name || "User"}
                </div>

                {/* message */}
                <div>{msg.body}</div>

                {/* timestamp */}
                <div style={{ fontSize: 10, marginTop: 4 }}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* message input */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}