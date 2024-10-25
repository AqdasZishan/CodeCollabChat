import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus } from "lucide-react"
import { useRecoilState } from "recoil"
import { useContext, useEffect, useState } from "react"
import axios from "axios"
import backend from "../../backend"
import { allclasses, joinedClasses } from "@/state/roomid"
import { useNavigate } from "react-router-dom"
import { Authcontext } from "./AuthProvider"

export default function ClassroomsContent({ onJoinClick, onCreateClick }) {
  const [allclass,setAllClass]=useRecoilState(allclasses);
  const [joinedclass,setJoinedClass]=useRecoilState(joinedClasses);
  const value=useContext(Authcontext)
  const token=localStorage.getItem("token");
  const navigate=useNavigate();

  useEffect(()=>{
    console.log(value);
    
  },[value])

  useEffect(()=>{
    if(!token){
      navigate("/create")
    }
    
    async function fetchAll(){      
      await axios.get(`${backend}/room/class/get/all`,{
        headers:{
          Authorization: token
        }
      }).then(res=>{
        setAllClass(res.data.classes);        
      }).catch(err=>{
        console.log(err);
        
      })
    }
    fetchAll();

    if(value.type==="STUDENT"){
      fetchStudent();
    }else{
      fetchTeacher();
    }
    async function fetchTeacher(){
      await axios.get(`${backend}/room/class/get/teacher`,{
        headers:{
          Authorization:token
        }
      }).then((res)=>{
        console.log(res.data.classes);
        setJoinedClass(res.data.classes) 
      }).catch(err=>{
        console.log(err);
      })
    }
    async function fetchStudent(){
      await axios.get(`${backend}/room/class/get/student`,{
        headers:{
          Authorization:token
        }
      }).then((res)=>{
        console.log(res.data.classes);
        setJoinedClass(res.data.classes) 
      }).catch(err=>{
        console.log(err);
      })
    }
    
   


  },[])

    return (
      <>
        <h2 className="text-3xl font-bold mb-6">Classrooms</h2>
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Input type="text" placeholder="Search Classrooms" className="pl-10 bg-white" />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="space-x-4">
            <Button variant="outline" className="bg-white" onClick={onJoinClick}>Join a Classroom</Button>
            <Button className={`${value.type==="STUDENT"?"hidden":"hidden"} bg-gray-800 text-white hover:bg-gray-700`} onClick={onCreateClick}>
              <Plus className="mr-2 h-4 w-4" /> Create a Classroom
            </Button>
          </div>
        </div>
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="bg-white">
            <TabsTrigger value="all" className="data-[state=active]:bg-gray-100">All Classrooms</TabsTrigger>
            <TabsTrigger value="my" className="data-[state=active]:bg-gray-100">My Classrooms</TabsTrigger>
          </TabsList>
          <TabsContent  value="all">
            {
              allclass.map((val)=>{
                return(
                  <>
                  <div key={val.id} className="pt-5 cursor-pointer">
                      <Card  className="bg-white shadow-sm ">
                        <CardContent className="p-4">
                          <h3 className="text-xl font-semibold">{val.name}</h3>
                          <p className="text-sm text-gray-500">{val.teacher.name}</p>
                        </CardContent>
                      </Card>
                      </div>
                  </>
                )
              })
            }
            
          </TabsContent>
          <TabsContent value="my">
          {
              joinedclass.map((val)=>{
                return(
                  <>
                  <div key={val.id} className="pt-5 cursor-pointer">
                      <Card  className="bg-white shadow-sm ">
                        <CardContent className="p-4">
                          <h3 className="text-xl font-semibold">{val.name}</h3>
                          <p className="text-sm text-gray-500">{val.teacher.name}</p>
                        </CardContent>
                      </Card>
                      </div>
                  </>
                )
              })
            }

          </TabsContent>
        </Tabs>
      </>
    )
  }