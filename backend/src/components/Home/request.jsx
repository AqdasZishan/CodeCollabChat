import { useEffect, useState } from "react";
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
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await axios.get(`${backend}/room/class/request/get`, {
          headers: {
            Authorization: token,
          },
        });
        setRequests(response.data.requests);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    }
    fetchRequests();
  }, [token]);

  async function handleRequest(value, requestId, classId, studentId) {
    try {
      const response = await axios.post(
        `${backend}/room/class/request/handle`,
        {
          value,
          requestId,
          classId,
          studentId,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      // Update the requests list by filtering out the handled request
      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.id !== requestId)
      );

      alert(response.data.message);
    } catch (error) {
      console.error("Error handling request:", error);
      alert(error.response?.data?.message || "Error handling request");
    }
  }

  const filteredRequests = requests.filter((request) => {
    const searchTerm = search.toLowerCase();
    return (
      request.student.name.toLowerCase().includes(searchTerm) ||
      request.student.email.toLowerCase().includes(searchTerm) ||
      request.student.roll.toLowerCase().includes(searchTerm) ||
      request.class.name.toLowerCase().includes(searchTerm)
    );
  });

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
        {filteredRequests.map((request) => (
          <Card key={request.id} className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {request.student.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Roll: {request.student.roll}
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
                    onClick={() =>
                      handleRequest(
                        "APPROVE",
                        request.id,
                        request.class.id,
                        request.student.id
                      )
                    }
                    variant="outline"
                    className="bg-green-500 text-white hover:bg-green-600"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() =>
                      handleRequest(
                        "REJECT",
                        request.id,
                        request.class.id,
                        request.student.id
                      )
                    }
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
        {filteredRequests.length === 0 && (
          <p className="text-center text-gray-500">No pending requests found</p>
        )}
      </div>
    </>
  );
}
