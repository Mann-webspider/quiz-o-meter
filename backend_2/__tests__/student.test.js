const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const studentRouter = require("../routes/student");
const { newManager } = require("../init");

// Create test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/students", studentRouter);

describe("Student API Endpoints", () => {
	const mockRoomId = "room123";
	const mockStudentName = "Alice";
	const mockUserId = "user_2_1234567891";

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("POST /api/students/rooms/:roomId - Join Room", () => {
		it("should join room successfully", async () => {
			// Mock addStudent to return userId
			jest.spyOn(newManager, "addStudent").mockResolvedValue(mockUserId);

			const response = await request(app)
				.post(`/api/students/rooms/${mockRoomId}`)
				.send({ username: mockStudentName })
				.expect("Content-Type", /json/)
				.expect(200);

			// Now userId should be in response
			expect(response.body).toHaveProperty("userId", mockUserId);
			expect(response.body).toHaveProperty("roomId", mockRoomId);
			expect(response.body).toHaveProperty(
				"message",
				"Successfully joined room",
			);

			// Check cookies
			const cookies = response.headers["set-cookie"];
			expect(cookies).toBeDefined();
			expect(cookies.some((cookie) => cookie.includes("userId"))).toBe(true);
			expect(cookies.some((cookie) => cookie.includes("roomId"))).toBe(true);
		});

		it("should return 400 if username is missing", async () => {
			const response = await request(app)
				.post(`/api/students/rooms/${mockRoomId}`)
				.send({})
				.expect("Content-Type", /json/)
				.expect(400);

			expect(response.body).toHaveProperty("error", "Username is required");
		});

		it("should return 500 if room does not exist", async () => {
			// Mock addStudent to throw error
			jest
				.spyOn(newManager, "addStudent")
				.mockRejectedValue(new Error("No room found, or no room created"));

			const response = await request(app)
				.post(`/api/students/rooms/invalidroom`)
				.send({ username: mockStudentName })
				.expect("Content-Type", /json/)
				.expect(500);

			expect(response.body.error).toBeDefined();
		});
	});

	describe("GET /api/students/rooms/:roomId - Get Quizzes", () => {
		it("should get quizzes without answers", async () => {
			const mockQuizzes = [
				{
					quizId: "quiz_1",
					question: "What is 2+2?",
					options: ["3", "4", "5", "6"],
					type: "multiple-choice",
					points: 1,
				},
			];

			jest.spyOn(newManager, "getQuizzes").mockResolvedValue(mockQuizzes);

			const response = await request(app)
				.get(`/api/students/rooms/${mockRoomId}`)
				.expect("Content-Type", /json/)
				.expect(200);

			expect(Array.isArray(response.body)).toBe(true);

			// Verify answers are not included
			if (response.body.length > 0) {
				expect(response.body[0]).not.toHaveProperty("answer");
			}
		});

		it("should return empty array for room with no quizzes", async () => {
			jest.spyOn(newManager, "getQuizzes").mockResolvedValue([]);

			const response = await request(app)
				.get(`/api/students/rooms/${mockRoomId}`)
				.expect("Content-Type", /json/)
				.expect(200);

			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBe(0);
		});
	});

	describe("GET /api/students/rooms/:roomId/participants - Get Participants", () => {
		it("should get list of participants", async () => {
			const mockParticipants = [
				{ studentId: "user_2_1", student: "Alice" },
				{ studentId: "user_2_2", student: "Bob" },
			];

			jest
				.spyOn(newManager, "getStudentName")
				.mockResolvedValue(mockParticipants);

			const response = await request(app)
				.get(`/api/students/rooms/${mockRoomId}/participants`)
				.expect("Content-Type", /json/)
				.expect(200);

			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body).toEqual(mockParticipants);
		});
	});

	describe("POST /api/students/rooms/quizzes/answers - Submit Answers", () => {
		const mockAnswers = [
			{ quizId: "quiz_1", answer: "1" },
			{ quizId: "quiz_2", answer: "2" },
		];

		it("should submit answers successfully", async () => {
			const mockResult = {
				score: "2/2",
				percentage: "100.00%",
				message: "Perfect score! 🎉",
				results: [],
				pendingReview: 0,
			};

			jest
				.spyOn(newManager, "checkManagerQuizAnswer")
				.mockResolvedValue(mockResult);

			const response = await request(app)
				.post("/api/students/rooms/quizzes/answers")
				.set("Cookie", [`roomId=${mockRoomId}; userId=${mockUserId}`])
				.send(mockAnswers)
				.expect("Content-Type", /json/)
				.expect(200);

			expect(response.body).toHaveProperty("score", "2/2");
			expect(response.body).toHaveProperty("percentage", "100.00%");
		});

		it("should return 400 if cookies are missing", async () => {
			const response = await request(app)
				.post("/api/students/rooms/quizzes/answers")
				.send(mockAnswers)
				.expect("Content-Type", /json/)
				.expect(400);

			expect(response.body.error).toBe("Missing user or room information");
		});

		it("should return 400 if answers is not an array", async () => {
			const response = await request(app)
				.post("/api/students/rooms/quizzes/answers")
				.set("Cookie", [`roomId=${mockRoomId}; userId=${mockUserId}`])
				.send({ answer: "invalid" })
				.expect("Content-Type", /json/)
				.expect(400);

			expect(response.body.error).toBe("Answers must be an array");
		});

		it("should return 400 if answer is missing quizId", async () => {
			const response = await request(app)
				.post("/api/students/rooms/quizzes/answers")
				.set("Cookie", [`roomId=${mockRoomId}; userId=${mockUserId}`])
				.send([{ answer: "1" }]) // Missing quizId
				.expect("Content-Type", /json/)
				.expect(400);

			expect(response.body.error).toBe(
				"Each answer must have quizId and answer fields",
			);
		});
	});
});
