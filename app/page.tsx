"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

import { useMutation, useQuery } from "convex/react";

import { api } from "../convex/_generated/api";


export default function Home() {

  const { user, isLoaded } = useUser();

  const storeUser = useMutation(api.users.storeUser);

  const createConversation = useMutation(api.conversations.createConversation);

  const users = useQuery(api.users.getUsers);


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


  const handleClick = async (otherUserId: any) => {

    const myUser = users?.find(u => u.clerkId === user.id);

    if (!myUser) return;

    await createConversation({

      memberIds: [myUser._id, otherUserId]

    });

    alert("Conversation created!");

  };


  return (

    <div style={{ padding: 20 }}>

      <h1>Welcome, {user.fullName}</h1>

      <h2>Users:</h2>

      {users?.map(u => (

        <div key={u._id}>

          {u.name}

          {u.clerkId !== user.id && (

            <button onClick={() => handleClick(u._id)}>

              Chat

            </button>

          )}

        </div>

      ))}

    </div>

  );

}