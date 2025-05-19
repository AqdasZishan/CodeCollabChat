import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { socket } from "../useSocket";
import CodeArea from "./components/CodeArea";
import Home from "./components/Home/Home";
import Signin from "./components/signin";
import SignupPage from "./components/signup";

function App() {
  useEffect(() => {
    const handleConnect = () => {
      console.log("Connected to socket server:", socket.id);
    };

    const handleNotification = (data) => {
      console.log("Received notification:", data);
    };

    socket.on("connect", handleConnect);
    socket.on("notification", handleNotification);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("notification", handleNotification);
      socket.disconnect();
    };
  }, []);

  return (
    <Routes>
      <Route
        path="/code/:classId/:projectId/:projectName/:userId"
        element={<CodeArea />}
      />
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Signin />} />
      <Route path="/create" element={<SignupPage />} />
    </Routes>
  );
}

export default App;
