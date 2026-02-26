"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import ConversationItem from "./ConversationItem";

export default function Sidebar() {

  const { user } = useUser();

  const users = useQuery(api.users.getUsers);

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

      {/* Conversations */}

      {conversations.map(conversation => (

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