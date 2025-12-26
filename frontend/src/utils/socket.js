import { io } from "socket.io-client";
import config from "../config";
const socket = io(`${config.BACKEND_URL}`, {
	autoConnect: false, // Don't connect automatically
	reconnection: true,
	reconnectionDelay: 1000,
	reconnectionAttempts: 5,
	transports: ["websocket", "polling"],
});

// Add connection logging
socket.on("connect", () => {
	console.log("✓ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
	console.log("✗ Socket disconnected:", reason);
});

socket.on("connect_error", (error) => {
	console.error("✗ Socket connection error:", error);
});

export default socket;
