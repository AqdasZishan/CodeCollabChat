import { useEffect, useState } from "react";
import { socket } from "../../useSocket";

export default function TextArea({ roomid }) {
  const [data, setdata] = useState("");
  const [val, setval] = useState("");

  useEffect(() => {
    socket.emit("privateMessage", { roomid, data });
    console.log(roomid);
  }, [data]);

  function handlepublic(e) {
    setval(e.target.value);
    socket.emit("publicmessage", e.target.value);
  }

  useEffect(() => {
    socket.on("message", (data) => {
      setdata(data);
    });

    socket.on("privateMessage", (data) => {
      setdata(data);
    });

    socket.on("publicmessagebackend", (data) => {
      console.log(data);
      setval(data);
    });
  }, []);

  return (
    <>
      <div className="">
        <div>private</div>
        <textarea
          value={data}
          className=""
          onChange={(e) => {
            setdata(e.target.value);
          }}
        ></textarea>
      </div>
      <div>public</div>
      <div>
        <textarea
          value={val}
          className=""
          onChange={(e) => {
            handlepublic(e);
          }}
        ></textarea>
      </div>
    </>
  );
}
