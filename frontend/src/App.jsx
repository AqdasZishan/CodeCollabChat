import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import TextArea from "./components/TextArea";
// import useSocket from '../useSocket';
import { socket } from "../useSocket";
import CodeArea from "./components/CodeArea";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Card from "./components/card";
import Signin from "./components/signin";
import SignupPage from "./components/signup";
import Home from "./components/Home/Home";
import Project from "./components/Home/Project";

function App() {
  useEffect(() => {
    socket.on("connect", (data) => {
      console.log("connected", socket.id);
    });

    socket.on("notification", (data) => {
      console.log(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <Routes>
        <Route
          path="/code/:classId/:projectId/:projectName/:userId"
          element={<CodeArea />}
        >
          {" "}
        </Route>
        <Route path="/" element={<Home />}>
          {" "}
        </Route>
        <Route path="/login" element={<Signin />}>
          {" "}
        </Route>
        <Route path="/create" element={<SignupPage />}>
          {" "}
        </Route>
        {/* <Route path="/class/:classId" element={<Project/>}></Route> */}
      </Routes>
    </>
  );
}

export default App;
