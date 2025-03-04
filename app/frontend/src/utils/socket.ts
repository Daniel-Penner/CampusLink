import { io } from "socket.io-client";

const socket = io(import.meta.env.SITE_ADDRESS || '', {
    path: "/socket.io",
    withCredentials: true,
    transports: ["websocket", "polling"]
});

export default socket;
