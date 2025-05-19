import { io } from "socket.io-client";
import backend from "./backend";

// Ensure proper WebSocket URL format
const SOCKET_URL = backend.replace(/^http/, "ws").replace(/^https/, "wss");

export const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  transports: ["websocket", "polling"],
  autoConnect: true,
  withCredentials: true,
});

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

socket.on("connect", () => {
  console.log("Socket connected successfully");
  reconnectAttempts = 0; // Reset reconnect attempts on successful connection
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
  reconnectAttempts++;

  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(
      "Max reconnection attempts reached. Please refresh the page."
    );
    return;
  }

  // Exponential backoff for reconnection
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
  setTimeout(() => {
    socket.connect();
  }, delay);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
  if (reason === "io server disconnect") {
    // Server initiated disconnect, try to reconnect
    socket.connect();
  }
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
  // Attempt to reconnect on error
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    socket.connect();
  }
});

// const useSocket=()=>{
//   const socket =useMemo(()=>io("http://localhost:3000"),[])
//   // const socket=io("http://localhost:3000")

//   console.log(socket.id)
//   return socket;
// }

// export default useSocket;

export default socket;
