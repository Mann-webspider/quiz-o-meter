const Rooms = require("./Rooms");
const { QuizManagerModel, UserM, QuizM, RoomM } = require("../db/model");
const {storeQuizesFromDb, findById} = require("../utils/storeQuiz");

class QuizManager {
  constructor(roomsInstance = {}) {
    
    this.roomsInstance = roomsInstance;
    
  }
  async createRoom(teacherName, roomId) {
    try {
      // to create room first make instance of the Room Object And teacher User object
      // const teacher = new User(teacherName,"teacher")
      const teacher = new UserM({ username: teacherName,roomId, role: "teacher" });
      teacher.save();

      // const newRoom = new Rooms(teacher,roomId);
      const newRoom = new RoomM({ teacher: teacher._id, roomId: roomId });
      await newRoom.save();

      // then assign the room instance to quizManager rommInstance dictionary
      // this.roomsInstance[roomId] = newRoom._id;
      
      
      const mod = new QuizManagerModel({roomId,roomObj:newRoom._id})
      await mod.save()
      return 0;
    } catch (e) {
      console.log(e);
    }
  }

  async addStudent(username, roomId) {
    try{
 // this method will engage when from frontend students enter their name and room id
    // create the student object
    // then find the room that student whats to join
    const roomIns =await findById("manager",roomId);
    const userId = await Rooms.addParticipant(username,roomId);
    await RoomM.findByIdAndUpdate({_id:roomIns.roomObj},{$push:{participants:userId}})
    return userId;
    }catch{
      return "No room Found , Or no room created "
    }
   
  }

  async getStudentName(roomId) {
    try {
      const roomIns = await this.getRoom(roomId);
     
      const namesList = await Rooms.getParticipantName(roomIns);
     
      const newList = [...namesList.map((user) => {return {studentId:user._id,student:user.username}})];
     
      return newList;
    } catch (e) {
      console.log("no room is created");
      return [""];
    }
  }

  

  async addBulkQuiz(roomId, listOfQuiz) {
    
    var res;
    try {
      res = await RoomM.findOne({ roomId });

      const list = await Rooms.addBulkRoomQuiz(listOfQuiz, roomId);

      const up = await RoomM.updateOne({ _id: res._id }, { quizzes: list });

      return list;
    } catch (e) {
      console.log(e);
      return "no room found"
    }
  }

  async getQuizzes(roomId) {
    // Find all quizes of roomId in Quizes collection
    const quizes = await QuizM.find({roomId})
    // store all database list of quizes in class object quiz  eg=> new Quiz()
    const datas = storeQuizesFromDb(quizes)
    //extract all data from 
    const res = Rooms.getRoomQuiz(datas)
 
    return res;
  }
  async getTeacherQuizzes(roomId) {
    // Find all quizes of roomId in Quizes collection
    const quizes = await QuizM.find({roomId})    
    return quizes;
  }

  async getRoom(roomId) {
    const room =await QuizManagerModel.findOne({roomId}).populate("roomObj")
    
    //WIP
    return room.roomObj;
  }


  async checkManagerQuizAnswer(studentId, roomId, quizzes) {
    try {
      
      
      const res = await Rooms.checkQuizAnswerAndSubmit(studentId,quizzes,roomId);
      const dbRs = await UserM.findByIdAndUpdate(studentId,{submissions:res});
      
      return res
    } catch (error) {
      console.log(error);
      return 0;
    }

  }

  async getAnalytics(teacherId,roomId){
    const roomIns = await RoomM.find({roomId}).populate("participants",["submissions"]);
    // console.log(roomIns.);
    const res = roomIns[0].participants[0].submissions
    return res
  }
}
module.exports = QuizManager;
