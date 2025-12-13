import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Avatar from "react-nice-avatar";
import config from "../utils/avatar";
import { useCookies } from "react-cookie";
import api from "../utils/axios";
import socket from "../utils/socket";

// Import new components
import StatsBar from "../components/teacher/StatsBar";
import QuestionForm from "../components/teacher/QuestionForm";
import QuestionList from "../components/teacher/QuestionList";
import StudentCard from "../components/teacher/StudentCard";
import StudentDetailModal from "../components/teacher/StudentDetailModal";

function Teacher() {
  const [ques, setQues] = useState([]);
  const { register, handleSubmit, reset, watch } = useForm();
  const [cookie] = useCookies(["roomId", "teacherId"]);
  const [dataS, setDataS] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quizPublished, setQuizPublished] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);

  const answerValue = watch("answer");

  useEffect(() => {
    if (!cookie.roomId) return;

    socket.emit("user", cookie.roomId);
    socket.emit("user-IU", cookie.roomId);

    socket.on("user", (data) => setDataS(data || []));
    socket.on("user-update", (data) => {
      setDataS((prevData) =>
        prevData.map((d) => (d.id === data.id ? data : d))
      );
    });
    socket.on("user-insert", (data) => {
      setDataS((prevData) => {
        const exists = prevData.some((d) => d.id === data.id);
        return exists ? prevData : [...prevData, data];
      });
    });

    return () => {
      socket.off("user");
      socket.off("user-update");
      socket.off("user-insert");
    };
  }, [cookie.roomId]);

  const onSubmit = (data) => {
    setQues([...ques, data]);
    reset();
  };

  const handleDelete = (index) => {
    if (window.confirm("Delete this question?")) {
      setQues(ques.filter((_, i) => i !== index));
    }
  };

  const handlePublishQuiz = async () => {
    if (ques.length === 0) {
      setError("Please add at least one question");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("http://localhost:3001/api/teachers/quizzes", ques, {
        withCredentials: true,
      });
      setQuizPublished(true);
      alert("✓ Quiz published successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    if (dataS.length === 0) {
      alert("No students in the room!");
      return;
    }

    if (!window.confirm(`Start quiz for ${dataS.length} student(s)?`)) return;

    try {
      const res = await api.get("http://localhost:3001/api/teachers/quizzes", {
        withCredentials: true,
      });

      socket.emit("start-quiz", {
        roomId: cookie.roomId,
        quizData: res.data,
      });

      alert("🚀 Quiz started!");
    } catch (err) {
      alert("Failed to start quiz");
    }
  };

  const handleViewStudent = async (studentId) => {
    try {
      const res = await api.get(
        `http://localhost:3001/api/teachers/analytics/${cookie.roomId}`,
        { withCredentials: true }
      );

      const student = res.data.find((s) => s.studentId === studentId);
      setStudentDetails(student);
      setSelectedStudent(studentId);
    } catch (err) {
      alert("Failed to load student details");
    }
  };

  return (
    <div className="bg-[#ededed] min-h-[100vh]">
      {/* Header */}
      <nav className="bg-white p-12 flex justify-between items-center shadow-sm">
        <div className="logo text-4xl font-bold">Quiz-O-Meter</div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Room Code
            </p>
            <p className="font-mono font-bold text-xl">{cookie.roomId}</p>
          </div>
          <Avatar style={{ width: "5rem", height: "5rem" }} {...config} />
        </div>
      </nav>

      <main className="container mx-auto p-12">
        {/* Stats Bar Component */}
        <StatsBar
          questionCount={ques.length}
          studentCount={dataS.length}
          isPublished={quizPublished}
          onPublish={handlePublishQuiz}
          onStart={handleStartQuiz}
          loading={loading}
        />

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Question Form Component */}
          {!quizPublished && (
            <QuestionForm
              register={register}
              onSubmit={handleSubmit(onSubmit)}
              answerValue={answerValue}
            />
          )}

          {/* Question List Component */}
          <QuestionList
            questions={ques}
            onDelete={handleDelete}
            isPublished={quizPublished}
          />
        </div>

        {/* Student Analytics */}
        <div className="bg-white p-8 rounded-lg">
          <h3 className="text-2xl font-bold mb-6">Student Analytics</h3>

          {dataS.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-7xl mb-4">👥</p>
              <p className="text-xl font-medium">No students joined yet</p>
              <p className="text-sm mt-2">
                Share room code{" "}
                <span className="font-mono font-bold text-gray-800">
                  {cookie.roomId}
                </span>{" "}
                with students
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dataS.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onViewDetails={handleViewStudent}
                />
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-600 font-bold mt-4 text-center text-lg">
            {error}
          </p>
        )}
      </main>

      {/* Student Detail Modal Component */}
      {selectedStudent && studentDetails && (
        <StudentDetailModal
          student={studentDetails}
          onClose={() => {
            setSelectedStudent(null);
            setStudentDetails(null);
          }}
        />
      )}
    </div>
  );
}

export default Teacher;
