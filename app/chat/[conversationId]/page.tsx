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

  // extract id
  const rawConversationId = params.conversationId as string;

  const conversationId =
    rawConversationId?.length > 20
      ? rawConversationId as Id<"conversations">
      : undefined;

  // queries
  const conversation = useQuery(
    api.conversations.getConversation,
    conversationId ? { conversationId } : "skip"
  );

  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip"
  );

  const users = useQuery(api.users.getUsers);

  // mutations
  const sendMessage = useMutation(api.messages.sendMessage);
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);
  const setTypingStatus = useMutation(api.users.setTypingStatus);
  const markAsSeen = useMutation(api.messages.markAsSeen);
  // SAFE VALIDATION

useEffect(() => {

  // not logged in
  if (isLoaded && !user)
    router.replace("/");

}, [isLoaded, user, router]);



useEffect(() => {

  // invalid id format
  if (!conversationId)
    router.replace("/");

}, [conversationId, router]);



useEffect(() => {

  // conversation not exists
  if (conversation === null)
    router.replace("/");

}, [conversation, router]);



useEffect(() => {

  // user not member
  if (!conversation || !users || !user) return;

  const currentUser =
    users.find(u => u.clerkId === user.id);

  if (
    currentUser &&
    !conversation.memberIds.includes(currentUser._id)
  ) {
    router.replace("/");
  }

}, [conversation, users, user, router]);

  // define currentUser EARLY
  const currentUser =
    users?.find(u => u.clerkId === user?.id);

  const otherUser =
    users?.find(
      u =>
        conversation?.memberIds.includes(u._id) &&
        u._id !== currentUser?._id
    );

  // redirect auth
  useEffect(() => {

    if (isLoaded && !user)
      router.replace("/");

  }, [isLoaded, user, router]);

  // redirect invalid conversation
  useEffect(() => {

    if (conversation === null)
      router.replace("/");

  }, [conversation, router]);

  // scroll
  useEffect(() => {

    messagesEndRef.current?.scrollIntoView();

  }, [messages]);

  // online status
  useEffect(() => {

    if (!user) return;

    setOnlineStatus({
      userId: user.id,
      isOnline: true,
    });

    return () => {

      setOnlineStatus({
        userId: user.id,
        isOnline: false,
      });

    };

  }, [user, setOnlineStatus]);

  // ✅ mark seen FIXED LOCATION
  useEffect(() => {

    if (!messages || !currentUser) return;

    messages.forEach(msg => {

      if (!msg.seenBy?.includes(currentUser._id)) {

        markAsSeen({

          messageId: msg._id,
          userId: currentUser._id

        });

      }

    });

  }, [messages, currentUser, markAsSeen]);

  // ✅ ONLY NOW return

  if (
    !isLoaded ||
    !user ||
    !conversation ||
    !messages ||
    !users ||
    !currentUser
  )
    return <div>Loading...</div>;

  // send function
  const handleSend = async () => {

    if (!message.trim()) return;

if (!conversationId) return;

await sendMessage({
  conversationId: conversationId,
  senderId: currentUser._id,
  body: message
});

    setMessage("");

    setTypingStatus({

      userId: user.id,
      conversationId,
      isTyping: false

    });

  };



  const handleTyping = (e: any) => {

    setMessage(e.target.value);
if (!conversationId) return;
    setTypingStatus({

      userId: user.id,

      conversationId,

      isTyping: e.target.value.length > 0

    });

  };



  // ticks
  const renderTicks = (msg: any) => {

    if (msg.senderId !== currentUser._id)
      return null;

    const seenCount = msg.seenBy?.length || 0;

    if (seenCount === 1)
      return "✔";

    if (seenCount === 2)
      return (
        <span style={{ color: "blue" }}>
          ✔✔
        </span>
      );

  };




  return (

    <div style={{ maxWidth: 700, margin: "auto" }}>



      {/* header */}

      <div style={{
        padding: 10,
        borderBottom: "1px solid #ddd"
      }}>

        {otherUser && (

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10
          }}>


            {/* online dot */}

            <div style={{

              width: 12,

              height: 12,

              borderRadius: "50%",

              background:
                otherUser.isOnline
                  ? "green"
                  : "red"

            }} />


            <div>

              {otherUser.name}

              {otherUser.isTyping && (

                <div style={{
                  fontSize: 12
                }}>
                  typing...
                </div>

              )}

            </div>

          </div>

        )}

      </div>




      {/* messages */}

      <div style={{
        height: 400,
        overflowY: "auto",
        padding: 10
      }}>

        {messages.map(msg => {

          const isMe =
            msg.senderId === currentUser._id;

          return (

            <div key={msg._id}

              style={{

                textAlign:
                  isMe
                    ? "right"
                    : "left",

                margin: 10

              }}>

              <span style={{

                background:
                  isMe
                    ? "#007bff"
                    : "#eee",

                color:
                  isMe
                    ? "white"
                    : "black",

                padding: 10,

                borderRadius: 10,

                display: "inline-block"

              }}>

                {msg.body}

                <span style={{
                  marginLeft: 8,
                  fontSize: 12
                }}>
                  {renderTicks(msg)}
                </span>

              </span>

            </div>

          );

        })}

        <div ref={messagesEndRef} />

      </div>




      {/* input */}

      <div style={{
        display: "flex",
        gap: 10,
        padding: 10
      }}>

        <input

          value={message}

          onChange={handleTyping}

          style={{ flex: 1 }}

        />

        <button onClick={handleSend}>
          Send
        </button>

      </div>

    </div>

  );

}