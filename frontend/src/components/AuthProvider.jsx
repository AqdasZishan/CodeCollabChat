import { createContext, useState } from "react";


export const Authcontext=createContext(null);
const AuthProvider=({children})=>{
    const[name,setname]=useState("");
    const[email,setemail]=useState("");
    const[type,settype]=useState("");
    const[roll,setroll]=useState("");
    const[id,setid]=useState("");


    return (
        <>
        <Authcontext.Provider  value={{name,email,type,roll,id,setname,setemail,settype,setroll,setid}}>
            {children}
        </Authcontext.Provider>

        </>
    )
}

export default AuthProvider;