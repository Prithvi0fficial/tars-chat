"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import ConversationItem from "./ConversationItem";
import { useState } from "react";
export default function Sidebar() {

  const { user } = useUser();

  const users = useQuery(api.users.getUsers);
  const [search, setSearch] = useState("");
  const currentUser =
    users?.find(u => u.clerkId === user?.id);

  const conversations =
    useQuery(
      api.conversations.getConversations,
      currentUser
        ? { userId: currentUser._id }
        : "skip"
    );

  if (!users || !currentUser || !conversations)
    return <div>Loading...</div>;

  return (

    <div style={{
      width: 320,
      height: "100vh",
      borderRight: "1px solid #ddd"
    }}>

      {/* Header */}

      <div style={{
        padding: 15,
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between"
      }}>

        {user?.fullName}

        <UserButton />

      </div>
      <div style={{ padding: 9 }}>

        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "95%",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ddd"
          }}
        />

      </div>
      {/* Conversations */}

      {conversations

        .filter(conversation => {

          const otherUser =
            users.find(
              u =>
                conversation.memberIds.includes(u._id)
                &&
                u._id !== currentUser._id
            );

          return otherUser?.name
            .toLowerCase()
            .includes(search.toLowerCase());

        })
        .sort(
          (a, b) =>
            b._creationTime -
            a._creationTime
        )
        .map(conversation => (

          <ConversationItem
            key={conversation._id}
            conversation={conversation}
            currentUser={currentUser}
            users={users}
          />

        ))}
    </div>

  );

}