import { io } from "socket.io-client";

// Updated to connect to merged server on port 3001 (instead of 3003)
const socket = io("http://localhost:3001", {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export default socket;
