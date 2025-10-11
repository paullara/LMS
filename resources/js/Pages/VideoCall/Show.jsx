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
} from "lucide-react";

export default function VideoCall({ videoCall }) {
    const { auth } = usePage().props;
    const myVideoRef = useRef(null);
    const peerInstance = useRef(null);
    const streamRef = useRef(null);
    const calledPeers = useRef(new Set());

    const [peerId, setPeerId] = useState(null);
    const [sharing, setSharing] = useState(false);
    const [cameraOn, setCameraOn] = useState(false);
    const [micOn, setMicOn] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

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
            // if no camera stream exists yet
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

            // Send to participants
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
                        call.on("error", (err) =>
                            console.error("Call error with", p.peer_id, err)
                        );
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
                call.on("error", (err) =>
                    console.error("Call error with", p.peer_id, err)
                );
                calledPeers.current.add(p.peer_id);
            }
        });
    }, [participants]);

    // --- UI ---
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
                        <ul className="space-y-3">
                            {participants.map((p) => (
                                <li
                                    key={p.id}
                                    className={`flex items-center space-x-2 text-sm ${
                                        p.user.id === currentUser.id
                                            ? "text-blue-400"
                                            : "text-gray-300"
                                    }`}
                                >
                                    <img
                                        src={`/${p.user.profile_picture}`}
                                        className="w-6 h-6 rounded-full border border-gray-600"
                                    />
                                    <span>
                                        {p.user.firstname} {p.user.lastname}
                                        {p.user.id === currentUser.id &&
                                            " (You)"}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </aside>
                )}

                {/* Main Video */}
                <main className="flex-1 flex flex-col items-center justify-center relative">
                    <video
                        ref={myVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="rounded-xl bg-black w-full max-w-5xl aspect-video object-cover shadow-lg"
                    />
                    <div className="absolute bottom-10 flex gap-6 bg-[#1b1f2b]/80 px-6 py-3 rounded-full shadow-xl backdrop-blur-sm border border-gray-700">
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
                            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
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
                    </div>
                </main>
            </div>
        </div>
    );
}
