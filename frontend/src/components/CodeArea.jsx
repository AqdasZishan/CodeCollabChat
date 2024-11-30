import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import {tokyoNightStorm} from "@uiw/codemirror-theme-tokyo-night-storm"
import {vscodeDark} from "@uiw/codemirror-theme-vscode";
import {vscodeLight} from "@uiw/codemirror-theme-vscode";
import  {bbedit} from "@uiw/codemirror-theme-bbedit" 
import {  socket } from '../../useSocket';
import { useRecoilValue } from 'recoil';
import { name, roomId } from '../state/roomid';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {LANGUAGE} from "../codeMap"
const judge0=import.meta.env.VITE_JUDGE0


import React, { useContext, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { 
  Play, 
  Users, 
  Download, 
  Upload, 
  Copy, 
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Lock,
  SidebarOpen
} from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Authcontext } from './AuthProvider';
import axios from 'axios';

const value={
  [LANGUAGE["JS"]]:`console.log("hello how are you")`,
  [LANGUAGE["JAVA"]]:`
      public class Main {\n
    public static void main(String[] args) {\n
        System.out.println("Hello, World!");\n
    }\n
}\n
  `,
  [LANGUAGE["PYTHON"]]:`
      print("Hello, World!")
  `

  
}


export default function CodeArea() {
  const [output, setOutput] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const {projectId,projectName,userId}=useParams()
  const value=useContext(Authcontext)
  const {state}=useLocation();
  const [languageCode,SetLanguageCode]=useState(LANGUAGE["JS"]);
  const [code, setCode] = useState("console.log('hello world!');");
  const [loading,setLoading]=useState(false);
  const navigate=useNavigate()

    useEffect(()=>{
      socket.emit("privateRoomJoin",projectId)

      socket.on("privateMessage",(code)=>{
        setCode(code)
        
      })
    },[])

  const handleRunCode =async () => {
    setLoading(true);
    try {
        await axios.post("https://judge0-ce.p.rapidapi.com/submissions?wait=true&fields=*",
          {
           language_id:languageCode,
           source_code:code
          },
          {
            headers:{
              "Content-Type":"application/json",
              "x-rapidapi-key":judge0
            }
          }
        ).then(async(res)=>{
          console.log(res);
          const stdout=res.data.stdout;
          const stderr=res.data.stderr;
          if(!stderr){
              setOutput(stdout);
              return;
          }
          setOutput(stderr)
          // const token=res.data.token;
          // await axios.get(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false&fields=*`,{
          //   headers:{
          //     "x-rapidapi-key":"c0e3d8c26fmsh39eac4c50506fd2p16fdcfjsn877bcd1c4479"
          //   }
          // }).then(res=>{
          //   console.log(res);
            
          // }).catch((err)=>{
          //   console.log(err);
          // })
        }).catch(err=>{
          console.log(err);
          
        })
        setLoading(false)
      // const result = eval(code)
      // setOutput(String(result))
    } catch (error) {
      setOutput(String(error))
      setLoading(false)
    }
  }

  function handleCodeEditor(val,projectId){
    setCode(val)
    socket.emit("privateMessage",{roomid:projectId,data:val})
  }

  if(!value){
    <div>
        Loading...
    </div>
  }

  

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar with project info */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden relative`}>
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Project Name: {projectName}</h2>
            <p className="text-sm text-gray-500">Room Code: {projectId}</p>
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
            {/* <Button variant="outline" className="w-full justify-start" onClick={() => {}}>
              <Download className="w-4 h-4 mr-2" />
              Save Code
            </Button> */}
           
            <Button  variant="outline" className="w-full justify-start" onClick={async () => {
                await navigator.clipboard.writeText(location.href)
                alert("link copied")
            }}>
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
        style={{ left: isSidebarOpen ? '256px' : '0' }}
        onClick={()=>{setIsSidebarOpen(!isSidebarOpen)}}
      >
        
        {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4 p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={()=>{
                navigate(-1)
              }}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button disabled={loading}
              onClick={handleRunCode}
              className="bg-green-600 hover:bg-green-700 text-white"
            >{loading?<div>running..</div>:<><Play className="w-2 h-4 mr-2" />
              Run Code</>}
              
            </Button>
            <select onChange={(e)=>{
              SetLanguageCode(e.target.value)
            }}
              className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-sm"
              defaultValue={LANGUAGE["JS"]}
            >
              <option value={LANGUAGE["JS"]}>JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>
        </div>

        {/* Editor and output */}
        
        <div className="flex-1 grid grid-rows-2 gap-4 p-6">
        <div className='relative'>
        {value.type==="TEACHER" || value.id==userId ? (
           <Card className="overflow-hidden">
           <CardContent className="p-0 h-full">
             {/* <Editor
               height="100%"
               defaultLanguage="javascript"
               theme="vs-dark"
               value={code}
               onChange={(value) => setCode(value || '')}
               options={{
                 minimap: { enabled: false },
                 fontSize: 14,
                 lineNumbers: 'on',
                 roundedSelection: false,
                 scrollBeyondLastLine: false,
                 automaticLayout: true
               }}
             /> */}
             <CodeMirror  onChange={(cm)=>{handleCodeEditor(cm,projectId)}} value={code} height="600px" extensions={[javascript({ jsx: true })]} theme={vscodeDark}  />
           </CardContent>
         </Card>
              
            
          ):
          <div className="absolute inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center">
          <Alert className="w-[90%] max-w-md bg-white/90 border-none">
            <Lock className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="text-center text-lg font-medium">
              Only teachers can view and edit the code
            </AlertDescription>
          </Alert>
        </div>
          }
          
          
        
          </div>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-2">Output:</h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-auto max-h-[200px]">
                {output.length!=0?
                output.split('\n').map((line)=>{
                    console.log(line)
                    return (<div>{line}</div>)
                })
                
                :'Run your code to see output here'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


