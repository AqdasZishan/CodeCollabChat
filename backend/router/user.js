import express from "express";
import { userSchema, userSignin } from "../middleware.js/zodmiddleware.js"; // Ensure the correct path and extension
import { PrismaClient, UserType } from "@prisma/client";
import { v4 as uuid } from "uuid";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import authmiddlware from "../middleware.js/authmiddleware.js";
import {
  signin,
  signup,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/user.js";
import { verifyToken } from "../middleware/auth.js";
dotenv.config();
const prisma = new PrismaClient();

const userRouter = express.Router();
export default userRouter;

//create user
userRouter.post("/create", async (req, res) => {
  let value = req.body;

  try {
    await userSchema.parseAsync(value);
    console.log(value);
    if (
      (value.type === "STUDENT" && !value.roll) ||
      (value.type === "STUDENT" && value.roll.length <= 3)
    ) {
      return res.status(404).json({
        message: "roll cannot be empty please type roll grater than 3digit",
      });
    }
    console.log("adsfadsffd");
    let user = await prisma.user.findFirst({
      where: {
        email: value.email,
      },
    });
    if (user) {
      res.status(404).json({
        message: "user already exists",
      });
      return;
    }
    const id = uuid();
    user = await prisma.user.create({
      data: {
        id: id,
        email: value.email,
        name: value.name,
        roll: value.roll ? value.roll : "",
        type: value.type === "STUDENT" ? UserType.STUDENT : UserType.TEACHER,
        password: value.password,
      },
    });
    const token = jwt.sign({ id }, process.env.JWT_SECRET);

    return res.status(201).json({
      message: "User created",
      data: value,
      token: token,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: err.issues[0].message, // Return the validation errors
      });
    } else {
      return res.status(404).json({
        message: err,
      });
    }
  }
});

//signin user
userRouter.post("/signin", signin);

// Auth routes
userRouter.post("/signup", signup);

// Protected routes
userRouter.get("/", verifyToken, getUsers);
userRouter.put("/:id", verifyToken, updateUser);
userRouter.delete("/:id", verifyToken, deleteUser);

userRouter.get("/details", authmiddlware, async (req, res) => {
  const userId = await req.USERID;
  console.log({ userId });

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    console.log(user);

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    return res.json({
      message: "fetched user details",
      name: user.name,
      email: user.email,
      type: user.type,
      roll: user.roll,
      id: user.id,
    });
  } catch (err) {
    res.status(404).json({
      message: err,
    });
    return;
  }
});

userRouter.post("/update", authmiddlware, async (req, res) => {
  const userId = req.USERID;
  const { name } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        roll: user.roll,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
});

userRouter.post("/change-password", authmiddlware, async (req, res) => {
  const userId = req.USERID;
  const { currentPassword, newPassword } = req.body;

  try {
    // First verify the current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.password !== currentPassword) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    // Update the password
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });

    return res.json({
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Error changing password:", err);
    return res.status(500).json({
      message: "Failed to change password",
    });
  }
});
