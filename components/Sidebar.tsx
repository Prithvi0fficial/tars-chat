"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "next/navigation";

export default function Sidebar() {

  const { user } = useUser();
  const users = useQuery(api.users.getUsers);
  const createConversation = useMutation(api.conversations.createConversation);

  const router = useRouter();

  if (!users || !user) return <div>Loading...</div>;

  const currentUser = users.find(
    (u) => u.clerkId === user.id
  );

  const handleChat = async (otherUserId: any) => {

    if (!currentUser) return;

    const conversationId =
      await createConversation({
        memberIds: [
          currentUser._id,
          otherUserId
        ],
      });

    router.push(`/chat/${conversationId}`);
  };

  return (

    <div
      style={{
        width: 300,
        height: "100vh",
        borderRight: "1px solid #ddd",
        padding: 20,
      }}
    >

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >

        <h3>
          {user.fullName || user.firstName}
        </h3>

        <UserButton afterSignOutUrl="/sign-in" />

      </div>


      {/* Users List */}

      {users
        .filter(
          (u) => u.clerkId !== user.id
        )
        .map((u) => (

          <div
            key={u._id}
            onClick={() => handleChat(u._id)}
            style={{
              padding: 10,
              cursor: "pointer",
              borderBottom: "1px solid #eee",
            }}
          >

            <div>
              {u.name}
            </div>

          </div>

        ))}

    </div>

  );

}