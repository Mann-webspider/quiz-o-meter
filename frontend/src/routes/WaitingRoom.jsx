import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import Avatar, { genConfig } from "react-nice-avatar";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";

function WaitingRoom() {
	const [cookies] = useCookies(["roomId", "userId", "username"]);
	const [participants, setParticipants] = useState([]);
	const [quizStarted, setQuizStarted] = useState(false);
	const [socketConnected, setSocketConnected] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		if (!cookies.roomId || !cookies.userId) {
			console.error("Missing cookies, redirecting to join");
			navigate("/join");
			return;
		}

		// Connect socket if not connected
		if (!socket.connected) {
			console.log("Connecting socket...");
			socket.connect();
		}

		// Wait for socket connection
		socket.on("connect", () => {
			console.log("Socket connected:", socket.id);
			setSocketConnected(true);

			// Join the room after connection
			console.log("Joining room:", cookies.roomId);
			socket.emit("join-room", cookies.roomId);

			// Request participant list
			setTimeout(() => {
				console.log("Requesting user list for room:", cookies.roomId);
				socket.emit("user", cookies.roomId);
			}, 500);
		});

		// Handle disconnect
		socket.on("disconnect", () => {
			console.log("Socket disconnected");
			setSocketConnected(false);
		});

		// Listen for participant updates
		socket.on("user", (data) => {
			console.log("Participants list received:", data);
			setParticipants(Array.isArray(data) ? data : []);
		});

		socket.on("user-insert", (data) => {
			console.log("New participant joined:", data);
			setParticipants((prev) => {
				const exists = prev.some((p) => p.studentId === data.studentId);
				if (exists) return prev;
				return [...prev, data];
			});
		});

		socket.on("user-update", (data) => {
			console.log("Participant updated:", data);
			setParticipants((prev) => {
				const index = prev.findIndex((p) => p.studentId === data.studentId);
				if (index === -1) return [...prev, data];
				const updated = [...prev];
				updated[index] = data;
				return updated;
			});
		});

		// Listen for quiz start
		socket.on("quiz-started", (quizData) => {
			console.log("Quiz started!", quizData);
			setQuizStarted(true);

			// Navigate to quiz after short delay
			setTimeout(() => {
				navigate("/quiz-live");
			}, 1000);
		});

		// If already connected, join room immediately
		if (socket.connected) {
			console.log("Socket already connected, joining room");
			socket.emit("join-room", cookies.roomId);
			setTimeout(() => {
				socket.emit("user", cookies.roomId);
			}, 500);
		}

		return () => {
			console.log("Cleaning up WaitingRoom");
			socket.emit("leave-room", cookies.roomId);
			socket.off("connect");
			socket.off("disconnect");
			socket.off("user");
			socket.off("user-insert");
			socket.off("user-update");
			socket.off("quiz-started");
		};
	}, [cookies.roomId, cookies.userId, navigate]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
			{/* Connection Status */}
			{!socketConnected && (
				<div className="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-full shadow-lg">
					<p className="text-sm font-semibold">Connecting...</p>
				</div>
			)}

			{/* Room Info */}
			<div className="bg-indigo-600 text-white px-8 py-4 rounded-full shadow-lg mb-8">
				<h1 className="text-3xl font-bold">Room No. {cookies.roomId}</h1>
			</div>

			<p className="text-gray-600 text-xl mb-12 font-medium">
				{quizStarted
					? "Starting Quiz..."
					: "Wait Until Teacher Starts The Test"}
			</p>

			{/* Debug Info (remove in production) */}
			<div className="bg-gray-100 p-4 rounded mb-4 text-xs">
				<p>UserID: {cookies.userId}</p>
				<p>RoomID: {cookies.roomId}</p>
				<p>Socket: {socketConnected ? "Connected" : "Disconnected"}</p>
				<p>Participants: {participants.length}</p>
			</div>

			{/* Participants Display */}
			<div className="relative w-full max-w-2xl h-96 flex items-center justify-center">
				{participants.length === 0 ? (
					<p className="text-gray-400 text-lg">Waiting for participants...</p>
				) : (
					<div className="relative w-full h-full">
						{participants.map((participant, index) => {
							const angle = (index * 360) / participants.length;
							const radius = 180;
							const x = Math.cos((angle * Math.PI) / 180) * radius;
							const y = Math.sin((angle * Math.PI) / 180) * radius;

							// Generate avatar config from student name
							const config = genConfig(participant.student || `user${index}`);

							return (
								<div
									key={participant.studentId || index}
									className="absolute transition-all duration-500 ease-out"
									style={{
										left: `calc(50% + ${x}px)`,
										top: `calc(50% + ${y}px)`,
										transform: "translate(-50%, -50%)",
									}}
								>
									<div className="flex flex-col items-center">
										<div className="bg-white p-2 rounded-full shadow-xl border-4 border-indigo-200 hover:border-indigo-400 transition-all">
											<Avatar
												style={{ width: "5rem", height: "5rem" }}
												{...config}
											/>
										</div>
										<p className="mt-2 text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded-full shadow">
											{participant.student}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Participant Count */}
			<div className="mt-12 bg-white px-6 py-3 rounded-full shadow-lg">
				<p className="text-lg font-semibold text-gray-700">
					{participants.length}{" "}
					{participants.length === 1 ? "Participant" : "Participants"} Joined
				</p>
			</div>

			{quizStarted && (
				<div className="mt-8 bg-green-500 text-white px-8 py-4 rounded-full shadow-lg animate-pulse">
					<p className="text-xl font-bold">🚀 Quiz Starting Now!</p>
				</div>
			)}
		</div>
	);
}

export default WaitingRoom;
