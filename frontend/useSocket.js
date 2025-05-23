import { useMemo } from "react";
import { io } from "socket.io-client";
import backend from "./backend";

// const useSocket=()=>{
//   const socket =useMemo(()=>io("http://localhost:3000"),[])
//   // const socket=io("http://localhost:3000")

//   console.log(socket.id)
//   return socket;
// }

export const socket = io(backend, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, reconnect manually
    socket.connect();
  }
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

// export default useSocket;
