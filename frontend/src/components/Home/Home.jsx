import { useEffect, useState } from "react";

import ClassroomsContent from "./ClassRoom";

import {
  BookOpen,
  Users,
  UserCircle,
  Search,
  Plus,
  LogOut,
} from "lucide-react";
import { useContext } from "react";
import { Authcontext } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import backend from "../../../backend.js";
import ProfileContent from "../Home/profile";
import RequestsContent from "./request";

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
      <aside className="w-64 bg-gray-100 p-4  justify-between flex flex-col">
        <div className="">
          <h1 className="text-2xl font-bold mb-8 text-gray-800">CollabTool</h1>
          <nav className="space-y-2">
            <a
              onClick={() => setActiveTab("profile")}
              className={`cursor-pointer flex items-center px-4 py-2 rounded-lg ${
                activeTab === "profile"
                  ? "bg-gray-800 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <UserCircle className="w-5 h-5 mr-3" />
              Profile
            </a>
            <a
              onClick={() => setActiveTab("classrooms")}
              className={`cursor-pointer flex items-center px-4 py-2 rounded-lg ${
                activeTab === "classrooms"
                  ? "bg-gray-800 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Users className="w-5 h-5 mr-3" />
              Home
            </a>
            {/* <a  onClick={() => setActiveTab('collabrooms')} className={`cursor-pointer flex items-center px-4 py-2 rounded-lg ${activeTab === 'collabrooms' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
            <Users className="w-5 h-5 mr-3" />
            Collab Rooms
          </a> */}
            <a
              onClick={() => setActiveTab("request")}
              className={`${
                value && value.type == "STUDENT" ? "hidden" : ""
              } cursor-pointer flex items-center px-4 py-2 rounded-lg ${
                activeTab === "request"
                  ? "bg-gray-800 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <BookOpen className="w-5 h-5 mr-3" />
              REQUESTS
            </a>
          </nav>
        </div>
        <a
          onClick={() => {
            logout();
          }}
          className={` cursor-pointer flex items-center px-4 py-2 rounded-lg ${
            activeTab === "logout"
              ? "bg-gray-800 text-white"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </a>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto bg-gray-50">
        {activeTab === "classrooms" && <ClassroomsContent />}
        {activeTab === "profile" && <ProfileContent />}
        {activeTab === "request" && <RequestsContent />}
      </main>
    </div>
  );
}

//disabled={!newClassroomName.trim()}
