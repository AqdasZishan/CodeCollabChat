import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle } from "lucide-react";
import backend from "../../../backend";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProjectDeletionRequests() {
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${backend}/room/project/deletion-requests`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setRequests(response.data.requests);
    } catch (error) {
      console.error("Error fetching deletion requests:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRequest(requestId, action) {
    try {
      const response = await axios.post(
        `${backend}/room/project/deletion-request/handle`,
        {
          requestId,
          action,
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

      // Show success message
      const message =
        action === "APPROVE"
          ? "Project deletion request approved successfully"
          : "Project deletion request rejected successfully";
      alert(message);
    } catch (error) {
      console.error("Error handling request:", error);
      alert(error.response?.data?.message || "Error handling request");
    }
  }

  const filteredRequests = requests.filter((request) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      request.project.name.toLowerCase().includes(searchTerm) ||
      request.student.name.toLowerCase().includes(searchTerm) ||
      request.student.email.toLowerCase().includes(searchTerm) ||
      request.student.roll.toLowerCase().includes(searchTerm)
    );
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6">Project Deletion Requests</h2>
        <Alert className="bg-gray-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Requests</AlertTitle>
          <AlertDescription>
            There are no pending project deletion requests at the moment.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Project Deletion Requests</h2>
      <div className="mb-6">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card
            key={request.id}
            className="bg-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Project: {request.project.name}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Requested by:</span>{" "}
                      {request.student.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Roll:</span>{" "}
                      {request.student.roll}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span>{" "}
                      {request.student.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Requested at:</span>{" "}
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="space-x-3">
                  <Button
                    onClick={() => handleRequest(request.id, "APPROVE")}
                    className="bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleRequest(request.id, "REJECT")}
                    className="bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredRequests.length === 0 && (
          <Alert className="bg-gray-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Results</AlertTitle>
            <AlertDescription>
              No requests match your search criteria.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
