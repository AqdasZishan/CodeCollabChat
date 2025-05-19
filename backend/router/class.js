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
      return res.status(404).json({
        message: "student cannot delete the class",
      });
    }
    const classname = await prisma.class.delete({
      where: {
        id: id,
      },
    });
    return res.json({
      message: `class deleted with name :${classname.name}`,
    });
  } catch (err) {
    res.status(404).json({
      message: err,
    });
    return;
  }
});

//request to join classes
router.post("/class/request/create", authmiddleware, async (req, res) => {
  const userId = req.USERID;
  const value = req.body; //get (classId)
  // console.log({value})
  if (!value.classId) {
    return res.status(404).json({
      message: "select valid classId",
    });
  }
  try {
    const status = await prisma.request.findFirst({
      where: {
        StudentId: userId,
        classId: value.classId,
      },
    });
    //if request is in pendind or rejected
    if (status) {
      return res.json({
        status: status.state,
      });
    }
    //if you are already in a class logic here and return early
    const joined = await prisma.class.findFirst({
      where: {
        students: {
          some: {
            id: userId,
          },
        },
      },
      include: {},
    });
    console.log({ joined });

    if (joined) {
      return res.json({
        message: "you are already in the class",
      });
    }

    //create  a request
    const id = uuid();
    await prisma.request.create({
      data: {
        id,
        classId: value.classId,
        StudentId: userId,
        TeacherId: value.teacherId,
        state: "PENDING",
      },
    });
    return res.json({
      message: "ask your teacher to let you in",
    });
  } catch (err) {
    res.status(404).json({
      message: err,
    });
    return;
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
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    // If user is a student, create a deletion request
    if (user.type === "STUDENT") {
      const project = await prisma.project.findFirst({
        where: {
          id: id,
        },
        include: {
          class: {
            select: {
              teacherId: true,
            },
          },
        },
      });

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      // Check if a deletion request already exists
      const existingRequest = await prisma.projectDeletionRequest.findFirst({
        where: {
          projectId: id,
          studentId: userId,
          state: "PENDING",
        },
      });

      if (existingRequest) {
        return res.status(400).json({
          message: "A deletion request for this project already exists",
        });
      }

      // Create new deletion request
      const requestId = uuid();
      await prisma.projectDeletionRequest.create({
        data: {
          id: requestId,
          projectId: id,
          studentId: userId,
          teacherId: project.class.teacherId,
          state: "PENDING",
        },
      });

      return res.json({
        message: "Deletion request sent to teacher",
      });
    }

    // If user is a teacher, proceed with deletion
    const project = await prisma.project.delete({
      where: {
        id: id,
      },
    });
    return res.json({
      message: `project deleted with name :${project.name}`,
    });
  } catch (err) {
    return res.status(404).json({
      message: err,
    });
  }
});

// Get project deletion requests for a teacher
router.get("/project/deletion-requests", authmiddleware, async (req, res) => {
  const userId = req.USERID;

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (user.type !== "TEACHER") {
      return res.status(403).json({
        message: "Only teachers can view deletion requests",
      });
    }

    const requests = await prisma.projectDeletionRequest.findMany({
      where: {
        teacherId: userId,
        state: "PENDING",
      },
      include: {
        project: {
          select: {
            name: true,
            id: true,
          },
        },
        student: {
          select: {
            name: true,
            email: true,
            roll: true,
          },
        },
      },
    });

    return res.json({
      requests,
    });
  } catch (err) {
    return res.status(500).json({
      message: err,
    });
  }
});

// Handle project deletion request
router.post(
  "/project/deletion-request/handle",
  authmiddleware,
  async (req, res) => {
    const userId = req.USERID;
    const { requestId, action } = req.body;

    try {
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      });

      if (user.type !== "TEACHER") {
        return res.status(403).json({
          message: "Only teachers can handle deletion requests",
        });
      }

      const request = await prisma.projectDeletionRequest.findFirst({
        where: {
          id: requestId,
          teacherId: userId,
          state: "PENDING",
        },
      });

      if (!request) {
        return res.status(404).json({
          message: "Request not found",
        });
      }

      if (action === "APPROVE") {
        // Delete the project
        await prisma.project.delete({
          where: {
            id: request.projectId,
          },
        });

        // Delete the request
        await prisma.projectDeletionRequest.delete({
          where: {
            id: requestId,
          },
        });

        return res.json({
          message: "Project deleted successfully",
        });
      } else if (action === "REJECT") {
        // Update request state to rejected
        await prisma.projectDeletionRequest.update({
          where: {
            id: requestId,
          },
          data: {
            state: "REJECTED",
          },
        });

        return res.json({
          message: "Deletion request rejected",
        });
      } else {
        return res.status(400).json({
          message: "Invalid action",
        });
      }
    } catch (err) {
      return res.status(500).json({
        message: err,
      });
    }
  }
);

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

//rename project
router.put("/project/rename/:id", authmiddleware, async (req, res) => {
  const id = req.params.id;
  const userId = req.USERID;
  const { name } = req.body;

  try {
    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    // Find the project
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

    // Check if user is the creator of the project
    if (project.userId !== userId) {
      return res.status(403).json({
        message: "Not authorized to rename this project",
      });
    }

    // Update project name
    const updatedProject = await prisma.project.update({
      where: {
        id: id,
      },
      data: {
        name: name.trim(),
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
      message: "Project renamed successfully",
      project: updatedProject,
    });
  } catch (err) {
    console.error("Error renaming project:", err);
    return res.status(500).json({
      message: "Failed to rename project",
    });
  }
});
