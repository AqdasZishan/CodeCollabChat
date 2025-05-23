import { useEffect, useState } from "react";
import { socket } from "../../useSocket";
import PropTypes from "prop-types";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TextArea({ roomid }) {
  const [privateData, setPrivateData] = useState("");
  const [publicData, setPublicData] = useState("");
  const [isPrivateLoading, setIsPrivateLoading] = useState(false);
  const [isPublicLoading, setIsPublicLoading] = useState(false);

  useEffect(() => {
    if (privateData) {
      setIsPrivateLoading(true);
      socket.emit("privateMessage", { roomid, data: privateData });
      const timer = setTimeout(() => setIsPrivateLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [privateData, roomid]);

  function handlePublicMessage(e) {
    const value = e.target.value;
    setPublicData(value);
    setIsPublicLoading(true);
    socket.emit("publicmessage", value);
    const timer = setTimeout(() => setIsPublicLoading(false), 500);
    return () => clearTimeout(timer);
  }

  useEffect(() => {
    const handleMessage = (data) => {
      setPrivateData(data);
    };

    const handlePrivateMessage = (data) => {
      setPrivateData(data);
    };

    const handlePublicMessageBackend = (data) => {
      setPublicData(data);
    };

    socket.on("message", handleMessage);
    socket.on("privateMessage", handlePrivateMessage);
    socket.on("publicmessagebackend", handlePublicMessageBackend);

    return () => {
      socket.off("message", handleMessage);
      socket.off("privateMessage", handlePrivateMessage);
      socket.off("publicmessagebackend", handlePublicMessageBackend);
    };
  }, []);

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          Private Messages
        </div>
        <div className="relative">
          <textarea
            value={privateData}
            className={cn(
              "w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm",
              "ring-offset-background placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "resize-none"
            )}
            placeholder="Type your private message..."
            onChange={(e) => setPrivateData(e.target.value)}
          />
          {isPrivateLoading && (
            <div className="absolute right-2 top-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Send className="h-4 w-4" />
          Public Messages
        </div>
        <div className="relative">
          <textarea
            value={publicData}
            className={cn(
              "w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm",
              "ring-offset-background placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "resize-none"
            )}
            placeholder="Type your public message..."
            onChange={handlePublicMessage}
          />
          {isPublicLoading && (
            <div className="absolute right-2 top-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

TextArea.propTypes = {
  roomid: PropTypes.string.isRequired,
};
