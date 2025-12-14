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
    const mainVideoRef = useRef(null);
    const peerInstance = useRef(null);
    const streamRef = useRef(null);
    const prevStreamRef = useRef(null);
    const calledPeers = useRef(new Set());
    // Map of peerId => Array of PeerJS Call objects (support multiple simultaneous calls)
    const activeCallsRef = useRef(new Map());
    const hostPeerIdRef = useRef(null);
    const pendingStreamsRef = useRef(new Map());

    // map of participantPeerId (or fallback id) => DOM video element
    {
        /* Reaction overlay */
    }
    {
        (() => {
            const userKeyForReaction = String(p.user.id);
            return (
                <>
                    {reactionOverlays[userKeyForReaction] && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 pointer-events-none">
                            <div className="text-3xl animate-pop">
                                {reactionOverlays[userKeyForReaction]}
                            </div>
                        </div>
                    )}

                    {/* Reaction button (open picker) */}
                    <div className="absolute bottom-2 right-2">
                        <div className="relative">
                            <button
                                onClick={() => openPicker(userKeyForReaction)}
                                className="p-1 bg-gray-800 rounded-full text-sm hover:bg-gray-700"
                                title="React"
                            >
                                🙂
                            </button>

                            {/* Picker */}
                            {pickerOpenFor === userKeyForReaction && (
                                <div className="absolute bottom-10 right-0 bg-[#121417] border border-gray-700 rounded-md p-2 flex gap-2 shadow-lg">
                                    {["👍", "❤️", "😂", "👏", "😮"].map(
                                        (emo) => (
                                            <button
                                                key={emo}
                                                onClick={() =>
                                                    sendReaction(p.user.id, emo)
                                                }
                                                className="text-xl p-1 hover:scale-110 transition"
                                            >
                                                {emo}
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            );
        })();
    }
    const participantsVideoRefs = useRef(new Map());

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
    const lastMessageRef = useRef(null);
    const [lastId, setLastId] = useState(null);
    const [reactionOverlays, setReactionOverlays] = useState({});
    const [pickerOpenFor, setPickerOpenFor] = useState(null);

    // Confirmation modal state
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState("");

    const currentUser = auth.user;

    // helper: register participant video element
    const setParticipantVideoRef = (key, el) => {
        if (!key) return;

        const keyStr = key.toString();

        if (el) {
            participantsVideoRefs.current.set(keyStr, el);

            // We're only going to attach a stream to the participant CARD when it's the local user's card
            if (keyStr === (peerId || String(currentUser.id))) {
                // Host-specific behavior: only show camera in the host's card while screen-sharing
                if (currentUser.id === videoCall.host_id) {
                    if (sharing) {
                        // attach previous camera/mic stream if we have one, otherwise leave the card empty
                        if (prevStreamRef.current) {
                            try {
                                el.srcObject = prevStreamRef.current;
                                // mute local user's own element; unmute others
                                el.muted =
                                    keyStr ===
                                    (peerId || String(currentUser.id));
                                el.play?.().catch(() => {});
                            } catch (e) {
                                console.warn(
                                    "Failed to set prev stream on participant element",
                                    e
                                );
                            }
                        } else {
                            try {
                                el.srcObject = null;
                            } catch (_) {}
                        }
                    } else {
                        // When the host is not sharing, intentionally keep their participant card empty
                        try {
                            el.srcObject = null;
                        } catch (_) {}
                    }
                } else {
                    // Non-host local user: attach whatever current local stream is (camera/mic)
                    if (streamRef.current) {
                        try {
                            el.srcObject = streamRef.current;
                            el.muted =
                                keyStr === (peerId || String(currentUser.id));
                            el.play?.().catch(() => {});
                        } catch (e) {
                            console.warn(
                                "Failed to set local stream on participant element",
                                e
                            );
                        }
                    }
                }
            }
        } else {
            participantsVideoRefs.current.delete(keyStr);
        }

        // if there is a pending remote stream for this peer, attach it now
        const pending = pendingStreamsRef.current.get(keyStr);
        if (pending) {
            try {
                el.srcObject = pending;
                const isLocal = keyStr === (peerId || String(currentUser.id));
                el.muted = isLocal;
                el.play?.().catch(() => {});
            } catch (e) {
                console.warn(
                    "Failed to attach pending stream to participant element",
                    e
                );
            }
            pendingStreamsRef.current.delete(keyStr);
            // no further local stream attach necessary in this case
            return;
        }
    };

    // --- Initialize PeerJS ---
    useEffect(() => {
        const myPeer = new Peer();

        myPeer.on("open", (id) => setPeerId(id));

        myPeer.on("call", (call) => {
            // answer without sending a stream by default (the callee may or may not send)
            try {
                call.answer();
            } catch (err) {
                console.warn("Error answering call:", err);
            }

            call.on("stream", (remoteStream) => {
                const callerIsHost = call.peer === hostPeerIdRef.current;

                // Use metadata to determine whether this incoming host stream is the screen share or camera
                const source = call.metadata?.source || null;

                if (
                    callerIsHost &&
                    source === "screen" &&
                    mainVideoRef.current
                ) {
                    // Host's screen share -> main video
                    mainVideoRef.current.srcObject = remoteStream;
                    // mute main for local host only, allow remote users to hear audio
                    mainVideoRef.current.muted =
                        currentUser.id === videoCall.host_id;
                    try {
                        mainVideoRef.current.play();
                    } catch (e) {}
                    return;
                }

                // For host camera streams, attach to the host participant card
                if (callerIsHost && source === "camera") {
                    const el = participantsVideoRefs.current.get(call.peer);
                    if (el) {
                        el.srcObject = remoteStream;
                        // host camera stream should be audible to remote participants
                        el.muted = false;
                        el.play?.().catch(() => {});
                    } else {
                        pendingStreamsRef.current.set(call.peer, remoteStream);
                    }
                    return;
                }

                // Non-host: attach only to participant-card element
                const el = participantsVideoRefs.current.get(call.peer);
                if (el) {
                    el.srcObject = remoteStream;
                    // if this stream belongs to the local user, keep it muted, otherwise allow audio
                    const isLocal =
                        call.peer === (peerId || String(currentUser.id));
                    el.muted = isLocal;
                    el.play?.().catch(() => {});

                    // Show confirmation for participant camera
                    const participant = participants.find(
                        (p) => p.peer_id === call.peer
                    );
                    if (participant) {
                        setConfirmationMessage(
                            `${participant.user.firstname} ${participant.user.lastname} has opened their camera`
                        );
                        setShowConfirmation(true);
                    }
                } else {
                    // buffer the stream until the participant card mounts
                    pendingStreamsRef.current.set(call.peer, remoteStream);
                }
            });

            call.on("close", () => {
                const callerIsHost = call.peer === hostPeerIdRef.current;
                const source = call.metadata?.source || null;

                if (
                    callerIsHost &&
                    source === "screen" &&
                    mainVideoRef.current
                ) {
                    try {
                        mainVideoRef.current.srcObject = null;
                    } catch (e) {}
                    return;
                }

                if (callerIsHost && source === "camera") {
                    const el = participantsVideoRefs.current.get(call.peer);
                    if (el) {
                        try {
                            el.srcObject = null;
                        } catch (e) {}
                    } else {
                        pendingStreamsRef.current.delete(call.peer);
                    }
                    return;
                }

                const el = participantsVideoRefs.current.get(call.peer);
                if (el) {
                    try {
                        el.srcObject = null;
                    } catch (e) {}
                } else {
                    // If we previously buffered a stream, remove it
                    pendingStreamsRef.current.delete(call.peer);
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

            // clear participant element for local user (if exists)
            const userKey = peerId || String(currentUser.id);
            const el = participantsVideoRefs.current.get(userKey);
            if (el) {
                try {
                    el.srcObject = null;
                } catch (e) {
                    console.warn("Error clearing local participant video:", e);
                }
            }

            // only clear main video for host or if screen sharing ended
            if (
                currentUser.id === videoCall.host_id &&
                mainVideoRef.current &&
                !sharing
            ) {
                try {
                    mainVideoRef.current.srcObject = null;
                } catch (e) {}
            }

            streamRef.current = null;
            // Close any outgoing call to the host (participant -> host)
            if (currentUser.id !== videoCall.host_id && hostPeerIdRef.current) {
                const hostId = hostPeerIdRef.current;
                const calls = activeCallsRef.current.get(hostId) || [];
                if (calls.length) {
                    calls.forEach((c) => {
                        try {
                            c.close();
                        } catch (e) {
                            console.warn("Error closing call to host:", e);
                        }
                    });
                    activeCallsRef.current.delete(hostId);
                    calledPeers.current.delete(hostId);
                }
            }
            setCameraOn(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: micOn, // Request audio if mic is already on
            });
            streamRef.current = stream;

            // Show in participant card for current user (if mounted)
            const userKey = peerId || String(currentUser.id);
            const el = participantsVideoRefs.current.get(userKey);
            if (el) {
                el.srcObject = stream;
                el.muted = userKey === (peerId || String(currentUser.id));
                el.play?.().catch(() => {});
            }

            // Only set main video if the local user is the host (we don't want participants to replace main)
            if (currentUser.id === videoCall.host_id && mainVideoRef.current) {
                mainVideoRef.current.srcObject = stream;
                mainVideoRef.current.muted = true; // mute local host main to avoid feedback
                try {
                    mainVideoRef.current.play();
                } catch (e) {}
            } else if (mainVideoRef.current) {
                // ensure remote users hear audio when main shows a remote stream
                mainVideoRef.current.muted = false;
            }

            setCameraOn(true);

            // If this user is NOT the host, call the host so they receive our camera stream
            if (currentUser.id !== videoCall.host_id && hostPeerIdRef.current) {
                try {
                    const hostId = hostPeerIdRef.current;
                    const call = peerInstance.current.call(
                        hostId,
                        streamRef.current
                    );
                    // track this outgoing call so we can close it when camera is turned off
                    const arr = activeCallsRef.current.get(hostId) || [];
                    arr.push(call);
                    activeCallsRef.current.set(hostId, arr);
                    calledPeers.current.add(hostId);
                    call.on("error", (err) =>
                        console.error("Call error to host:", err)
                    );
                    call.on("close", () => {
                        const a = activeCallsRef.current.get(hostId) || [];
                        const i = a.indexOf(call);
                        if (i > -1) a.splice(i, 1);
                        if (a.length) activeCallsRef.current.set(hostId, a);
                        else {
                            activeCallsRef.current.delete(hostId);
                            calledPeers.current.delete(hostId);
                        }
                    });
                } catch (err) {
                    console.warn("Error calling host with camera stream:", err);
                }
            }
        } catch (err) {
            console.error("Camera error:", err);
        }
    };

    const toggleMic = async () => {
        if (!micOn && !cameraOn) {
            // No stream exists, request audio-only stream
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
                streamRef.current = stream;

                // attach mic to participant card if exists (local user)
                const userKey = peerId || String(currentUser.id);
                const el = participantsVideoRefs.current.get(userKey);
                if (el) {
                    el.srcObject = stream;
                    el.muted = userKey === (peerId || String(currentUser.id));
                    el.play?.().catch(() => {});
                }

                // Only attach main video to stream if host (avoid replacing main for participants)
                if (
                    currentUser.id === videoCall.host_id &&
                    mainVideoRef.current
                ) {
                    mainVideoRef.current.srcObject = stream;
                    mainVideoRef.current.muted = true;
                    try {
                        mainVideoRef.current.play();
                    } catch (e) {}
                }

                setMicOn(true);
                // If this user is NOT the host, call the host so they receive our mic-only stream
                if (
                    currentUser.id !== videoCall.host_id &&
                    hostPeerIdRef.current
                ) {
                    try {
                        const hostId = hostPeerIdRef.current;
                        const call = peerInstance.current.call(
                            hostId,
                            streamRef.current
                        );
                        const arr = activeCallsRef.current.get(hostId) || [];
                        arr.push(call);
                        activeCallsRef.current.set(hostId, arr);
                        calledPeers.current.add(hostId);
                        call.on("error", (err) =>
                            console.error("Call error to host (mic-only):", err)
                        );
                        call.on("close", () => {
                            const a = activeCallsRef.current.get(hostId) || [];
                            const i = a.indexOf(call);
                            if (i > -1) a.splice(i, 1);
                            if (a.length) activeCallsRef.current.set(hostId, a);
                            else {
                                activeCallsRef.current.delete(hostId);
                                calledPeers.current.delete(hostId);
                            }
                        });
                    } catch (err) {
                        console.warn(
                            "Error calling host with mic-only stream:",
                            err
                        );
                    }
                }
            } catch (err) {
                console.error("Mic error:", err);
            }
            return;
        }

        if (!micOn && cameraOn) {
            // Camera is on but no audio track; need to get new stream with both
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                // Stop old stream and replace with new one
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                }
                streamRef.current = newStream;

                // Update participant card
                const userKey = peerId || String(currentUser.id);
                const el = participantsVideoRefs.current.get(userKey);
                if (el) {
                    el.srcObject = newStream;
                    el.muted = userKey === (peerId || String(currentUser.id));
                    el.play?.().catch(() => {});
                }

                // Update main video if host
                if (
                    currentUser.id === videoCall.host_id &&
                    mainVideoRef.current
                ) {
                    mainVideoRef.current.srcObject = newStream;
                    mainVideoRef.current.muted = true;
                    try {
                        mainVideoRef.current.play();
                    } catch (e) {}
                }

                setMicOn(true);
                // If this user is NOT the host, call the host so they receive our updated stream
                if (
                    currentUser.id !== videoCall.host_id &&
                    hostPeerIdRef.current
                ) {
                    try {
                        const hostId = hostPeerIdRef.current;
                        const call = peerInstance.current.call(
                            hostId,
                            streamRef.current
                        );
                        const arr = activeCallsRef.current.get(hostId) || [];
                        arr.push(call);
                        activeCallsRef.current.set(hostId, arr);
                        calledPeers.current.add(hostId);
                        call.on("error", (err) =>
                            console.error(
                                "Call error to host (camera+mic):",
                                err
                            )
                        );
                        call.on("close", () => {
                            const a = activeCallsRef.current.get(hostId) || [];
                            const i = a.indexOf(call);
                            if (i > -1) a.splice(i, 1);
                            if (a.length) activeCallsRef.current.set(hostId, a);
                            else {
                                activeCallsRef.current.delete(hostId);
                                calledPeers.current.delete(hostId);
                            }
                        });
                    } catch (err) {
                        console.warn(
                            "Error calling host with camera+mic stream:",
                            err
                        );
                    }
                }
            } catch (err) {
                console.error("Mic error:", err);
            }
            return;
        }

        // Mic is on; toggle audio tracks
        if (streamRef.current) {
            const hasAudioTracks = streamRef.current
                .getTracks()
                .some((t) => t.kind === "audio");

            if (hasAudioTracks) {
                // Disable audio tracks
                streamRef.current.getTracks().forEach((track) => {
                    if (track.kind === "audio") track.enabled = false;
                });
                setMicOn(false);

                // If there is no camera active and we're a participant, close outgoing call to host
                if (
                    !cameraOn &&
                    currentUser.id !== videoCall.host_id &&
                    hostPeerIdRef.current
                ) {
                    const hostId = hostPeerIdRef.current;
                    const calls = activeCallsRef.current.get(hostId) || [];
                    if (calls.length) {
                        calls.forEach((c) => {
                            try {
                                c.close();
                            } catch (e) {
                                console.warn(
                                    "Error closing mic-only call to host:",
                                    e
                                );
                            }
                        });
                        activeCallsRef.current.delete(hostId);
                        calledPeers.current.delete(hostId);
                    }
                    // Stop and clear audio-only stream
                    try {
                        streamRef.current.getTracks().forEach((t) => t.stop());
                    } catch (e) {}
                    streamRef.current = null;
                }
            } else {
                // No audio tracks to toggle, need to add them
                try {
                    const audioStream =
                        await navigator.mediaDevices.getUserMedia({
                            audio: true,
                        });
                    audioStream.getTracks().forEach((track) => {
                        if (track.kind === "audio") {
                            streamRef.current.addTrack(track);
                        }
                    });
                    setMicOn(true);
                } catch (err) {
                    console.error("Failed to add audio track:", err);
                }
            }
        }
    };

    // --- Screen Sharing ---
    const startSharing = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });

            // Save any existing local stream (camera/mic) so we can restore it after sharing
            prevStreamRef.current = streamRef.current;

            // Use the display stream as the active stream
            streamRef.current = stream;
            if (mainVideoRef.current) {
                mainVideoRef.current.srcObject = stream;
                // mute only for the local user (host) to avoid feedback
                mainVideoRef.current.muted =
                    currentUser.id === videoCall.host_id;
                try {
                    mainVideoRef.current.play();
                } catch (e) {}
            }
            setSharing(true);

            // Ensure host's participant card does NOT show the shared screen:
            const userKey = peerId || String(currentUser.id);
            const hostEl = participantsVideoRefs.current.get(userKey);
            if (hostEl) {
                try {
                    hostEl.srcObject = null;
                } catch (e) {
                    console.warn(
                        "Error clearing host participant card for screen share:",
                        e
                    );
                }
            }

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
                            stream,
                            { metadata: { source: "screen" } }
                        );
                        // store multiple calls per peer
                        const existing =
                            activeCallsRef.current.get(p.peer_id) || [];
                        existing.push(call);
                        activeCallsRef.current.set(p.peer_id, existing);
                        calledPeers.current.add(p.peer_id);
                        call.on("error", (err) =>
                            console.error("Call error with", p.peer_id, err)
                        );
                        call.on("close", () => {
                            const arr =
                                activeCallsRef.current.get(p.peer_id) || [];
                            const idx = arr.indexOf(call);
                            if (idx > -1) arr.splice(idx, 1);
                            if (arr.length)
                                activeCallsRef.current.set(p.peer_id, arr);
                            else {
                                activeCallsRef.current.delete(p.peer_id);
                                calledPeers.current.delete(p.peer_id);
                            }
                        });

                        // also send camera stream (if available) as a separate call so participants can show it in the host card
                        if (prevStreamRef.current) {
                            const camCall = peerInstance.current.call(
                                p.peer_id,
                                prevStreamRef.current,
                                { metadata: { source: "camera" } }
                            );
                            const ex2 =
                                activeCallsRef.current.get(p.peer_id) || [];
                            ex2.push(camCall);
                            activeCallsRef.current.set(p.peer_id, ex2);
                            camCall.on("error", (err) =>
                                console.error(
                                    "Camera call error with",
                                    p.peer_id,
                                    err
                                )
                            );
                            camCall.on("close", () => {
                                const arr2 =
                                    activeCallsRef.current.get(p.peer_id) || [];
                                const idx2 = arr2.indexOf(camCall);
                                if (idx2 > -1) arr2.splice(idx2, 1);
                                if (arr2.length)
                                    activeCallsRef.current.set(p.peer_id, arr2);
                                else {
                                    activeCallsRef.current.delete(p.peer_id);
                                    calledPeers.current.delete(p.peer_id);
                                }
                            });
                        }
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

        // Clear the display stream
        const currentStream = streamRef.current;
        streamRef.current = null;

        if (mainVideoRef.current && currentStream) {
            try {
                mainVideoRef.current.srcObject = null;
            } catch (e) {}
        }

        // Close any active calls from the host's broadcast (support arrays of calls)
        activeCallsRef.current.forEach((calls, peerId) => {
            (calls || []).forEach((call) => {
                try {
                    call.close();
                } catch (e) {
                    console.warn("Error closing call:", e);
                }
            });
        });
        activeCallsRef.current.clear();
        calledPeers.current.clear();
        setSharing(false);

        // Restore the previous (camera/mic) stream if we saved one
        if (prevStreamRef.current) {
            streamRef.current = prevStreamRef.current;
            const userKey = peerId || String(currentUser.id);
            const hostEl = participantsVideoRefs.current.get(userKey);
            if (hostEl) {
                try {
                    hostEl.srcObject = streamRef.current;
                    hostEl.muted = true; // host's own card should be muted for local
                    hostEl.play?.().catch(() => {});
                } catch (e) {
                    console.warn(
                        "Error restoring host participant video after screen share:",
                        e
                    );
                }
            }
            // restore main view to camera if host previously had camera on
            if (
                currentUser.id === videoCall.host_id &&
                mainVideoRef.current &&
                streamRef.current
            ) {
                try {
                    mainVideoRef.current.srcObject = streamRef.current;
                    mainVideoRef.current.muted = true;
                    try {
                        mainVideoRef.current.play();
                    } catch (e) {}
                } catch (e) {}
            }
            prevStreamRef.current = null;
        }
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
                const source = sharing ? "screen" : "camera";
                const call = peerInstance.current.call(
                    p.peer_id,
                    streamRef.current,
                    { metadata: { source } }
                );
                const arr = activeCallsRef.current.get(p.peer_id) || [];
                arr.push(call);
                activeCallsRef.current.set(p.peer_id, arr);
                calledPeers.current.add(p.peer_id);
                call.on("error", (err) =>
                    console.error("Call error with", p.peer_id, err)
                );
                call.on("close", () => {
                    const a = activeCallsRef.current.get(p.peer_id) || [];
                    const i = a.indexOf(call);
                    if (i > -1) a.splice(i, 1);
                    if (a.length) activeCallsRef.current.set(p.peer_id, a);
                    else {
                        activeCallsRef.current.delete(p.peer_id);
                        calledPeers.current.delete(p.peer_id);
                    }
                });

                // If we're currently sharing and have a saved camera stream, also send it so participants receive host camera separately
                if (sharing && prevStreamRef.current) {
                    const camCall = peerInstance.current.call(
                        p.peer_id,
                        prevStreamRef.current,
                        { metadata: { source: "camera" } }
                    );
                    const a2 = activeCallsRef.current.get(p.peer_id) || [];
                    a2.push(camCall);
                    activeCallsRef.current.set(p.peer_id, a2);
                    camCall.on("error", (err) =>
                        console.error("Camera call error with", p.peer_id, err)
                    );
                    camCall.on("close", () => {
                        const arr2 =
                            activeCallsRef.current.get(p.peer_id) || [];
                        const idx2 = arr2.indexOf(camCall);
                        if (idx2 > -1) arr2.splice(idx2, 1);
                        if (arr2.length)
                            activeCallsRef.current.set(p.peer_id, arr2);
                        else {
                            activeCallsRef.current.delete(p.peer_id);
                            calledPeers.current.delete(p.peer_id);
                        }
                    });
                }
            }
        });
    }, [participants]);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(
                `/video-call/${videoCall.id}/messages`,
                {
                    params: lastId ? { after_id: lastId } : {},
                }
            );

            if (res.data.messages.length) {
                const newMessages = res.data.messages;
                setMessages((prev) => {
                    const existingIds = new Set(prev.map((m) => m.id));
                    const newOnes = newMessages.filter(
                        (m) => !existingIds.has(m.id)
                    );

                    // process reaction messages (format: __REACTION__|targetUserId|emoji)
                    newOnes.forEach((m) => {
                        if (
                            typeof m.message === "string" &&
                            m.message.startsWith("__REACTION__|")
                        ) {
                            const parts = m.message.split("|");
                            const targetId = parts[1];
                            const emoji = parts[2];
                            if (targetId && emoji)
                                showReaction(targetId, emoji);
                        }
                    });

                    return [...prev, ...newOnes];
                });

                const newest = newMessages[newMessages.length - 1];
                setLastId(newest.id);
            }
        } catch (err) {
            console.error("Fetch failed:", err);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 1000);
        return () => clearInterval(interval);
    }, [videoCall.id]);

    // 🟣 Send message
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const res = await axios.post(
                `/video-call/${videoCall.id}/messages`,
                {
                    message: newMessage,
                }
            );

            setMessages((prev) => {
                const exists = prev.some((m) => m.id === res.data.data.id);
                return exists ? prev : [...prev, res.data.data];
            });

            setLastId(res.data.data.id);
            setNewMessage("");
        } catch (err) {
            console.error("Send failed:", err);
        } finally {
            setSending(false);
        }
    };

    // Show a transient reaction overlay on a participant card
    const showReaction = (targetId, emoji) => {
        setReactionOverlays((prev) => ({ ...prev, [targetId]: emoji }));
        // remove after 4s
        setTimeout(() => {
            setReactionOverlays((prev) => {
                const copy = { ...prev };
                delete copy[targetId];
                return copy;
            });
        }, 4000);
    };

    // Open picker for a participant
    const openPicker = (targetUserId) => {
        setPickerOpenFor(targetUserId);
    };

    const sendReaction = async (targetUserId, emoji) => {
        try {
            await axios.post(`/video-call/${videoCall.id}/messages`, {
                message: `__REACTION__|${targetUserId}|${emoji}`,
            });
            // locally show immediately
            showReaction(String(targetUserId), emoji);
        } catch (err) {
            console.error("Failed to send reaction:", err);
        } finally {
            setPickerOpenFor(null);
        }
    };

    // scroll to bottom on new message
    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // --- Keyboard ESC ---
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") setFullscreen(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    useEffect(() => {
        const host = participants.find((p) => p.user.id === videoCall.host_id);
        hostPeerIdRef.current = host?.peer_id || null;
    }, [participants, videoCall.host_id]);

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

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#1b1f2b] border border-gray-700 rounded-lg p-6 max-w-sm shadow-xl">
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Camera Activated
                        </h3>
                        <p className="text-gray-300 mb-6">
                            {confirmationMessage}
                        </p>
                        <button
                            onClick={() => setShowConfirmation(false)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

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
                            {participants.map((p) => {
                                // choose stable key for ref lookup: prefer peer_id, fallback to user id
                                const refKey = p.peer_id || String(p.user.id);
                                return (
                                    <div
                                        key={p.id}
                                        className="relative bg-[#11131b] border border-gray-700 rounded-xl p-3 flex flex-col items-center justify-center shadow-md"
                                    >
                                        <video
                                            ref={(el) =>
                                                setParticipantVideoRef(
                                                    refKey,
                                                    el
                                                )
                                            }
                                            autoPlay
                                            playsInline
                                            muted={p.user.id === currentUser.id}
                                            className="rounded-lg w-full h-32 object-cover bg-black"
                                        />
                                        {/* Fallback avatar + name overlay (will show even if video blank) */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
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
                                    </div>
                                );
                            })}
                        </div>
                    </aside>
                )}

                {/* Main Video */}
                <main className="flex-1 flex flex-col items-center justify-center relative">
                    <video
                        ref={mainVideoRef}
                        autoPlay
                        playsInline
                        muted={currentUser.id === videoCall.host_id}
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
