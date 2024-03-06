const express = require("express")
const router = express.Router()

// Retrieve a list of rooms available for students to join.
router.get("/student/rooms")

// Join a room as a student.
router.post("/rooms/:id/join")

// Retrieve details of a quiz within a specific room for student participation.
router.get("/rooms/:roomId/quizzes/:quizId")

// Submit answers to questions in a quiz within a specific room.
router.post("/rooms/:roomId/quizzes/:quizId/answers")
export default router