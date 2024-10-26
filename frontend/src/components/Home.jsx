import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ClassroomsContent from './ClassRoom'

import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookOpen, Users, UserCircle, Search, Plus } from "lucide-react"
import { useContext } from 'react'
import { Authcontext } from './AuthProvider'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import backend from '../../backend.js'
import ProfileContent from './profile'
import RequestsContent from './request'

export default function Home() {
  const [activeTab, setActiveTab] = useState('classrooms')
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newClassroomName, setNewClassroomName] = useState('')
  const value=useContext(Authcontext)
  const token=localStorage.getItem("token");
  const navigate=useNavigate();

  useEffect(()=>{
    if(!token){
      navigate("/login")
    }
    
    if(value.id==""){
      fetch()      
    }
    
    async function fetch(){
      await axios.get(`${backend}/user/details`,{
        headers:{
          Authorization:token
        }
      }).then(res=>{        
        value.setname(res.data.name);
        value.setemail(res.data.email);
        value.settype(res.data.type);
        value.setroll(res.data.roll);
        value.setid(res.data.id);
      }).catch(err=>{
        console.log(err);
        
      })
    }
  },[])

  async function  handleCreateClassroom(){
    await axios.post(`${backend}/room/class/create`,
      {
        name:newClassroomName
      },
      {headers:{
        Authorization:token
      }},
    ).then(res=>{
        setIsCreateModalOpen(false)
        console.log(`Creating classroom: ${newClassroomName}`)
        setNewClassroomName("")
        
      }).catch(err=>{
        console.log(err);
        
      })
  
   
    
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">CollabTool</h1>
        <nav className="space-y-2">
          
          <a  onClick={() => setActiveTab('profile')} className={`cursor-pointer flex items-center px-4 py-2 rounded-lg ${activeTab === 'profile' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
            <UserCircle className="w-5 h-5 mr-3" />
            Profile
          </a>
          <a  onClick={() => setActiveTab('classrooms')} className={`cursor-pointer flex items-center px-4 py-2 rounded-lg ${activeTab === 'classrooms' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
            <Users className="w-5 h-5 mr-3" />
            Home
          </a>
          {/* <a  onClick={() => setActiveTab('collabrooms')} className={`cursor-pointer flex items-center px-4 py-2 rounded-lg ${activeTab === 'collabrooms' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
            <Users className="w-5 h-5 mr-3" />
            Collab Rooms
          </a> */}
          <a  onClick={() => setActiveTab('request')} className={`${value && value.type=="STUDENT"?"hidden":""} cursor-pointer flex items-center px-4 py-2 rounded-lg ${activeTab === 'request' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
            <BookOpen className="w-5 h-5 mr-3" />
            REQUESTS
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto bg-gray-50">
        {activeTab === 'classrooms' && (
          <ClassroomsContent 
            onJoinClick={() => setIsJoinModalOpen(true)} 
            onCreateClick={() => setIsCreateModalOpen(true)}
          />
        )}
        {activeTab === 'profile' && <ProfileContent />}
        {activeTab === 'request' && <RequestsContent/>}
      </main>

      {/* Join Classroom Modal */}
      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join a Classroom</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input id="classroomCode" placeholder="Enter Classroom Code" className="col-span-4" />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsJoinModalOpen(false)}>Close</Button>
            <Button onClick={() => {
              // Handle join logic here
              setIsJoinModalOpen(false)
            }}>Join</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Classroom Modal */}
      <Dialog  open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a Classroom</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="classroomName" className="col-span-4">
                Classroom Name
              </Label>
              <Input 
                id="classroomName" 
                value={newClassroomName}
                onChange={(e) => setNewClassroomName(e.target.value)}
                placeholder="Enter Classroom Name" 
                className="col-span-4" 
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={()=>{handleCreateClassroom()}}  className="bg-black text-white hover:bg-gray-800">Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


//disabled={!newClassroomName.trim()}


