"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Id } from "../convex/_generated/dataModel";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Always define hooks at top
  const storeUser = useMutation(api.users.storeUser);
  const createConversation = useMutation(api.conversations.createConversation);
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);
  const users = useQuery(api.users.getUsers);

  // Store logged-in user and set online/offline
  useEffect(() => {
    if (!isLoaded || !user) return;

    storeUser({
      clerkId: user.id,
      name: user.fullName || "",
      email: user.primaryEmailAddress?.emailAddress || "",
      image: user.imageUrl || "",
    }).then(() => {
      setOnlineStatus({ userId: user.id, isOnline: true }).catch(console.error);
    });

    const handleBeforeUnload = () => {
      setOnlineStatus({ userId: user.id, isOnline: false }).catch(console.error);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      setOnlineStatus({ userId: user.id, isOnline: false }).catch(console.error);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLoaded, user, storeUser, setOnlineStatus]);

  // Loading / not authenticated states
  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <SignInPage />; // redirect component

  if (!users) return <div>Loading users...</div>;

  // Start conversation
  const handleClick = async (otherUserId: Id<"users">) => {
    const myUser = users.find((u) => u.clerkId === user.id);
    if (!myUser) return;

    try {
      const conversationId = await createConversation({
        memberIds: [myUser._id, otherUserId],
      });
      router.push(`/chat/${conversationId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Welcome {user.fullName || user.firstName || "User"}</h2>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>

      <h2 style={{ marginTop: 30 }}>Users</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {users
          .filter((u) => u.clerkId !== user.id)
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
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={u.image}
                  alt={u.name}
                  width={40}
                  height={40}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: u.isOnline ? "2px solid green" : "2px solid red",
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: "#818080" }}>
                    {u.email} - {u.isOnline ? "Online" : "Offline"}
                  </div>
                </div>
              </div>
              <button onClick={() => handleClick(u._id)} style={{ padding: "6px 12px", cursor: "pointer" }}>
                Chat
              </button>
            </div>
            
          ))}
      </div>
          <div>

    </div>
    </div>
  );
}

// Redirect / Sign In component
function SignInPage() {
  const router = useRouter();
  useEffect(() => {
    router.push("/sign-in");
  }, [router]);
  return <div>Redirecting to Sign In...</div>;
}