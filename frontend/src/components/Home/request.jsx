import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Mail,
  BookOpen,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import backend from "../../../backend";
import axios from "axios";
import { toast } from "sonner";

// const requests = [
//     { id: 1, name: 'John Doe', roll: 'A001', email: 'john@example.com', classroom: 'Math 101', classroomId: 'MATH101' },
//     { id: 2, name: 'Jane Smith', roll: 'A002', email: 'jane@example.com', classroom: 'Physics 202', classroomId: 'PHYS202' },
//   ]

export default function RequestsContent() {
  const [search, setSearch] = useState("");
  const [requests, setRequest] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRequests();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchRequests() {
    try {
      setIsLoading(true);
      const res = await axios.get(`${backend}/room/class/request/get`, {
        headers: {
          Authorization: token,
        },
      });
      console.log("Fetched requests:", res.data.requests);
      setRequest(res.data.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch requests");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRequest(value, requestId, classId, studentId) {
    try {
      setIsProcessing(true);
      const res = await axios.post(
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

      // Remove the request from the list
      setRequest((prevRequests) =>
        prevRequests.filter((req) => req.id !== requestId)
      );

      // Show success message
      toast.success(
        res.data.message ||
          (value === "APPROVE"
            ? "Request approved successfully"
            : "Request rejected successfully")
      );

      // Refresh the requests list
      fetchRequests();
    } catch (error) {
      console.error("Error handling request:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to process request";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
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

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-500">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold">Pending Requests</h2>
          <p className="text-sm text-gray-500">
            Review and manage student requests to join classrooms
          </p>
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white w-64"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {search
              ? "No requests match your search"
              : "No pending requests found"}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${request.student.email}`}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(request.student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {request.student.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Roll: {request.student.roll}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-2" />
                        {request.student.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <BookOpen className="h-4 w-4 mr-2" />
                        {request.class.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() =>
                        handleRequest(
                          "APPROVE",
                          request.id,
                          request.classId,
                          request.StudentId
                        )
                      }
                      disabled={isProcessing}
                      variant="outline"
                      className="bg-green-500 text-white hover:bg-green-600 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() =>
                        handleRequest(
                          "REJECT",
                          request.id,
                          request.classId,
                          request.StudentId
                        )
                      }
                      disabled={isProcessing}
                      variant="outline"
                      className="bg-red-500 text-white hover:bg-red-600 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
