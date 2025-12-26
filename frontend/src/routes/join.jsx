import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import OtpInput from "../components/Otp";
import TextStroke from "../components/TextStroke";
import api from "../utils/axios";
import config from "../config";
function Join() {
	const [form, setForm] = useState({ username: "", roomId: "" });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const navigation = useNavigate();
	const [_cookie,setCookie] = useCookies(["userId", "roomId", "username"]); // Add username

	const onSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			console.log("Joining room:", form);

			// Use the api instance instead of hardcoded URL
			const res = await api.post(
				`${config.BACKEND_URL}/api/students/rooms/${form.roomId}`,
				{
					username: form.username,
				},
			);

			console.log("Join response:", res.data);

			// Set cookies with proper options
			const cookieOptions = {
				path: "/",
				maxAge: 24 * 60 * 60, // 24 hours in seconds
				sameSite: "none",
				secure: true
			};

			setCookie("userId", res.data.userId, cookieOptions);
			setCookie("roomId", res.data.roomId, cookieOptions);
			setCookie("username", form.username, cookieOptions); // Store username too

			console.log("Cookies set:", {
				userId: res.data.userId,
				roomId: res.data.roomId,
				username: form.username,
			});

			// Small delay to ensure cookies are set
			setTimeout(() => {
				navigation("/waiting");
			}, 100);
		} catch (err) {
			console.error("Error joining room:", err);
			setError(
				err.response?.data?.error || "Failed to join room. Please try again.",
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
						Enter your room code here
					</p>

					<input
						type="text"
						placeholder="Enter your Name"
						className="px-2 py-1 w-64 rounded-lg border-solid border-gray-400 border-2"
						onChange={(e) => setForm({ ...form, username: e.target.value })}
						value={form.username}
						required
					/>

					<OtpInput
						length={6}
						onOtpSubmit={(val) => {
							console.log("Room ID entered:", val);
							setForm({ ...form, roomId: val });
						}}
					/>

					{error && <p className="text-red-500 text-sm font-medium">{error}</p>}

					<Button
						text={loading ? "Joining..." : "Let's Go"}
						click={onSubmit}
						disabled={loading || !form.username || form.roomId.length !== 6}
					/>
				</div>
			</div>
		</div>
	);
}

export default Join;
