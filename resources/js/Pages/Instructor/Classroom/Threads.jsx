import { useState, useEffect, useRef } from "react";
import axios from "axios";
import React from "react";

// Reply form component
const ReplyForm = ({ threadId, parentId, onPost, onCancel }) => {
    const [message, setMessage] = useState("");
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message) return;

        setProcessing(true);
        await onPost(threadId, parentId, message);
        setMessage("");
        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-2 ml-6">
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your reply..."
                className="w-full border p-2 rounded-md"
                rows="2"
            />
            <div className="flex gap-2 mt-1">
                <button
                    type="submit"
                    disabled={processing}
                    className="bg-purple-600 text-white px-3 py-1 rounded-md"
                >
                    Post Reply
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-400 text-white px-3 py-1 rounded-md"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

// Recursive replies renderer
const RenderReplies = React.memo(
    ({
        replies,
        threadId,
        onReplyClick,
        replyTarget,
        onPostReply,
        onCancelReply,
    }) => (
        <div className="ml-6 space-y-4">
            {replies.map((reply) => (
                <div key={reply.id} className="border-l-2 pl-4 py-2">
                    <div className="flex items-start space-x-2">
                        <img
                            src={
                                reply.user?.profile_picture
                                    ? `/${reply.user.profile_picture}`
                                    : "/default-avatar.png"
                            }
                            alt="profile"
                            className="w-8 h-8 rounded-full object-cover border"
                        />
                        <div>
                            <span className="font-semibold">
                                {reply.user?.firstname || "Anonymous"}
                            </span>
                            <p>{reply.message}</p>
                            <span className="text-gray-400 text-sm">
                                {new Date(reply.created_at).toLocaleString()}
                            </span>

                            <div>
                                <button
                                    onClick={() =>
                                        onReplyClick(threadId, reply.id)
                                    }
                                    className="text-sm text-purple-600 mt-1"
                                >
                                    Reply
                                </button>
                            </div>

                            {replyTarget?.threadId === threadId &&
                                replyTarget?.parentId === reply.id && (
                                    <ReplyForm
                                        threadId={threadId}
                                        parentId={reply.id}
                                        onPost={onPostReply}
                                        onCancel={onCancelReply}
                                    />
                                )}
                        </div>
                    </div>

                    {reply.replies?.length > 0 && (
                        <RenderReplies
                            replies={reply.replies}
                            threadId={threadId}
                            onReplyClick={onReplyClick}
                            replyTarget={replyTarget}
                            onPostReply={onPostReply}
                            onCancelReply={onCancelReply}
                        />
                    )}
                </div>
            ))}
        </div>
    )
);

export default function Threads({ classId }) {
    const [threadData, setThreadData] = useState("");
    const [threads, setThreads] = useState([]);
    const [replyTarget, setReplyTarget] = useState(null); // {threadId, parentId}
    const [pollingActive, setPollingActive] = useState(true);
    const threadsRef = useRef([]);

    // Polling
    useEffect(() => {
        let interval;

        const fetchThreads = async () => {
            try {
                if (!classId) return;
                const res = await axios.get(`/threads/${classId}`);
                const newData = JSON.stringify(res.data.threads);
                const oldData = JSON.stringify(threadsRef.current);
                if (newData !== oldData) {
                    setThreads(res.data.threads);
                    threadsRef.current = res.data.threads;
                }
            } catch (error) {
                console.error("Error fetching threads:", error);
            }
        };

        if (pollingActive) {
            fetchThreads();
            interval = setInterval(fetchThreads, 2000);
        }

        return () => clearInterval(interval);
    }, [classId, pollingActive]);

    // Create thread
    const handleCreateThread = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`/classroom/${classId}/threads`, {
                message: threadData,
            });
            setThreads((prev) => [res.data.thread, ...prev]);
            threadsRef.current = [res.data.thread, ...threadsRef.current];
            setThreadData("");
        } catch (error) {
            console.error("Error creating thread:", error);
        }
    };

    // Reply handlers
    const handleReplyClick = (threadId, parentId = null) => {
        setReplyTarget({ threadId, parentId });
        setPollingActive(false); // pause polling while replying
    };

    const handleCancelReply = () => {
        setReplyTarget(null);
        setPollingActive(true);
    };

    const handlePostReply = async (threadId, parentId, message) => {
        try {
            const res = await axios.post(`/replies`, {
                thread_id: threadId,
                parent_id: parentId,
                message,
            });

            const updatedThreads = threads.map((thread) =>
                thread.id === threadId
                    ? {
                          ...thread,
                          replies: [res.data.reply, ...(thread.replies || [])],
                      }
                    : thread
            );

            setThreads(updatedThreads);
            threadsRef.current = updatedThreads;
            setReplyTarget(null);
            setPollingActive(true);
        } catch (error) {
            console.error("Error posting reply:", error);
        }
    };

    return (
        <div>
            {/* Create thread */}
            <form onSubmit={handleCreateThread} className="mb-6">
                <textarea
                    value={threadData}
                    onChange={(e) => setThreadData(e.target.value)}
                    className="w-full border p-3 rounded"
                    rows="3"
                    required
                />
                <button
                    type="submit"
                    className="mt-2 bg-purple-500 text-white px-4 py-2 rounded"
                >
                    Post in classroom
                </button>
            </form>

            {/* Threads */}
            <div className="space-y-6">
                {threads.map((thread) => (
                    <div
                        key={thread.id}
                        className="border p-4 rounded-lg bg-white shadow-sm"
                    >
                        <div className="flex items-center mb-2">
                            <img
                                src={
                                    thread?.user?.profile_picture
                                        ? `/${thread.user.profile_picture}`
                                        : "/default-avatar.png"
                                }
                                alt="profile"
                                className="w-8 h-8 rounded-full mr-2 object-cover border"
                            />
                            <span className="font-semibold">
                                {thread?.user?.firstname || "Anonymous"}
                            </span>
                            <span className="text-gray-400 text-sm ml-2">
                                {new Date(thread.created_at).toLocaleString()}
                            </span>
                        </div>

                        <p className="mb-4">{thread?.message || ""}</p>

                        <button
                            onClick={() => handleReplyClick(thread.id)}
                            className="text-sm text-purple-600"
                        >
                            Reply
                        </button>

                        {/* Reply form for thread */}
                        {replyTarget?.threadId === thread.id &&
                            replyTarget?.parentId === null && (
                                <ReplyForm
                                    threadId={thread.id}
                                    parentId={null}
                                    onPost={handlePostReply}
                                    onCancel={handleCancelReply}
                                />
                            )}

                        {/* Nested replies */}
                        <RenderReplies
                            replies={thread.replies || []}
                            threadId={thread.id}
                            onReplyClick={handleReplyClick}
                            replyTarget={replyTarget}
                            onPostReply={handlePostReply}
                            onCancelReply={handleCancelReply}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
