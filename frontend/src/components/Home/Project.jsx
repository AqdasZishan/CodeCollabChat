import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Plus,
  Code2,
  User,
  Mail,
  BookOpen,
  Loader2,
  ArrowLeft,
  Edit2,
  Trash2,
  Lock,
  Users,
} from "lucide-react";
import axios from "axios";
import backend from "../../../backend";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Authcontext } from "../AuthProvider";
import { useRecoilState } from "recoil";
import { insideClassRoom } from "@/state/roomid";
import { toast } from "sonner";
import PropTypes from "prop-types";
import { socket } from "../../../useSocket";

export default function Project({ classroomName }) {
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editProjectName, setEditProjectName] = useState("");
  const [error, setError] = useState(null);
  const [projectConnections, setProjectConnections] = useState({});

  const [searchParams] = useSearchParams();
  const classId = searchParams.get("classId");
  const token = localStorage.getItem("token");
  const value = useContext(Authcontext);
  const navigate = useNavigate();
  const [, setInsideClass] = useRecoilState(insideClassRoom);

  async function handleCreateProject() {
    if (!newProjectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await axios.post(
        `${backend}/room/project/create`,
        {
          name: newProjectName,
          classId,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setProjects((prev) => [...prev, res.data.project]);
      toast.success("Project created successfully");
      setNewProjectName("");
      setIsCreateProjectModalOpen(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create project";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function FetchProjects() {
    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.get(`${backend}/room/class/${classId}`, {
        headers: {
          Authorization: token,
        },
      });
      setProjects(res.data.projects);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch projects";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCodeEditor(projectId, projectName, userId) {
    if (userId !== value.id && value.type !== "TEACHER") {
      toast.error("You don't have access to this project");
      return;
    }
    navigate(`/code/${classId}/${projectId}/${projectName}/${userId}`);
  }

  async function handleEditProject() {
    if (!editProjectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await axios.post(
        `${backend}/room/project/update/${editingProject.id}`,
        {
          name: editProjectName,
          classId: classId,
        },
        { headers: { Authorization: token } }
      );

      setProjects((prev) =>
        prev.map((proj) =>
          proj.id === editingProject.id ? res.data.project : proj
        )
      );
      setIsEditModalOpen(false);
      setEditingProject(null);
      setEditProjectName("");
      toast.success("Project updated successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update project";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEditClick(e, project) {
    e.stopPropagation();
    setEditingProject(project);
    setEditProjectName(project.name);
    setIsEditModalOpen(true);
  }

  async function handleDeleteProject(projectId) {
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await axios.post(
        `${backend}/room/project/delete/${projectId}`,
        {},
        { headers: { Authorization: token } }
      );
      setProjects((prev) => prev.filter((proj) => proj.id !== projectId));
      toast.success(res.data.message);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete project";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    FetchProjects();
  }, [classId]);

  useEffect(() => {
    const handlePopState = () => {
      setInsideClass(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setInsideClass]);

  useEffect(() => {
    // Listen for project connection updates
    socket.on("projectUsers", ({ roomId, count, users }) => {
      setProjectConnections((prev) => ({
        ...prev,
        [roomId]: count,
      }));
    });

    socket.on("userLeft", ({ userId, userName, roomId }) => {
      // Update connection count for the specific room
      setProjectConnections((prev) => ({
        ...prev,
        [roomId]: Math.max(0, (prev[roomId] || 0) - 1),
      }));
    });

    return () => {
      socket.off("projectUsers");
      socket.off("userLeft");
    };
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBack = () => {
    setInsideClass(false);
    navigate("/");
  };

  if (!value?.id) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-3xl font-bold">Projects</h2>
          <div className="flex items-center text-gray-500">
            <BookOpen className="h-5 w-5 mr-2" />
            <span className="text-lg">{classroomName}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search Projects"
              className="pl-10 bg-white w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <Button
            className="bg-primary text-white hover:bg-primary/90"
            onClick={() => setIsCreateProjectModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Project
          </Button>
        </div>
      </div>

      <Tabs defaultValue="my" className="space-y-4">
        <TabsList className="bg-white">
          <TabsTrigger value="my" className="data-[state=active]:bg-gray-100">
            My Projects
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-gray-100">
            All Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center text-gray-500">
              {searchQuery
                ? "No projects found matching your search"
                : "No projects yet"}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  onClick={() =>
                    handleCodeEditor(project.id, project.name, project.user.id)
                  }
                  className={`bg-white shadow-sm hover:shadow-md transition-shadow ${
                    project.user.id !== value.id && value.type !== "TEACHER"
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex items-center justify-between">
                      <div className="flex items-center">
                        <Code2 className="h-5 w-5 mr-2 text-primary" />
                        {project.name}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{projectConnections[project.id] || 0}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-2" />
                          {project.user.name}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-4 w-4 mr-2" />
                          {project.user.email}
                        </div>
                      </div>
                      {project.user.id === value.id ||
                      value.type === "TEACHER" ? (
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleEditClick(e, project)}
                            className="hover:bg-gray-100"
                          >
                            <Edit2 className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this project?"
                                )
                              ) {
                                handleDeleteProject(project.id);
                              }
                            }}
                            className="hover:bg-gray-100"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-gray-500">
                          <Lock className="h-4 w-4 mr-1" />
                          <span>Locked</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects
                .filter((project) => project.user.id === value.id)
                .map((project) => (
                  <Card
                    key={project.id}
                    onClick={() =>
                      handleCodeEditor(
                        project.id,
                        project.name,
                        project.user.id
                      )
                    }
                    className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl flex items-center justify-between">
                        <div className="flex items-center">
                          <Code2 className="h-5 w-5 mr-2 text-primary" />
                          {project.name}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{projectConnections[project.id] || 0}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="h-4 w-4 mr-2" />
                            {project.user.name}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="h-4 w-4 mr-2" />
                            {project.user.email}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleEditClick(e, project)}
                            className="hover:bg-gray-100"
                          >
                            <Edit2 className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this project?"
                                )
                              ) {
                                handleDeleteProject(project.id);
                              }
                            }}
                            className="hover:bg-gray-100"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={isCreateProjectModalOpen}
        onOpenChange={setIsCreateProjectModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a Project</DialogTitle>
            <DialogDescription>
              Create a new project for your classroom
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectName" className="col-span-4">
                Project Name
              </Label>
              <Input
                id="projectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter Project Name"
                className="col-span-4"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateProjectModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!newProjectName.trim() || isSubmitting}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the name of your project
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editProjectName" className="col-span-4">
                Project Name
              </Label>
              <Input
                id="editProjectName"
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
                placeholder="Enter Project Name"
                className="col-span-4"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditProject}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Project"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

Project.propTypes = {
  classroomName: PropTypes.string.isRequired,
};
