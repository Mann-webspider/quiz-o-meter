const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const teacherRouter = require("../routes/teacher");
const studentRouter = require("../routes/student");
const { newManager } = require("../init");

// Create test app with both routers
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/teachers", teacherRouter);
app.use("/api/students", studentRouter);

describe("Integration Tests - Complete Quiz Flow", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should complete full quiz workflow", async () => {
		const roomId = "integration_room_123";
		const mockTeacherId = "teacher_1";
		const mockStudentId = "student_1";
		const mockQuizIds = ["quiz_1", "quiz_2"];

		// Mock createRoom
		jest.spyOn(newManager, "createRoom").mockResolvedValue(mockTeacherId);

		// Step 1: Teacher creates room
		const createRoomResponse = await request(app)
			.post("/api/teachers/rooms")
			.send({
				teacherName: "Integration Teacher",
				roomId: roomId,
			})
			.expect(200);

		expect(createRoomResponse.body.roomId).toBe(roomId);
		// teacherId is in cookie, not body
		const createCookies = createRoomResponse.headers["set-cookie"];
		expect(createCookies.some((cookie) => cookie.includes("teacherId"))).toBe(
			true,
		);

		// Step 2: Teacher adds quizzes
		jest.spyOn(newManager, "addBulkQuiz").mockResolvedValue(mockQuizIds);

		const addQuizzesResponse = await request(app)
			.post("/api/teachers/quizzes")
			.set("Cookie", [`roomId=${roomId}; teacherId=${mockTeacherId}`])
			.send([
				{
					question: "Integration Test Question 1",
					options: ["A", "B", "C", "D"],
					answer: "1",
					type: "multiple-choice",
					points: 1,
				},
			])
			.expect(200);

		expect(addQuizzesResponse.body.quizIds).toEqual(mockQuizIds);

		// Step 3: Student joins room
		jest.spyOn(newManager, "addStudent").mockResolvedValue(mockStudentId);

		const joinRoomResponse = await request(app)
			.post(`/api/students/rooms/${roomId}`)
			.send({ username: "Integration Student" })
			.expect(200);

		expect(joinRoomResponse.body.roomId).toBe(roomId);
		expect(joinRoomResponse.body.userId).toBe(mockStudentId);

		// Step 4: Student gets quizzes
		jest.spyOn(newManager, "getQuizzes").mockResolvedValue([
			{
				quizId: "quiz_1",
				question: "Test",
				options: ["A", "B"],
				type: "multiple-choice",
				points: 1,
			},
		]);

		const getQuizzesResponse = await request(app)
			.get(`/api/students/rooms/${roomId}`)
			.expect(200);

		expect(getQuizzesResponse.body).toBeInstanceOf(Array);

		// Step 5: Student submits answers
		jest.spyOn(newManager, "checkManagerQuizAnswer").mockResolvedValue({
			score: "1/1",
			percentage: "100%",
			results: [],
			pendingReview: 0,
		});

		const submitAnswersResponse = await request(app)
			.post("/api/students/rooms/quizzes/answers")
			.set("Cookie", [`roomId=${roomId}; userId=${mockStudentId}`])
			.send([{ quizId: mockQuizIds[0], answer: "1" }])
			.expect(200);

		expect(submitAnswersResponse.body).toHaveProperty("score");

		// Step 6: Teacher checks analytics
		const mockRoom = { roomId, teacherId: mockTeacherId, participants: [] };
		jest.spyOn(newManager, "getRoom").mockResolvedValue(mockRoom);
		jest.spyOn(newManager, "getAnalytics").mockResolvedValue([]);

		const analyticsResponse = await request(app)
			.get(`/api/teachers/analytics/${roomId}`)
			.set("Cookie", [`teacherId=${mockTeacherId}`])
			.expect(200);

		expect(analyticsResponse.body).toBeInstanceOf(Array);
	});

	it("should handle multiple students joining same room", async () => {
		const roomId = "multi_student_room";
		const mockTeacherId = "teacher_1";

		// Create room
		jest.spyOn(newManager, "createRoom").mockResolvedValue(mockTeacherId);

		await request(app)
			.post("/api/teachers/rooms")
			.send({
				teacherName: "Multi Student Teacher",
				roomId: roomId,
			})
			.expect(200);

		// Multiple students join
		const students = ["Alice", "Bob", "Charlie"];
		const studentIds = [];

		for (let i = 0; i < students.length; i++) {
			const mockId = `student_${i + 1}`;

			// Mock before each request
			jest.spyOn(newManager, "addStudent").mockResolvedValueOnce(mockId);

			const response = await request(app)
				.post(`/api/students/rooms/${roomId}`)
				.send({ username: students[i] })
				.expect(200);

			studentIds.push(response.body.userId);
		}

		expect(studentIds.length).toBe(3);
		expect(studentIds).toEqual(["student_1", "student_2", "student_3"]);
	});
});
