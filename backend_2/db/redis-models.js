const { redisClient, redisHelpers } = require("./redis-client");

class UserModel {
  static async create({ username, role = "student", roomId }) {
    const userId = await redisHelpers.generateId("user");
    const timestamp = new Date().toISOString();

    await redisClient.hSet(`user:${userId}`, {
      userId,
      username,
      role,
      roomId: roomId || "",
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    if (roomId) {
      await redisClient.sAdd(`user:room:${roomId}`, userId);
    }

    return userId;
  }

  static async findById(userId) {
    const exists = await redisClient.exists(`user:${userId}`);
    if (!exists) return null;

    const userData = await redisClient.hGetAll(`user:${userId}`);

    const submissions = await redisClient.lRange(
      `user:${userId}:submissions`,
      0,
      -1
    );
    userData.submissions = submissions.map((s) => JSON.parse(s));

    return userData;
  }

  static async findOne(criteria) {
    const userKeys = await redisClient.keys("user:user_*");

    for (const key of userKeys) {
      const userData = await redisClient.hGetAll(key);

      let match = true;
      for (const [field, value] of Object.entries(criteria)) {
        if (userData[field] !== value) {
          match = false;
          break;
        }
      }

      if (match) {
        const userId = userData.userId;
        const submissions = await redisClient.lRange(
          `user:${userId}:submissions`,
          0,
          -1
        );
        userData.submissions = submissions.map((s) => JSON.parse(s));
        return userData;
      }
    }

    return null;
  }

  static async addSubmission(userId, submission) {
    submission.createdAt = new Date().toISOString();
    await redisClient.rPush(
      `user:${userId}:submissions`,
      JSON.stringify(submission)
    );
    await redisClient.hSet(
      `user:${userId}`,
      "updatedAt",
      new Date().toISOString()
    );
  }

  static async updateSubmissions(userId, submissions) {
    await redisClient.del(`user:${userId}:submissions`);

    if (submissions && submissions.length > 0) {
      const submissionsJSON = submissions.map((s) => JSON.stringify(s));
      await redisClient.rPush(`user:${userId}:submissions`, submissionsJSON);
    }

    await redisClient.hSet(
      `user:${userId}`,
      "updatedAt",
      new Date().toISOString()
    );
  }

  static async findByRoom(roomId) {
    const userIds = await redisClient.sMembers(`user:room:${roomId}`);
    const users = [];

    for (const userId of userIds) {
      const user = await this.findById(userId);
      if (user) users.push(user);
    }

    return users;
  }
}

class QuizModel {
  static async create({ question, options, answer, roomId }) {
    const quizId = await redisHelpers.generateId("quiz");
    const timestamp = new Date().toISOString();

    await redisClient.hSet(`quiz:${quizId}`, {
      quizId,
      question,
      answer,
      roomId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    if (options && options.length > 0) {
      await redisClient.rPush(`quiz:${quizId}:options`, options);
    }

    await redisClient.sAdd(`quiz:room:${roomId}`, quizId);

    return quizId;
  }

  static async createMany(quizzesData) {
    const quizIds = [];
    for (const quizData of quizzesData) {
      const quizId = await this.create(quizData);
      quizIds.push(quizId);
    }
    return quizIds;
  }

  static async findById(quizId) {
    const exists = await redisClient.exists(`quiz:${quizId}`);
    if (!exists) return null;

    const quizData = await redisClient.hGetAll(`quiz:${quizId}`);
    quizData.options = await redisClient.lRange(
      `quiz:${quizId}:options`,
      0,
      -1
    );

    return quizData;
  }

  static async findByRoom(roomId) {
    const quizIds = await redisClient.sMembers(`quiz:room:${roomId}`);
    const quizzes = [];

    for (const quizId of quizIds) {
      const quiz = await this.findById(quizId);
      if (quiz) quizzes.push(quiz);
    }

    return quizzes;
  }

  static async findOne(criteria) {
    const quizKeys = await redisClient.keys("quiz:quiz_*");

    for (const key of quizKeys) {
      if (key.includes(":options")) continue;

      const quizData = await redisClient.hGetAll(key);

      let match = true;
      for (const [field, value] of Object.entries(criteria)) {
        if (quizData[field] !== value) {
          match = false;
          break;
        }
      }

      if (match) {
        const quizId = quizData.quizId;
        quizData.options = await redisClient.lRange(
          `quiz:${quizId}:options`,
          0,
          -1
        );
        return quizData;
      }
    }

    return null;
  }
}

class RoomModel {
  static async create({ roomId, teacherId }) {
    const timestamp = new Date().toISOString();

    // Check if room already exists
    const exists = await redisClient.exists(`room:${roomId}`);
    if (exists) {
      throw new Error(`Room ${roomId} already exists`);
    }

    // Store room data as hash
    await redisClient.hSet(`room:${roomId}`, {
      roomId,
      teacherId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // Initialize empty participants set (don't add teacher to participants)
    // The participants set will be populated when users join

    return roomId;
  }

  static async findById(roomId) {
    const exists = await redisClient.exists(`room:${roomId}`);
    if (!exists) return null;

    const roomData = await redisClient.hGetAll(`room:${roomId}`);

    // Check if participants set exists, if not create empty set
    const participantsExists = await redisClient.exists(
      `room:${roomId}:participants`
    );
    if (participantsExists) {
      roomData.participants = await redisClient.sMembers(
        `room:${roomId}:participants`
      );
    } else {
      roomData.participants = [];
    }

    // Check if quizzes set exists
    const quizzesExists = await redisClient.exists(`room:${roomId}:quizzes`);
    if (quizzesExists) {
      roomData.quizzes = await redisClient.sMembers(`room:${roomId}:quizzes`);
    } else {
      roomData.quizzes = [];
    }

    return roomData;
  }

  static async findOne(criteria) {
    if (criteria.roomId) {
      return await this.findById(criteria.roomId);
    }

    const roomKeys = await redisClient.keys("room:*");

    for (const key of roomKeys) {
      if (key.includes(":participants") || key.includes(":quizzes")) continue;

      const roomData = await redisClient.hGetAll(key);

      let match = true;
      for (const [field, value] of Object.entries(criteria)) {
        if (roomData[field] !== value) {
          match = false;
          break;
        }
      }

      if (match) {
        const roomId = roomData.roomId;
        const participantsExists = await redisClient.exists(
          `room:${roomId}:participants`
        );
        if (participantsExists) {
          roomData.participants = await redisClient.sMembers(
            `room:${roomId}:participants`
          );
        } else {
          roomData.participants = [];
        }

        const quizzesExists = await redisClient.exists(
          `room:${roomId}:quizzes`
        );
        if (quizzesExists) {
          roomData.quizzes = await redisClient.sMembers(
            `room:${roomId}:quizzes`
          );
        } else {
          roomData.quizzes = [];
        }

        return roomData;
      }
    }

    return null;
  }

  static async addParticipant(roomId, userId) {
    // Ensure the room exists
    const roomExists = await redisClient.exists(`room:${roomId}`);
    if (!roomExists) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    // Add user to participants set
    await redisClient.sAdd(`room:${roomId}:participants`, userId);
    await redisClient.hSet(
      `room:${roomId}`,
      "updatedAt",
      new Date().toISOString()
    );
  }

  static async addQuiz(roomId, quizId) {
    await redisClient.sAdd(`room:${roomId}:quizzes`, quizId);
    await redisClient.hSet(
      `room:${roomId}`,
      "updatedAt",
      new Date().toISOString()
    );
  }

  static async getParticipantsWithDetails(roomId) {
    const participantsExists = await redisClient.exists(
      `room:${roomId}:participants`
    );
    if (!participantsExists) {
      return [];
    }

    const participantIds = await redisClient.sMembers(
      `room:${roomId}:participants`
    );
    const participants = [];

    for (const userId of participantIds) {
      const user = await UserModel.findById(userId);
      if (user) participants.push(user);
    }

    return participants;
  }
}

class QuizManagerModel {
  static async create(roomId) {
    await redisClient.set(`quizmanager:${roomId}`, roomId);
    return roomId;
  }

  static async findOne({ roomId }) {
    const exists = await redisClient.exists(`quizmanager:${roomId}`);
    if (!exists) return null;

    return {
      roomId,
      roomObj: roomId,
    };
  }
}

module.exports = {
  UserModel,
  QuizModel,
  RoomModel,
  QuizManagerModel,
};
