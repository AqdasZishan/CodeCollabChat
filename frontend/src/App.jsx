import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { io } from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';
import TextArea from './components/TextArea';
// import useSocket from '../useSocket';
import { socket } from '../useSocket';
import CodeArea from './components/CodeArea';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Card from './components/card';
import Signin from './components/signin';
import SignupPage from './components/signup';

function App() {

  useEffect(()=>{
    socket.on("connect",(data)=>{
      console.log("connected", socket.id )
    })

    socket.on("notification",(data)=>{
      console.log(data)

     
    })
   

    return()=>{
      socket.disconnect()
    }
  },[])

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/code" element={<CodeArea/>}> </Route>
        <Route path="/" element={<Card/>}> </Route>
        <Route path="/login" element={<Signin/>}> </Route>
        <Route path="/create" element={<SignupPage/>}> </Route>
      </Routes>
    </BrowserRouter>
    
  

   
      
    </>
  )
}

export default App
