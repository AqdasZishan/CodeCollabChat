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
        console.log(res.data);

        setJoinedClass(res.data.classes);
      })
      .catch((err) => {
        console.log(err);
      });
  }
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
        console.log(res.data);

        setJoinedClass((prev) => [...prev, res.data.room]);
        setIsCreateModalOpen(false);
        console.log(`Creating classroom: ${newClassroomName}`);
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
        <>
          <h2 className="text-3xl font-bold mb-6">Classrooms</h2>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search Classrooms"
                className="pl-10 bg-white"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="space-x-4">
              <Button
                variant="outline"
                className="bg-white"
                onClick={() => {
                  setIsJoinModalOpen(true);
                }}
              >
                Join a Classroom
              </Button>
              <Button
                className={`${
                  value.type === "STUDENT" ? "hidden" : ""
                } bg-gray-800 text-white hover:bg-gray-700`}
                onClick={() => {
                  setIsCreateModalOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Create a Classroom
              </Button>
            </div>
          </div>
          <Tabs defaultValue="my" className="mb-6">
            <TabsList className="bg-white">
              <TabsTrigger
                value="my"
                className="data-[state=active]:bg-gray-100"
              >
                My Classrooms
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gray-100"
              >
                All Classrooms
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {allclass &&
                allclass.map((val) => {
                  return (
                    <>
                      <div
                        key={val.id}
                        className="pt-5 cursor-pointer"
                        onClick={() => {
                          request(val.id, val.teacher.id);
                        }}
                      >
                        <Card className="bg-white shadow-sm ">
                          <CardContent className="p-4">
                            <h3 className="text-xl font-semibold">
                              {val.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {val.teacher.name}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  );
                })}
            </TabsContent>
            <TabsContent value="my">
              {joinedclass &&
                joinedclass.map((val) => {
                  return (
                    <>
                      <div
                        key={val.id}
                        className="pt-5 cursor-pointer"
                        onClick={() => {
                          OpenClass(val.id);
                        }}
                      >
                        <Card className="bg-white shadow-sm ">
                          <CardContent className="p-4">
                            <h3 className="text-xl font-semibold">
                              {val.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {val.teacher.name}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  );
                })}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Join Classroom Modal */}
      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join a Classroom</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="classroomCode"
                placeholder="Enter Classroom Code"
                className="col-span-4"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsJoinModalOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                // Handle join logic here
                setIsJoinModalOpen(false);
              }}
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
            <DialogTitle>Create a Classroom</DialogTitle>
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
              onClick={() => {
                handleCreateClassroom();
              }}
              className="bg-black text-white hover:bg-gray-800"
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
