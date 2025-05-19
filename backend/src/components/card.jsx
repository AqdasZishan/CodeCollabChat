import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { socket } from "../../useSocket";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { name, roomId } from "../state/roomid";

const Card = () => {
  const [roomid, setRoomId] = useRecoilState(roomId);
  const [username, setUsername] = useRecoilState(name);
  const navigate = useNavigate();

  const handleRoomIdChange = (event) => {
    setRoomId(event.target.value);
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  function handle() {
    const id = uuidv4();
    setRoomId(id);
  }

  const handleSubmit = () => {
    if (username.length <= 0) {
      alert("username cant be empty");
      return;
    }
    console.log("Joining room:", { roomid, username });
    socket.emit("privateRoomJoin", roomid);
    navigate("/code");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Code Sync</h1>
      <div className="w-full max-w-md">
        <div className="mb-4">
          <label
            htmlFor="room-id"
            className="block text-gray-400 font-bold mb-2"
          >
            Paste invitation ROOM ID
          </label>
          <input
            type="text"
            id="room-id"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={roomid}
            onChange={handleRoomIdChange}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="username"
            className="block text-gray-400 font-bold mb-2"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div className="flex gap-5">
          <button
            onClick={handleSubmit}
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Join
          </button>
          <button
            onClick={handle}
            type="submit"
            className="bg-green-500  hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create
          </button>
        </div>
      </div>
      <p className="mt-4 text-gray-400">
        If you don't have an invite then create{" "}
        <a href="#" className="text-blue-500 hover:text-blue-700">
          new room
        </a>
      </p>
    </div>
  );
};

export default Card;
