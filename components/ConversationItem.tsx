"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function ConversationItem({
    conversation,
    currentUser,
    users
}: any) {

    const router = useRouter();

    const otherUser =
        users.find(
            (u: any) =>
                conversation.memberIds.includes(u._id)
                &&
                u._id !== currentUser._id
        );

    const lastMessage =
        useQuery(
            api.messages.getLastMessage,
            {
                conversationId: conversation._id
            }
        );

    const unread =
        useQuery(
            api.messages.getUnreadCount,
            {
                conversationId: conversation._id,
                userId: currentUser._id
            }
        );

    if (!otherUser)
        return null;

    return (

        <div

            onClick={() =>
                router.push(`/chat/${conversation._id}`)
            }

            style={{
                padding: 15,
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                display: "flex",
                gap: 10
            }}

        >

            {/* Online dot */}

            <div style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background:
                    otherUser.isOnline
                        ? "green"
                        : "red",
                marginTop: 6
            }} />

            {/* Content */}

            <div style={{ flex: 1 }}>

                <div
                    style={{
                        fontWeight:
                            (unread ?? 0) > 0
                                ? "bold"
                                : "normal"
                    }}
                >
                    {otherUser.name}
                </div>

                <div style={{
                    fontSize: 13,
                    color: "gray",

                    fontWeight:
                        (unread ?? 0) > 0
                            ? "bold"
                            : "normal"
                }}>
                    {lastMessage && (
                        <>
                            {lastMessage.senderId === currentUser._id
                                ? "You: "
                                : ""}

                            {lastMessage.body}
                        </>
                    )}
                </div>

            </div>

            {/* Right side */}

            <div style={{ textAlign: "right" }}>

                <div style={{ fontSize: 12 }}>
                    {lastMessage &&
                        new Date(
                            lastMessage.createdAt
                        ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                </div>

                {unread! > 0 && (

                    <div style={{
                        background: "green",
                        color: "white",
                        borderRadius: 12,
                        padding: "2px 8px",
                        fontSize: 12,
                        marginTop: 5
                    }}>
                        {unread}
                    </div>

                )}

            </div>

        </div>

    );

}