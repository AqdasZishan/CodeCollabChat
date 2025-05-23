import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { socket } from "../../useSocket";
import { LANGUAGE } from "../codeMap";
import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Play,
  Users,
  Download,
  ChevronLeft,
  ArrowLeft,
  MessageSquare,
  Loader2,
  Code2,
  Terminal,
  Share2,
  Maximize2,
  Minimize2,
  Type,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Authcontext } from "./AuthProvider";
import { SaveCode } from "@/utils/codeArena";
import { handleRunCode } from "@/utils/codeArena";
import axios from "axios";
import backend from "../../backend";
import Chat from "./Chat";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const language = {
  [LANGUAGE["JS"].language]: `// JavaScript code
console.log("Hello, World!");

// Example function
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Example usage
console.log(greet("Developer"));`,
  [LANGUAGE["JAVA"].language]: `// Java code
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Example method
        String message = greet("Developer");
        System.out.println(message);
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`,
  [LANGUAGE["PYTHON"].language]: `# Python code
print("Hello, World!")

# Example function
def greet(name):
    return f"Hello, {name}!"

# Example usage
print(greet("Developer"))`,
};

const Output = {
  [LANGUAGE["JS"].language]: `JS`,
  [LANGUAGE["JAVA"].language]: `JAVA`,
  [LANGUAGE["PYTHON"].language]: `PYTHON`,
};

const getLanguageExtension = (language) => {
  switch (language) {
    case "javascript":
      return javascript();
    case "python":
      return python();
    case "java":
      return java();
    default:
      return javascript();
  }
};

// Add this CSS at the top of the file, after imports
const editorStyles = `
  .cm-scroller::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  .cm-scroller::-webkit-scrollbar-track {
    background: #1e1e1e;
  }

  .cm-scroller::-webkit-scrollbar-thumb {
    background: #424242;
    border-radius: 5px;
    border: 2px solid #1e1e1e;
  }

  .cm-scroller::-webkit-scrollbar-thumb:hover {
    background: #4f4f4f;
  }

  .cm-scroller::-webkit-scrollbar-corner {
    background: #1e1e1e;
  }

  .output-scroll::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  .output-scroll::-webkit-scrollbar-track {
    background: #1e1e1e;
  }

  .output-scroll::-webkit-scrollbar-thumb {
    background: #424242;
    border-radius: 5px;
    border: 2px solid #1e1e1e;
  }

  .output-scroll::-webkit-scrollbar-thumb:hover {
    background: #4f4f4f;
  }

  .output-scroll::-webkit-scrollbar-corner {
    background: #1e1e1e;
  }

  /* Prevent layout shift when scrollbar appears */
  .editor-container {
    overflow: hidden;
    position: relative;
  }

  .editor-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
  }

  /* Ensure top bar and sidebars stay fixed */
  .top-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    background: white;
  }

  .left-sidebar {
    position: sticky;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 5;
  }

  .chat-sidebar {
    position: sticky;
    right: 0;
    top: 0;
    height: 100vh;
    z-index: 5;
  }
`;

export default function CodeArea() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { projectId, projectName } = useParams();
  const value = useContext(Authcontext);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connectionCount, setConnectionCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [languageCode, SetLanguageCode] = useState(LANGUAGE["JS"]);
  const [codes, setCodes] = useState(language);
  const [output, setOutput] = useState(Output);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    socket.emit("privateRoomJoin", projectId);

    socket.on("privateMessage", (code, languageCode) => {
      setCodes({ ...codes, [languageCode]: code });
    });

    return () => {
      socket.off("privateMessage");
    };
  }, [projectId, codes]);

  useEffect(() => {
    async function getCodes() {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${backend}/room/project/code/${projectId}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        const value = res.data.codes;
        value.forEach((code) => {
          const lang = code.language;
          setCodes((prev) => ({ ...prev, [lang]: code.data }));
        });
      } catch (error) {
        toast.error("Failed to load code");
      } finally {
        setIsLoading(false);
      }
    }
    getCodes();
  }, [projectId, token]);

  useEffect(() => {
    // Join project room on component mount
    socket.emit("joinProjectRoom", {
      roomid: projectId,
      userInfo: {
        id: value.id,
        name: value.name,
        type: value.type,
      },
    });

    // Listen for project user updates
    socket.on("projectUsers", ({ roomId, count, users }) => {
      if (roomId === projectId) {
        setConnectionCount(count);
        setOnlineUsers(users || []);
      }
    });

    // Listen for user disconnections
    socket.on("userLeft", ({ roomId, userId }) => {
      if (roomId === projectId) {
        setOnlineUsers((prev) => prev.filter((user) => user.id !== userId));
        setConnectionCount((prev) => Math.max(0, prev - 1));
      }
    });

    // Listen for code updates
    socket.on("privateMessage", (code, languageCode) => {
      setCodes((prev) => ({ ...prev, [languageCode]: code }));
    });

    // Listen for chat messages
    socket.on("chatMessage", (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    // Handle socket disconnection
    socket.on("disconnect", () => {
      setOnlineUsers([]);
      setConnectionCount(0);
    });

    // Handle socket reconnection
    socket.on("connect", () => {
      socket.emit("joinProjectRoom", {
        roomid: projectId,
        userInfo: {
          id: value.id,
          name: value.name,
          type: value.type,
        },
      });
    });

    // Cleanup on unmount
    return () => {
      socket.off("projectUsers");
      socket.off("userLeft");
      socket.off("privateMessage");
      socket.off("chatMessage");
      socket.off("disconnect");
      socket.off("connect");
      socket.emit("leaveProjectRoom", projectId);
    };
  }, [projectId, value.id, value.name, value.type]);

  // Handle code changes
  const handleCodeChange = (value, languageCode) => {
    setCodes((prev) => ({ ...prev, [languageCode]: value }));
    socket.emit("privateMessage", {
      roomid: projectId,
      data: value,
      languageCode: languageCode,
    });
  };

  // Handle sending messages
  const handleSendMessage = () => {
    if (!input.trim()) return;

    const messageData = {
      sender: value.name,
      senderId: value.id,
      text: input,
      timestamp: new Date().toISOString(),
      roomId: projectId,
    };

    try {
      socket.emit("sendChatMessage", messageData);
      setInput("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  // Add message input handler
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Add message key press handler
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  async function handleSaveCode() {
    setIsSaving(true);
    try {
      await SaveCode(projectId, languageCode, codes, token, setIsSaving);
      toast.success("Code saved successfully");
    } catch (error) {
      toast.error("Failed to save code");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRun() {
    setIsRunning(true);
    try {
      await handleRunCode({
        languageCode,
        setOutput,
        codes,
        setLoading: setIsRunning,
        loading: isRunning,
        output,
      });
    } catch (error) {
      toast.error("Failed to run code");
    } finally {
      setIsRunning(false);
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(location.href);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  }

  const toggleFontSize = () => {
    setFontSize((prev) => (prev === 14 ? 16 : 14));
  };

  if (!value) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <style>{editorStyles}</style>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Left sidebar */}
        <div
          className={`left-sidebar ${
            isSidebarOpen ? "w-72" : "w-0"
          } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden shadow-lg`}
        >
          <div className="p-6 space-y-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 truncate">
                {projectName}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Online Users ({connectionCount})</span>
              </div>
              <div className="pl-6 space-y-2">
                {onlineUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 text-sm p-2 rounded-md bg-white shadow-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-gray-500">({user.type})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                disabled={isSaving}
                variant="outline"
                className="w-full justify-start hover:bg-gray-50"
                onClick={handleSaveCode}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Save Code
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start hover:bg-gray-50"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Code
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="top-bar h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hover:bg-gray-100"
              >
                <ChevronLeft
                  className={`h-4 w-4 transform ${
                    isSidebarOpen ? "rotate-0" : "rotate-180"
                  } transition-transform`}
                />
              </Button>
              <Button
                disabled={isRunning}
                onClick={handleRun}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Code
                  </>
                )}
              </Button>
              <Select
                defaultValue="JS"
                onValueChange={(value) => SetLanguageCode(LANGUAGE[value])}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JS">JavaScript</SelectItem>
                  <SelectItem value="PYTHON">Python</SelectItem>
                  <SelectItem value="JAVA">Java</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFontSize}
                title={`Font Size: ${fontSize}px`}
              >
                <Type className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                title={
                  showLineNumbers ? "Hide Line Numbers" : "Show Line Numbers"
                }
              >
                <Code2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`hover:bg-gray-100 ${
                  isChatOpen ? "text-primary" : ""
                }`}
                title={isChatOpen ? "Close Chat" : "Open Chat"}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Editor and output */}
          <div
            className={`flex-1 grid ${
              isFullscreen ? "grid-rows-1" : "grid-rows-2"
            } gap-4 p-6 overflow-hidden`}
          >
            <div className="editor-container relative rounded-lg overflow-hidden border border-gray-200 bg-[#1e1e1e] shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-8 bg-[#252526] flex items-center px-4 border-b border-gray-700 z-10">
                <Code2 className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-400">
                  {languageCode.language}
                </span>
              </div>
              <div className="editor-content pt-8">
                <CodeMirror
                  value={codes[languageCode.language]}
                  height="100%"
                  theme={vscodeDark}
                  extensions={[
                    getLanguageExtension(languageCode.language.toLowerCase()),
                  ]}
                  onChange={(value) =>
                    handleCodeChange(value, languageCode.language)
                  }
                  className="h-full"
                  basicSetup={{
                    lineNumbers: showLineNumbers,
                    foldGutter: true,
                    highlightActiveLineGutter: true,
                    highlightSpecialChars: true,
                    history: true,
                    drawSelection: true,
                    dropCursor: true,
                    allowMultipleSelections: true,
                    indentOnInput: true,
                    syntaxHighlighting: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    rectangularSelection: true,
                    crosshairCursor: true,
                    highlightActiveLine: true,
                    highlightSelectionMatches: true,
                    closeBracketsKeymap: true,
                    searchKeymap: true,
                    completionKeymap: true,
                    lintKeymap: true,
                  }}
                  style={{
                    fontSize: `${fontSize}px`,
                    height: "100%",
                  }}
                />
              </div>
            </div>
            {!isFullscreen && (
              <Card className="overflow-hidden">
                <CardContent className="p-4 h-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <Terminal className="h-4 w-4 mr-2 text-gray-500" />
                      Output
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setOutput({ ...output, [languageCode.language]: "" })
                      }
                      className="h-7 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="bg-[#1e1e1e] text-gray-100 p-4 rounded-md font-mono text-sm overflow-auto h-[calc(100%-2rem)] output-scroll">
                    {output[languageCode.language].length !== 0 ? (
                      output[languageCode.language]
                        .split("\n")
                        .map((line, index) => (
                          <div key={index} className="whitespace-pre">
                            {line}
                          </div>
                        ))
                    ) : (
                      <div className="text-gray-400 flex items-center justify-center h-full">
                        <Terminal className="h-5 w-5 mr-2" />
                        Run your code to see output here
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Chat sidebar */}
        {isChatOpen && (
          <div className="chat-sidebar w-80 border-l border-gray-200 bg-white shadow-lg">
            <Chat />
          </div>
        )}
      </div>
    </>
  );
}
