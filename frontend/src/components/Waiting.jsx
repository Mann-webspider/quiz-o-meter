import React, { useEffect, useState } from "react";
import { useCookies } from 'react-cookie';
import AvatarContainer from "./AvatarContainer";
import socket from "../utils/socket"
function Waiting() {
    const [cookie,setCookie]= useCookies()
    const [user,setUser]= useState([])
    useEffect(()=>{
    
            socket.emit("getStudents",cookie)
            socket.on("getStudents",(data)=>{
                console.log(data);
                setUser(()=>[...data])
            })

        

    },[setUser,cookie,socket])
  return (
    <div className=" w-screen h-screen overflow-hidden">
    <div className="room h-24 flex flex-col justify-center items-center">
        <div className="w-fit py-4 px-8 bg-[#2D3CC4] rounded-full mt-14">
            <h1 className="text-xl text-white font-medium"> Room No. {cookie.roomId}</h1>
        </div>
            <p className="text-md text-gray-800 font-regular mt-4"> Wait Until Teacher Start the Quiz</p>
    </div>
    <div className="container h-full   relative">

      <AvatarContainer
        // users={[
        //   { width: "5rem", name: "mann" },
        //   { width: "3rem", name: "meet" },
        //   { width: "7rem", name: "devarsh" },
        //   { width: "9rem", name: "kavy" },
        //   { width: "4rem", name: "shubham" },
        //   { width: "6rem", name: "nigam" },
        //   { width: "5rem", name: "mann" },
        //   { width: "3rem", name: "meet" },
        //   { width: "7rem", name: "devarsh" },
        //   { width: "9rem", name: "kavy" },
        //   { width: "4rem", name: "shubham" },
        //   { width: "6rem", name: "nigam" },
        //   { width: "5rem", name: "mann" },
        //   { width: "3rem", name: "meet" },
        //   { width: "7rem", name: "devarsh" },
        //   { width: "9rem", name: "kavy" },
        //   { width: "4rem", name: "shubham" },
        //   { width: "6rem", name: "nigam" },
        // ]}
        users={user}
      />
    </div>
    </div>
  );
}

export default Waiting;
