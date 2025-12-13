const { RoomModel, UserModel, QuizModel } = require("../db/redis-models");
const Quiz = require("./Quiz");
const User = require("./User");

class Rooms {
  constructor(
    teacher,
    roomId,
    quizzes = [],
    submissions = [],
    participants = []
  ) {
    this.teacher = teacher;
    this.participants = participants;
    this.roomId = roomId;
    this.quizzes = quizzes;
    this.submissions = submissions;
  }

  static async addParticipant(username, roomId) {
    try {
      const existingUser = await UserModel.findOne({ username, roomId });
      if (existingUser) {
        return existingUser.userId;
      }

      const newUser = new User(username, roomId);
      const userId = await newUser.save();
      await RoomModel.addParticipant(roomId, userId);

      return userId;
    } catch (error) {
      console.log("Error adding participant:", error);
      throw new Error("Failed to add participant");
    }
  }

  static async getParticipantName(roomId) {
    try {
      const participants = await RoomModel.getParticipantsWithDetails(roomId);
      return participants;
    } catch (error) {
      console.log("Error getting participants:", error);
      return [];
    }
  }

  static async addBulkRoomQuiz(bulkQuiz, roomId) {
    try {
      const quizIds = [];

      for (const quizData of bulkQuiz) {
        const quiz = new Quiz(
          quizData.question,
          quizData.options,
          quizData.answer, // This should be the index as string "0", "1", "2", "3"
          roomId
        );
        const quizId = await quiz.save();
        quizIds.push(quizId);
      }

      return quizIds;
    } catch (error) {
      console.log("Error adding bulk quiz:", error);
      throw error;
    }
  }

  static getRoomQuiz(quizzes) {
    return quizzes.map((quiz) => ({
      quizId: quiz.quizId,
      question: quiz.question,
      options: quiz.options,
    }));
  }

  static async checkQuizAnswerAndSubmit(userId, studentAnswers, roomId) {
    try {
      const results = [];
      let correctCount = 0;

      // Process each answer
      for (const studentAnswer of studentAnswers) {
        const quiz = await Quiz.findById(studentAnswer.quizId);

        if (!quiz) {
          console.error("Quiz not found:", studentAnswer.quizId);
          continue;
        }

        console.log("=== Answer Checking Debug ===");
        console.log("Quiz ID:", studentAnswer.quizId);
        console.log("Question:", quiz.question);
        console.log("Correct Answer Index:", quiz.answer);
        console.log("Student Answer Index:", studentAnswer.answer);
        console.log("Quiz Options:", quiz.options);

        // Compare answer indexes as strings
        const isCorrect = String(quiz.answer) === String(studentAnswer.answer);

        console.log("Is Correct:", isCorrect);
        console.log("===========================");

        if (isCorrect) {
          correctCount++;
        }

        const result = {
          quizId: quiz.quizId,
          question: quiz.question,
          options: quiz.options,
          answer: quiz.answer, // Correct answer index
          studentAns: quiz.options[parseInt(studentAnswer.answer)], // Convert index to actual text
          isCorrect: isCorrect,
        };

        results.push(result);
      }

      // Calculate percentage
      const totalQuestions = studentAnswers.length;
      const percentage =
        totalQuestions > 0
          ? `${((correctCount / totalQuestions) * 100).toFixed(2)}%`
          : "0.00%";

      // Update user submissions
      const user = await UserModel.findById(userId);
      if (user) {
        await UserModel.update(userId, {
          submissions: results,
        });

        // Publish update via Socket.io
        const updatedUser = await UserModel.findById(userId);
        if (global.io && global.io.publishUserUpdate) {
          await global.io.publishUserUpdate(
            roomId,
            updatedUser,
            "user-updated"
          );
        }
      }

      return {
        results: results,
        score: `${correctCount}/${totalQuestions}`,
        percentage: percentage,
        message:
          correctCount === totalQuestions
            ? "Perfect score! 🎉"
            : correctCount > totalQuestions / 2
            ? "Good job! 👍"
            : "Keep practicing! 💪",
      };
    } catch (error) {
      console.error("Error checking answers:", error);
      throw error;
    }
  }
}

module.exports = Rooms;
