import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import React, { useEffect } from 'react';
import {tokyoNightStorm} from "@uiw/codemirror-theme-tokyo-night-storm"
import {vscodeDark} from "@uiw/codemirror-theme-vscode";
import {vscodeLight} from "@uiw/codemirror-theme-vscode";
import  {bbedit} from "@uiw/codemirror-theme-bbedit" 
import { socket } from '../../useSocket';
import { useRecoilValue } from 'recoil';
import { name, roomId } from '../state/roomid';


export default function CodeArea(){
    const [value, setValue] = React.useState("console.log('hello world!');");
    const roomid=useRecoilValue(roomId)
    const username =useRecoilValue(name);

    const onChange = React.useCallback((val, viewUpdate) => {
      console.log('val:', val);
      setValue(val);
      socket.emit("privateMessage",{roomid,data:val});
      
    }, []);

    useEffect(()=>{
        socket.on("privateMessage",(data)=>{
            setValue(data)
        })
    })



    return (
        <>
        <div className='flex gap-28'>
        <div className='text-xl'>
            RoomCode: {roomid}
        </div>
        <div className='text-xl'>
            Username : {username}
        </div>
        </div>
       <CodeMirror value={value} height="800px" extensions={[javascript({ jsx: true })]} theme={vscodeDark} onChange={onChange} />;

        </>
    )
}