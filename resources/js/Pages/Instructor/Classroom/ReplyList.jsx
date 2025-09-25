import { useState } from "react";
import axios from "axios";

export default function ReplyList({ thread }) {
    const [replies, setReplies] = useState(thread.replies || []);
    const [replyMessage, setReplyMessage] = useState("");

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        try {
            const res = await axios.post(`/api/threads/${thread.id}/replies`, {
                message: replyMessage,
            });
            setReplies([...replies, res.data.reply]);
            setReplyMessage("");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="mt-3 ml-4 border-l pl-3">
            <h4 className="font-medium">Replies</h4>
            <ul className="space-y-2">
                {replies.map((reply) => (
                    <li key={reply.id} className="border rounded p-2">
                        <p className="font-semibold">{reply.user.name}</p>
                        <p>{reply.message}</p>
                    </li>
                ))}
            </ul>

            <form onSubmit={handleReplySubmit} className="mt-2">
                <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full border p-2 rounded mb-2"
                />
                <button
                    type="submit"
                    className="px-3 py-1 bg-green-500 text-white rounded"
                >
                    Reply
                </button>
            </form>
        </div>
    );
}
