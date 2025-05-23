import { useState } from "react";
import ClassroomsContent from "./ClassRoom";
import { BookOpen, Users, UserCircle, LogOut, Loader2 } from "lucide-react";
import { useContext } from "react";
import { Authcontext } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import ProfileContent from "../Home/profile";
import RequestsContent from "./request";
import { toast } from "sonner";

export default function Home() {
  const [activeTab, setActiveTab] = useState("classrooms");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const value = useContext(Authcontext);
  const navigate = useNavigate();

  async function logout() {
    try {
      setIsLoggingOut(true);
      localStorage.removeItem("token");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (!value.name) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">CollabTool</h1>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-colors ${
                activeTab === "profile"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <UserCircle className="w-5 h-5 mr-3" />
              <span className="font-medium">Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("classrooms")}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-colors ${
                activeTab === "classrooms"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Users className="w-5 h-5 mr-3" />
              <span className="font-medium">Home</span>
            </button>

            {value && value.type !== "STUDENT" && (
              <button
                onClick={() => setActiveTab("request")}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-colors ${
                  activeTab === "request"
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <BookOpen className="w-5 h-5 mr-3" />
                <span className="font-medium">Requests</span>
              </button>
            )}
          </nav>
        </div>

        <button
          onClick={logout}
          disabled={isLoggingOut}
          className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-colors ${
            isLoggingOut
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {isLoggingOut ? (
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5 mr-3" />
          )}
          <span className="font-medium">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto p-8">
          {activeTab === "classrooms" && <ClassroomsContent />}
          {activeTab === "profile" && <ProfileContent />}
          {activeTab === "request" && <RequestsContent />}
        </div>
      </main>
    </div>
  );
}

//disabled={!newClassroomName.trim()}
