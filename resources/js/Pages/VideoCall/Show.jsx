import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    MonitorUp,
    MonitorX,
    PhoneOff,
    Users,
    MessageCircle,
} from "lucide-react";

export default function VideoCall({ videoCall }) {
    const { auth } = usePage().props;
    const myVideoRef = useRef(null);
    const peerInstance = useRef(null);
    const streamRef = useRef(null);
    const calledPeers = useRef(new Set());
    const activeCallsRef = useRef(new Map());

    const [peerId, setPeerId] = useState(null);
    const [sharing, setSharing] = useState(false);
    const [cameraOn, setCameraOn] = useState(false);
    const [micOn, setMicOn] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);

    const currentUser = auth.user;

    // --- Initialize PeerJS ---
    useEffect(() => {
        const myPeer = new Peer();

        myPeer.on("open", (id) => setPeerId(id));
        myPeer.on("call", (call) => {
            call.answer();

            call.on("stream", (remoteStream) => {
                if (myVideoRef.current) {
                    myVideoRef.current.srcObject = remoteStream;
                }
            });

            call.on("close", () => {
                if (myVideoRef.current) {
                    myVideoRef.current.srcObject = null;
                }
            });

            call.on("error", (err) => {
                console.error("Incoming call error:", err);
            });
        });

        peerInstance.current = myPeer;
        return () => myPeer.destroy();
    }, []);

    // --- Join & Register ---
    useEffect(() => {
        axios.post(`/video-call/${videoCall.id}/join`).catch(() => {});
    }, []);

    useEffect(() => {
        if (!peerId) return;
        axios
            .post(`/video-call/${videoCall.id}/register-peer`, {
                peer_id: peerId,
            })
            .catch(() => {});
    }, [peerId]);

    // --- Fetch participants ---
    useEffect(() => {
        const fetchParticipants = async () => {
            const res = await axios.get(
                `/video-call/${videoCall.id}/participants`
            );
            setParticipants(res.data.participants);
        };
        fetchParticipants();
        const interval = setInterval(fetchParticipants, 1500);
        return () => clearInterval(interval);
    }, []);

    // --- Camera & Mic ---
    const toggleCamera = async () => {
        if (cameraOn) {
            streamRef.current
                ?.getTracks()
                .filter((t) => t.kind === "video")
                .forEach((t) => t.stop());
            setCameraOn(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: micOn,
            });
            streamRef.current = stream;
            myVideoRef.current.srcObject = stream;
            setCameraOn(true);
        } catch (err) {
            console.error("Camera error:", err);
        }
    };

    const toggleMic = async () => {
        if (!micOn && !cameraOn) {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            streamRef.current = stream;
            myVideoRef.current.srcObject = stream;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => {
                if (track.kind === "audio") track.enabled = !micOn;
            });
        }
        setMicOn(!micOn);
    };

    // --- Screen Sharing ---
    const startSharing = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });

            myVideoRef.current.srcObject = stream;
            streamRef.current = stream;
            setSharing(true);

            stream.getTracks().forEach((track) => {
                track.onended = () => stopSharing();
            });

            if (auth.user.id === videoCall.host_id) {
                const res = await axios.get(
                    `/video-call/${videoCall.id}/participants`
                );
                res.data.participants.forEach((p) => {
                    if (p.user.id !== auth.user.id && p.peer_id) {
                        const call = peerInstance.current.call(
                            p.peer_id,
                            stream
                        );
                        activeCallsRef.current.set(p.peer_id, call);
                        calledPeers.current.add(p.peer_id);
                        call.on("error", (err) =>
                            console.error("Call error with", p.peer_id, err)
                        );
                        call.on("close", () => {
                            activeCallsRef.current.delete(p.peer_id);
                            calledPeers.current.delete(p.peer_id);
                        });
                    }
                });
            }
        } catch (err) {
            console.error("Screen share error:", err);
        }
    };

    const stopSharing = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }
        streamRef.current = null;
        myVideoRef.current.srcObject = null;

        activeCallsRef.current.forEach((call) => {
            try {
                call.close();
            } catch (e) {
                console.warn("Error closing call:", e);
            }
        });
        activeCallsRef.current.clear();
        calledPeers.current.clear();
        setSharing(false);
    };

    const handleEndCall = async () => {
        try {
            await axios.post(`/video-call/${videoCall.id}/end`);
            window.location.href = `/classroom/show/${videoCall.classroom.id}`;
        } catch (error) {
            console.error("Failed to end call:", error);
        }
    };

    // --- Auto redirect students when call ends ---
    useEffect(() => {
        if (auth.user.id === videoCall.host_id) return;
        const interval = setInterval(async () => {
            const res = await axios.get(
                `/video-call/check/${videoCall.classroom.id}`
            );
            const activeCall = res.data.videoCall;
            if (!activeCall || activeCall.status === "ended") {
                window.location.href = `/classroom/${videoCall.classroom.id}`;
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // --- Host rebroadcast ---
    useEffect(() => {
        if (
            auth.user.id !== videoCall.host_id ||
            !streamRef.current ||
            !participants.length
        )
            return;

        participants.forEach((p) => {
            if (
                p.user.id !== auth.user.id &&
                p.peer_id &&
                !calledPeers.current.has(p.peer_id)
            ) {
                const call = peerInstance.current.call(
                    p.peer_id,
                    streamRef.current
                );
                activeCallsRef.current.set(p.peer_id, call);
                calledPeers.current.add(p.peer_id);
                call.on("error", (err) =>
                    console.error("Call error with", p.peer_id, err)
                );
                call.on("close", () => {
                    activeCallsRef.current.delete(p.peer_id);
                    calledPeers.current.delete(p.peer_id);
                });
            }
        });
    }, [participants]);

    // --- Chat Messages ---
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const lastMessageId = messages.length
                    ? messages[messages.length - 1].id
                    : 0;
                const res = await axios.get(
                    `/video-call/${videoCall.id}/messages?after_id=${lastMessageId}`
                );
                if (res.data.messages.length) {
                    setMessages((prev) => {
                        const existingIds = new Set(prev.map((m) => m.id));
                        const newOnes = res.data.messages.filter(
                            (m) => !existingIds.has(m.id)
                        );
                        return [...prev, ...newOnes];
                    });
                }
            } catch (err) {
                console.error("Failed to load messages:", err);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 500);
        return () => clearInterval(interval);
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);

        try {
            const res = await axios.post(
                `/video-call/${videoCall.id}/messages`,
                { message: newMessage }
            );
            setMessages((prev) => [...prev, res.data.data]);
            setNewMessage("");
        } catch (err) {
            console.error("Failed to send message:", err);
        } finally {
            setSending(false);
        }
    };

    // --- Keyboard ESC ---
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") setFullscreen(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    return (
        <div className="h-screen flex flex-col bg-[#0f1117] text-white">
            {/* Header */}
            <header className="px-6 py-4 flex justify-between items-center border-b border-gray-800">
                <div className="text-lg font-semibold tracking-wide">
                    {videoCall?.classroom?.name || "Classroom"}
                </div>
                <div className="text-sm text-gray-400">
                    Peer ID: {peerId || "Connecting..."}
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                {sidebarOpen && (
                    <aside className="w-64 bg-[#1b1f2b] border-r border-gray-800 p-4 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-gray-200">
                                Participants
                            </h2>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="text-gray-400 hover:text-gray-200 text-sm"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {participants.map((p) => (
                                <div
                                    key={p.id}
                                    className="relative bg-[#11131b] border border-gray-700 rounded-xl p-3 flex flex-col items-center justify-center shadow-md"
                                >
                                    {p.user.id === currentUser.id &&
                                    cameraOn ? (
                                        <video
                                            ref={myVideoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="rounded-lg w-full h-32 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-32 bg-[#11131b] rounded-lg flex flex-col items-center justify-center text-gray-400">
                                            <img
                                                src={`/${p.user.profile_picture}`}
                                                className="w-12 h-12 rounded-full border border-gray-600 mb-1"
                                            />
                                            <span className="text-xs text-gray-300 text-center">
                                                {p.user.firstname}{" "}
                                                {p.user.lastname}
                                                {p.user.id === currentUser.id &&
                                                    " (You)"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </aside>
                )}

                {/* Main Video */}
                <main className="flex-1 flex flex-col items-center justify-center relative">
                    <video
                        ref={myVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="rounded-xl bg-black w-full max-w-5xl aspect-video object-cover shadow-lg mb-24"
                    />

                    {!fullscreen && (
                        <div className="absolute bottom-10 flex gap-6 bg-[#1b1f2b]/80 px-6 py-3 rounded-full shadow-xl backdrop-blur-sm border border-gray-700 mt-20">
                            <button
                                onClick={toggleCamera}
                                className={`p-3 rounded-full ${
                                    cameraOn
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-gray-700 hover:bg-gray-600"
                                }`}
                            >
                                {cameraOn ? (
                                    <Video size={20} />
                                ) : (
                                    <VideoOff size={20} />
                                )}
                            </button>

                            <button
                                onClick={toggleMic}
                                className={`p-3 rounded-full ${
                                    micOn
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-gray-700 hover:bg-gray-600"
                                }`}
                            >
                                {micOn ? (
                                    <Mic size={20} />
                                ) : (
                                    <MicOff size={20} />
                                )}
                            </button>

                            {!sharing ? (
                                <button
                                    onClick={startSharing}
                                    className="p-3 rounded-full bg-blue-600 hover:bg-blue-700"
                                >
                                    <MonitorUp size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={stopSharing}
                                    className="p-3 rounded-full bg-yellow-500 hover:bg-yellow-600"
                                >
                                    <MonitorX size={20} />
                                </button>
                            )}

                            <button
                                onClick={handleEndCall}
                                className="p-3 rounded-full bg-red-600 hover:bg-red-700"
                            >
                                <PhoneOff size={20} />
                            </button>

                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"
                            >
                                <Users size={20} />
                            </button>
                            <button
                                onClick={() => setChatOpen(!chatOpen)}
                                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"
                            >
                                <MessageCircle size={20} />
                            </button>
                        </div>
                    )}
                </main>

                {/* Chat */}
                {chatOpen && (
                    <aside className="w-80 bg-[#1b1f2b] border-l border-gray-800 flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-gray-700">
                            <span className="font-semibold text-gray-200">
                                Chat
                            </span>
                            <button
                                onClick={() => setChatOpen(false)}
                                className="text-gray-400 hover:text-gray-200 text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`${
                                        msg.user.id === currentUser.id
                                            ? "text-blue-400 text-right"
                                            : "text-gray-300 text-left"
                                    }`}
                                >
                                    <p className="text-xs text-gray-500">
                                        {msg.user.firstname} {msg.user.lastname}
                                    </p>
                                    <div className="bg-gray-800 inline-block px-3 py-2 rounded-lg mt-1">
                                        {msg.message}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form
                            onSubmit={sendMessage}
                            className="p-3 border-t border-gray-700 flex gap-2"
                        >
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={sending}
                                className={`px-4 py-2 rounded-lg text-sm transition ${
                                    sending
                                        ? "bg-gray-600 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            >
                                {sending ? "Sending..." : "Send"}
                            </button>
                        </form>
                    </aside>
                )}
            </div>
        </div>
    );
}
