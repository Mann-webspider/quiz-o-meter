const Quiz = require("./Quiz");

class Rooms {
  constructor(teacher,roomId,quizzes=[],submissions=[],participants=[]) {
    // this.roomDict = {};
    this.teacher = teacher;
    this.participants = participants;
    this.roomId = roomId;
    this.quizzes = quizzes;
    this.submissions = submissions;
  }
  getRoomId() {
    return this.roomId;
  }

  addParticipant(user) {
    this.participants.push(user);
  }

  getParticipantName() {
    return this.participants;
  }
  removeParticipant(user) {
    this.participants = [...this.participants.filter((us) => us != user)];
    0;
  }

  addQuiz(ques, option, answer) {
    const newQuiz = new Quiz(ques, option, answer);
    this.quizzes.push(newQuiz);

    return "Question added";
  }

  addBulkRoomQuiz(listOfQuiz) {
    listOfQuiz.map((quiz) => {
      this.addQuiz(quiz.question, quiz.options, quiz.answer);
    });
    return "ok";
  }

  addStudent(username) {
    const newStudent = new User(username);
    this.room.addParticipant(newStudent);
  }

  getRoomQuiz() {
    return [...this.quizzes.map((quiz) => quiz.getQuiz())];
  }

  checkQuizAnswerAndSubmit(userId ,quizId, answerIndex) {
    // it will return the quiz answer is true or false
    const answer = this.quizzes.map((data) => {
        if (data.id == quizId) {
          return data.checkAnswer(answerIndex);
        }
        return false;
      })[0];
    return 
  }
}

module.exports = Rooms;
