import { useState, useEffect, useRef, useContext } from "react";
import { socket } from "../../useSocket";
import { useParams } from "react-router-dom";
import { Authcontext } from "./AuthProvider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { SendHorizontal, Users, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import PropTypes from "prop-types";

export default function Chat({ roomid }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activeTab] = useState("room");
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef(null);
  const value = useContext(Authcontext);
  const { projectId } = useParams();

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle sending messages
  const sendMessage = () => {
    if (!input.trim()) return;

    const messageData = {
      sender: value.name,
      senderId: value.id,
      text: input,
      timestamp: new Date().toISOString(),
      roomId: projectId || roomid,
    };

    try {
      socket.emit("sendChatMessage", messageData);
      setInput("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  // Initialize socket connection and listeners
  useEffect(() => {
    // Join project room on component mount
    socket.emit("joinProjectRoom", { roomid: projectId || roomid });

    // Listen for incoming messages
    socket.on("chatMessage", (messageData) => {
      setMessages((prev) => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(
          (msg) =>
            msg.senderId === messageData.senderId &&
            msg.timestamp === messageData.timestamp
        );
        if (messageExists) return prev;
        return [...prev, messageData];
      });
    });

    // Connection status
    socket.on("connect", () => {
      setIsConnected(true);
      toast.success("Connected to chat");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      toast.error("Disconnected from chat");
    });

    // Cleanup on unmount
    return () => {
      socket.off("chatMessage");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [projectId, roomid]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background shadow-lg">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Chat</h3>
          <div className="flex items-center gap-2">
            {!isConnected && (
              <div className="flex items-center gap-1 text-sm text-red-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Reconnecting...
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="w-full mb-2">
            <TabsTrigger value="room" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Project
            </TabsTrigger>
            <TabsTrigger value="class" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Class
            </TabsTrigger>
          </TabsList>

          <div className="h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            <TabsContent value="room" className="space-y-4 p-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-8">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn("flex items-start gap-2 group", {
                      "justify-end": message.senderId === value.id,
                    })}
                  >
                    {message.senderId !== value.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${message.sender}`}
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials(message.sender)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2 text-sm shadow-sm",
                        {
                          "bg-primary text-primary-foreground":
                            message.senderId === value.id,
                          "bg-muted hover:bg-muted/80 transition-colors":
                            message.senderId !== value.id,
                        }
                      )}
                    >
                      {message.senderId !== value.id && (
                        <p className="font-medium text-xs mb-1 text-primary">
                          {message.sender}
                        </p>
                      )}
                      <div className="space-y-1">
                        <p className="whitespace-pre-wrap break-words">
                          {message.text}
                        </p>
                        <p className="text-[10px] opacity-70 text-right">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </TabsContent>

            <TabsContent value="class">
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-8">
                <Users className="h-8 w-8 mb-2 opacity-50" />
                <p>Class-wide chat coming soon!</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="p-4 border-t bg-muted/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-background"
            disabled={!isConnected}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || !isConnected}
            className="shrink-0"
          >
            <SendHorizontal className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

Chat.propTypes = {
  roomid: PropTypes.string.isRequired,
};
