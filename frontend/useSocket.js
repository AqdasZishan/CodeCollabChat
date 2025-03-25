import { useMemo } from "react";
import { io } from "socket.io-client";

// const useSocket=()=>{
//   const socket =useMemo(()=>io("http://localhost:3000"),[])
//   // const socket=io("http://localhost:3000")

//   console.log(socket.id)
//   return socket;
// }
export const socket = io("http://localhost:3000");

// export default useSocket;
