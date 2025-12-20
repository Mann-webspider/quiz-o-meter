import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useForm } from "react-hook-form";
import Avatar from "react-nice-avatar";
import { useNavigate } from "react-router-dom"; // ← Add this import
import QuestionForm from "../components/teacher/QuestionForm";
import QuestionList from "../components/teacher/QuestionList";
// Import new components
import StatsBar from "../components/teacher/StatsBar";
import StudentCard from "../components/teacher/StudentCard";
import StudentDetailModal from "../components/teacher/StudentDetailModal";
import config from "../utils/avatar";
import api from "../utils/axios";
import socket from "../utils/socket";

function Teacher() {
	const [ques, setQues] = useState([]);
	const { register, handleSubmit, reset, watch, setValue } = useForm();
	const [cookies] = useCookies(["roomId", "teacherId", "teacherName"]);
	const navigate = useNavigate();
	const [dataS, setDataS] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [quizPublished, setQuizPublished] = useState(false);
	const [selectedStudent, setSelectedStudent] = useState(null);
	const [studentDetails, setStudentDetails] = useState(null);
	const [loadingQuestions, setLoadingQuestions] = useState(true); // ← Add loading state

	// Session check and Socket setup
	useEffect(() => {
		if (!cookies.teacherId || !cookies.roomId) {
			console.error("Missing teacher session, redirecting to create room");
			navigate("/create");
			return;
		}

		console.log("Teacher connecting to room:", cookies.roomId);

		if (!socket.connected) {
			socket.connect();
		}

		const handleConnect = () => {
			console.log("Teacher socket connected:", socket.id);
			socket.emit("join-room", cookies.roomId);

			setTimeout(() => {
				console.log("Requesting participants for room:", cookies.roomId);
				socket.emit("user", cookies.roomId);
			}, 500);
		};

		const handleUserList = (data) => {
			console.log("Received participants:", data);
			const participants = Array.isArray(data) ? data : [];
			setDataS(participants);
		};

		const handleUserInsert = (data) => {
			console.log("New participant joined:", data);
			setDataS((prev) => {
				const exists = prev.some((p) => p.studentId === data.studentId);
				if (exists) return prev;
				return [...prev, data];
			});
		};

		const handleUserUpdate = (data) => {
			console.log("Participant updated:", data);
			setDataS((prev) => {
				const index = prev.findIndex((p) => p.studentId === data.studentId);
				if (index === -1) return [...prev, data];
				const updated = [...prev];
				updated[index] = data;
				return updated;
			});
		};

		socket.on("connect", handleConnect);
		socket.on("user", handleUserList);
		socket.on("user-insert", handleUserInsert);
		socket.on("user-update", handleUserUpdate);

		if (socket.connected) {
			handleConnect();
		}

		return () => {
			socket.emit("leave-room", cookies.roomId);
			socket.off("connect", handleConnect);
			socket.off("user", handleUserList);
			socket.off("user-insert", handleUserInsert);
			socket.off("user-update", handleUserUpdate);
		};
	}, [cookies.roomId, cookies.teacherId, navigate, cookies]);

	// ← NEW: Fetch existing questions on mount
	useEffect(() => {
		const fetchExistingQuestions = async () => {
			if (!cookies.roomId) return;

			setLoadingQuestions(true);
			try {
				console.log("Fetching existing questions for room:", cookies.roomId);

				const res = await api.get(
					"http://localhost:3001/api/teachers/quizzes",
					{ withCredentials: true },
				);

				console.log("Fetched questions:", res.data);

				if (res.data && res.data.length > 0) {
					setQues(res.data);
					setQuizPublished(true); // Questions exist = already published
					console.log(`Loaded ${res.data.length} existing questions`);
				} else {
					console.log("No existing questions found");
				}
			} catch (err) {
				console.error("Error fetching questions:", err);
				// Don't show error - just means no questions yet
			} finally {
				setLoadingQuestions(false);
			}
		};

		fetchExistingQuestions();
	}, [cookies.roomId]);

	// Rest of your component code...
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
			console.log("Quiz published successfully");
			setQuizPublished(true);
			alert("✓ Quiz published successfully!");
		} catch (err) {
			console.error("Publish error:", err);
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

			console.log("Starting quiz with data:", res.data);

			socket.emit("start-quiz", {
				roomId: cookies.roomId,
				quizData: res.data,
			});

			alert("🚀 Quiz started!");
		} catch (err) {
			console.error("Start quiz error:", err);
			alert("Failed to start quiz");
		}
	};

	const handleViewStudent = async (studentId) => {
		try {
			const res = await api.get(
				`http://localhost:3001/api/teachers/analytics/${cookies.roomId}`,
				{ withCredentials: true },
			);
			console.log("student deatils", res.data);

			const student = res.data.find((s) => s.studentId === studentId);
			if (student) {
				setStudentDetails(student);
				setSelectedStudent(studentId);
			} else {
				alert("Student not found");
			}
		} catch (err) {
			console.error("Load student details error:", err);
			alert("Failed to load student details");
		}
	};

	// Show loading state while fetching questions
	if (loadingQuestions) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600 text-lg">Loading dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-[#ededed] min-h-[100vh]">
			{/* Rest of your JSX */}
			<nav className="bg-white p-12 flex justify-between items-center shadow-sm">
				<div className="logo text-4xl font-bold">Quiz-O-Meter</div>
				<div className="flex items-center gap-4">
					<div className="text-right">
						<p className="text-xs text-gray-500 uppercase tracking-wider">
							Teacher
						</p>
						<p className="font-medium text-lg">
							{cookies.teacherName || "Teacher"}
						</p>
						<p className="text-xs text-gray-500 uppercase tracking-wider mt-2">
							Room Code
						</p>
						<p className="font-mono font-bold text-xl">{cookies.roomId}</p>
					</div>
					<Avatar style={{ width: "5rem", height: "5rem" }} {...config} />
				</div>
			</nav>

			<main className="container mx-auto p-12">
				<StatsBar
					questionCount={ques.length}
					studentCount={dataS.length}
					isPublished={quizPublished}
					onPublish={handlePublishQuiz}
					onStart={handleStartQuiz}
					loading={loading}
				/>

				<div className="grid grid-cols-2 gap-8 mb-8">
					{!quizPublished && (
						<QuestionForm
							register={register}
							onSubmit={handleSubmit(onSubmit)}
							answerValue={watch("answer")}
							watch={watch}
							setValue={setValue}
						/>
					)}

					<QuestionList
						questions={ques}
						onDelete={handleDelete}
						isPublished={quizPublished}
					/>
				</div>

				<div className="bg-white p-8 rounded-lg shadow-lg">
					<h3 className="text-2xl font-bold mb-6">
						Student Analytics
						<span className="ml-4 text-blue-600 text-lg">
							({dataS.length} {dataS.length === 1 ? "student" : "students"})
						</span>
					</h3>

					{dataS.length === 0 ? (
						<div className="text-center py-20 text-gray-400">
							<p className="text-7xl mb-4">👥</p>
							<p className="text-xl font-medium">No students joined yet</p>
							<p className="text-sm mt-2">
								Share room code{" "}
								<span className="font-mono font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded">
									{cookies.roomId}
								</span>{" "}
								with students
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{dataS.map((student) => (
								<StudentCard
									key={student.studentId}
									student={student}
									onViewDetails={handleViewStudent}
								/>
							))}
						</div>
					)}
				</div>

				{error && (
					<p className="text-red-600 font-bold mt-4 text-center text-lg bg-red-50 p-4 rounded">
						{error}
					</p>
				)}
			</main>

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
