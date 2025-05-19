import http from "http";
import express from "express";
import { Server } from "socket.io";
import router from "./router/index.js";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./router/user.js";
import chatRouter from "./router/chat.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const PORT = 3000;
const IP_ADDRESS = "0.0.0.0";

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());
app.use(cors());

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    message: "Backend Connected",
  });
});

app.use("/", router);
app.use("/user", userRouter);
app.use("/chat", chatRouter);

// Track connected users and their rooms
const connectedUsers = new Map();
const roomUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const roomId = connectedUsers.get(socket.id);
    if (roomId) {
      const users = roomUsers.get(roomId) || new Set();
      users.delete(socket.id);
      if (users.size === 0) {
        roomUsers.delete(roomId);
      } else {
        roomUsers.set(roomId, users);
      }
    }
    connectedUsers.delete(socket.id);
    socket.broadcast.emit("userDisconnected", socket.id);
  });

  // Handle private room joining
  socket.on("privateRoomJoin", (roomId) => {
    if (!roomId || typeof roomId !== "string") {
      socket.emit("error", { message: "Invalid room ID" });
      return;
    }
    socket.join(roomId);
    connectedUsers.set(socket.id, roomId);
    const users = roomUsers.get(roomId) || new Set();
    users.add(socket.id);
    roomUsers.set(roomId, users);
    console.log(`User ${socket.id} joined private room: ${roomId}`);
  });

  // Handle project room joining
  socket.on("joinProjectRoom", ({ roomid }) => {
    if (!roomid || typeof roomid !== "string") {
      socket.emit("error", { message: "Invalid project room ID" });
      return;
    }
    socket.join(roomid);
    connectedUsers.set(socket.id, roomid);
    const users = roomUsers.get(roomid) || new Set();
    users.add(socket.id);
    roomUsers.set(roomid, users);
    console.log(`User ${socket.id} joined project room: ${roomid}`);
  });

  // Handle leaving project room
  socket.on("leaveProjectRoom", ({ roomid }) => {
    if (!roomid || typeof roomid !== "string") {
      socket.emit("error", { message: "Invalid project room ID" });
      return;
    }
    socket.leave(roomid);
    connectedUsers.delete(socket.id);
    const users = roomUsers.get(roomid);
    if (users) {
      users.delete(socket.id);
      if (users.size === 0) {
        roomUsers.delete(roomid);
      } else {
        roomUsers.set(roomid, users);
      }
    }
    console.log(`User ${socket.id} left project room: ${roomid}`);
  });

  // Handle chat messages
  socket.on("sendChatMessage", (messageData) => {
    if (
      !messageData ||
      !messageData.roomId ||
      !messageData.text ||
      typeof messageData.text !== "string"
    ) {
      socket.emit("error", { message: "Invalid message format" });
      return;
    }
    io.to(messageData.roomId).emit("chatMessage", {
      ...messageData,
      timestamp: new Date().toISOString(),
    });
    console.log(
      `Chat message in room ${messageData.roomId}: ${messageData.text}`
    );
  });

  // Handle code updates
  socket.on("privateMessage", ({ roomid, data, languageCode }) => {
    if (!roomid || !data || !languageCode || typeof data !== "string") {
      socket.emit("error", { message: "Invalid code update format" });
      return;
    }
    socket.to(roomid).emit("privateMessage", data, languageCode);
    console.log(`Code update in room ${roomid} for language ${languageCode}`);
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
    socket.emit("error", { message: "Internal server error" });
  });
});

// Error handling for the HTTP server
httpServer.on("error", (error) => {
  console.error("Server error:", error);
  process.exit(1); // Exit on critical server errors
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

httpServer.listen(PORT, IP_ADDRESS, () => {
  console.log(`Backend connected on port ${PORT} at ${IP_ADDRESS}`);
});
