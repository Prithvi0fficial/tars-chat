"use client";

import { IoCheckmark, IoCheckmarkDone } from "react-icons/io5";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../../convex/_generated/dataModel";
import { FaTrash } from "react-icons/fa";

export default function ChatPage() {

  const router = useRouter();
  const params = useParams();
  const { user, isLoaded } = useUser();

  const [message, setMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formatTime = (timestamp: number) => {

    const date = new Date(timestamp);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  };

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
  const deleteMessage = useMutation(api.messages.deleteMessage);
  // SAFE VALIDATION
  const handleDelete = async (messageId: Id<"messages">) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmDelete) return;

    try {

      await deleteMessage({ messageId });

    } catch (error) {

      console.error("Delete failed:", error);

    }

  };
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

  //  mark seen 
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
    // show ticks only for messages sent by me
    if (msg.senderId !== currentUser._id) return null;

    const isSeen = msg.seenBy?.includes(otherUser?._id);

    return (
      <span className="ml-1 flex items-center">
        {isSeen ? (
          // ✅ Seen → double blue tick
          <IoCheckmarkDone size={20} className="text-[#34B7F1] font-bold" />
        ) : (
          // ✅ Delivered → single white tick
          <IoCheckmark size={20} className="text-white" />
        )}
      </span>
    );
  };



  return (

    <div className="flex flex-col h-screen w-full">



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

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {messages.length === 0 && (
          <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs ml-auto">
            No messages yet. Start conversation 👋
          </div>
        )}

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
                    ? "#072541"
                    : "#f0eded",

                color:
                  isMe
                    ? "white"
                    : "black",

                padding: 10,

                borderRadius: 10,

                display: "inline-block"

              }}>
                <div
                  style={{
                    background: isMe ? "#072541" : "#f0eded",
                    color: isMe ? "white" : "black",
                    padding: 10,
                    borderRadius: 10,
                    display: "inline-block",
                    maxWidth: "min(75%, 420px)",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {msg.body}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    marginTop: 2,
                    display: "flex",
                    gap: 4,
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    alignItems: "center",
                  }}
                >
                  <span>{formatTime(msg._creationTime)}</span>
                  {renderTicks(msg)}
                </div>
              </span>
              {!msg.isDeleted && (

                <button

                  onClick={() => handleDelete(msg._id)}

                  title="Delete message"

                  style={{

                    marginLeft: 6,

                    border: "none",

                    background: "transparent",

                    cursor: "pointer",

                    color: "grey",

                    display: "inline-flex",

                    alignItems: "center"

                  }}

                >

                  <FaTrash size={12} />

                </button>

              )}
            </div>

          );

        })}

        <div ref={messagesEndRef} />

      </div>




      {/* input */}

      <div className="border-t p-3 flex gap-2">

        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-3 py-2 outline-none"

          value={message}

          onChange={handleTyping}

          style={{ flex: 1 }}

        />

        <button className="bg-blue-500 text-white px-4 rounded-lg" onClick={handleSend}>
          Send
        </button>

      </div>

    </div>

  );

}