import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { socket } from "../../useSocket";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { name, roomId } from "../state/roomid";
import { toast } from "sonner";
import { Loader2, Users, PlusCircle } from "lucide-react";

const Card = () => {
  const [roomid, setRoomId] = useRecoilState(roomId);
  const [username, setUsername] = useRecoilState(name);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoomIdChange = (event) => {
    setRoomId(event.target.value);
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  function handleCreateRoom() {
    const id = uuidv4();
    setRoomId(id);
    toast.success("New room created! Share the room ID with others.");
  }

  const handleJoinRoom = () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    if (!roomid.trim()) {
      toast.error("Please enter a room ID");
      return;
    }

    setIsLoading(true);
    try {
      socket.emit("privateRoomJoin", roomid);
      navigate("/code");
    } catch (error) {
      toast.error("Failed to join room. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Code Sync
          </h1>
          <p className="text-gray-400">
            Collaborate in real-time with your team
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 shadow-xl space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="room-id"
              className="block text-sm font-medium text-gray-300"
            >
              Room ID
            </label>
            <div className="relative">
              <input
                type="text"
                id="room-id"
                placeholder="Paste invitation ROOM ID"
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                value={roomid}
                onChange={handleRoomIdChange}
              />
              <Users className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              value={username}
              onChange={handleUsernameChange}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleJoinRoom}
              disabled={isLoading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Join Room"
              )}
            </button>
            <button
              onClick={handleCreateRoom}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-5 w-5" />
              Create Room
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400">
          Don&apos;t have an invite? Create a new room and share the ID with
          your team.
        </p>
      </div>
    </div>
  );
};

export default Card;
