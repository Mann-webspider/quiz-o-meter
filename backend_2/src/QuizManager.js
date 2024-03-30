// const IoManager = require("../ioManager")
const User = require("./User");
const Rooms = require("./Rooms");
// const { default: mongoose } = require("mongoose");
const { QuizManagerModel, UserM, QuizM, RoomM } = require("../db/model");

class QuizManager {
  constructor(roomsInstance = {}) {
    // this.teacher = new User(teacher,teacherId,role="teacher");
    // this.room = new Rooms(this.teacher);
    this.roomsInstance = roomsInstance;
    // this.currentQuiz = 0;
    // this.roomId = null
  }
   createRoom(teacherName, roomId) {
    try {
      // to create room first make instance of the Room Object And teacher User object
      // const teacher = new User(teacherName,"teacher")
      const teacher = new UserM({ username: teacherName, role: "teacher" });
       teacher.save();

      // const newRoom = new Rooms(teacher,roomId);
      const newRoom = new RoomM({ teacher: teacher._id, roomId: roomId });
       newRoom.save();

      // then assign the room instance to quizManager rommInstance dictionary
      this.roomsInstance[roomId] = newRoom._id;
      return 0;
    } catch (e) {
      console.log(e);
    }
  }

  async addStudent(username, roomId) {
    // this method will engage when from frontend students enter their name and room id
    // create the student object
    // const newStudent = new User(username);
    const student = new UserM({ username: username});
    await student.save();
    // then find the room that student whats to join
    const roomIns = this.getRoom(roomId);
    roomIns.addParticipant(newStudent);
    this.saveToMongoDB();
    return newStudent.getUserId();
  }

  getStudentName(roomId) {
    try {
      const roomIns = this.getRoom(roomId);

      const namesList = roomIns.getParticipantName();
      // console.log("i am in manager ");
      // console.log(namesList);
      const newList = [...namesList.map((user) => user.username)];
      // console.log(newList);
      return newList;
    } catch (e) {
      console.log("no room is created");
      return [""];
    }
  }

  addRoomQuiz(roomId, ques, option, answer) {
    const roomIns = this.getRoom(roomId);
    this.saveToMongoDB();
    return roomIns.addQuiz(ques, option, answer);
  }

    async addBulkQuiz(roomId, listOfQuiz) {
    // const roomIns = this.getRoom(roomId);
    var res;
    try{

        res= await RoomM.findOne({roomId:roomId})
        quizes = res.quizzes
        RoomM.updateMany()
        // roomIns.addBulkRoomQuiz(listOfQuiz);
        // this.saveToMongoDB();
    }catch(e){
        console.log(e);
    }
    
  }

  getQuizzes(roomId) {
    const roomIns = this.getRoom(roomId);
    const res = this.findById("quizes",roomId)
    console.log(res);
    // const names = roomIns.getRoomQuiz();
    return names;
  }

  getRoom(roomId) {
    return this.roomsInstance[roomId];
  }

  async findById(collection, id) {
    switch (collection) {
      case "users":
        return await UserM.findById(id);
        break;
      case "rooms":
        return await RoomM.findById(id);
        break;
      case "quizes":
        return await QuizM.findById(id);
        break;
      case "manager":
        return await QuizManagerModel.findById(id);
        break;

      default:
        return "dont have that modle";
        break;
    }
    // const res = await
  }

  getAllRoomId() {
    return;
  }

  checkManagerQuizAnswer(studentId, roomId, quizId, answer) {
    const roomIns = this.getRoom(roomId);

    return roomIns.checkQuizAnswer(quizId, answer);
  }

  // startQuiz(){
  //     const io = IoManager.getIo()
  //     while(this.currentQuiz != this.quizzes.length-1){
  //         var newQuiz = this.quizzes[this.currentQuiz].getQuiz()
  //         io.to(this.roomId).emit("getQuiz",{ newQuiz })
  //         io.on("checkAnswer",(data)=>{
  //             console.log(data);
  //             if(newQuiz.checkAnswer(0)){
  //                 console.log("passed");
  //                 this.currentQuiz +=1

  //             }
  //             else{
  //                 console.log("failed");
  //             }
  //         })
  //     }
  // }

  async saveToMongoDB() {
    // Serialize the QuizManager object to JSON
    // const serializedObject = JSON.stringify(this);

    // Create a new document using the Mongoose model
    const quizManagerDocument = new QuizManagerModel({
      roomsInstance: this.roomsInstance,
    });

    // Save the document to the MongoDB database
    try {
      const old = await QuizManagerModel.findOne();
      if (old) {
        console.log(this.roomsInstance);
        quizManagerDocument._id = old._id;
        const res = await QuizManagerModel.replaceOne(
          { _id: old.id },
          quizManagerDocument
        );
        console.log("replace");
        console.log(res.matchedCount);
        console.log(res.modifiedCount);
      } else {
        await quizManagerDocument.save();
      }
    } catch (e) {
      console.log(e);
    }
  }
  async initialize() {
    const quizManagerDocument = await QuizManagerModel.findOne();
    this.roomsInstance = quizManagerDocument.roomsInstance;
  }

  // Static method to load a QuizManager object from MongoDB
  async loadFromMongoDB() {
    // Retrieve the document from MongoDB
    const quizManagerDocument = await QuizManagerModel.findOne();
    this.roomsInstance = quizManagerDocument["roomsInstance"];
    // Deserialize the document back into a QuizManager object
    if (quizManagerDocument) {
      // const deserializedObject = JSON.parse(quizManagerDocument.roomsInstance);
      // return new QuizManager(deserializedObject);
      return quizManagerDocument;
    }
    return null;
  }
}
module.exports = QuizManager;
