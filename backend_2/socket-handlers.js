const { redisClient } = require("./db/redis-client");
const { RoomModel } = require("./db/redis-models");

function formatForTable(userData) {
	const submissions = userData.submissions || [];
	const correct = submissions.filter((dt) => dt.isCorrect === true);

	return {
		studentId: userData.userId, // ← Changed from 'id' to 'studentId' for consistency
		student: userData.username,
		status: submissions.length !== 0 ? "Done" : "Pending",
		marks: `${correct.length}/${submissions.length}`,
	};
}

function studentsTableFormat(list) {
	return list?.map((data) => formatForTable(data)) || [];
}

async function getRoomParticipants(roomId) {
	try {
		const participants = await RoomModel.getParticipantsWithDetails(roomId);
		return studentsTableFormat(participants);
	} catch (error) {
		console.error("Error getting room participants:", error);
		return [];
	}
}

async function publishUserUpdate(roomId, userData, type = "user-updated") {
	try {
		const channel = `room:${roomId}:updates`;
		const message = JSON.stringify({
			type,
			user: userData,
			timestamp: new Date().toISOString(),
		});

		await redisClient.publish(channel, message);
		console.log(`✓ Published ${type} to ${channel}`);
	} catch (error) {
		console.error("Error publishing user update:", error);
	}
}

module.exports = (io) => {
	// Store active Redis subscribers per socket
	const subscribers = new Map();

	io.on("connection", async (socket) => {
		console.log("✓ Socket client connected:", socket.id);

		socket.on("disconnect", async () => {
			console.log("✗ Socket client disconnected:", socket.id);

			// Clean up Redis subscriber if exists
			const subscriber = subscribers.get(socket.id);
			if (subscriber) {
				try {
					await subscriber.quit();
					subscribers.delete(socket.id);
					console.log(`✓ Cleaned up Redis subscriber for ${socket.id}`);
				} catch (err) {
					console.error("Error cleaning up subscriber:", err);
				}
			}
		});

		// Join Socket.io room
		socket.on("join-room", async (roomId) => {
			socket.join(roomId);
			console.log(`✓ Client ${socket.id} joined Socket.io room: ${roomId}`);

			// Also setup Redis pub/sub for this room
			try {
				const subscriber = redisClient.duplicate();
				await subscriber.connect();

				const channel = `room:${roomId}:updates`;

				await subscriber.subscribe(channel, (message) => {
					try {
						const data = JSON.parse(message);

						if (data.type === "user-joined") {
							const formatted = formatForTable(data.user);
							socket.emit("user-insert", formatted);
							console.log(`📢 User joined room ${roomId}:`, formatted);
						}

						if (data.type === "user-updated") {
							const formatted = formatForTable(data.user);
							socket.emit("user-update", formatted);
							console.log(`📢 User updated in room ${roomId}:`, formatted);
						}
					} catch (error) {
						console.error("Error processing Redis message:", error);
					}
				});

				// Store subscriber for cleanup
				subscribers.set(socket.id, subscriber);

				console.log(`✓ Subscribed to Redis updates for room: ${roomId}`);
			} catch (error) {
				console.error("Error setting up Redis subscription:", error);
			}
		});

		// Leave Socket.io room
		socket.on("leave-room", async (roomId) => {
			socket.leave(roomId);
			console.log(`✓ Client ${socket.id} left room: ${roomId}`);

			// Clean up Redis subscriber
			const subscriber = subscribers.get(socket.id);
			if (subscriber) {
				try {
					await subscriber.quit();
					subscribers.delete(socket.id);
				} catch (err) {
					console.error("Error unsubscribing:", err);
				}
			}
		});

		// Get current participants
		socket.on("user", async (roomId) => {
			console.log(`📋 Client requested participants for room: ${roomId}`);

			try {
				const participants = await getRoomParticipants(roomId);
				console.log(`📤 Sending ${participants.length} participants to client`);
				socket.emit("user", participants);
			} catch (error) {
				console.error("Error getting participants:", error);
				socket.emit("user", []);
			}
		});

		// REMOVED: user-IU event (redundant with join-room)

		// Start quiz - broadcast to all in Socket.io room
		socket.on("start-quiz", async ({ roomId, quizData }) => {
			console.log(
				`🚀 Teacher starting quiz in room: ${roomId} with ${quizData.length} questions`,
			);

			// Broadcast to everyone in the Socket.io room
			io.to(roomId).emit("quiz-started", quizData);

			console.log(`✓ Broadcasted quiz-started to room ${roomId}`);
		});

		// Track student question timing
		socket.on("question-time", async ({ userId, quizId, timeSpent }) => {
			console.log(`⏱️ User ${userId} spent ${timeSpent}s on question ${quizId}`);

			try {
				const key = `timing:${userId}:${quizId}`;
				await redisClient.set(key, timeSpent.toString());
				await redisClient.expire(key, 3600); // Expire after 1 hour
			} catch (error) {
				console.error("Error storing timing:", error);
			}
		});
	});

	// Export helper functions
	io.publishUserUpdate = publishUserUpdate;
};
