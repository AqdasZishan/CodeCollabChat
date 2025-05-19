import { useState } from "react";
import ClassroomsContent from "./ClassRoom";
import { BookOpen, Users, UserCircle, LogOut, Trash2 } from "lucide-react";
import { useContext } from "react";
import { Authcontext } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import ProfileContent from "../Home/profile";
import RequestsContent from "./request";
import ProjectDeletionRequests from "./ProjectDeletionRequests";

export default function Home() {
  const [activeTab, setActiveTab] = useState("classrooms");
  const value = useContext(Authcontext);
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  if (!value.name) {
    return (
      <>
        <div>Loading.....</div>
      </>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">CodeCollab</h1>
        </div>
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("classrooms")}
            className={`flex items-center space-x-2 w-full p-2 rounded ${
              activeTab === "classrooms"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Classrooms</span>
          </button>
          {value.type === "TEACHER" && (
            <>
              <button
                onClick={() => setActiveTab("requests")}
                className={`flex items-center space-x-2 w-full p-2 rounded ${
                  activeTab === "requests"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Join Requests</span>
              </button>
              <button
                onClick={() => setActiveTab("deletion-requests")}
                className={`flex items-center space-x-2 w-full p-2 rounded ${
                  activeTab === "deletion-requests"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Trash2 className="w-5 h-5" />
                <span>Deletion Requests</span>
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center space-x-2 w-full p-2 rounded ${
              activeTab === "profile"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <UserCircle className="w-5 h-5" />
            <span>Profile</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center space-x-2 w-full p-2 rounded text-gray-600 hover:bg-gray-50"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "classrooms" && <ClassroomsContent />}
        {activeTab === "requests" && value.type === "TEACHER" && (
          <RequestsContent />
        )}
        {activeTab === "deletion-requests" && value.type === "TEACHER" && (
          <ProjectDeletionRequests />
        )}
        {activeTab === "profile" && <ProfileContent />}
      </div>
    </div>
  );
}

//disabled={!newClassroomName.trim()}
