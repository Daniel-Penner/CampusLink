import React, { useRef, useEffect, useState, useContext } from "react";
import { FaPhone, FaPhoneSlash, FaTimes } from "react-icons/fa";
import socket from "../../utils/socket.ts";
import { AuthContext } from "../../contexts/AuthContext.tsx";

interface CallProps {
    recipientId: string | null;
}

interface IncomingCallPayload {
    caller: string;
    offer: RTCSessionDescriptionInit;
}

interface AnswerCallPayload {
    answer: RTCSessionDescriptionInit;
}

interface IceCandidatePayload {
    candidate: RTCIceCandidateInit;
}

interface CallRejectedPayload {
    caller: string;
}

const CallManager: React.FC<CallProps> = ({ recipientId }) => {
    const authContext = useContext(AuthContext);
    const userId = authContext?.id;
    const [isCalling, setIsCalling] = useState(false);
    const [incomingCall, setIncomingCall] = useState(false);
    const [callerId, setCallerId] = useState<string | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (userId) {
            console.log(`Joining room for user: ${userId}`);
            socket.emit("join", userId);
        }
    }, [userId]);

    useEffect(() => {
        console.log("Setting up call event listeners...");

        const handleIncomingCall = async ({ caller, offer }: IncomingCallPayload) => {
            console.log(`Incoming call from: ${caller}`);
            setIncomingCall(true);
            setCallerId(caller);

            if (!peerConnectionRef.current) {
                console.log("Creating new peer connection for incoming call...");
                peerConnectionRef.current = createPeerConnection();
            }

            console.log("Setting remote description with offer...");
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        };

        const handleCallAnswered = async ({ answer }: AnswerCallPayload) => {
            console.log("Call answered, setting remote description...");
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        };

        const handleICECandidate = async ({ candidate }: IceCandidatePayload) => {
            if (peerConnectionRef.current) {
                console.log("Adding received ICE candidate...");
                try {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (error) {
                    console.error("Error adding ICE candidate:", error);
                }
            }
        };

        const handleCallRejected = (payload: CallRejectedPayload | undefined) => {
            if (!payload || !payload.caller) {
                console.error("Received call rejection but no caller information.");
                return;
            }

            console.log(`Call from ${payload.caller} was rejected.`);
            endCall();
        };

        socket.on("incoming-call", handleIncomingCall);
        socket.on("call-answered", handleCallAnswered);
        socket.on("ice-candidate", handleICECandidate);
        socket.on("call-rejected", handleCallRejected);
        socket.on("call-ended", endCall);

        return () => {
            console.log("Cleaning up event listeners...");
            socket.off("incoming-call", handleIncomingCall);
            socket.off("call-answered", handleCallAnswered);
            socket.off("ice-candidate", handleICECandidate);
            socket.off("call-rejected", handleCallRejected);
            socket.off("call-ended", endCall);
        };
    }, []);

    const createPeerConnection = () => {
        console.log("Creating new peer connection...");
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate && recipientId) {
                console.log("Sending ICE candidate...");
                socket.emit("ice-candidate", { recipient: recipientId, candidate: event.candidate });
            }
        };

        peerConnection.ontrack = (event) => {
            if (remoteAudioRef.current) {
                console.log("Receiving remote audio stream...");
                remoteAudioRef.current.srcObject = event.streams[0];
            }
        };

        peerConnectionRef.current = peerConnection;
        return peerConnection;
    };

    const startCall = async () => {
        if (!recipientId || isCalling) return;

        console.log(`Calling user ${recipientId}`);
        setIsCalling(true);

        localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

        const peerConnection = createPeerConnection();
        localStreamRef.current.getTracks().forEach((track) => peerConnection.addTrack(track, localStreamRef.current!));

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        console.log("Sending call request with offer:", offer);
        socket.emit("call-user", { caller: userId, recipient: recipientId, offer });
    };

    const acceptCall = async () => {
        if (!callerId) return;

        console.log(`Accepting call from: ${callerId}`);
        setIncomingCall(false);
        setIsCalling(true);

        localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

        const peerConnection = createPeerConnection();
        localStreamRef.current.getTracks().forEach((track) => peerConnection.addTrack(track, localStreamRef.current!));

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        console.log("Answering call with SDP:", answer);
        socket.emit("answer-call", { caller: callerId, answer });
    };

    const rejectCall = () => {
        if (!callerId) return;

        console.log(`Rejecting call from: ${callerId}`);
        socket.emit("call-rejected", { caller: callerId });

        setIncomingCall(false);
        setCallerId(null);
    };

    const endCall = () => {
        if (!peerConnectionRef.current) return;

        console.log("Ending call...");
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }

        setIsCalling(false);
        setIncomingCall(false);
        setCallerId(null);
        socket.emit("end-call", { recipient: recipientId });
    };

    return (
        <>
            {/* Floating Start Call Button */}
            {!isCalling && !incomingCall && (
                <div
                    className="absolute top-[82px] right-0 bg-secondaryBackground p-3 rounded-lg shadow-lg flex items-center justify-center">
                    <button
                        className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all"
                        onClick={startCall}
                    >
                        <FaPhone size={24}/>
                    </button>
                </div>

            )}

            {/* Full-screen Incoming Call UI */}
            {incomingCall && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white">
                    <p className="text-lg font-bold">Incoming call from {callerId}...</p>
                    <div className="flex space-x-6 mt-6">
                        <button className="p-4 bg-green-500 text-white rounded-full" onClick={acceptCall}>
                            <FaPhone size={32} />
                        </button>
                        <button className="p-4 bg-red-500 text-white rounded-full" onClick={rejectCall}>
                            <FaTimes size={32} />
                        </button>
                    </div>
                </div>
            )}

            {/* Full-screen Call UI only while in a call */}
            {isCalling && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white">
                    <p className="text-lg font-bold">In Call...</p>
                    <button className="p-4 bg-red-500 text-white rounded-full mt-6" onClick={endCall}>
                        <FaPhoneSlash size={32} />
                    </button>
                </div>
            )}

            <audio ref={remoteAudioRef} autoPlay playsInline />
        </>
    );
};

export default CallManager;
