const express = require("express");
const router = express.Router();
const { newManager } = require("../init");

/**
 * GET /api/teachers/quizzes
 * Retrieve a list of quizzes created by the teacher
 */
router.get("/quizzes", async (req, res) => {
	try {
		const cookie = req.cookies;

		if (!cookie.roomId) {
			return res.status(400).json({ error: "Room ID not found in cookies" });
		}
		console.log("router cookie roomid", cookie.roomId);

		const result = await newManager.getTeacherQuizzes(cookie.roomId);
		res.json(result);
	} catch (error) {
		console.error("Error getting teacher quizzes:", error);
		res.status(500).json({ error: "Failed to retrieve quizzes" });
	}
});

/**
 * POST /api/teachers/quizzes
 * Create new quizzes
 * Body: Array of {question, options, answer}
 */
router.post("/quizzes", async (req, res) => {
	try {
		const cookie = req.cookies;
		const body = req.body;

		if (!cookie.roomId) {
			return res.status(400).json({ error: "Room ID not found in cookies" });
		}

		if (!Array.isArray(body) || body.length === 0) {
			return res
				.status(400)
				.json({ error: "Request body must be a non-empty array of quizzes" });
		}

		const result = await newManager.addBulkQuiz(cookie.roomId, body);
		res.json({
			message: "Quizzes created successfully",
			quizIds: result,
		});
	} catch (error) {
		console.error("Error creating quizzes:", error);
		res.status(500).json({ error: "Failed to create quizzes" });
	}
});

/**
 * POST /api/teachers/rooms
 * Create a new room
 * Body: {teacherName, roomId}
 */
router.post("/rooms", async (req, res) => {
	try {
		const { teacherName, roomId } = req.body;

		if (!teacherName || !roomId) {
			return res.status(400).json({
				error: "teacherName and roomId are required",
			});
		}

		const teacherId = await newManager.createRoom(teacherName, roomId);

		// Set cookies with proper options
		const cookieOptions = {
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
			httpOnly: false, // Allow JavaScript access
			sameSite: "none",
			secure: true,
			path: "/",
		};

		res
			.cookie("teacherId", teacherId, cookieOptions)
			.cookie("roomId", roomId, cookieOptions)
			.cookie("teacherName", teacherName, cookieOptions) // Add teacher name
			.json({
				roomId: roomId,
				teacherId: teacherId, // ← Add this to response body
				message: "Room created successfully",
			});
	} catch (error) {
		console.error("Error creating room:", error);
		res.status(500).json({ error: "Failed to create room" });
	}
});

/**
 * GET /api/teachers/rooms/:roomId
 * Retrieve details of a specific room
 */
router.get("/rooms/:roomId", async (req, res) => {
	try {
		const { roomId } = req.params;

		if (!roomId) {
			return res.status(400).json({ error: "Room ID is required" });
		}

		const room = await newManager.getRoom(roomId);

		if (!room) {
			return res.status(404).json({ error: "Room not found" });
		}

		res.json(room);
	} catch (error) {
		console.error("Error getting room:", error);
		res.status(500).json({ error: "Failed to retrieve room details" });
	}
});

/**
 * GET /api/teachers/analytics/:roomId
 * Get student submission analytics for a room
 */
router.get("/analytics/:roomId", async (req, res) => {
	try {
		const { roomId } = req.params;
		const { teacherId } = req.cookies;

		if (!teacherId) {
			return res
				.status(401)
				.json({ error: "Not authorized - teacher ID not found" });
		}

		if (!roomId) {
			return res.status(400).json({ error: "Room ID is required" });
		}

		// Get room and verify teacher
		const room = await newManager.getRoom(roomId);

		if (!room) {
			return res.status(404).json({ error: "Room not found" });
		}
		console.log("room teacher id", room.teacherId);
		console.log("teacherid", teacherId);

		if (room.teacherId !== teacherId) {
			return res.status(403).json({
				error: "Not authorized - you are not the teacher of this room",
			});
		}

		// Get analytics
		const analytics = await newManager.getAnalytics(teacherId, roomId);
		res.json(analytics);
	} catch (error) {
		console.error("Error getting analytics:", error);
		res.status(500).json({ error: "Failed to retrieve analytics" });
	}
});

// Future endpoints (commented for reference)
// GET /api/teachers/quizzes/:id - Retrieve details of a specific quiz
// PUT /api/teachers/quizzes/:id - Update an existing quiz
// DELETE /api/teachers/quizzes/:id - Delete a quiz
// PUT /api/teachers/rooms/:id - Update an existing room
// DELETE /api/teachers/rooms/:id - Delete a room

module.exports = router;
