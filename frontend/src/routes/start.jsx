import React, { useEffect, useState } from 'react'
// import AvatarContainer from '../components/AvatarContainer'
// import Waiting from '../components/Waiting'
import api from "../utils/axios";
import { useCookies } from 'react-cookie';
import RadioGroup from '../components/Radio-group';
function Start() {
  const [quiz,setQuiz] = useState([])
  const [cookie,setCookie]= useCookies()
  
  useEffect(()=>{
    async function getQuiz  (){
      const res = await api.get(`http://localhost:3001/api/students/rooms/${cookie.roomId}`)
      console.log(res.data);
      setQuiz(()=>res.data)
      return ()=>{}
    }
    return getQuiz()
  },[])
  return (
    <div className='relative bg-[#ededed] w-full h-'>
      <RadioGroup/>
    </div>
  )
}

export default Start