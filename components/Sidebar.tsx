"use client";

import { useUser, UserButton } from "@clerk/nextjs";

import { useQuery } from "convex/react";

import { api } from "../convex/_generated/api";

import { useRouter } from "next/navigation";

export default function Sidebar() {

  const { user } = useUser();

  const router = useRouter();

  const users =
    useQuery(api.users.getUsers);

  const currentUser =
    users?.find(
      u => u.clerkId === user?.id
    );

  const conversations =
    useQuery(
      api.conversations.getConversations,
      currentUser
        ? { userId: currentUser._id }
        : "skip"
    );


  if (
    !users ||
    !currentUser ||
    !conversations
  )
    return <div>Loading...</div>;



  return (

    <div style={{
      width: 320,
      height: "100vh",
      borderRight: "1px solid #ddd"
    }}>


      {/* HEADER */}

      <div style={{
        padding: 15,
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between"
      }}>

        {user?.fullName}

        <UserButton />

      </div>



      {/* LIST */}

      {conversations
        .sort(
          (a, b) =>
            b._creationTime -
            a._creationTime
        )
        .map(conversation => {

          const otherUser =
            users.find(
              u =>
                conversation.memberIds.includes(u._id)
                &&
                u._id !== currentUser._id
            );

          if (!otherUser)
            return null;



          const lastMessage =
            useQuery(
              api.messages.getLastMessage,
              {
                conversationId:
                  conversation._id
              }
            );


          const unread =
            useQuery(
              api.messages.getUnreadCount,
              {
                conversationId:
                  conversation._id,
                userId:
                  currentUser._id
              }
            );



          return (

            <div

              key={
                conversation._id
              }

              onClick={() =>
                router.push(
                  `/chat/${conversation._id}`
                )
              }

              style={{
                padding: 15,
                borderBottom:
                  "1px solid #eee",
                cursor: "pointer",
                display: "flex",
                gap: 10
              }}

            >


              {/* DOT */}

              <div style={{

                width: 10,
                height: 10,

                borderRadius:
                  "50%",

                background:

                  otherUser.isOnline
                    ? "green"
                    : "red",

                marginTop: 6

              }} />


              {/* CONTENT */}

              <div
                style={{
                  flex: 1
                }}
              >

                {/* NAME */}

                <div
                  style={{
                    fontWeight: 600
                  }}
                >

                  {otherUser.name}

                </div>


                {/* LAST MESSAGE */}

                <div
                  style={{
                    fontSize: 13,
                    color: "gray"
                  }}
                >

                  {lastMessage?.body}

                </div>


              </div>



              {/* RIGHT */}

              <div
                style={{
                  textAlign:
                    "right"
                }}
              >


                {/* TIME */}

                <div
                  style={{
                    fontSize: 12
                  }}
                >

                  {lastMessage &&
                    new Date(
                      lastMessage.createdAt
                    ).toLocaleTimeString(
                      [],
                      {
                        hour:
                          "2-digit",
                        minute:
                          "2-digit"
                      }
                    )}

                </div>



                {/* UNREAD */}

                {unread > 0 && (

                  <div
                    style={{

                      background:
                        "green",

                      color:
                        "white",

                      borderRadius:
                        12,

                      padding:
                        "2px 8px",

                      fontSize:
                        12,

                      marginTop:
                        5

                    }}
                  >

                    {unread}

                  </div>

                )}


              </div>


            </div>

          );

        })}

    </div>

  );

}