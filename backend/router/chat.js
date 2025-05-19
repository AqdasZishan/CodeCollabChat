import express from "express";
import authmiddleware from "../middleware.js/authmiddleware.js";

const router = express.Router();

// Basic chat endpoints
router.get("/messages", authmiddleware, async (req, res) => {
  try {
    res.json({ message: "Chat messages endpoint" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
