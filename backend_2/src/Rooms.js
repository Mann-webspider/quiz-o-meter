const { RoomModel, UserModel, QuizModel } = require("../db/redis-models");
const Quiz = require("./Quiz");
const User = require("./User");
const { publishUserUpdate } = require("./socket-utils");

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

  // In src/Rooms.js - addParticipant method
  static async addParticipant(username, roomId) {
    try {
      const student = new User(username, roomId, "student");
      const userId = await student.save();
      await RoomModel.addParticipant(roomId, userId);
      
      // Get the full user data
      const userData = await UserModel.findById(userId);
      await publishUserUpdate(roomId, userData, "user-joined");

     

      return userId;
    } catch (error) {
      console.error("Error adding participant:", error);
      throw error;
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

  static async addBulkRoomQuiz(quizzes, roomId) {
    try {
      const quizIds = [];

      for (const quizData of quizzes) {
        const quiz = new Quiz(
          quizData.question,
          quizData.options || [],
          quizData.answer,
          roomId,
          quizData.type || "multiple-choice", // ← Use provided type or default
          quizData.points || 1 // ← Use provided points or default
        );

        const quizId = await quiz.save();
        quizIds.push(quizId);
      }

      return quizIds;
    } catch (error) {
      console.error("Error adding bulk quizzes:", error);
      throw error;
    }
  }

  static getRoomQuiz(quizzes) {
    return quizzes.map((quiz) => ({
      quizId: quiz.quizId,
      question: quiz.question,
      options: quiz.options,
      type: quiz.type || "multiple-choice", // ← Add this
      points: quiz.points || 1, // ← Add this
      // Don't include 'answer' for students
    }));
  }

  static async checkQuizAnswerAndSubmit(userId, studentAnswers, roomId) {
    try {
      const results = [];
      let totalPoints = 0;
      let earnedPoints = 0;

      for (const studentAnswer of studentAnswers) {
        const quiz = await Quiz.findById(studentAnswer.quizId);

        if (!quiz) {
          console.error("Quiz not found:", studentAnswer.quizId);
          continue;
        }

        totalPoints += quiz.points || 1;
        let isCorrect = false;
        let studentAnswerText = "";

        console.log("=== Answer Checking ===");
        console.log("Question Type:", quiz.type);
        console.log("Question:", quiz.question);

        // Check based on question type
        switch (quiz.type) {
          case "multiple-choice":
            // Single correct answer
            isCorrect = String(quiz.answer) === String(studentAnswer.answer);
            studentAnswerText = quiz.options[parseInt(studentAnswer.answer)];
            console.log("Correct Answer:", quiz.answer);
            console.log("Student Answer:", studentAnswer.answer);
            break;

          case "multi-select":
            // Multiple correct answers
            const correctAnswers = Array.isArray(quiz.answer)
              ? quiz.answer.map(String).sort()
              : [String(quiz.answer)].sort();
            const studentAnswersArray = Array.isArray(studentAnswer.answer)
              ? studentAnswer.answer.map(String).sort()
              : [String(studentAnswer.answer)].sort();

            isCorrect =
              JSON.stringify(correctAnswers) ===
              JSON.stringify(studentAnswersArray);
            studentAnswerText = studentAnswersArray
              .map((idx) => quiz.options[parseInt(idx)])
              .join(", ");
            console.log("Correct Answers:", correctAnswers);
            console.log("Student Answers:", studentAnswersArray);
            break;

          case "long-answer":
            // Manual grading required - always marked as pending
            isCorrect = null; // null means "pending review"
            studentAnswerText = studentAnswer.answer;
            console.log("Long Answer Submitted:", studentAnswerText);
            break;

          default:
            console.error("Unknown question type:", quiz.type);
            continue;
        }

        if (isCorrect === true) {
          earnedPoints += quiz.points || 1;
        }

        console.log("Is Correct:", isCorrect);
        console.log("=====================");

        const result = {
          quizId: quiz.quizId,
          question: quiz.question,
          options: quiz.options,
          answer: quiz.answer,
          studentAns: studentAnswerText,
          isCorrect: isCorrect,
          type: quiz.type,
          points: quiz.points,
          earnedPoints: isCorrect === true ? quiz.points : 0,
        };

        results.push(result);
      }

      // Calculate percentage
      const percentage =
        totalPoints > 0
          ? `${((earnedPoints / totalPoints) * 100).toFixed(2)}%`
          : "0.00%";

      // Update user submissions
      const user = await UserModel.findById(userId);
      if (user) {
        await UserModel.update(userId, {
          submissions: results,
        });

        const updatedUser = await UserModel.findById(userId);
        if (global.io && global.io.publishUserUpdate) {
          await global.io.publishUserUpdate(
            roomId,
            updatedUser,
            "user-updated"
          );
        }
      }

      // Count questions pending review
      const pendingReview = results.filter((r) => r.isCorrect === null).length;

      return {
        results: results,
        score: `${earnedPoints}/${totalPoints}`,
        percentage: percentage,
        pendingReview: pendingReview,
        message:
          pendingReview > 0
            ? `${pendingReview} answer(s) pending teacher review`
            : earnedPoints === totalPoints
            ? "Perfect score! 🎉"
            : earnedPoints > totalPoints / 2
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
