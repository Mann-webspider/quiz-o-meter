import React from "react";
import "../styles/login.css";
import Button from "../components/Button";
import TextStroke from "../components/TextStroke";
// import supabase from "../utils/supabase"
// import { useCookies } from 'react-cookie';
// import { useNavigate } from "react-router-dom";

function Login() {
    // const navigate = useNavigate()
    // const [cookie,setCookie,removeCookie] = useCookies()
    const handleSignInWithGoogle = async () =>{
      //  await supabase.auth.signInWithOAuth({provider:'google'}).then((session)=>{

      //   setCookie("session",session,{maxAge:1000*60*10})
      //   // navigate("/teacher")
      // })
      
        
    }
  return (
    <div className="w-full  h-[100vh] relative flex justify-center items-center">
      <div className="img w-full absolute z-[-10]">
        <img
          src="img/login-page2.png"
          className="w-full object-cover h-[100vh] opacity-80"
          alt=""
        />
      </div>
      <div className="container flex flex-col  items-center h-64">
        {/* <div className="box"></div> */}
        <TextStroke text={"LOGIN"} size="6xl"/>
        <div className="subHead w-[30ch] text-center text-gray-600 font-medium text-lg mb-20 mt-4">
          <p className="">
            Join in with us to Create and play the Quiz Challenges with
            Quiz-o-meter
          </p>
        </div>
        <div className="btn">
          <Button text={"Sign in with Google"} click={handleSignInWithGoogle}/>
        </div>
      </div>
    </div>
  );
}

export default Login;
