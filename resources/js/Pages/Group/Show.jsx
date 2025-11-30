import React, { useState, useEffect, useRef } from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import axios from "axios";

// ensure cookies (Sanctum session) are sent when frontend is on a different origin
axios.defaults.withCredentials = true;

export default function Show({ group: initialGroup, auth }) {
    console.log("Auth object:", auth);
    // --------------------------
    // GROUP + STUDENTS
    // --------------------------
    const [group, setGroup] = useState(initialGroup);
    const [students, setStudents] = useState(initialGroup.students || []);

    // --------------------------
    // SEARCH STATES
    // --------------------------
    const [search, setSearch] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);

    // --------------------------
    // MESSAGES STATES
    // --------------------------
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // fetch messages for the group
    const fetchMessages = async () => {
        try {
            const res = await axios.get(`/groups/${group.id}/messages`);
            setMessages(res.data || []);
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    };

    useEffect(() => {
        if (!group || !group.id) return;
        fetchMessages();
        // optional: poll every 10s to refresh messages
        const t = setInterval(fetchMessages, 10000);
        return () => clearInterval(t);
    }, [group]);

    // scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // send a new message
    const sendMessage = async () => {
        const content = newMessage.trim();
        if (!content) return;
        setLoading(true);
        try {
            const res = await axios.post(`/groups/${group.id}/messages`, {
                content,
            });
            // server returns message with user relation
            setMessages((prev) => [...prev, res.data]);
            setNewMessage("");
        } catch (err) {
            console.error(
                "Error sending message:",
                err.response?.data || err.message || err
            );
        } finally {
            setLoading(false);
        }
    };
    // alias for older code / HMR - some builds referenced `handleSendMessage`
    const handleSendMessage = sendMessage;
    // --------------------------
    // FILTER USERS BASED ON SEARCH
    // --------------------------

    // --------------------------
    // ADD STUDENT TO GROUP
    // --------------------------

    return (
        <Authenticated>
            <div className="flex h-[calc(100vh-2rem)] max-w-6xl mx-auto p-4 justify-center items-center">
                {/* Left Panel - Search + Students */}

                {/* Right Panel - Messages */}
                <div className="w-2/3 bg-white rounded shadow flex flex-col p-4">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                        <h2 className="text-xl font-bold text-blue-700">
                            {group?.name}
                        </h2>
                    </div>

                    <div className="flex-1 border rounded p-3 overflow-auto mb-3 flex flex-col">
                        {messages.length === 0 ? (
                            <p className="text-gray-400 text-center mt-4">
                                No messages yet.
                            </p>
                        ) : (
                            messages.map((m) => {
                                // const isOwn = m.user_id === auth?.id;
                                const isOwn = m.user_id === auth?.user?.id;

                                console.log(
                                    "Message ID:",
                                    m.id,
                                    "User ID:",
                                    m.user_id,
                                    "Auth ID:",
                                    auth?.id,
                                    "isOwn:",
                                    isOwn
                                );
                                return (
                                    <div
                                        key={m.id}
                                        className={`mb-3 flex w-full ${
                                            isOwn
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >
                                        <div className={`max-w-xs`}>
                                            <div
                                                className={`text-xs mb-1 ${
                                                    isOwn
                                                        ? "text-right text-gray-500"
                                                        : "text-left text-gray-600"
                                                }`}
                                            >
                                                {!isOwn && (
                                                    <strong className="text-blue-700">
                                                        {m.user?.firstname}{" "}
                                                        {m.user?.lastname}
                                                    </strong>
                                                )}
                                                <span className="ml-2 text-xs text-gray-400">
                                                    {new Date(
                                                        m.created_at
                                                    ).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div
                                                className={`p-3 rounded-lg ${
                                                    isOwn
                                                        ? "bg-blue-500 text-white rounded-br-none"
                                                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                                                }`}
                                            >
                                                {m.content}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 border p-2 rounded focus:border-blue-700 focus:ring-1 focus:ring-blue-300"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !newMessage.trim()}
                            className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
