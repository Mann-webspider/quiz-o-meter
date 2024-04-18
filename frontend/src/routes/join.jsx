import React, {  useState } from "react";
import TextStroke from "../components/TextStroke";
import OtpInput from "../components/Otp";
import Button from "../components/Button";
// import socket from "../utils/socket"
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { useCookies } from "react-cookie";

function Join() {
 

  const [form, setForm] = useState({username:"",roomId:""});
  const [room,setRoom]= useState()
  const navigation = useNavigate()
  const [cookie,setCookie]= useCookies()
  const onSubmit = async(e) => {
    
    console.log(form)
    const res = await api.post(`http://localhost:3001/api/students/rooms/${form.roomId}`,form)
    setCookie("userId",res.data.userId)
    navigation("/start")
  };
  
 
  
 

  return (
    <div className="w-full h-[100vh]  flex justify-center items-center relative">
      <div className="background w-[100vw] h-full object-cover absolute z-[-5]">
        <img
          src="img/Join.png"
          alt=""
          className="h-full w-full absolute object-cover z-[-5]"
        />
      </div>

      <div className="container  flex flex-col items-center  z-5 text-center">
        <a href="/">
        <TextStroke text={"Quiz-O-Meter"} size={"6xl"} />

        </a>

        <p className="text-gray-600 font-medium text-lg w-[25ch]">
          Measure Your Knowledge, And Challenge Your Limits
        </p>
        <img src="img/join-man.png" alt="" />
        <div className="room gap-3 flex flex-col items-center">
          
            <p className="text-gray-500 font-medium text-xl tracking-wider">
              Enter your room code here 
            </p>
            <input
              
              type="text"
              placeholder="Enter your Name"
              className="px-2 py-1 w-64 rounded-lg border-solid border-gray-400 border-2"
              onChange={(e)=>setForm({...form,username:e.target.value})}
              
            />
            <OtpInput
              length={6}
              onOtpSubmit={(val) => {
                setForm({...form,roomId:val});
              }}

            />
            
            <Button text={"Let's Go"}   click={onSubmit}/>
            
          
        </div>
      </div>
    </div>
  );
}

export default Join;
