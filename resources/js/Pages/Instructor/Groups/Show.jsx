import { useState, useEffect } from "react";
import Instructor from "@/Layouts/InstructorLayout";
import axios from "axios";

export default function Show({ group, messages: initialMessages, auth }) {
    const [messages, setMessages] = useState(initialMessages);
    const [content, setContent] = useState("");

    // Poll every 3 seconds (optional)
    useEffect(() => {
        const interval = setInterval(() => {
            axios
                .get(route("instructor.groups.messages.fetch", group.id))
                .then((res) => setMessages(res.data));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const sendMessage = () => {
        if (!content.trim()) return;

        axios
            .post(route("instructor.groups.messages.store", group.id), {
                content,
            })
            .then((res) => {
                setMessages([...messages, res.data]);
                setContent("");
            });
    };

    return (
        <Instructor>
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-4">
                    {group.name} (Group Chat)
                </h1>

                {/* Students List */}
                <div className="mb-4 bg-white p-4 rounded shadow">
                    <h2 className="font-semibold mb-2">Students</h2>
                    <ul>
                        {group.students.map((s) => (
                            <li key={s.id} className="border-b py-1">
                                {s.name}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Chat Window */}
                <div className="bg-white rounded shadow p-4 h-[400px] overflow-y-auto">
                    {messages.map((msg) => (
                        <div key={msg.id} className="mb-3">
                            <b
                                className={
                                    msg.user_id === auth.id
                                        ? "text-blue-600"
                                        : ""
                                }
                            >
                                {msg.user.name}
                            </b>
                            : {msg.content}
                        </div>
                    ))}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2 mt-4">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 border rounded p-2"
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={sendMessage}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Send
                    </button>
                </div>
            </div>
        </Instructor>
    );
}
