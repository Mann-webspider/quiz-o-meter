const { redisClient } = require("./redis-client");

class UserModel {
  static async create(userData) {
    try {
      // Generate userId if not provided
      const userId =
        userData.userId ||
        `user_${userData.role === "teacher" ? 1 : 2}_${Date.now()}`;

      const key = `user:${userId}`;

      // Serialize submissions array to JSON
      const dataToStore = {
        userId: userId, // ← Make sure userId is stored
        username: String(userData.username),
        roomId: String(userData.roomId),
        role: String(userData.role || "student"),
        submissions: JSON.stringify(userData.submissions || []),
      };

      console.log("Creating user:", dataToStore); // Debug log

      await redisClient.hSet(key, dataToStore);
      return userId; // ← Return the userId
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async findById(userId) {
    try {
      const key = `user:${userId}`;
      const userData = await redisClient.hGetAll(key);

      if (!userData || Object.keys(userData).length === 0) {
        return null;
      }

      // Parse submissions back to array
      return {
        ...userData,
        submissions: userData.submissions
          ? JSON.parse(userData.submissions)
          : [],
      };
    } catch (error) {
      console.error("Error finding user:", error);
      return null;
    }
  }

  static async findOne(query) {
    try {
      const pattern = `user:*`;
      const keys = await redisClient.keys(pattern);

      for (const key of keys) {
        const userData = await redisClient.hGetAll(key);

        let matches = true;
        for (const [field, value] of Object.entries(query)) {
          if (userData[field] !== value) {
            matches = false;
            break;
          }
        }

        if (matches) {
          return {
            ...userData,
            submissions: userData.submissions
              ? JSON.parse(userData.submissions)
              : [],
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error finding user:", error);
      return null;
    }
  }

  static async update(userId, updates) {
    try {
      const key = `user:${userId}`;
      // Serialize submissions if present
      const dataToUpdate = {
        ...updates,
        submissions: updates.submissions
          ? JSON.stringify(updates.submissions)
          : undefined,
      };

      // Remove undefined values
      Object.keys(dataToUpdate).forEach(
        (k) => dataToUpdate[k] === undefined && delete dataToUpdate[k]
      );

      await redisClient.hSet(key, dataToUpdate);
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
}

class RoomModel {
  static async create(roomData) {
    try {
      const key = `room:${roomData.roomId}`;
      const dataToStore = {
        roomId: String(roomData.roomId),
        teacherId: String(roomData.teacherId),
        teacherName: String(roomData.teacherName || ""),
        participants: JSON.stringify(roomData.participants || []),
        createdAt: roomData.createdAt
          ? roomData.createdAt instanceof Date
            ? roomData.createdAt.toISOString()
            : String(roomData.createdAt)
          : new Date().toISOString(),
        status: String(roomData.status || "draft"),
      };

      console.log("Creating room with data:", dataToStore);
      await redisClient.hSet(key, dataToStore);
      return roomData.roomId;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }

  static async findById(roomId) {
    try {
      const key = `room:${roomId}`;
      const roomData = await redisClient.hGetAll(key);

      if (!roomData || Object.keys(roomData).length === 0) {
        return null;
      }

      return {
        ...roomData,
        participants: roomData.participants
          ? JSON.parse(roomData.participants)
          : [],
      };
    } catch (error) {
      console.error("Error finding room:", error);
      return null;
    }
  }

  static async addParticipant(roomId, userId) {
    try {
      const room = await this.findById(roomId);
      if (!room) {
        throw new Error("Room not found");
      }

      const participants = room.participants || [];
      if (!participants.includes(userId)) {
        participants.push(userId);
        await redisClient.hSet(`room:${roomId}`, {
          participants: JSON.stringify(participants),
        });
      }

      return true;
    } catch (error) {
      console.error("Error adding participant:", error);
      throw error;
    }
  }

  static async getParticipantsWithDetails(roomId) {
    try {
      const room = await this.findById(roomId);
      if (!room) {
        return [];
      }

      const participants = room.participants || [];
      const participantDetails = [];

      for (const userId of participants) {
        const user = await UserModel.findById(userId);
        if (user) {
          participantDetails.push(user);
        }
      }

      return participantDetails;
    } catch (error) {
      console.error("Error getting participant details:", error);
      return [];
    }
  }
  
}

class QuizModel {
  static async create(quizData) {
    try {
      const key = `quiz:${quizData.quizId}`;

      // Serialize complex data types
      const dataToStore = {
        quizId: quizData.quizId,
        question: quizData.question,
        roomId: quizData.roomId,
        type: quizData.type || "multiple-choice",
        points: String(quizData.points || 1),
        // Serialize arrays/objects to JSON
        options: quizData.options ? JSON.stringify(quizData.options) : null,
        answer: Array.isArray(quizData.answer)
          ? JSON.stringify(quizData.answer)
          : String(quizData.answer || ""),
      };

      console.log("Storing quiz in Redis:", dataToStore);

      await redisClient.hSet(key, dataToStore);

      // Add to room's quiz list
      const roomQuizKey = `room:${quizData.roomId}:quizzes`;
      await redisClient.sAdd(roomQuizKey, quizData.quizId);

      return quizData.quizId;
    } catch (error) {
      console.error("Error creating quiz:", error);
      throw error;
    }
  }

  static async findById(quizId) {
    try {
      const key = `quiz:${quizId}`;
      const quizData = await redisClient.hGetAll(key);

      if (!quizData || Object.keys(quizData).length === 0) {
        return null;
      }

      // Parse stored data back to original format
      return {
        quizId: quizData.quizId,
        question: quizData.question,
        roomId: quizData.roomId,
        type: quizData.type || "multiple-choice",
        points: parseInt(quizData.points) || 1,
        options: quizData.options ? JSON.parse(quizData.options) : null,
        // Handle both single answer and array of answers
        answer: quizData.answer
          ? quizData.answer.startsWith("[")
            ? JSON.parse(quizData.answer)
            : quizData.answer
          : null,
      };
    } catch (error) {
      console.error("Error finding quiz:", error);
      return null;
    }
  }

  static async findByRoomId(roomId) {
    try {
      const roomQuizKey = `room:${roomId}:quizzes`;
      const quizIds = await redisClient.sMembers(roomQuizKey);

      const quizzes = [];
      for (const quizId of quizIds) {
        const quiz = await this.findById(quizId);
        if (quiz) {
          quizzes.push(quiz);
        }
      }

      return quizzes;
    } catch (error) {
      console.error("Error finding quizzes by room:", error);
      return [];
    }
  }
}

class QuizManagerModel {
  static async create(roomId) {
    try {
      const key = `quizmanager:${roomId}`;
      await redisClient.hSet(key, {
        roomId,
        createdAt: new Date().toISOString(),
      });
      return roomId;
    } catch (error) {
      console.error("Error creating quiz manager:", error);
      throw error;
    }
  }

  static async findById(roomId) {
    try {
      const key = `quizmanager:${roomId}`;
      const data = await redisClient.hGetAll(key);

      if (!data || Object.keys(data).length === 0) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error finding quiz manager:", error);
      return null;
    }
  }
}

module.exports = {
  UserModel,
  RoomModel,
  QuizModel,
  QuizManagerModel,
};
