import http from "http";
import express from "express";
import { Server } from "socket.io";
import router from "./router/index.js"; // Adjusted import for the router
import cors from "cors";
const PORT = 3000;
const IP_ADDRESS = "0.0.0.0";

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    message: "Backend Connected",
  });
});

app.use("/", router); // Use the router

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.broadcast.emit("notification", "new user connected: " + socket.id);

  socket.on("disconnect", () => {
    console.log("disconnected");
  });

  socket.on("privateRoomJoin", (data) => {
    socket.join(data);
    console.log(data + " joined private room");
  });

  socket.on("joinProjectRoom", ({ roomid }) => {
    socket.join(roomid);
    console.log(`${socket.id} joined project room: ${roomid}`);
  });

  socket.on("sendChatMessage", (messageData) => {
    socket.to(messageData.roomId).emit("chatMessage", messageData);
    console.log(
      `Chat message in room ${messageData.roomId}: ${messageData.text}`
    );
  });

  socket.on("privateMessage", ({ roomid, data, languageCode }) => {
    socket.to(roomid).emit("privateMessage", data, languageCode);
    console.log({ data, roomid, languageCode });
  });

  socket.on("message", (data) => {
    console.log(data);
  });
});

httpServer.listen(PORT, () => {
  console.log("Backend connected on port " + PORT + " " + IP_ADDRESS);
});
