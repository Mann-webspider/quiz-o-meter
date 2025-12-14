const { QuizModel } = require("../db/redis-models");
const { v4: uuidv4 } = require("uuid");

class Quiz {
  constructor(
    question,
    options = [],
    answer,
    roomId,
    type = "multiple-choice",
    points = 1
  ) {
    this.quizId = uuidv4();
    this.question = question;
    this.options = options;
    this.answer = answer;
    this.roomId = roomId;
    this.type = type;
    this.points = points;
  }

  async save() {
    try {
      await QuizModel.create({
        quizId: this.quizId,
        question: this.question,
        options: this.options,
        answer: this.answer,
        roomId: this.roomId,
        type: this.type,
        points: this.points,
      });
      return this.quizId;
    } catch (error) {
      console.error("Error saving quiz:", error);
      throw error;
    }
  }

  toObject() {
    return {
      quizId: this.quizId,
      question: this.question,
      options: this.options,
      answer: this.answer,
      roomId: this.roomId,
      type: this.type,
      points: this.points,
    };
  }

  // Return quiz data without answer (for students)
  toStudentObject() {
    return {
      quizId: this.quizId,
      question: this.question,
      options: this.options,
      type: this.type,
      points: this.points,
      // No 'answer' field
    };
  }

  static async findById(quizId) {
    try {
      const quizData = await QuizModel.findById(quizId);
      if (!quizData) return null;

      const quiz = new Quiz(
        quizData.question,
        quizData.options,
        quizData.answer,
        quizData.roomId,
        quizData.type,
        quizData.points
      );

      // Preserve the original quizId from database
      quiz.quizId = quizData.quizId;

      return quiz;
    } catch (error) {
      console.error("Error finding quiz:", error);
      return null;
    }
  }

  static async findByRoom(roomId) {
    try {
      const quizData = await QuizModel.findByRoomId(roomId);

      // Map plain objects to Quiz instances
      return quizData.map((q) => {
        const quiz = new Quiz(
          q.question,
          q.options,
          q.answer,
          q.roomId,
          q.type || "multiple-choice",
          q.points || 1
        );
        // Preserve the original quizId
        quiz.quizId = q.quizId;
        return quiz;
      });
    } catch (error) {
      console.error("Error finding quizzes by room:", error);
      return [];
    }
  }
}

module.exports = Quiz;
