import express from "express";
import { ZodError } from "zod";
import { classSchema, projectSchema } from "../middleware.js/zodmiddleware.js";
import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";
import authmiddleware from "../middleware.js/authmiddleware.js";
const prisma = new PrismaClient();
const router = express.Router();
export default router;

//create class
router.post("/class/create", authmiddleware, async (req, res) => {
  const userId = req.USERID;
  const value = req.body;

  try {
    await classSchema.parseAsync(value);

    let user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    //check  it is teacher only
    const type = user.type;
    if (type === "STUDENT") {
      res.status(404).json({
        message: "student cannot create room",
      });
      return;
    }
    //check that another room with same id exists
    let room = await prisma.class.findFirst({
      where: {
        name: value.name,
      },
    });

    if (room) {
      return res.status(404).json({
        message: "room already exists Please choose another name",
      });
    }

    const id = uuid();
    room = await prisma.class.create({
      data: {
        id,
        name: value.name,
        teacherId: user.id,
      },
    });
    room = await prisma.class.findFirst({
      where: {
        id: id,
      },
      include: {
        teacher: {
          select: {
            name: true,
          },
        },
      },
    });

    return res.json({
      message: "room created",
      room,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(404).json({
        message: err.issues[0].message,
      });
      return;
    }
  }
});

//get all classes
router.get("/class/get/all", authmiddleware, async (req, res) => {
  const userId = req.USERID;
  try {
    const classes = await prisma.class.findMany({
      include: {
        teacher: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    return res.json({
      message: "all classes are fetched",
      classes,
    });
  } catch (err) {
    res.status(404).json({
      message: err,
    });
    return;
  }
});

//get class of teacher joined
router.get("/class/get/teacher", authmiddleware, async (req, res) => {
  const userId = req.USERID;

  try {
    const classes = await prisma.class.findMany({
      where: {
        teacher: {
          id: userId,
        },
      },
      include: {
        teacher: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    return res.json({
      classes,
    });
  } catch (err) {
    return res.json({
      message: err,
    });
  }
});

//get class of student joined
router.get("/class/get/student", authmiddleware, async (req, res) => {
  const userId = req.USERID;
  console.log({ userId });

  try {
    const classes = await prisma.class.findMany({
      where: {
        students: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        teacher: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    console.log({ classes });
    return res.json({
      classes,
    });
  } catch (err) {
    return res.json({
      message: err,
    });
  }
});

//delete class
router.post("/class/delete/:id", authmiddleware, async (req, res) => {
  const userId = req.USERID;
  const id = req.params.id;
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (user.type == "STUDENT") {
      return res.status(403).json({
        message: "Students cannot delete classes",
      });
    }

    // Check if the classroom exists and belongs to the teacher
    const classroom = await prisma.class.findFirst({
      where: {
        id: id,
        teacherId: userId,
      },
    });

    if (!classroom) {
      return res.status(404).json({
        message:
          "Classroom not found or you don't have permission to delete it",
      });
    }

    // Delete all related records first
    await prisma.$transaction(async (tx) => {
      // Delete all requests for this class
      await tx.request.deleteMany({
        where: { classId: id },
      });

      // Delete all projects and their codes
      const projects = await tx.project.findMany({
        where: { classId: id },
        select: { id: true },
      });

      for (const project of projects) {
        await tx.code.deleteMany({
          where: { projectId: project.id },
        });
      }

      await tx.project.deleteMany({
        where: { classId: id },
      });

      // Finally delete the class
      await tx.class.delete({
        where: { id: id },
      });
    });

    return res.json({
      message: `Class "${classroom.name}" has been deleted successfully`,
    });
  } catch (err) {
    console.error("Error deleting classroom:", err);
    if (err.code === "P2025") {
      return res.status(404).json({
        message: "Classroom not found",
      });
    }
    return res.status(500).json({
      message: "Failed to delete classroom. Please try again.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

//request to join classes
router.post("/class/request/create", authmiddleware, async (req, res) => {
  const userId = req.USERID;
  const { classId, teacherId } = req.body;

  console.log("Received request creation request:", {
    userId,
    classId,
    teacherId,
  });

  // Validate required fields
  if (!classId || !teacherId) {
    console.log("Missing required fields");
    return res.status(400).json({
      message: "classId and teacherId are required",
    });
  }

  try {
    // Verify the class exists and belongs to the specified teacher
    const classExists = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: teacherId,
      },
    });

    if (!classExists) {
      console.log("Class not found or doesn't belong to the specified teacher");
      return res.status(404).json({
        message: "Class not found or invalid teacher",
      });
    }

    // Check if user is a student
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.type !== "STUDENT") {
      console.log("Only students can request to join classes");
      return res.status(403).json({
        message: "Only students can request to join classes",
      });
    }

    // Check if user is already in this specific class
    console.log("Checking if user is already in this specific class...");
    const isInClass = await prisma.class.findFirst({
      where: {
        id: classId,
        students: {
          some: {
            id: userId,
          },
        },
      },
    });
    console.log("User's class membership status:", isInClass);

    if (isInClass) {
      return res.status(200).json({
        message: "You are already a member of this class",
      });
    }

    // Check for existing request
    console.log("Checking for existing request...");
    const existingRequest = await prisma.request.findFirst({
      where: {
        StudentId: userId,
        classId: classId,
      },
    });
    console.log("Existing request status:", existingRequest);

    // If there's an existing request, check its status
    if (existingRequest) {
      if (existingRequest.state === "PENDING") {
        return res.status(200).json({
          status: existingRequest.state,
          message: `You already have a ${existingRequest.state.toLowerCase()} request for this class`,
        });
      } else if (existingRequest.state === "REJECTED") {
        // If the previous request was rejected, delete it and create a new one
        await prisma.request.delete({
          where: {
            id: existingRequest.id,
          },
        });
      }
    }

    // Create the request using a transaction
    console.log("Creating new request...");
    const newRequest = await prisma.$transaction(async (tx) => {
      const id = uuid();
      return await tx.request.create({
        data: {
          id,
          classId,
          StudentId: userId,
          TeacherId: teacherId,
          state: "PENDING",
        },
        include: {
          student: {
            select: {
              name: true,
              email: true,
              roll: true,
            },
          },
          class: {
            select: {
              name: true,
            },
          },
        },
      });
    });

    console.log("Created request:", newRequest);

    return res.status(201).json({
      message: "Request sent successfully",
      request: newRequest,
    });
  } catch (err) {
    console.error("Error creating request:", err);

    // Handle specific error types
    if (err.code === "P2002") {
      return res.status(409).json({
        message: "A request for this class already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create request",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

//get all requests as a teacher
router.get("/class/request/get", authmiddleware, async (req, res) => {
  const userId = req.USERID;
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (user.type == "STUDENT") {
      return res.status(404).json({
        message: "student cannot get the requests lists",
      });
    }
    const requests = await prisma.request.findMany({
      where: {
        TeacherId: userId,
        state: "PENDING",
      },
      include: {
        student: {
          select: {
            email: true,
            name: true,
            roll: true,
          },
        },
        class: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    return res.json({
      requests,
    });
  } catch (err) {
    return res.json({
      message: err,
    });
  }
});

//handle requests as a teacher
router.post("/class/request/handle", authmiddleware, async (req, res) => {
  const userId = req.USERID;
  const value = req.body; //(value==REJECT and APPROVE) (requestId) (classId) (studentId)
  try {
    const req = await prisma.request.findFirst({
      where: {
        id: value.requestId,
      },
    });
    if (!req) {
      res.status(404).json({
        message: "request not found",
      });
      return;
    }
    if (value.value === "REJECT") {
      await prisma.request.update({
        where: {
          id: value.requestId,
        },
        data: {
          state: "REJECTED",
        },
      });

      res.json({
        message: "student rejected",
      });
      return;
    } else if (value.value === "APPROVE") {
      await prisma.$transaction(async (tx) => {
        await tx.request.delete({
          where: {
            id: value.requestId,
          },
        });
        await tx.class.update({
          where: {
            id: value.classId,
          },
          data: {
            students: {
              connect: { id: value.studentId },
            },
          },
        });

        await tx.user.findMany({
          select: {
            classrooms: true,
          },
        });
      });
      res.json({
        message: "student accepted to the class",
      });
      return;
    }
  } catch (err) {
    return res.status(404).json({
      message: err,
    });
  }
});

//create project
router.post("/project/create", authmiddleware, async (req, res) => {
  const userId = req.USERID;
  const value = req.body;
  try {
    await projectSchema.parseAsync(value);

    const classname = await prisma.class.findFirst({
      where: {
        id: value.id,
      },
    });
    if (!classname) {
      return res.status(404).json({
        message: "class not found",
      });
    }
    const id = uuid();
    let project = await prisma.project.create({
      data: {
        id,
        name: value.name,
        userId: userId,
        classId: value.classId,
      },
    });

    project = await prisma.project.findFirst({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            roll: true,
            id: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
      },
    });

    return res.json({
      message: "project created",
      project,
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

//get all projects
router.get("/class/:classId", authmiddleware, async (req, res) => {
  const userId = req.USERID;
  const classId = req.params.classId;
  console.log({ classId });

  try {
    const projects = await prisma.project.findMany({
      where: {
        classId: classId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            roll: true,
            id: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
      },
    });
    return res.json({
      projects,
    });
  } catch (err) {
    return res.status(404).json({
      message: err,
    });
  }
});

//delete project
router.post("/project/delete/:id", authmiddleware, async (req, res) => {
  const id = req.params.id;
  const userId = req.USERID;

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: id,
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Allow deletion if user is the project owner
    if (project.userId !== userId) {
      return res.status(403).json({
        message: "You can only delete your own projects",
      });
    }

    await prisma.project.delete({
      where: {
        id: id,
      },
    });
    return res.json({
      message: `Project deleted with name: ${project.name}`,
    });
  } catch (err) {
    return res.status(404).json({
      message: err,
    });
  }
});

//save code in a project
router.post("/project/code/save/:id", authmiddleware, async (req, res) => {
  const userId = req.USERID;
  const projectId = req.params.id;
  const body = req.body; //code , languageName
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
      },
    });
    if (!project) {
      return res.status(404).json({
        message: "project not found",
      });
    }
    const id = uuid();
    const code = await prisma.code.upsert({
      where: {
        projectId_language: {
          projectId: projectId,
          language: body.language,
        },
      },
      update: {
        data: body.code,
      },
      create: {
        id,
        projectId,
        language: body.language,
        data: body.code,
      },
    });

    return res.json({
      code,
    });
  } catch (err) {
    console.log(err);
  }
});

//get code for a project
router.get("/project/code/:id", authmiddleware, async (req, res) => {
  const userId = req.USERID;
  const projectId = req.params.id;
  try {
    const codes = await prisma.code.findMany({
      where: {
        projectId: projectId,
      },
    });
    return res.json({
      codes,
    });
  } catch (err) {
    if (err instanceof ZodError) {
    } else {
      console.log(err);
      return res.status(404).json({
        message: "not found",
      });
    }
  }
});

//update class name
router.post("/class/update/:id", authmiddleware, async (req, res) => {
  const userId = req.USERID;
  const id = req.params.id;
  const value = req.body;

  try {
    await classSchema.parseAsync(value);

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (user.type === "STUDENT") {
      return res.status(404).json({
        message: "student cannot update the class",
      });
    }

    // Check if another room with same name exists
    const existingRoom = await prisma.class.findFirst({
      where: {
        name: value.name,
        id: {
          not: id,
        },
      },
    });

    if (existingRoom) {
      return res.status(404).json({
        message: "room with this name already exists",
      });
    }

    const updatedClass = await prisma.class.update({
      where: {
        id: id,
      },
      data: {
        name: value.name,
      },
      include: {
        teacher: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    return res.json({
      message: "class updated successfully",
      class: updatedClass,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(404).json({
        message: err.issues[0].message,
      });
    }
    return res.status(404).json({
      message: err,
    });
  }
});

//update project name
router.post("/project/update/:id", authmiddleware, async (req, res) => {
  const userId = req.USERID;
  const id = req.params.id;
  const value = req.body;

  try {
    await projectSchema.parseAsync(value);

    const project = await prisma.project.findFirst({
      where: {
        id: id,
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Allow update if user is the project owner
    if (project.userId !== userId) {
      return res.status(403).json({
        message: "You can only update your own projects",
      });
    }

    // Verify the class exists
    const classExists = await prisma.class.findFirst({
      where: {
        id: value.classId,
      },
    });

    if (!classExists) {
      return res.status(404).json({
        message: "Class not found",
      });
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: id,
      },
      data: {
        name: value.name,
        classId: value.classId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            roll: true,
            id: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
      },
    });

    return res.json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: err.issues[0].message,
      });
    }
    return res.status(500).json({
      message: err.message || "Failed to update project",
    });
  }
});
