import React, {  useRef, useState } from "react";
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
function Teacher() {
  // const [avatar] = useState();
  const [ques,setQues] = useState([])
  const {register,handleSubmit} = useForm()
  // const inputRef = useRef()
  const [cookie,setCookie]= useCookies()

//   useEffect(() => {
//     const getUser = async () => {
//       const { data } = await supabase.auth.getUser();
//       if (data) {
//         setAvatar(() => data.user.user_metadata.avatar_url);

//         return;
//       }
//     };

//     getUser();
//   }, []);




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
    </div>
  );
}

export default Teacher;
