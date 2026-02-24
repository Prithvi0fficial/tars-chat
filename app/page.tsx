"use client";

import { useUser, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Home() {

  const { user } = useUser();

  const storeUser = useMutation(api.users.storeUser);

  useEffect(() => {

    if (!user) return;

    storeUser({

      clerkId: user.id,
      name: user.fullName || "",
      email: user.primaryEmailAddress?.emailAddress || "",
      image: user.imageUrl || "",

    });

  }, [user, storeUser]);

  return (

    <div style={{ padding: "20px" }}>

      <SignedOut>

        <SignInButton />

      </SignedOut>

      <SignedIn>

        <UserButton />

        <h1>

          Welcome, {user?.fullName} 👋

        </h1>

      </SignedIn>

    </div>

  );

}