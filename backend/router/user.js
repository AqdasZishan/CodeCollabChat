import express from "express";
import { userSchema, userSignin } from "../middleware.js/zodmiddleware.js";
import { PrismaClient, UserType } from "@prisma/client";
import { v4 as uuid } from "uuid";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import authmiddlware from "../middleware.js/authmiddleware.js";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
dotenv.config();
const prisma = new PrismaClient();

const userRouter = express.Router();
export default userRouter;

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/profile-pictures";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."));
    }
  },
});

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
        message: err.issues[0].message, // return the validation Errors
      });
    } else {
      return res.status(404).json({
        message: err,
      });
    }
  }
});

//signin user
userRouter.post("/signin", async (req, res) => {
  let value = req.body;
  try {
    value = await userSignin.parseAsync(value);
    const user = await prisma.user.findFirst({
      where: {
        email: value.email,
      },
    });
    console.log(value);

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    if (user.password !== value.password) {
      return res.status(404).json({
        message: "wrong password",
      });
    }
    const id = user.id;
    const token = jwt.sign({ id }, process.env.JWT_SECRET);
    console.log(user);

    return res.json({
      message: "user logged in successfully",
      token,
      user,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(404).json({
        message: err.issues[0].message,
      });
    } else {
      return res.status(404).json({
        message: err,
      });
    }
  }
});

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
      profilePicture: user.profilePicture
        ? `${process.env.BACKEND_URL || "http://localhost:3000"}${
            user.profilePicture
          }`
        : "",
    });
  } catch (err) {
    res.status(404).json({
      message: err,
    });
    return;
  }
});

// Change password endpoint
userRouter.put("/change-password", authmiddlware, async (req, res) => {
  const userId = req.USERID;
  const { currentPassword, newPassword } = req.body;

  try {
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    // Get user and verify current password
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

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });

    return res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      message: "Failed to change password",
    });
  }
});

// Update profile endpoint
userRouter.put("/update", authmiddlware, async (req, res) => {
  const userId = req.USERID;
  const { name } = req.body;

  try {
    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update name
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() },
    });

    return res.json({
      message: "Profile updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        type: updatedUser.type,
        roll: updatedUser.roll,
        id: updatedUser.id,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
});

// Update profile picture endpoint
userRouter.put(
  "/update-picture",
  authmiddlware,
  upload.single("profilePicture"),
  async (req, res) => {
    const userId = req.USERID;

    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      // Get the file path
      const filePath = `/${req.file.path.replace(/\\/g, "/")}`;
      // Update user's profile picture in database
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { profilePicture: filePath },
      });
      const profilePictureUrl = `${
        process.env.BACKEND_URL || "http://localhost:3000"
      }${filePath}`;
      return res.json({
        message: "Profile picture updated successfully",
        profilePictureUrl: profilePictureUrl,
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      return res.status(500).json({
        message: "Failed to update profile picture",
      });
    }
  }
);
