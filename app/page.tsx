"use client";

import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";

export default function Home() {

  const { user } = useUser();

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-6">

      <SignedOut>
        <SignInButton mode="modal">
          <button className="bg-black text-white px-6 py-2 rounded-lg">
            Sign In
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>

        <div className="flex items-center gap-4">

          <UserButton />

          <span className="text-lg font-semibold">
            Welcome, {user?.firstName}
          </span>

        </div>

      </SignedIn>

    </main>
  );
}