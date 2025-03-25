import express from "express";
import userRouter from "./user.js"; // Correct path to user.js
import roomRouter from "./class.js";

const router = express.Router();

router.use("/user", userRouter); // User userRouter
router.use("/room", roomRouter); //project and class router

export default router;
