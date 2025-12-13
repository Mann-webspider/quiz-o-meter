import React, { useState } from "react";
import TextStroke from "../components/TextStroke";
import OtpInput from "../components/Otp";
import Button from "../components/Button";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

function CreateRoom() {
  const navigate = useNavigate();
  const [cookie, setCookie] = useCookies();
  const [form, setForm] = useState({ teacherName: "", roomId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Creating room:", form);

      const res = await api.post(
        "http://localhost:3001/api/teachers/rooms",
        form
      );

      console.log("Room created:", res.data);

      // Set cookies
      setCookie("roomId", res.data.roomId);
      setCookie("teacherId", res.data.teacherId);

      // Navigate to teacher dashboard
      navigate("/teacher");
    } catch (err) {
      console.error("Error creating room:", err);
      setError(
        err.response?.data?.error || "Failed to create room. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[100vh] flex justify-center items-center relative">
      <div className="background w-[100vw] h-full object-cover absolute z-[-5]">
        <img
          src="img/Join.png"
          alt=""
          className="h-full w-full absolute object-cover z-[-5]"
        />
      </div>

      <div className="container flex flex-col items-center z-5 text-center">
        <a href="/">
          <TextStroke text={"Quiz-O-Meter"} size={"6xl"} />
        </a>

        <p className="text-gray-600 font-medium text-lg w-[25ch]">
          Measure Your Knowledge, And Challenge Your Limits
        </p>
        <img src="img/join-man.png" alt="" />

        <div className="room gap-3 flex flex-col items-center">
          <p className="text-gray-500 font-medium text-xl tracking-wider">
            Enter your favourite room code here
          </p>

          <input
            type="text"
            placeholder="Enter your Name"
            className="px-2 py-1 w-64 rounded-lg border-solid border-gray-400 border-2"
            onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
            value={form.teacherName}
            required
          />

          <OtpInput
            length={6}
            onOtpSubmit={(val) => {
              setForm({ ...form, roomId: val });
            }}
          />

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <Button
            text={loading ? "Creating..." : "Let's Go"}
            click={onSubmit}
            disabled={loading || !form.teacherName || !form.roomId}
          />
        </div>
      </div>
    </div>
  );
}

export default CreateRoom;
