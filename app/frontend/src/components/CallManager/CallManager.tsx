import React, { useRef, useEffect, useState, useContext } from "react";
import socket from "../../utils/socket.ts";  // Import the shared socket instance
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

    // Ensure user joins their own socket room on mount
    useEffect(() => {
        if (userId) {
            console.log(`Joining room for user: ${userId}`);
            socket.emit("join", userId);
        }
    }, [userId]);

    useEffect(() => {
        console.log("Setting up call event listeners...");

        const handleIncomingCall = async ({caller, offer}: IncomingCallPayload) => {
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

        const handleCallAnswered = async ({answer}: AnswerCallPayload) => {
            console.log("Call answered, setting remote description...");
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        };

        const handleICECandidate = async ({candidate}: IceCandidatePayload) => {
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
    }, [socket]);

    const createPeerConnection = () => {
        if (peerConnectionRef.current) {
            console.warn("Peer connection already exists. Returning existing connection.");
            return peerConnectionRef.current;
        }

        console.log("Creating new peer connection...");
        const peerConnection = new RTCPeerConnection({
            iceServers: [{urls: "stun:stun.l.google.com:19302"}],
        });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate && recipientId) {
                console.log("Sending ICE candidate...");
                socket.emit("ice-candidate", {recipient: recipientId, candidate: event.candidate});
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
        if (!recipientId) {
            console.error("No recipient ID provided.");
            return;
        }
        if (isCalling) {
            console.warn("Already in a call.");
            return;
        }

        console.log(`Calling user ${recipientId}`);
        setIsCalling(true);

        localStreamRef.current = await navigator.mediaDevices.getUserMedia({audio: true});

        const peerConnection = createPeerConnection();
        localStreamRef.current.getTracks().forEach((track) => {
            if (peerConnection.signalingState !== "closed") {
                peerConnection.addTrack(track, localStreamRef.current!);
            } else {
                console.error("Cannot add track, connection is closed.");
            }
        });

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        console.log("Sending call request with offer:", offer);
        socket.emit("call-user", {caller: userId, recipient: recipientId, offer});
    };

    const acceptCall = async () => {
        setIncomingCall(false);
        setIsCalling(true); // Ensure UI updates correctly

        if (!callerId) {
            console.error("Caller ID is missing, cannot accept the call.");
            return;
        }

        console.log(`Accepting call from: ${callerId}`);

        localStreamRef.current = await navigator.mediaDevices.getUserMedia({audio: true});

        const peerConnection = createPeerConnection();
        localStreamRef.current.getTracks().forEach((track) => {
            if (peerConnection.signalingState !== "closed") {
                peerConnection.addTrack(track, localStreamRef.current!);
            } else {
                console.error("Cannot add track, connection is closed.");
            }
        });

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        console.log("Answering call with SDP:", answer);
        socket.emit("answer-call", {caller: callerId, answer});
    };


    const rejectCall = () => {
        if (!callerId) {
            console.error("Reject call attempted but callerId is missing.");
            return;
        }

        console.log(`Rejecting call from: ${callerId}`);
        socket.emit("call-rejected", { caller: callerId });

        setIncomingCall(false);
        setCallerId(null);
    };


    const endCall = () => {
        if (!peerConnectionRef.current) {
            console.warn("No active call to end.");
            return;
        }

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
        socket.emit("end-call", {recipient: recipientId});
    };

    return (
        <div className="flex flex-col items-center">
            {!isCalling && !incomingCall && (
                <button
                    className="p-3 bg-primary text-buttonText rounded-md hover:bg-buttonHover transition-all"
                    onClick={startCall}
                    disabled={isCalling || incomingCall}
                >
                    {isCalling ? "Calling..." : "Start Call"}
                </button>
            )}

            {incomingCall && (
                <div className="mt-4 flex flex-col items-center gap-4 bg-secondaryBackground p-4 rounded-md shadow-md">
                    <p className="text-white text-center font-bold">Incoming call from {callerId}...</p>
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

            <audio ref={remoteAudioRef} autoPlay playsInline/>
        </div>
    );
}

    export default CallManager;
