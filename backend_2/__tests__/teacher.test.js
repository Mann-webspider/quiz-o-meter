const request = require("supertest");
const express = require("express");
const cookieParser = require("cookie-parser");
const teacherRouter = require("../routes/teacher");
const { redisClient } = require("../db/redis-client");
const { RoomModel, QuizModel } = require("../db/redis-models");
const { newManager } = require("../init");
// Create test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/teachers", teacherRouter);

describe("Teacher API Endpoints", () => {
  const mockRoomId = "room123";
  const mockTeacherName = "John Doe";
  let mockTeacherId;

 describe('POST /api/teachers/rooms - Create Room', () => {
  it('should create a room successfully', async () => {
    const mockTeacherId = 'user_1_1234567890';
    
    // Mock the createRoom method
    jest.spyOn(newManager, 'createRoom').mockResolvedValue(mockTeacherId);

    const response = await request(app)
      .post('/api/teachers/rooms')
      .send({
        teacherName: mockTeacherName,
        roomId: mockRoomId,
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('roomId', mockRoomId);
    expect(response.body).toHaveProperty('message', 'Room created successfully');
    
    // Check cookies were set (teacherId is in cookie, not body)
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some(cookie => cookie.includes('roomId'))).toBe(true);
    expect(cookies.some(cookie => cookie.includes('teacherId'))).toBe(true);
    
    // Verify createRoom was called
    expect(newManager.createRoom).toHaveBeenCalledWith(mockTeacherName, mockRoomId);
  });
});


  describe("POST /api/teachers/quizzes - Add Quizzes", () => {
    const mockQuizzes = [
      {
        question: "What is 2+2?",
        options: ["3", "4", "5", "6"],
        answer: "1",
        type: "multiple-choice",
        points: 1,
      },
      {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Rome"],
        answer: "2",
        type: "multiple-choice",
        points: 1,
      },
    ];

    it("should add quizzes successfully", async () => {
      const mockQuizIds = ["quiz_1", "quiz_2"];

      // Clear and mock fresh
      jest.clearAllMocks();
      const mockFn = jest
        .spyOn(newManager, "addBulkQuiz")
        .mockResolvedValue(mockQuizIds);

      const response = await request(app)
        .post("/api/teachers/quizzes")
        .set("Cookie", [`roomId=${mockRoomId}; teacherId=user_1_123`])
        .send(mockQuizzes)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Quizzes created successfully"
      );
      expect(response.body).toHaveProperty("quizIds");
      expect(Array.isArray(response.body.quizIds)).toBe(true);
      expect(response.body.quizIds).toEqual(mockQuizIds);

      // Verify it was called
      expect(mockFn).toHaveBeenCalledWith(mockRoomId, mockQuizzes);
    });

    // ... rest of quiz tests
  });


  describe("GET /api/teachers/quizzes - Get Teacher Quizzes", () => {
    it("should retrieve teacher quizzes successfully", async () => {
      const mockQuizzes = [
        {
          quizId: "quiz_1",
          question: "What is 2+2?",
          options: ["3", "4", "5", "6"],
          answer: "1",
        },
      ];

      const response = await request(app)
        .get("/api/teachers/quizzes")
        .set("Cookie", [`roomId=${mockRoomId}`])
        .expect("Content-Type", /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 400 if roomId cookie is missing", async () => {
      const response = await request(app)
        .get("/api/teachers/quizzes")
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toHaveProperty(
        "error",
        "Room ID not found in cookies"
      );
    });
  });

  describe("GET /api/teachers/rooms/:roomId - Get Room Details", () => {
    it("should get room details successfully", async () => {
      const mockRoom = {
        roomId: mockRoomId,
        teacherId: "user_1_123",
        teacherName: mockTeacherName,
        participants: [],
      };

      jest.spyOn(RoomModel, "findById").mockResolvedValue(mockRoom);

      const response = await request(app)
        .get(`/api/teachers/rooms/${mockRoomId}`)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("roomId", mockRoomId);
      expect(response.body).toHaveProperty("teacherName", mockTeacherName);
    });

    it("should return 404 if room not found", async () => {
      jest.spyOn(RoomModel, "findById").mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/teachers/rooms/invalidroom`)
        .expect("Content-Type", /json/)
        .expect(404);

      expect(response.body).toHaveProperty("error", "Room not found");
    });
  });

  describe("GET /api/teachers/analytics/:roomId - Get Analytics", () => {
    const mockTeacherId = "user_1_123";

    it("should get analytics successfully", async () => {
      const mockRoom = {
        roomId: mockRoomId,
        teacherId: mockTeacherId,
        participants: [],
      };

      const mockAnalytics = [
        {
          studentId: "user_2_456",
          studentName: "Alice",
          submissions: [],
        },
      ];

      jest.spyOn(RoomModel, "findById").mockResolvedValue(mockRoom);

      const response = await request(app)
        .get(`/api/teachers/analytics/${mockRoomId}`)
        .set("Cookie", [`teacherId=${mockTeacherId}`])
        .expect("Content-Type", /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 401 if teacherId cookie is missing", async () => {
      const response = await request(app)
        .get(`/api/teachers/analytics/${mockRoomId}`)
        .expect("Content-Type", /json/)
        .expect(401);

      expect(response.body.error).toContain("Not authorized");
    });

    it("should return 403 if teacher does not own the room", async () => {
      const mockRoom = {
        roomId: mockRoomId,
        teacherId: "different_teacher_id",
        participants: [],
      };

      jest.spyOn(RoomModel, "findById").mockResolvedValue(mockRoom);

      const response = await request(app)
        .get(`/api/teachers/analytics/${mockRoomId}`)
        .set("Cookie", [`teacherId=${mockTeacherId}`])
        .expect("Content-Type", /json/)
        .expect(403);

      expect(response.body.error).toContain("not the teacher of this room");
    });
  });
});
