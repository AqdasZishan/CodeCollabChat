import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { socket } from "../../useSocket";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LANGUAGE } from "../codeMap";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Play,
  Users,
  Download,
  Copy,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Lock,
  Coins,
  Cone,
  MessageSquare,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Authcontext } from "./AuthProvider";
import { SaveCode } from "@/utils/codeArena";
import { handleRunCode } from "@/utils/codeArena";
import axios from "axios";
import backend from "../../backend";
import { useRecoilState } from "recoil";
import { insideClassRoom } from "@/state/roomid";
import Chat from "./Chat";

const language = {
  [LANGUAGE["JS"].language]: `console.log("hello how are you");`,
  [LANGUAGE["JAVA"].language]: `class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
  `,
  [LANGUAGE["PYTHON"].language]: `print("Hello, World!")`,
};

const Output = {
  [LANGUAGE["JS"].language]: `JS`,
  [LANGUAGE["JAVA"].language]: `JAVA`,
  [LANGUAGE["PYTHON"].language]: `PYTHON`,
};

export default function CodeArea() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { projectId, projectName, userId } = useParams();
  const value = useContext(Authcontext);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [languageCode, SetLanguageCode] = useState(LANGUAGE["JS"]);
  const [codes, setCodes] = useState(language);
  const [output, setOutput] = useState(Output);

  const [loading, setLoading] = useState(false);
  const [saveCodeLoading, setSaveCodeLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [insideClass, setInsideClass] = useRecoilState(insideClassRoom);

  useEffect(() => {
    socket.emit("privateRoomJoin", projectId);

    socket.on("privateMessage", (code, languageCode) => {
      setCodes({ ...codes, [languageCode]: code });
    });
  }, []);

  console.log(navigate);

  useEffect(() => {
    async function getCodes() {
      await axios
        .get(`${backend}/room/project/code/${projectId}`, {
          headers: {
            Authorization: token,
          },
        })
        .then(async (res) => {
          const value = res.data.codes;

          value.forEach((code) => {
            const lang = code.language;
            setCodes((prev) => ({ ...prev, [lang]: code.data }));
          });
        });
    }
    getCodes();
  }, []);

  function handleCodeEditor(val, projectId) {
    setCodes({ ...codes, [languageCode.language]: val });
    socket.emit("privateMessage", {
      roomid: projectId,
      data: val,
      languageCode: languageCode.language,
    });
  }

  if (!value) {
    <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar with project info */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-0"
        } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden relative`}
      >
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Project Name: {projectName}
            </h2>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <div className="pl-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-600">{value.name}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              disabled={saveCodeLoading}
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                SaveCode(
                  projectId,
                  languageCode,
                  codes,
                  token,
                  setSaveCodeLoading
                );
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              {saveCodeLoading ? "saving.." : "Save Code"}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={async () => {
                await navigator.clipboard.writeText(location.href);
                alert("link copied");
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Share Code
            </Button>
          </div>
        </div>
      </div>

      {/* Toggle sidebar button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-none border-l-0 z-10"
        style={{ left: isSidebarOpen ? "256px" : "0" }}
        onClick={() => {
          setIsSidebarOpen(!isSidebarOpen);
        }}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4 p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigate(-1);
              }}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              disabled={loading}
              onClick={() => {
                handleRunCode({
                  languageCode,
                  setOutput,
                  codes,
                  setLoading,
                  loading,
                  output,
                });
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <div>running..</div>
              ) : (
                <>
                  <Play className="w-2 h-4 mr-2" />
                  Run Code
                </>
              )}
            </Button>
            <select
              onChange={(e) => {
                SetLanguageCode(LANGUAGE[e.target.value]);
              }}
              className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm"
              defaultValue="JS"
            >
              <option value="JS">JavaScript</option>
              <option value="PYTHON">Python</option>
              <option value="JAVA">Java</option>
            </select>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <MessageSquare
                className={`h-5 w-5 ${isChatOpen ? "text-primary" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Editor and output */}
        <div className="flex-1 grid grid-rows-2 gap-4 p-6">
          <div className="relative">
            {value.type === "TEACHER" || value.id == userId ? (
              <Card className="overflow-hidden">
                <CardContent className="p-0 h-full">
                  <CodeMirror
                    onChange={(cm) => {
                      handleCodeEditor(cm, projectId);
                    }}
                    value={codes[languageCode.language]}
                    height="600px"
                    extensions={[javascript({ jsx: true })]}
                    theme={vscodeDark}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="absolute inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center">
                <Alert className="w-[90%] max-w-md bg-white/90 border-none">
                  <Lock className="h-5 w-5 text-yellow-600" />
                  <AlertDescription className="text-center text-lg font-medium">
                    Only teachers can view and edit the code
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
          <OutputFn output={output} languageCode={languageCode} />
        </div>
      </div>

      {/* Chat panel */}
      <div
        className={`${
          isChatOpen ? "w-80" : "w-0"
        } transition-all duration-300 overflow-hidden border-l h-full`}
      >
        {isChatOpen && <Chat roomid={projectId} />}
      </div>
    </div>
  );
}

//output
const OutputFn = React.memo(function ({ output, languageCode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-2">Output:</h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-auto max-h-[200px]">
          {output[languageCode.language].length != 0
            ? output[languageCode.language].split("\n").map((line) => {
                return <div>{line}</div>;
              })
            : "Run your code to see output here"}
        </div>
      </CardContent>
    </Card>
  );
});
