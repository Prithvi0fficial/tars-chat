"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [search, setSearch] = useState(""); // ⭐ search state

  const storeUser = useMutation(api.users.storeUser);
  const createConversation = useMutation(api.conversations.createConversation);
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);
  const users = useQuery(api.users.getUsers);

  // store logged-in user
  useEffect(() => {
    if (!isLoaded || !user) return;

    storeUser({
      clerkId: user.id,
      name: user.fullName || "",
      email: user.primaryEmailAddress?.emailAddress || "",
      image: user.imageUrl || "",
    }).then(() => {
      setOnlineStatus({ userId: user.id, isOnline: true });
    });

    const handleBeforeUnload = () => {
      setOnlineStatus({ userId: user.id, isOnline: false });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      setOnlineStatus({ userId: user.id, isOnline: false });
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLoaded, user, storeUser, setOnlineStatus]);

  if (!isLoaded) return <div className="p-6">Loading...</div>;
  if (!user) return <SignInPage />;
  if (!users) return <div className="p-6">Loading users...</div>;

  // start chat
  const handleClick = async (otherUserId: Id<"users">) => {
    const myUser = users.find((u) => u.clerkId === user.id);
    if (!myUser) return;

    const conversationId = await createConversation({
      memberIds: [myUser._id, otherUserId],
    });

    router.push(`/chat/${conversationId}`);
  };

  // ⭐ filter users based on search
  const filteredUsers = users
    .filter((u) => u.clerkId !== user.id)
    .filter((u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-6">

        {/* header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-xl font-semibold">
            Welcome {user.fullName || user.firstName || "User"}
          </h1>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>

        {/* search bar */}
        <div className="mt-6">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* users */}
        <h2 className="mt-6 mb-4 text-lg font-semibold">Users</h2>

        <div className="space-y-3">

          {filteredUsers.length === 0 && (
            <div className="text-gray-500 text-center py-6">
              No users found
            </div>
          )}

          {filteredUsers.map((u) => (
            <div
              key={u._id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4 min-w-0">

                {/* avatar */}
                <div className="relative w-12 h-12 flex-shrink-0">
                  <img
                    src={u.image}
                    alt={u.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  {u.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="font-semibold truncate">{u.name}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {u.email}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleClick(u._id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Chat
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* redirect */
function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/");
  }, [router]);

  return <div className="p-6">Redirecting to Sign In...</div>;
}