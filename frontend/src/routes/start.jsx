import React, { useEffect, useState } from "react";
import api from "../utils/axios";
import { useCookies } from "react-cookie";
import RadioGroup from "../components/Radio-group";
import Button from "../components/Button";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function Start() {
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [cookie] = useCookies(["roomId", "userId"]);
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  useEffect(() => {
    async function getQuiz() {
      try {
        if (!cookie.roomId) {
          setError("No room ID found. Please join a room first.");
          navigate("/join");
          return;
        }

        const res = await api.get(
          `http://localhost:3001/api/students/rooms/${cookie.roomId}`
        );

        console.log("Quiz data:", res.data);

        if (!res.data || res.data.length === 0) {
          setError(
            "No quizzes available yet. Please wait for teacher to add questions."
          );
        } else {
          setQuiz(res.data);
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    getQuiz();
  }, [cookie.roomId, navigate]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");

    try {
      // Format answers for API
      const answers = Object.entries(data.answers).map(([quizId, answer]) => ({
        quizId: quizId,
        answer: answer,
      }));

      console.log("Submitting answers:", answers);

      // Submit to API
      const res = await api.post(
        "http://localhost:3001/api/students/rooms/quizzes/answers",
        answers,
        { withCredentials: true }
      );

      console.log("Submission result:", res.data);
      setResult(res.data);

      // Scroll to top to show results
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error submitting answers:", error);
      setError("Failed to submit answers. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[100vh] flex justify-center items-center">
        <p className="text-2xl">Loading quiz...</p>
      </div>
    );
  }

  if (error && quiz.length === 0) {
    return (
      <div className="w-full h-[100vh] flex justify-center items-center flex-col gap-4">
        <p className="text-2xl text-red-500">{error}</p>
        <Button text="Back to Join" click={() => navigate("/join")} />
      </div>
    );
  }

  return (
    <div className="relative bg-[#ededed] w-full flex justify-center items-center flex-col bebas-neue-regular">
      {/* Results Display */}
      {result && (
        <div className="w-full max-w-4xl mx-auto my-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-4xl font-bold text-center mb-4">Quiz Results</h2>
          <div className="text-center mb-6">
            <p className="text-6xl font-bold text-blue-600">
              {result.percentage}
            </p>
            <p className="text-2xl text-gray-600">Score: {result.score}</p>
            <p className="text-lg text-gray-500">{result.message}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-4">Answer Review:</h3>
            {result.results.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg ${
                  item.isCorrect ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <p className="font-bold">{item.question}</p>
                <p className="text-sm">
                  Your answer:{" "}
                  <span className="font-medium">{item.studentAns}</span>
                </p>
                {!item.isCorrect && (
                  <p className="text-sm text-red-600">
                    Correct answer:{" "}
                    <span className="font-medium">
                      {item.options[item.answer]}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Form */}
      {!result && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex justify-center items-center flex-col w-full"
        >
          {quiz.map((data, idx) => (
            <div
              key={data.quizId}
              className="h-[80vh] w-full max-w-4xl m-6 flex justify-center items-center flex-col"
            >
              <h1 className="my-8 text-6xl uppercase text-center w-full select-none px-4">
                {idx + 1}. {data.question}
              </h1>
              <RadioGroup
                options={data.options}
                id={data.quizId}
                register={register}
              />
            </div>
          ))}

          {error && (
            <p className="text-red-500 text-lg font-medium my-4">{error}</p>
          )}

          <div className="my-8">
            <Button
              text={submitting ? "Submitting..." : "Submit"}
              type="submit"
              disabled={submitting}
            />
          </div>
        </form>
      )}
    </div>
  );
}

export default Start;
