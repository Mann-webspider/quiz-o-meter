const express = require("express");
const router = express.Router();
// Retrieve a list of quizzes created by the teacher.
router.get("/quizzes")

// Retrieve details of a specific quiz created by the teacher.
router.get("/quizzes/:id")

// Create a new quiz.
router.post("/quizzes")

// Update an existing quiz created by the teacher.
router.put("/quizzes/:id")

// Delete a quiz created by the teacher.
router.delete("/quizzes/:id")

// Retrieve a list of rooms created by the teacher.
router.get("/rooms")

// Retrieve details of a specific room created by the teacher.
router.get("/rooms/:id")

// Create a new room./
router.post("/rooms")

// Update an existing room created by the teacher.
router.put("/rooms/:id")

// Delete a room created by the teacher.
router.delete("/rooms/:id")
export default router