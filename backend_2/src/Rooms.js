const { QuizM, UserM, RoomM } = require("../db/model");
const { storeQuizesFromUser, findById, storeQuizesFromDb } = require("../utils/storeQuiz");
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
  

  static async addParticipant(username) {
    try {
      const newUser = new User(username);
      const dbUser = new UserM(newUser);
      await dbUser.save();

      return dbUser.id;
    } catch (error) {
      console.log(error);
      return "student already exists";
    }
  }

  static async getParticipantName(objectId) {
    const room = await RoomM.findOne({ _id: objectId }, { participants: 1 }).populate("participants");
    
    return room.participants
  }

  removeParticipant(user) {
    this.participants = [...this.participants.filter((us) => us != user)];
    0;
  }

  // async addQuiz(ques, option, answer) {
  //   const newQuiz = new Quiz(ques, option, answer);

  //   ls.push(newQuiz);
  //   return "Question added";
  // }

  static async addBulkRoomQuiz(listOfQuiz, roomId) {
    try {
      // Check if listOfQuiz is an array

      if (!Array.isArray(listOfQuiz)) {
        throw new Error("listOfQuiz must be an array");
      }
      const dt = storeQuizesFromUser(listOfQuiz, roomId);
      const res = await QuizM.insertMany(dt, { rawResult: true }).then(
        (data) => {
          return new Map(Object.entries(data.insertedIds));
        }
      );

      return res;
    } catch (error) {
      console.log("Error in Rooms add bulk: ", error._message);
    }
  }

  

  static getRoomQuiz(quizzes) {
    return [...quizzes.map((quiz) => quiz.getQuiz())];
  }

  static async checkQuizAnswerAndSubmit(userId, quizzes,roomId) {
    // it will return the quiz answer is true or false
    const quizFromDb = await findById("quizes",roomId)
    const listOfDbQuiz = storeQuizesFromDb(quizFromDb)
    // console.log(listOfDbQuiz);
    const dt = listOfDbQuiz.map( (quiz,idx)=>{
      console.log(quizzes[idx]);
      console.log(listOfDbQuiz[idx].quizId);
      if(quiz.quizId == quizzes[idx].quizId){
        console.log("found quiz");
        return quiz.checkAnswer(quizzes[idx].answer)
        
      }
      
    })
    return dt;
  }
}

module.exports = Rooms;
