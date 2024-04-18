import React, { useEffect, useState } from "react";
// import AvatarContainer from '../components/AvatarContainer'
// import Waiting from '../components/Waiting'
import api from "../utils/axios";
import { useCookies } from "react-cookie";
import RadioGroup from "../components/Radio-group";
import Button from "../components/Button";
import { useForm } from "react-hook-form";
function Start() {
  const [quiz, setQuiz] = useState([]);
  const [cookie, setCookie] = useCookies();
  const {register,handleSubmit} = useForm();
  const [answer,setAnswer] = useState([])

  useEffect(() => {
    async function getQuiz() {
      const res = await api.get(
        `http://localhost:3001/api/students/rooms/${cookie.roomId}`
      );
      console.log(res.data);
      setQuiz(() => res.data);
      return () => {};
    }
    getQuiz();
    return function destroy() {};
  }, []);



  const onSubmit = async(data)=>{
    const arr = []
    const dum =Object.entries(data.answers)
    
    for (const [key,val] of dum){
      
      arr.push({
        "quizId":key,
        "answer":val
      })
    }
    try {
      // Send the array of quiz IDs and answers to the API endpoint
      const res = await api.post("http://localhost:3001/api/students/rooms/quizzes/answers", arr, { withCredentials: true });
      console.log(res.data);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  return (
    <div className="relative bg-[#ededed] w-full  flex justify-center items-center flex-col bebas-neue-regular">
      <form onSubmit={handleSubmit(onSubmit)} className="flex justify-center items-center flex-col">

      {quiz.map((data,idx) => (
        <div className="h-[80vh] w-full m-6 flex justify-center items-center flex-col">
          
          <h1 className="my-8 text-6xl uppercase text-left  w-full select-none" >{data.question}</h1>
          <RadioGroup options={data.options} id={data.quizId} register={register}/>
        </div>
      ))}
      <Button text={"submit"} type={"submit"}/>
      </form>
    </div>
  );
}

export default Start;
