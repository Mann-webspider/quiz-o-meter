import React, {  useEffect, useRef, useState } from "react";
// import supabase from "../utils/supabase";
// import TextStroke from "../components/TextStroke";
import Input from "../components/Input";
import Choices from "../components/Choices";
import QuestionBox from "../components/QuestionBox";
import Button from "../components/Button";
import { useForm } from "react-hook-form"
import Avatar from 'react-nice-avatar'
import config from "../utils/avatar"
import { useCookies } from 'react-cookie';
import api from "../utils/axios";
import { Payment, columns } from "../components/columns"

import  DataTable  from "../components/tableData"
import socket from "src/utils/socket";
 function getData() {

  // Fetch data from your API here.
  const arr = []
  arr.push({
    id: "728ed52f",
    amount: 100,
    status: "pending",
    student: "m@example.com",
    marks: "15/20"
  })
  arr.push({
    id: "728ed52f",
    amount: 500,
    status: "done",
    student: "mannD@example.com",
    marks: "1/20"
  })
  return arr
}
socket.connect("localhost:3003")
function Teacher() {
 
  const [ques,setQues] = useState([])
  const {register,handleSubmit} = useForm()
  const [cookie , setCookie] = useCookies()
  const [dataS,setDataS] = useState([{}])
  const [update,setUpdate] = useState(0)
  useEffect(()=>{
    const fetchUserData = ()=>{
      socket.emit("user",cookie.roomId)
      socket.emit("user-IU",cookie.roomId)
      socket.on("user",data=>{
        setDataS(()=>data)
      })
      // socket.emit("user-insert",123456)
      socket.on("user-update", data =>{
        
        const newData = dataS.map((d)=>{
          if(d.id == data.id){
            return data
          }
          else{
            return d
          }
        })

        setDataS(()=>newData)
        setUpdate((prev)=>prev+1)
        
      })
      socket.on("user-insert",data=>{
        
       
        setDataS(()=>[...dataS,data])
        setUpdate((prev)=>prev+1)
        
      })
      return ()=>{}
    }
    return fetchUserData()

  },[update])

const onSubmit = ( data)=>{
  
    setQues([...ques,data])
}

const handleQuizSubmit = ()=>{
  api.post("http://localhost:3001/api/teachers/quizzes",ques,{ withCredentials: true }).then((res)=>{
    console.log(res);
  }).catch((err)=>{
    console.log(err);
  })
}

// const data = getData()
// console.log(data);

  return (
    <div className="bg-[#ededed] h-[100vh] z-[-10]">
      <nav className="flex justify-between p-12">
        <div className="logo text-4xl font-bold ">Quiz-O-Meter</div>
        <div className="avatar">
          
          {/* <img
            src={avatar}
            alt=""
            className="w-16 h-16 object-contain rounded-full"
          /> */}
          <Avatar style={{ width: '5rem', height: '5rem' }} {...config}/>
        </div>
      </nav>
      <main className="w-full h-[80vh]  flex justify-center items-center">
        <div className="container flex w-screen h-full ">
          <div className="form w-3/6 h-6/6 ">
            <form className="flex flex-col justify-around  w-full h-full " onSubmit={handleSubmit(onSubmit)}>
              <div className="">
                <Input placeholder={"Enter your Question"} width={"96rem"}  register={{...register("question")}}/>
              </div>
              <div className="multiples ">
                <Choices number={4} register={register} />
              </div>
              <Button text={"ADD"} type={"submit"} />
            </form>
          </div>
          <div className="questions w-3/6  flex justify-center ">
                <QuestionBox width={"3/6"} height={"5/6"} question={ques} roomId={cookie.roomId} click={handleQuizSubmit}/>
          </div>
        </div>
      </main>
      <section className="analytics">
      <div className="container mx-auto py-10">
      <DataTable columns={columns} data={dataS} />
    </div>
      </section>
    </div>
  );
}

export default Teacher;
