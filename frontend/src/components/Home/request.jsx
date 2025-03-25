import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import backend from "../../../backend";
import axios from "axios";

// const requests = [
//     { id: 1, name: 'John Doe', roll: 'A001', email: 'john@example.com', classroom: 'Math 101', classroomId: 'MATH101' },
//     { id: 2, name: 'Jane Smith', roll: 'A002', email: 'jane@example.com', classroom: 'Physics 202', classroomId: 'PHYS202' },
//   ]

export default function RequestsContent() {
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");
  const [requests, setRequest] = useState([]);
  const [button, setbutton] = useState("");

  useEffect(() => {
    async function request() {
      await axios
        .get(`${backend}/room/class/request/get`, {
          headers: {
            Authorization: token,
          },
        })
        .then((res) => {
          console.log(res.data);
          setRequest(res.data.requests);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    request();
  }, []);

  async function handleRequest(value, requestId, classId, studentId) {
    console.log("hello from request");
    console.log({ value }, { requestId });

    await axios
      .post(
        `${backend}/room/class/request/handle`,
        {
          value: value,
          requestId: requestId,
          classId,
          studentId,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then((res) => {
        console.log(res.data);

        value = requests.filter((req) => {
          return req.id !== requestId;
        });
        console.log(value);
        setRequest(value);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <>
      <h2 className="text-3xl font-bold mb-6">Pending Requests</h2>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search requests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md"
        />
      </div>
      <div className="space-y-4">
        {requests &&
          requests.map((request) => (
            <Card key={request.id} className="bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{}</h3>
                    <p className="text-sm text-gray-500">
                      Roll: {request.student.roll}
                    </p>
                    <p className="text-sm text-gray-500">
                      Name: {request.student.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Email: {request.student.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Classroom: {request.class.name} (ID: {request.class.id})
                    </p>
                  </div>
                  <div className="space-x-2">
                    <Button
                      onClick={(e) => {
                        handleRequest(
                          e.target.value,
                          request.id,
                          request.classId,
                          request.StudentId
                        );
                      }}
                      value="APPROVE"
                      variant="outline"
                      className="bg-green-500 text-white hover:bg-green-600"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={(e) => {
                        handleRequest(
                          e.target.value,
                          request.id,
                          request.classId,
                          request.StudentId
                        );
                      }}
                      value="REJECT"
                      variant="outline"
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </>
  );
}
