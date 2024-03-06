import { useEffect, useState } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import supabase from "./utils/supabase";
import Button from "./components/Button"

function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  async function fetchData() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    setSession(() => session);
  }
  useEffect(() => {
    fetchData();
  }, []);


  const handleStudentBtn = ()=>{
    // navigate to student room join page
  }
  const handleTeacherBtn = ()=>{
    // first check that user has his session available or not 
    // if available then navigate him to his user Admin page
    // if not then navigate to login page
  }
  
  if (!session) {
    navigate("/login");
  } 
    return (
      <div className="App h-full w-full ">
        <div className="img h-full w-full object-cover overflow-hidden absolute z-[-5]">
          <img src="img/Landing.png" alt="" className="w-full object-cover " />
        </div>
        <nav className="p-16 flex justify-between">
          <div className="logo text-3xl font-medium">Quiz-O-Meter</div>
          <div className="menu">
            <ul className="flex gap-24 text-md">
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>
        </nav>

        <main className="p-16 w-full flex justify-center items-center">
          <div className="container flex flex-col justify-center w-[60rem] items-center h-96">
            <h1 className="text-6xl font-bold mb-8">Test Your Knowledge</h1>
            <p className="w-[50ch] text-lg text-center">Challenge Your Mind and Expand Your Knowledge with Engaging Quizzes!</p>
            <div className="choice flex  mt-24  justify-center gap-36">
              <Button text={"Student"}/>
              <Button text={"Teacher"}/>
            </div>
          </div>
        </main>
      </div>
    );
  }


export default App;
