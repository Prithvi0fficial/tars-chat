"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Home() {

  const { user, isLoaded } = useUser();

  const storeUser = useMutation(api.users.storeUser);

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


  return (

    <div>

      <h1>Users List</h1>

      {users?.map((u) => (

        <div key={u._id}>{u.name}</div>

      ))}

    </div>

  );

}