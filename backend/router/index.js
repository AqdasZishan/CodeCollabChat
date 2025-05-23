import express from "express";
import userRouter from "./user.js";
import roomRouter from "./class.js";

const router = express.Router();

// Mount routers with correct paths
router.use("/user", userRouter);
router.use("/room", roomRouter);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default router;
