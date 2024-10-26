import { createContext, useState,useEffect } from "react";
import axios from "axios";
import backend from "../../backend";

export const Authcontext=createContext(null);
const AuthProvider=({children})=>{
    const[name,setname]=useState("");
    const[email,setemail]=useState("");
    const[type,settype]=useState("");
    const[roll,setroll]=useState("");
    const[id,setid]=useState("");
    const token=localStorage.getItem("token")

    useEffect(()=>{
        if(!token){
          navigate("/login")
        }
        fetch()        
        async function fetch(){
          await axios.get(`${backend}/user/details`,{
            headers:{
              Authorization:token
            }
          }).then(res=>{        
            setname(res.data.name);
            setemail(res.data.email);
            settype(res.data.type);
            setroll(res.data.roll);
            setid(res.data.id);
          }).catch(err=>{
            console.log(err);
            
          })
        }
      },[])


    return (
        <>
        <Authcontext.Provider  value={{name,email,type,roll,id,setname,setemail,settype,setroll,setid}}>
            {children}
        </Authcontext.Provider>

        </>
    )
}

export default AuthProvider;