import { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import backend from "../../../backend";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Authcontext } from "../AuthProvider";
import { useRecoilState } from "recoil";
import { insideClassRoom } from "@/state/roomid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for projects

export default function Project({ classroomName }) {
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [isRenameProjectModalOpen, setIsRenameProjectModalOpen] =
    useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [activeTab, setActiveTab] = useState("my");
  const [selectedProject, setSelectedProject] = useState(null);

  const [searchParams] = useSearchParams();
  const classId = searchParams.get("classId");
  const token = localStorage.getItem("token");
  const value = useContext(Authcontext);
  const navigate = useNavigate();
  const [, setInsideClass] = useRecoilState(insideClassRoom);

  //create project
  async function handleCreateProject() {
    await axios
      .post(
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
      )
      .then((res) => {
        setProjects((prev) => [...prev, res.data.project]);
        setNewProjectName("");
        setIsCreateProjectModalOpen(false);
      })
      .catch((err) => {
        console.error("Error creating project:", err);
        alert(err.response?.data?.message || "Error creating project");
      });
  }

  //rename project
  async function handleRenameProject() {
    if (!selectedProject || !newProjectName.trim()) return;

    try {
      await axios.put(
        `${backend}/room/project/rename/${selectedProject.id}`,
        {
          name: newProjectName.trim(),
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      setProjects((prev) =>
        prev.map((project) =>
          project.id === selectedProject.id
            ? { ...project, name: newProjectName.trim() }
            : project
        )
      );
      setNewProjectName("");
      setIsRenameProjectModalOpen(false);
      setSelectedProject(null);
    } catch (err) {
      console.error("Error renaming project:", err);
      alert(err.response?.data?.message || "Error renaming project");
    }
  }

  //delete project
  async function handleDeleteProject(projectId) {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await axios.post(
        `${backend}/room/project/delete/${projectId}`,
        {},
        {
          headers: {
            Authorization: token,
          },
        }
      );

      // If the user is a student, show the request sent message
      if (value.type === "STUDENT") {
        alert(response.data.message);
        return;
      }

      // If the user is a teacher, remove the project from the list
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (err) {
      console.error("Error deleting project:", err);
      alert(err.response?.data?.message || "Error deleting project");
    }
  }

  //fetch all projects
  async function FetchProjects() {
    await axios
      .get(`${backend}/room/class/${classId}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        setProjects(res.data.projects);
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
      });
  }

  async function handleCodeEditor(projectId, projectName, userId) {
    navigate(`/code/${classId}/${projectId}/${projectName}/${userId}`);
  }

  useEffect(() => {
    FetchProjects();
  }, [classId, token]);

  useEffect(() => {
    const handlePopState = () => {
      setInsideClass(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setInsideClass]);

  // Handle search input changes
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      setShowRecommendations(false);
      return;
    }

    const filteredProjects = projects.filter((project) => {
      const searchTerm = query.toLowerCase();
      return (
        project.name.toLowerCase().includes(searchTerm) ||
        project.user.name.toLowerCase().includes(searchTerm) ||
        project.user.email.toLowerCase().includes(searchTerm)
      );
    });

    setSearchResults(filteredProjects);
    setShowRecommendations(true);
  };

  // Handle project selection from recommendations
  const handleProjectSelect = (project) => {
    setSearchQuery(project.name);
    setShowRecommendations(false);
    handleCodeEditor(project.id, project.name, project.user.id);
  };

  if (!value?.id) {
    return <div>Loading...</div>;
  }

  const filteredProjects =
    activeTab === "my"
      ? projects.filter((project) => project.user.id === value.id)
      : projects;

  return (
    <div className="p-8 bg-white min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">{classroomName}</h2>
      <div className="flex justify-between items-center mb-8">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Search Projects"
            className="pl-10 bg-white border border-gray-200 shadow-sm"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery && setShowRecommendations(true)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {showRecommendations && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {searchResults.map((project) => (
                <div
                  key={project.id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  onClick={() => handleProjectSelect(project)}
                >
                  <div className="font-medium text-gray-900">
                    {project.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Created by: {project.user.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button
          className="bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200"
          onClick={() => setIsCreateProjectModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Create a Project
        </Button>
      </div>
      <Tabs defaultValue="my" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="bg-white shadow-sm">
          <TabsTrigger
            value="my"
            className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900"
          >
            My Projects
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900"
          >
            All Projects
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div
                      className="flex-1 cursor-pointer group"
                      onClick={() =>
                        handleCodeEditor(
                          project.id,
                          project.name,
                          project.user.id
                        )
                      }
                    >
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-150">
                        {project.name}
                      </h3>
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Created by:</span>{" "}
                          {project.user.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span>{" "}
                          {project.user.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Class:</span>{" "}
                          {project.class.name}
                        </p>
                      </div>
                    </div>
                    {project.user.id === value.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProject(project);
                              setNewProjectName(project.name);
                              setIsRenameProjectModalOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-600 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="my">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div
                      className="flex-1 cursor-pointer group"
                      onClick={() =>
                        handleCodeEditor(
                          project.id,
                          project.name,
                          project.user.id
                        )
                      }
                    >
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-150">
                        {project.name}
                      </h3>
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Created by:</span>{" "}
                          {project.user.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span>{" "}
                          {project.user.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Class:</span>{" "}
                          {project.class.name}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedProject(project);
                            setNewProjectName(project.name);
                            setIsRenameProjectModalOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-600 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={isCreateProjectModalOpen}
        onOpenChange={setIsCreateProjectModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Create a Project
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Enter a name for your new project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectName" className="col-span-4 text-gray-700">
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
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsCreateProjectModalOpen(false)}
              className="hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!newProjectName.trim()}
              className="bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRenameProjectModalOpen}
        onOpenChange={setIsRenameProjectModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Rename Project
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Enter a new name for your project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="renameProjectName"
                className="col-span-4 text-gray-700"
              >
                New Project Name
              </Label>
              <Input
                id="renameProjectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter New Project Name"
                className="col-span-4"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsRenameProjectModalOpen(false);
                setSelectedProject(null);
                setNewProjectName("");
              }}
              className="hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameProject}
              disabled={!newProjectName.trim()}
              className="bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Rename
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
