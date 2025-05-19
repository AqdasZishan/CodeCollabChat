const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const Class = require("../models/Class");
const auth = require("../middleware/auth");

// Create a new project
router.post("/create", auth, async (req, res) => {
  try {
    const { name, classId } = req.body;
    const userId = req.user.id;

    const classRoom = await Class.findById(classId);
    if (!classRoom) {
      return res.status(404).json({ message: "Class not found" });
    }

    const project = new Project({
      name,
      user: userId,
      class: classId,
    });

    await project.save();
    res.status(201).json({ project });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Error creating project" });
  }
});

// Rename a project
router.put("/rename/:projectId", auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if the user is the creator of the project
    if (project.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to rename this project" });
    }

    project.name = name;
    await project.save();

    res.json({ project });
  } catch (error) {
    console.error("Error renaming project:", error);
    res.status(500).json({ message: "Error renaming project" });
  }
});

// Delete a project
router.delete("/delete/:projectId", auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if the user is the creator of the project
    if (project.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this project" });
    }

    await Project.findByIdAndDelete(projectId);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Error deleting project" });
  }
});

module.exports = router;
