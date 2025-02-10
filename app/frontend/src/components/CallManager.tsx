import React, { useRef, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../contexts/AuthContext.tsx";

const socket = io(import.meta.env.SITE_ADDRESS || '', {
    path: '/socket.io',
    withCredentials: true,
    transports: ['websocket', 'polling']
});

interface CallProps {
    recipientId: string | null;
}

const CallManager: React.FC<CallProps> = ({ recipientId }) => {
    const authContext = useContext(AuthContext);
    const userId = authContext?.id;
    const [isCalling, setIsCalling] = useState(false);
    const [incomingCall, setIncomingCall] = useState(false);
    const [callerId, setCallerId] = useState<string | null>(null); // Store caller's ID
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        socket.on("incoming-call", async ({ caller, offer }) => {
            console.log("Incoming call from:", caller);
            setIncomingCall(true);
            setCallerId(caller); // Store caller ID

            // Set up WebRTC connection
            peerConnectionRef.current = createPeerConnection();
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        });

        socket.on("call-answered", async ({ answer }) => {
            console.log("Call answered, connecting...");
            await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("call-rejected", () => {
            console.log("Call was rejected.");
            endCall();
        });

        socket.on("ice-candidate", async ({ candidate }) => {
            try {
                await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error("Error adding ICE candidate:", error);
            }
        });

        socket.on("call-ended", () => {
            console.log("Call ended");
            endCall();
        });

        return () => {
            socket.off("incoming-call");
            socket.off("call-answered");
            socket.off("call-rejected");
            socket.off("ice-candidate");
            socket.off("call-ended");
        };
    }, []);

    const createPeerConnection = () => {
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", { recipient: recipientId, candidate: event.candidate });
            }
        };

        peerConnection.ontrack = (event) => {
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0];
            }
        };

        return peerConnection;
    };

    const startCall = async () => {
        if (!recipientId) return;
        setIsCalling(true);

        // Get user media
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Create WebRTC connection
        peerConnectionRef.current = createPeerConnection();

        localStreamRef.current.getTracks().forEach((track) => {
            peerConnectionRef.current?.addTrack(track, localStreamRef.current!);
        });

        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);

        socket.emit("call-user", { caller: userId, recipient: recipientId, offer });
    };

    const acceptCall = async () => {
        setIncomingCall(false);
        if (!callerId) return;

        localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Ensure peerConnection is initialized
        if (!peerConnectionRef.current) {
            peerConnectionRef.current = createPeerConnection();
        }

        localStreamRef.current.getTracks().forEach((track) => {
            peerConnectionRef.current?.addTrack(track, localStreamRef.current!);
        });

        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        socket.emit("answer-call", { caller: callerId, answer });
    };


    const rejectCall = () => {
        if (!callerId) return;

        socket.emit("call-rejected", { caller: callerId });
        setIncomingCall(false);
        setCallerId(null);
    };

    const endCall = () => {
        peerConnectionRef.current?.close();
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        setIsCalling(false);
        setIncomingCall(false);
        setCallerId(null);
        socket.emit("end-call", { recipient: recipientId });
    };

    return (
        <div className="flex flex-col items-center">
            <button
                className="p-3 bg-primary text-buttonText rounded-md hover:bg-buttonHover transition-all"
                onClick={startCall}
                disabled={isCalling || incomingCall}
            >
                {isCalling ? "Calling..." : "Start Call"}
            </button>

            {incomingCall && (
                <div className="mt-4 flex gap-4">
                    <button className="p-3 bg-green-500 text-white rounded-md" onClick={acceptCall}>
                        Accept Call
                    </button>
                    <button className="p-3 bg-red-500 text-white rounded-md" onClick={rejectCall}>
                        Reject Call
                    </button>
                </div>
            )}

            {isCalling && (
                <button className="p-3 mt-4 bg-red-500 text-white rounded-md" onClick={endCall}>
                    End Call
                </button>
            )}

            <audio ref={remoteAudioRef} autoPlay />
        </div>
    );
};

export default CallManager;
