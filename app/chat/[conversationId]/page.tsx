"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../../convex/_generated/dataModel";

export default function ChatPage() {

  const router = useRouter();
  const params = useParams();

  const { user, isLoaded } = useUser();

  const [message, setMessage] = useState("");

  const users = useQuery(api.users.getUsers);

  // ✅ SAFE conversationId validation
  const rawConversationId =
    params.conversationId as string;

  const conversationId =
    rawConversationId?.length > 20
      ? rawConversationId as Id<"conversations">
      : null;


  // ✅ redirect if invalid id
  useEffect(() => {

    if (!conversationId) {

      router.replace("/");

    }

  }, [conversationId, router]);


  // queries
  const conversation = useQuery(
    api.conversations.getConversation,
    conversationId ? { conversationId } : "skip"
  );

  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip"
  );

  const sendMessage =
    useMutation(api.messages.sendMessage);


  // ✅ protect auth
  useEffect(() => {

    if (isLoaded && !user) {

      router.replace("/sign-in");

    }

  }, [isLoaded, user, router]);


  // ✅ redirect if conversation not exists
  useEffect(() => {

    if (conversation === null) {

      router.replace("/");

    }

  }, [conversation, router]);


  // loading state
  if (!conversationId || !messages || !users || !conversation)
    return <div>Loading...</div>;


  const currentUser =
    users.find(u => u.clerkId === user?.id);


  const handleSend = async () => {

    if (!message.trim() || !currentUser)
      return;

    await sendMessage({

      conversationId,

      senderId: currentUser._id,

      body: message,

    });

    setMessage("");

  };


  const getSender = (senderId: string) =>
    users.find(u => u._id === senderId);


  return (

    <div style={{ padding: 20, maxWidth: 700 }}>

      <h1>Chat</h1>

      <div style={{ marginBottom: 20 }}>

        {messages.length === 0 &&
          <p>No messages yet</p>}

        {messages.map(msg => {

          const sender =
            getSender(msg.senderId);

          const isMe =
            sender?.clerkId === user?.id;

          return (

            <div
              key={msg._id}
              style={{
                display: "flex",
                justifyContent:
                  isMe ? "flex-end" : "flex-start",
                marginBottom: 12,
              }}
            >

              <div
                style={{
                  maxWidth: "60%",
                  padding: 10,
                  borderRadius: 10,
                  background:
                    isMe ? "#007bff" : "#eee",
                  color:
                    isMe ? "white" : "black",
                }}
              >

                <div style={{
                  fontSize: 12,
                  fontWeight: 600
                }}>
                  {isMe
                    ? "You"
                    : sender?.name}
                </div>

                <div>{msg.body}</div>

              </div>

            </div>

          );

        })}

      </div>


      <div style={{
        display: "flex",
        gap: 10
      }}>

        <input
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          placeholder="Type message"
          style={{
            flex: 1,
            padding: 8
          }}
        />

        <button onClick={handleSend}>
          Send
        </button>

      </div>

    </div>

  );

}