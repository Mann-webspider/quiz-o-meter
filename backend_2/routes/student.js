const express = require("express");
const router = express.Router();
const { newManager } = require("../init"); // Use shared instance

// Join room
router.post("/rooms/:roomId", async (req, res) => {
	try {
		const { roomId } = req.params;
		const { username } = req.body;

		if (!username) {
			return res.status(400).json({ error: "Username is required" });
		}

		const userId = await newManager.addStudent(username, roomId);

		// Set cookies
		res.cookie("userId", userId, { maxAge: 24 * 60 * 60 * 1000 });
		res.cookie("roomId", roomId, { maxAge: 24 * 60 * 60 * 1000 });

		res.json({
			userId,
			roomId,
			message: "Successfully joined room",
		});
	} catch (error) {
		console.error("Error joining room:", error);
		res.status(500).json({ error: error.message });
	}
});

// Get quizzes for room
router.get("/rooms/:roomId", async (req, res) => {
	try {
		const { roomId } = req.params;
		const quizzes = await newManager.getQuizzes(roomId);
		res.json(quizzes);
	} catch (error) {
		console.error("Error getting quizzes:", error);
		res.status(500).json({ error: error.message });
	}
});

// Submit answers
router.post("/rooms/quizzes/answers", async (req, res) => {
	try {
		const studentAnswers = req.body;
		const { userId, roomId } = req.cookies;

		if (!userId || !roomId) {
			return res
				.status(400)
				.json({ error: "Missing user or room information" });
		}

		console.log("=== Submission Debug ===");
		console.log("User ID:", userId);
		console.log("Room ID:", roomId);
		console.log("Student Answers:", JSON.stringify(studentAnswers, null, 2));

		// Validate answer format
		if (!Array.isArray(studentAnswers)) {
			return res.status(400).json({ error: "Answers must be an array" });
		}

		// Ensure all answers have quizId and answer fields
		for (const answer of studentAnswers) {
			if (!answer.quizId || answer.answer === undefined) {
				return res.status(400).json({
					error: "Each answer must have quizId and answer fields",
				});
			}
		}

		const result = await newManager.checkManagerQuizAnswer(
			userId,
			roomId,
			studentAnswers,
		);

		console.log("=== Result ===");
		console.log(JSON.stringify(result, null, 2));

		res.json(result);
	} catch (error) {
		console.error("Error submitting answers:", error);
		res.status(500).json({ error: error.message });
	}
});

// room participant list
router.get("/rooms/:roomId/participants", async (req, res) => {
	try {
		const { roomId } = req.params;
		const participants = await newManager.getStudentName(roomId); // Use correct method name
		res.json(participants);
	} catch (error) {
		console.error("Error getting participants:", error);
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
