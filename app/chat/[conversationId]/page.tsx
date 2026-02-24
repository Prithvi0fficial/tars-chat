"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.conversationId as any;

  // real-time messages
  const messages = useQuery(api.messages.getMessages, {
    conversationId,
  });

  if (!messages) return <div>Loading messages...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Chat</h1>

      {messages.length === 0 && <p>No messages yet</p>}

      {messages.map((msg) => (
        <div key={msg._id} style={{ marginBottom: 10 }}>
          {msg.body}
        </div>
      ))}
    </div>
  );
}