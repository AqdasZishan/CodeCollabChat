import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus } from "lucide-react";
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
  const [insideClass, setInsideClass] = useRecoilState(insideClassRoom);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/create");
    }

    fetchAll();
    if (value.type === "STUDENT") {
      fetchStudent();
    } else {
      fetchTeacher();
    }
  }, [value]);

  //fetch all classes
  async function fetchAll() {
    await axios
      .get(`${backend}/room/class/get/all`, {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        setAllClass(res.data.classes);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //fetch teacher classes
  async function fetchTeacher() {
    await axios
      .get(`${backend}/room/class/get/teacher`, {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        setJoinedClass(res.data.classes);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //fetch student classes
  async function fetchStudent() {
    await axios
      .get(`${backend}/room/class/get/student`, {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        setJoinedClass(res.data.classes);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Handle search input changes
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      setShowRecommendations(false);
      return;
    }

    const results = allclass.filter((classroom) => {
      const searchTerm = query.toLowerCase();
      return (
        classroom.name.toLowerCase().includes(searchTerm) ||
        classroom.teacher.name.toLowerCase().includes(searchTerm)
      );
    });

    setSearchResults(results);
    setShowRecommendations(true);
  };

  // Handle classroom selection from recommendations
  const handleClassroomSelect = (classroom) => {
    setSearchQuery(classroom.name);
    setShowRecommendations(false);
    request(classroom.id, classroom.teacher.id);
  };

  //request to join the class
  async function request(id, teacherId) {
    if (value.type === "TEACHER") {
      alert("teacher cannot join others class ask admin");
      return;
    }
    axios
      .post(
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
      )
      .then((res) => {
        if (res.data.status) {
          console.log(res.data.status);
          alert(res.data.status);
        } else {
          console.log(res.data);
          alert(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //create a classRoom
  async function handleCreateClassroom() {
    await axios
      .post(
        `${backend}/room/class/create`,
        {
          name: newClassroomName,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then((res) => {
        setJoinedClass((prev) => [...prev, res.data.room]);
        setIsCreateModalOpen(false);
        setNewClassroomName("");
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //open the class
  async function OpenClass(classId) {
    navigate(`?classId=${classId}`);
    setClassId(classId);
    setInsideClass(true);
  }

  return (
    <>
      {insideClass ? (
        <Project
          classroomName={"Class"}
          classId={classId}
          setInsideClass={setInsideClass}
        />
      ) : (
        <div className="p-8 bg-white min-h-screen">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Classrooms</h2>
          <div className="flex justify-between items-center mb-8">
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search Classrooms"
                className="pl-10 bg-white border border-gray-200 shadow-sm"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowRecommendations(true)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {showRecommendations && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((classroom) => (
                    <div
                      key={classroom.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                      onClick={() => handleClassroomSelect(classroom)}
                    >
                      <div className="font-medium text-gray-900">
                        {classroom.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Teacher: {classroom.teacher.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-x-4">
              <Button
                variant="outline"
                className="bg-white hover:bg-gray-50 transition-colors duration-200 border border-gray-200"
                onClick={() => {
                  setIsJoinModalOpen(true);
                }}
              >
                Join a Classroom
              </Button>
              <Button
                className={`${
                  value.type === "STUDENT" ? "hidden" : ""
                } bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200`}
                onClick={() => {
                  setIsCreateModalOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Create a Classroom
              </Button>
            </div>
          </div>
          <Tabs defaultValue="my" className="mb-8">
            <TabsList className="bg-white border border-gray-200">
              <TabsTrigger
                value="my"
                className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900"
              >
                My Classrooms
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900"
              >
                All Classrooms
              </TabsTrigger>
            </TabsList>
            <TabsContent value="my">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {joinedclass.map((classroom) => (
                  <Card
                    key={classroom.id}
                    className="bg-white border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div
                          className="flex-1 cursor-pointer group"
                          onClick={() => OpenClass(classroom.id)}
                        >
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-150">
                            {classroom.name}
                          </h3>
                          <div className="mt-3 space-y-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Teacher:</span>{" "}
                              {classroom.teacher.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Email:</span>{" "}
                              {classroom.teacher.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="all">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {allclass.map((classroom) => (
                  <Card
                    key={classroom.id}
                    className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div
                          className="flex-1 cursor-pointer group"
                          onClick={() => OpenClass(classroom.id)}
                        >
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-150">
                            {classroom.name}
                          </h3>
                          <div className="mt-3 space-y-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Teacher:</span>{" "}
                              {classroom.teacher.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Email:</span>{" "}
                              {classroom.teacher.email}
                            </p>
                          </div>
                        </div>
                        {value.type === "STUDENT" && (
                          <Button
                            onClick={() =>
                              request(classroom.id, classroom.teacher.id)
                            }
                            className="bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200"
                          >
                            Join
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Join Classroom Modal */}
          <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Join a Classroom
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Enter the classroom ID to join.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="classId" className="col-span-4 text-gray-700">
                    Classroom ID
                  </Label>
                  <Input
                    id="classId"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    placeholder="Enter Classroom ID"
                    className="col-span-4"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => request(classId)}
                  disabled={!classId.trim()}
                  className="bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Classroom Modal */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Create a Classroom
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Enter a name for your new classroom.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="classroomName"
                    className="col-span-4 text-gray-700"
                  >
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
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateClassroom}
                  disabled={!newClassroomName.trim()}
                  className="bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}
