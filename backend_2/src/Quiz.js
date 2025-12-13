const { QuizModel } = require("../db/redis-models");

class Quiz {
  constructor(question, options, answer, roomId, quizId = null) {
    this.question = question;
    this.options = options;
    this.answer = answer;
    this.roomId = roomId;
    this.quizId = quizId;
  }

  /**
   * Get quiz without answer (for students)
   * @returns {Object}
   */
  getQuiz() {
    return {
      quizId: this.quizId,
      question: this.question,
      options: this.options,
    };
  }

  /**
   * Set new question text
   * @param {string} newQuestion
   */
  setQuestion(newQuestion) {
    this.question = newQuestion;
  }

  /**
   * Check if answer is correct
   * @param {string|number} answerIndex
   * @returns {boolean}
   */
  checkAnswer(answerIndex) {
    // Handle both string and number indices
    const index =
      typeof answerIndex === "string" ? parseInt(answerIndex) : answerIndex;

    if (this.options[this.answer] === this.options[index]) {
      return true;
    }
    return false;
  }

  /**
   * Save quiz to Redis
   * @returns {Promise<string>} quizId
   */
  async save() {
    if (!this.quizId) {
      this.quizId = await QuizModel.create({
        question: this.question,
        options: this.options,
        answer: this.answer,
        roomId: this.roomId,
      });
    }
    return this.quizId;
  }

  /**
   * Load quiz from Redis by ID
   * @param {string} quizId
   * @returns {Promise<Quiz|null>}
   */
  static async findById(quizId) {
    const quizData = await QuizModel.findById(quizId);
    if (!quizData) return null;

    return new Quiz(
      quizData.question,
      quizData.options,
      quizData.answer,
      quizData.roomId,
      quizData.quizId
    );
  }

  /**
   * Find quizzes by room ID
   * @param {string} roomId
   * @returns {Promise<Array<Quiz>>}
   */
  static async findByRoom(roomId) {
    const quizzesData = await QuizModel.findByRoom(roomId);
    return quizzesData.map(
      (qData) =>
        new Quiz(
          qData.question,
          qData.options,
          qData.answer,
          qData.roomId,
          qData.quizId
        )
    );
  }

  /**
   * Create multiple quizzes
   * @param {Array} quizzesData - Array of {question, options, answer, roomId}
   * @returns {Promise<Array<string>>} Array of quizIds
   */
  static async createMany(quizzesData) {
    const quizIds = await QuizModel.createMany(quizzesData);
    return quizIds;
  }

  /**
   * Convert to plain object with answer (for teacher)
   * @returns {Object}
   */
  toObject() {
    return {
      quizId: this.quizId,
      question: this.question,
      options: this.options,
      answer: this.answer,
      roomId: this.roomId,
    };
  }
}

module.exports = Quiz;
