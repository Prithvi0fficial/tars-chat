"use client";

import { IoCheckmark, IoCheckmarkDone } from "react-icons/io5";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../../convex/_generated/dataModel";
import { FaTrash } from "react-icons/fa";




export default function ChatPageWrapper() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const params = useParams();

  const rawId = params?.conversationId;
  const [ready, setReady] = useState(false);
  const [validId, setValidId] = useState<Id<"conversations"> | null>(null);

  useEffect(() => {
    // Wait until Clerk finishes loading
    if (!isLoaded) return;

    // Not signed in → redirect to /sign-in
    if (!user) {
      router.replace("/sign-in");
      return;
    }

    // Invalid conversationId → redirect home
    if (!rawId || typeof rawId !== "string" || rawId.length < 25) {
      router.replace("/");
      return;
    }

    // Valid → allow ChatPage to render
    setValidId(rawId as Id<"conversations">);
    setReady(true);
  }, [isLoaded, user, rawId, router]);

  // Block render until ready
  if (!ready) return null;

  return <ChatPage conversationId={validId!} />;
}

// ✅ Step 2: Main component now receives conversationId as a prop
function ChatPage({ conversationId }: { conversationId: Id<"conversations"> }) {
  const router = useRouter();
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


  // queries
  const conversation = useQuery(
    api.conversations.getConversation,
    { conversationId }
  );

  const messages = useQuery(
    api.messages.getMessages,
    { conversationId }
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




      {/* messages} */}

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {messages.length === 0 && (
          <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs ml-auto">
            No messages yet. Start conversation 👋
          </div>
        )}

        {messages.map((msg) => (
          <MessageItem
            key={msg._id}
            msg={msg}
            currentUser={currentUser}
            otherUser={otherUser}
            handleDelete={handleDelete}
            formatTime={formatTime}
            renderTicks={renderTicks}
          />
        ))}

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

function MessageItem({
  msg,
  currentUser,
  handleDelete,
  formatTime,
  renderTicks,
}: any) {
  const [showReactions, setShowReactions] = useState(false);

  const reactions = useQuery(
    api.reactions.getReactionsByMessage,
    { messageId: msg._id }
  );

  const toggleReaction = useMutation(api.reactions.toggleReaction);

  const groupedReactions = reactions?.reduce(
    (acc: Record<string, number>, reaction: any) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    },
    {}
  );

  const isMe = msg.senderId === currentUser._id;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMe ? "flex-end" : "flex-start",
        padding: "4px 12px",
      }}
    >
      <div
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
        style={{
          position: "relative",
          maxWidth: "75%",
        }}
      >
        {/* Reaction Picker (hover only) */}
        {showReactions && (
          <div
            style={{
              position: "absolute",
              top: -38,
              right: isMe ? 0 : "auto",
              left: isMe ? "auto" : 0,
              background: "white",
              borderRadius: 20,
              padding: "6px 10px",
              display: "flex",
              gap: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              zIndex: 10,
            }}
          >
            {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
              <span
                key={emoji}
                onClick={() =>
                  toggleReaction({
                    messageId: msg._id,
                    userId: currentUser._id,
                    emoji,
                  })
                }
                style={{
                  cursor: "pointer",
                  fontSize: 18,
                  transition: "transform 0.1s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {emoji}
              </span>
            ))}
          </div>
        )}

        {/* Message Bubble */}
        <div
          style={{
            background: isMe ? "#c7f0c0" : "#dac5c5",
            padding: "8px 12px",
            borderRadius: 12,
            borderTopRightRadius: isMe ? 0 : 12,
            borderTopLeftRadius: isMe ? 12 : 0,
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            fontSize: 14,
            wordBreak: "break-word",
          }}
        >
          <div>{msg.body}</div>

          {/* Time + ticks */}
          <div
            style={{
              fontSize: 11,
              marginTop: 4,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 4,
              color: "#667781",
            }}
          >
            <span>{formatTime(msg._creationTime)}</span>
            {renderTicks(msg)}


            {/* message deletion */}
            {!msg.isDeleted && (
              <button
                onClick={() => handleDelete(msg._id)}
                title="Delete message"
                style={{
                  marginLeft: 6,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#667781",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <FaTrash size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Reaction Pills */}
        {groupedReactions &&
          Object.keys(groupedReactions).length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 4,
                flexWrap: "wrap",
                justifyContent: isMe ? "flex-end" : "flex-start",
              }}
            >
              {Object.entries(groupedReactions).map(
                ([emoji, count]) => (
                  <div
                    key={emoji}
                    style={{
                      background: "#f0f2f5",
                      borderRadius: 14,
                      padding: "2px 8px",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span>{emoji}</span>
                    <span>{count as number}</span>
                  </div>
                )
              )}
            </div>
          )}


      </div>
    </div>
  );
}

