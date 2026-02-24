"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const storeUser = useMutation(api.users.storeUser);
  const createConversation = useMutation(api.conversations.createConversation);
  const users = useQuery(api.users.getUsers);

  // store logged-in user in DB
  useEffect(() => {
    if (!isLoaded || !user) return;

    storeUser({
      clerkId: user.id,
      name: user.fullName || "",
      email: user.primaryEmailAddress?.emailAddress || "",
      image: user.imageUrl || "",
    });
  }, [isLoaded, user, storeUser]);

  if (!isLoaded) return <div>Loading...</div>;
  if (!users) return <div>Loading users...</div>;

  const handleClick = async (otherUserId: string) => {
    const myUser = users.find((u) => u.clerkId === user?.id);
    if (!myUser) return;

    const conversationId = await createConversation({
      memberIds: [myUser._id, otherUserId],
    });

    // redirect to chat page (future step)
    router.push(`/chat/${conversationId}`);
  };

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h1>Welcome, {user?.fullName}</h1>

      <h2 style={{ marginTop: 30 }}>Users</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {users
          .filter((u) => u.clerkId !== user?.id)
          .map((u) => (
            <div
              key={u._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            >
              {/* avatar + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={u.image}
                  alt={u.name}
                  width={40}
                  height={40}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />

                <div>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {u.email}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleClick(u._id)}
                style={{
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                Chat
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}