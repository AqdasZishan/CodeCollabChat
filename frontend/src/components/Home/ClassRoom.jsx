import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Loader2,
  BookOpen,
  Edit2,
  Trash2,
  User,
} from "lucide-react";
import { useRecoilState } from "recoil";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import backend from "../../../backend";
import { allclasses, insideClassRoom, joinedClasses } from "@/state/roomid";
import { useNavigate } from "react-router-dom";
import { Authcontext } from "../AuthProvider";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Project from "./Project";
import { toast } from "sonner";

export default function ClassroomsContent() {
  const [allclass, setAllClass] = useRecoilState(allclasses);
  const [joinedclass, setJoinedClass] = useRecoilState(joinedClasses);
  const value = useContext(Authcontext);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState("");
  const [classId, setClassId] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");
  const [insideClass, setInsideClass] = useRecoilState(insideClassRoom);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [editClassName, setEditClassName] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/create");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (value.type === "TEACHER") {
          await Promise.all([fetchAll(), fetchTeacher()]);
        } else {
          await Promise.all([fetchAll(), fetchStudent()]);
        }
      } catch (error) {
        toast.error("Failed to load classrooms");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [value]);

  async function fetchAll() {
    try {
      const res = await axios.get(`${backend}/room/class/get/all`, {
        headers: { Authorization: token },
      });
      setAllClass(res.data.classes);
    } catch (error) {
      toast.error("Failed to fetch all classrooms");
    }
  }

  async function fetchTeacher() {
    try {
      const res = await axios.get(`${backend}/room/class/get/teacher`, {
        headers: { Authorization: token },
      });
      setJoinedClass(res.data.classes);
    } catch (error) {
      toast.error("Failed to fetch teacher classrooms");
    }
  }

  async function fetchStudent() {
    try {
      const res = await axios.get(`${backend}/room/class/get/student`, {
        headers: { Authorization: token },
      });
      setJoinedClass(res.data.classes);
    } catch (error) {
      toast.error("Failed to fetch student classrooms");
    }
  }

  async function request(id, teacherId) {
    if (value.type === "TEACHER") {
      toast.error("Teachers cannot join other classrooms");
      return;
    }

    console.log("Sending request with data:", {
      classId: id,
      teacherId: teacherId,
    });
    console.log("Auth token:", token);

    try {
      const res = await axios.post(
        `${backend}/room/class/request/create`,
        {
          classId: id,
          teacherId: teacherId,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      console.log("Request response:", res.data);

      if (res.data.status === "PENDING") {
        toast.info("Request already pending");
      } else if (res.data.message === "you are already in the class") {
        toast.info("You are already a member of this class");
      } else {
        toast.success("Request sent successfully");
        // Refresh the joined classes list
        fetchStudent();
      }
    } catch (error) {
      console.error("Request error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage =
        error.response?.data?.message || "Failed to send request";
      toast.error(errorMessage);
    }
  }

  async function handleCreateClassroom() {
    if (!newClassroomName.trim()) {
      toast.error("Please enter a classroom name");
      return;
    }

    try {
      const res = await axios.post(
        `${backend}/room/class/create`,
        { name: newClassroomName },
        { headers: { Authorization: token } }
      );

      setJoinedClass((prev) => [...prev, res.data.room]);
      setIsCreateModalOpen(false);
      setNewClassroomName("");
      toast.success("Classroom created successfully");
    } catch (error) {
      toast.error("Failed to create classroom");
    }
  }

  async function handleJoinClassroom() {
    if (!joinCode.trim()) {
      toast.error("Please enter a classroom code");
      return;
    }

    try {
      // Add your join classroom logic here
      setIsJoinModalOpen(false);
      setJoinCode("");
      toast.success("Successfully joined classroom");
    } catch (error) {
      toast.error("Failed to join classroom");
    }
  }

  function OpenClass(classId, className) {
    navigate(`?classId=${classId}`);
    setClassId(classId);
    setSelectedClassName(className);
    setInsideClass(true);
  }

  const filteredClasses = (classes) => {
    return classes.filter((cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  async function handleEditClassroom() {
    try {
      const res = await axios.post(
        `${backend}/room/class/update/${editingClassroom.id}`,
        { name: editClassName },
        { headers: { Authorization: token } }
      );
      setAllClass((prev) =>
        prev.map((c) => (c.id === editingClassroom.id ? res.data.class : c))
      );
      setJoinedClass((prev) =>
        prev.map((c) => (c.id === editingClassroom.id ? res.data.class : c))
      );
      setEditingClassroom(null);
      setEditClassName("");
      toast.success("Classroom renamed successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to rename classroom"
      );
    }
  }

  function handleEditClick(e, classroom) {
    e.stopPropagation();
    setEditingClassroom(classroom);
    setEditClassName(classroom.name);
    setIsEditModalOpen(true);
  }

  async function handleDeleteClassroom(id) {
    try {
      const res = await axios.post(
        `${backend}/room/class/delete/${id}`,
        {},
        {
          headers: { Authorization: token },
        }
      );

      if (res.data.message) {
        toast.success(res.data.message);
        setAllClass((prev) => prev.filter((cls) => cls.id !== id));
        setJoinedClass((prev) => prev.filter((cls) => cls.id !== id));
      } else {
        toast.error("Failed to delete classroom");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete classroom"
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {insideClass ? (
        <Project
          classroomName={selectedClassName}
          classId={classId}
          setInsideClass={setInsideClass}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-bold">Classrooms</h2>
              <div className="flex items-center text-gray-500">
                <BookOpen className="h-5 w-5 mr-2" />
                <span className="text-lg">Total: {allclass.length}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search Classrooms"
                  className="pl-10 bg-white w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {value.type !== "STUDENT" && (
                <Button
                  className="bg-primary text-white hover:bg-primary/90"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Create Classroom
                </Button>
              )}
              {value.type === "STUDENT" && (
                <Button
                  className="bg-primary text-white hover:bg-primary/90"
                  onClick={() => setIsJoinModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Join Classroom
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-white">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gray-100"
              >
                All Classrooms
              </TabsTrigger>
              <TabsTrigger
                value="joined"
                className="data-[state=active]:bg-gray-100"
              >
                My Classrooms
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredClasses(allclass).map((classroom) => (
                    <Card
                      key={classroom.id}
                      className="bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center justify-between">
                          <div className="flex items-center">
                            <BookOpen className="h-5 w-5 mr-2 text-primary" />
                            {classroom.name}
                          </div>
                          {value.type !== "STUDENT" &&
                            classroom.teacher.id === value.id && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => handleEditClick(e, classroom)}
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
                                        "Are you sure you want to delete this classroom?"
                                      )
                                    ) {
                                      handleDeleteClassroom(classroom.id);
                                    }
                                  }}
                                  className="hover:bg-gray-100"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-2" />
                          {classroom.teacher.name}
                        </div>
                        {value.type === "STUDENT" &&
                          !joinedclass.some((c) => c.id === classroom.id) && (
                            <Button
                              variant="outline"
                              className="w-full mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                request(classroom.id, classroom.teacher.id);
                              }}
                            >
                              Request to Join
                            </Button>
                          )}
                        {joinedclass.some((c) => c.id === classroom.id) && (
                          <Button
                            variant="default"
                            className="w-full mt-2"
                            onClick={() =>
                              OpenClass(classroom.id, classroom.name)
                            }
                          >
                            Enter Classroom
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="joined" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredClasses(joinedclass).map((classroom) => (
                    <Card
                      key={classroom.id}
                      className="bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center justify-between">
                          <div className="flex items-center">
                            <BookOpen className="h-5 w-5 mr-2 text-primary" />
                            {classroom.name}
                          </div>
                          {value.type !== "STUDENT" &&
                            classroom.teacher.id === value.id && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => handleEditClick(e, classroom)}
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
                                        "Are you sure you want to delete this classroom?"
                                      )
                                    ) {
                                      handleDeleteClassroom(classroom.id);
                                    }
                                  }}
                                  className="hover:bg-gray-100"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-2" />
                          {classroom.teacher.name}
                        </div>
                        <Button
                          variant="default"
                          className="w-full mt-2"
                          onClick={() =>
                            OpenClass(classroom.id, classroom.name)
                          }
                        >
                          Enter Classroom
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join a Classroom</DialogTitle>
            <DialogDescription>
              Enter the classroom code provided by your teacher
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="classroomCode"
                placeholder="Enter Classroom Code"
                className="col-span-4"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsJoinModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoinClassroom}>Join Classroom</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a Classroom</DialogTitle>
            <DialogDescription>
              Create a new classroom for your students
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="classroomName" className="col-span-4">
                Classroom Name
              </Label>
              <Input
                id="classroomName"
                value={newClassroomName}
                onChange={(e) => setNewClassroomName(e.target.value)}
                placeholder="Enter Classroom Name"
                className="col-span-4"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateClassroom}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Create Classroom
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Classroom</DialogTitle>
            <DialogDescription>
              Update the name of your classroom
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editClassName" className="col-span-4">
                Classroom Name
              </Label>
              <Input
                id="editClassName"
                value={editClassName}
                onChange={(e) => setEditClassName(e.target.value)}
                placeholder="Enter Classroom Name"
                className="col-span-4"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditClassroom}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Update Classroom
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
