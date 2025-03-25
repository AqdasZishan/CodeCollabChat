import { useState, useEffect, useRef, useContext } from "react";
import { socket } from "../../useSocket";
import { useParams } from "react-router-dom";
import { Authcontext } from "./AuthProvider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { SendHorizontal, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Chat({ roomid }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("room");
  const messagesEndRef = useRef(null);
  const value = useContext(Authcontext);
  const { classId, projectId, projectName } = useParams();

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initialize socket connection and listeners
  useEffect(() => {
    // Join project room on component mount
    socket.emit("joinProjectRoom", { roomid: projectId || roomid });

    // Listen for incoming messages
    socket.on("chatMessage", (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    // Cleanup on unmount
    return () => {
      socket.off("chatMessage");
    };
  }, [projectId, roomid]);

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

    socket.emit("sendChatMessage", messageData);
    setMessages((prev) => [...prev, messageData]);
    setInput("");
  };

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
    <div className="flex flex-col h-full border rounded-lg bg-background">
      <div className="p-3 border-b">
        <h3 className="text-sm font-medium mb-2">Chat</h3>

        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="w-full mb-2">
            <TabsTrigger value="room" className="flex-1">
              Project
            </TabsTrigger>
            <TabsTrigger value="class" className="flex-1">
              Class
            </TabsTrigger>
          </TabsList>

          <div className="h-[calc(100vh-200px)] overflow-y-auto">
            <TabsContent value="room">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn("flex items-start gap-2", {
                      "justify-end": message.senderId === value.id,
                    })}
                  >
                    {message.senderId !== value.id && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(message.sender)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        {
                          "bg-primary text-primary-foreground":
                            message.senderId === value.id,
                          "bg-muted": message.senderId !== value.id,
                        }
                      )}
                    >
                      {message.senderId !== value.id && (
                        <p className="font-medium text-xs mb-1">
                          {message.sender}
                        </p>
                      )}
                      <div className="space-y-1">
                        <p>{message.text}</p>
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
              <div className="text-center text-muted-foreground text-sm py-8">
                Class-wide chat coming soon!
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="p-3 border-t mt-auto">
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
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
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
