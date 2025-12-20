import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

import QuestionRenderer from "../components/student/QuestionRenderer";
import api from "../utils/axios";
import socket from "../utils/socket";

function QuizLive() {
	const [cookies] = useCookies(["roomId", "userId"]);
	const [quizzes, setQuizzes] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [answers, setAnswers] = useState({});
	const [questionTimes, setQuestionTimes] = useState({});
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [result, setResult] = useState(null);
	const navigate = useNavigate();

	const startTimeRef = useRef(Date.now());
	const currentQuizIdRef = useRef(null);

	useEffect(() => {
		async function loadQuiz() {
			try {
				const res = await api.get(
					`http://localhost:3001/api/students/rooms/${cookies.roomId}`,
				);
				console.log(res.data);

				setQuizzes(res.data);
				if (res.data.length > 0) {
					currentQuizIdRef.current = res.data[0].quizId;
					startTimeRef.current = Date.now();
				}
			} catch (err) {
				console.error("Error loading quiz:", err);
			} finally {
				setLoading(false);
			}
		}

		loadQuiz();
	}, [cookies.roomId]);

	const saveQuestionTime = (quizId) => {
		const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
		setQuestionTimes((prev) => ({
			...prev,
			[quizId]: timeSpent,
		}));

		socket.emit("question-time", {
			roomId: cookies.roomId,
			userId: cookies.userId,
			quizId,
			timeSpent,
		});
	};

	const handleNext = () => {
		if (currentIndex < quizzes.length - 1) {
			saveQuestionTime(currentQuizIdRef.current);
			setCurrentIndex(currentIndex + 1);
			currentQuizIdRef.current = quizzes[currentIndex + 1].quizId;
			startTimeRef.current = Date.now();
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const handlePrevious = () => {
		if (currentIndex > 0) {
			saveQuestionTime(currentQuizIdRef.current);
			setCurrentIndex(currentIndex - 1);
			currentQuizIdRef.current = quizzes[currentIndex - 1].quizId;
			startTimeRef.current = Date.now();
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	// In QuizLive.jsx, update the handleSubmit function

	const handleSubmit = async () => {
		saveQuestionTime(currentQuizIdRef.current);
		setSubmitting(true);

		try {
			// Format answers - make sure we're sending the index as string
			const formattedAnswers = Object.entries(answers).map(
				([quizId, answerIndex]) => {
					console.log("Submitting:", { quizId, answer: answerIndex });
					return {
						quizId: quizId,
						answer: String(answerIndex), // Ensure it's a string
					};
				},
			);

			console.log("All formatted answers:", formattedAnswers);

			const res = await api.post(
				"http://localhost:3001/api/students/rooms/quizzes/answers",
				formattedAnswers,
				{ withCredentials: true },
			);

			console.log("Submission result:", res.data);
			setResult(res.data);
			window.scrollTo({ top: 0, behavior: "smooth" });
		} catch (error) {
			console.error("Error submitting answers:", error);
			alert("Failed to submit answers. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="w-full h-[100vh] flex flex-col items-center justify-center bg-[#ededed]">
				<div className="text-6xl mb-4">⏳</div>
				<p className="text-2xl font-medium text-gray-600">Loading Quiz...</p>
			</div>
		);
	}

	if (result) {
		return (
			<div className="w-full min-h-[100vh] bg-[#ededed] p-8 flex items-center justify-center">
				<div className="container max-w-4xl bg-white rounded-lg shadow-sm p-12">
					{/* Score Display */}
					<div className="text-center mb-12 pb-8 border-b-2 border-gray-200">
						<h2 className="text-5xl font-bold mb-6">Your Results</h2>
						<div className="inline-block bg-black text-white px-12 py-6 rounded-lg">
							<p className="text-7xl font-bold">{result.percentage}</p>
						</div>
						<p className="text-2xl text-gray-600 mt-4">
							Score: <span className="font-bold">{result.score}</span>
						</p>
					</div>

					{/* Answer Review */}
					<div className="space-y-6 mb-8">
						<h3 className="text-3xl font-bold mb-6">Answer Review</h3>
						{result.results.map((item, idx) => (
							<div
								key={idx}
								className={`p-6 rounded-lg border-2 ${
									item.isCorrect
										? "border-gray-800 bg-gray-50"
										: "border-gray-300 bg-white"
								}`}
							>
								<div className="flex items-start gap-4">
									<span className="text-3xl font-bold text-gray-800">
										{idx + 1}.
									</span>
									<div className="flex-1">
										<p className="font-bold text-xl mb-3 text-gray-900">
											{item.question}
										</p>
										<div className="space-y-2">
											<p className="text-gray-700">
												<span className="font-medium">Your answer:</span>{" "}
												<span
													className={`font-semibold ${
														item.isCorrect ? "text-gray-900" : "text-gray-600"
													}`}
												>
													{item.studentAns}
												</span>
												{item.isCorrect && (
													<span className="ml-2 text-xl">✓</span>
												)}
											</p>
											{!item.isCorrect && (
												<p className="text-gray-700">
													<span className="font-medium">Correct answer:</span>{" "}
													<span className="font-bold text-gray-900">
														{item.options[item.answer]}
													</span>
												</p>
											)}
											{questionTimes[item.quizId] && (
												<p className="text-sm text-gray-500 italic">
													Time spent: {questionTimes[item.quizId]}s
												</p>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					<div className="text-center">
						<Button text="Back to Home" click={() => navigate("/")} />
					</div>
				</div>
			</div>
		);
	}

	const currentQuiz = quizzes[currentIndex];
	const progress = ((currentIndex + 1) / quizzes.length) * 100;

	return (
		<div className="w-full min-h-[100vh] bg-[#ededed] relative">
			{/* Header with Progress */}
			<div className="bg-white shadow-sm sticky top-0 z-10">
				<div className="container max-w-6xl mx-auto px-8 py-6">
					<div className="flex justify-between items-center mb-4">
						<h1 className="text-2xl font-bold">Quiz</h1>
						<p className="text-gray-600 font-medium">
							Question {currentIndex + 1} / {quizzes.length}
						</p>
					</div>
					{/* Progress Bar */}
					<div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
						<div
							className="bg-black h-full transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container max-w-6xl mx-auto px-8 py-12">
				<div className="bg-white rounded-lg shadow-sm p-12">
					{/* Question */}
					<div className="mb-12">
						<div className="flex items-start gap-4 mb-8">
							<span className="text-5xl font-bold text-gray-800">
								{currentIndex + 1}.
							</span>
							<h2 className="text-4xl font-bold text-gray-900 leading-tight">
								{currentQuiz.question}
							</h2>
						</div>
					</div>

					{/* Options using your RadioGroup component */}
					<div className="mb-12">
						<QuestionRenderer
							quiz={currentQuiz} // ✅ Correct - matches component prop
							answer={answers[currentQuiz.quizId]}
							onAnswerChange={(quizId, answer) => {
								// ✅ Correct - matches component prop
								setAnswers((prev) => ({
									...prev,
									[quizId]: answer,
								}));
							}}
						/>
					</div>

					{/* Navigation Buttons */}
					<div className="flex justify-between items-center pt-8 border-t-2 border-gray-200">
						<button
							type="button"
							onClick={handlePrevious}
							disabled={currentIndex === 0}
							className="px-8 py-3 bg-white border-2 border-gray-800 text-gray-800 font-bold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 hover:text-white transition-all"
						>
							← Previous
						</button>

						<div className="text-center text-sm text-gray-600">
							<p className="font-medium">
								Answered: {Object.keys(answers).length} / {quizzes.length}
							</p>
						</div>

						{currentIndex === quizzes.length - 1 ? (
							<Button
								text={submitting ? "Submitting..." : "Submit Quiz"}
								click={handleSubmit}
								disabled={submitting}
							/>
						) : (
							<button
								type="button"
								onClick={handleNext}
								className="px-8 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all"
							>
								Next →
							</button>
						)}
					</div>
				</div>

				{/* Question Navigator */}
				<div className="mt-8 bg-white rounded-lg shadow-sm p-6">
					<p className="text-sm font-medium text-gray-700 mb-4">
						Jump to Question:
					</p>
					<div className="flex gap-3 flex-wrap">
						{quizzes.map((quiz, idx) => (
							<button
								type="button"
								key={quiz.quizId}
								onClick={() => {
									saveQuestionTime(currentQuizIdRef.current);
									setCurrentIndex(idx);
									currentQuizIdRef.current = quiz.quizId;
									startTimeRef.current = Date.now();
									window.scrollTo({ top: 0, behavior: "smooth" });
								}}
								className={`w-12 h-12 rounded-lg font-bold transition-all ${
									idx === currentIndex
										? "bg-black text-white scale-110"
										: answers[quiz.quizId]
											? "bg-gray-800 text-white hover:bg-gray-700"
											: "bg-gray-200 text-gray-700 hover:bg-gray-300"
								}`}
							>
								{idx + 1}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default QuizLive;
