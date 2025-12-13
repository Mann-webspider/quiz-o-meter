const { redisClient } = require("./db/redis-client");
const { UserModel, RoomModel } = require("./db/redis-models");

function formatForTable(userData) {
  const submissions = userData.submissions || [];
  const correct = submissions.filter((dt) => dt.isCorrect === true);

  return {
    id: userData.userId,
    student: userData.username,
    status: submissions.length !== 0 ? "Done" : "Pending",
    marks: `${correct.length}/${submissions.length}`,
  };
}

function studentsTableFormat(list) {
  return list?.map((data) => formatForTable(data)) || [];
}

async function watchRoomUpdates(socket, roomId) {
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
          console.log(`User joined room ${roomId}:`, formatted);
        }

        if (data.type === "user-updated") {
          const formatted = formatForTable(data.user);
          socket.emit("user-update", formatted);
          console.log(`User updated in room ${roomId}:`, formatted);
        }

        // New: Quiz start event
        if (data.type === "quiz-started") {
          socket.emit("quiz-started", data.quizData);
          console.log(`Quiz started in room ${roomId}`);
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });

    console.log(`✓ Subscribed to updates for room: ${roomId}`);

    socket.on("disconnect", async () => {
      await subscriber.unsubscribe(channel);
      await subscriber.quit();
      console.log(`✓ Unsubscribed from room: ${roomId}`);
    });
  } catch (error) {
    console.error("Error watching room updates:", error);
  }
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

async function publishQuizStart(roomId, quizData) {
  try {
    const channel = `room:${roomId}:updates`;
    const message = JSON.stringify({
      type: "quiz-started",
      quizData,
      timestamp: new Date().toISOString(),
    });

    await redisClient.publish(channel, message);
    console.log(`✓ Published quiz-started to ${channel}`);
  } catch (error) {
    console.error("Error publishing quiz start:", error);
  }
}

module.exports = function (io) {
  io.on("connection", async (socket) => {
    console.log("✓ Socket client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("✗ Socket client disconnected:", socket.id);
    });

    socket.on("user-IU", async (roomId) => {
      console.log(`📡 Client watching room: ${roomId}`);
      await watchRoomUpdates(socket, roomId);
    });

    socket.on("user", async (roomId) => {
      console.log(`📋 Client requested participants for room: ${roomId}`);

      try {
        const participants = await getRoomParticipants(roomId);
        socket.emit("user", participants);
      } catch (error) {
        console.error("Error getting participants:", error);
        socket.emit("user", []);
      }
    });

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`✓ Client ${socket.id} joined room: ${roomId}`);
    });

    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
      console.log(`✓ Client ${socket.id} left room: ${roomId}`);
    });

    // New: Start quiz event from teacher
    socket.on("start-quiz", async ({ roomId, quizData }) => {
      console.log(`🚀 Teacher starting quiz in room: ${roomId}`);

      // Broadcast to all students in the room
      io.to(roomId).emit("quiz-started", quizData);

      // Also publish to Redis for any new connections
      await publishQuizStart(roomId, quizData);
    });

    // New: Track student question timing
    socket.on(
      "question-time",
      async ({ roomId, userId, quizId, timeSpent }) => {
        console.log(
          `⏱️ User ${userId} spent ${timeSpent}s on question ${quizId}`
        );

        // Store timing data in Redis
        try {
          const key = `timing:${userId}:${quizId}`;
          await redisClient.set(key, timeSpent.toString());
          await redisClient.expire(key, 3600); // Expire after 1 hour
        } catch (error) {
          console.error("Error storing timing:", error);
        }
      }
    );
  });

  io.publishUserUpdate = publishUserUpdate;
  io.publishQuizStart = publishQuizStart;
};
