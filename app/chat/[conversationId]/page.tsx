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

  // get all users from DB
  const users = useQuery(api.users.getUsers);

  // find current user in DB
  const currentUser = users?.find(
    (u) => u.clerkId === user?.id
  );

  // real-time messages
  const messages = useQuery(api.messages.getMessages, {
    conversationId,
  });

  const sendMessage = useMutation(api.messages.sendMessage);

  const handleSend = async () => {
    if (!message.trim() || !currentUser) return;

    await sendMessage({
      conversationId,
      senderId: currentUser._id, // ✅ correct sender id
      body: message,
    });

    setMessage("");
  };

  if (!messages || !users) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h1>Chat</h1>

      {/* message list */}
      <div style={{ marginBottom: 20 }}>
        {messages.length === 0 && <p>No messages yet</p>}

        {messages.map((msg) => (
          <div key={msg._id} style={{ marginBottom: 10 }}>
            {msg.body}
          </div>
        ))}
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