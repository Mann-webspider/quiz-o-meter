import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
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
