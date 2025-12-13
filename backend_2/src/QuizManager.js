const Rooms = require("./Rooms");
const User = require("./User");
const Quiz = require("./Quiz");
const {
  QuizManagerModel,
  UserModel,
  RoomModel,
} = require("../db/redis-models");

class QuizManager {
  constructor(roomsInstance = {}) {
    this.roomsInstance = roomsInstance;
  }

  /**
   * Create a new room with teacher
   * @param {string} teacherName
   * @param {string} roomId
   * @returns {Promise<string>} teacherId
   */
  async createRoom(teacherName, roomId) {
    try {
      // Create teacher user
      const teacher = new User(teacherName, roomId, "teacher");
      const teacherId = await teacher.save();

      // Create room
      await RoomModel.create({ teacherId, roomId });

      // Create quiz manager entry
      await QuizManagerModel.create(roomId);

      return teacherId;
    } catch (error) {
      console.log("Error creating room:", error);
      throw error;
    }
  }

  /**
   * Add student to room
   * @param {string} username
   * @param {string} roomId
   * @returns {Promise<string>} userId
   */
  async addStudent(username, roomId) {
    try {
      // Check if room exists
      const room = await RoomModel.findById(roomId);
      if (!room) {
        throw new Error("No room found, or no room created");
      }

      // Add student to room
      const userId = await Rooms.addParticipant(username, roomId);
      return userId;
    } catch (error) {
      console.log("Error adding student:", error);
      throw error;
    }
  }

  /**
   * Get all student names in a room
   * @param {string} roomId
   * @returns {Promise<Array>}
   */
  async getStudentName(roomId) {
    try {
      const namesList = await Rooms.getParticipantName(roomId);

      const newList = namesList.map((user) => ({
        studentId: user.userId,
        student: user.username,
      }));

      return newList;
    } catch (error) {
      console.log("Error getting student names:", error);
      return [];
    }
  }

  /**
   * Add multiple quizzes to room
   * @param {string} roomId
   * @param {Array} listOfQuiz
   * @returns {Promise<Array>} quizIds
   */
  async addBulkQuiz(roomId, listOfQuiz) {
    try {
      // Check if room exists
      const room = await RoomModel.findById(roomId);
      if (!room) {
        throw new Error("No room found");
      }

      // Add quizzes
      const quizIds = await Rooms.addBulkRoomQuiz(listOfQuiz, roomId);
      return quizIds;
    } catch (error) {
      console.log("Error adding bulk quiz:", error);
      throw error;
    }
  }

  /**
   * Get quizzes for students (without answers)
   * @param {string} roomId
   * @returns {Promise<Array>}
   */
  async getQuizzes(roomId) {
    try {
      // Find all quizzes of roomId
      const quizzes = await Quiz.findByRoom(roomId);

      // Extract data without answers
      const res = Rooms.getRoomQuiz(quizzes);
      return res;
    } catch (error) {
      console.log("Error getting quizzes:", error);
      return [];
    }
  }

  /**
   * Get quizzes for teachers (with answers)
   * @param {string} roomId
   * @returns {Promise<Array>}
   */
  async getTeacherQuizzes(roomId) {
    try {
      // Find all quizzes with answers
      const quizzes = await Quiz.findByRoom(roomId);
      return quizzes.map((q) => q.toObject());
    } catch (error) {
      console.log("Error getting teacher quizzes:", error);
      return [];
    }
  }

  /**
   * Get room details
   * @param {string} roomId
   * @returns {Promise<Object>}
   */
  async getRoom(roomId) {
    try {
      const room = await RoomModel.findById(roomId);
      return room;
    } catch (error) {
      console.log("Error getting room:", error);
      throw error;
    }
  }

  /**
   * Check student answers and update submissions
   * @param {string} studentId
   * @param {string} roomId
   * @param {Array} quizzes - Student answers
   * @returns {Promise<Array>}
   */
  async checkManagerQuizAnswer(studentId, roomId, quizzes) {
    try {
      const res = await Rooms.checkQuizAnswerAndSubmit(
        studentId,
        quizzes,
        roomId
      );
      return res;
    } catch (error) {
      console.log("Error checking answers:", error);
      throw error;
    }
  }

  /**
   * Get analytics for a room
   * @param {string} teacherId
   * @param {string} roomId
   * @returns {Promise<Array>}
   */
  async getAnalytics(teacherId, roomId) {
    try {
      // Get all participants in the room
      const participants = await RoomModel.getParticipantsWithDetails(roomId);

      // Extract submissions from all participants
      const allSubmissions = participants
        .filter((p) => p.role === "student")
        .map((participant) => ({
          studentId: participant.userId,
          studentName: participant.username,
          submissions: participant.submissions || [],
        }));

      return allSubmissions;
    } catch (error) {
      console.log("Error getting analytics:", error);
      return [];
    }
  }
}

module.exports = QuizManager;
