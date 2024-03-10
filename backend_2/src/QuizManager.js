// const IoManager = require("../ioManager")
const User = require("./User")
const Rooms = require("./Rooms")
// const Quiz = require("./Quiz")
class QuizManager{
    constructor(){
        // this.teacher = new User(teacher,teacherId,role="teacher");
        // this.room = new Rooms(this.teacher);
        this.roomsInstance = {}
        this.currentQuiz = 0;
        // this.roomId = null
    }
    createRoom(teacherName ,roomId){
        // to create room first make instance of the Room Object And teacher User object
        const teacher = new User(teacherName,"teacher")
        console.log((teacher.isTeacher()));
        console.log(teacher.getUserId());
        const newRoom = new Rooms(teacher,roomId);
       
        // then assign the room instance to quizManager rommInstance dictionary
        // this.roomsInstance.push(this.room)
        this.roomsInstance[roomId] = newRoom
        return teacher.getUserId()
    }

    
    
    
    
    addStudent(username,roomId){
        // this method will engage when from frontend students enter their name and room id 
        // create the student object 
        const newStudent = new User(username)
        // then find the room that student whats to join 
        const roomIns = this.getRoom(roomId)
        roomIns.addParticipant(newStudent)
        return newStudent.getUserId()
    }
    
    getStudentName(teacherId,roomId){
        const roomIns = this.getRoom(roomId)
        const roomTeacher = roomIns.teacher
        if( roomTeacher.getUserId() != teacherId){
            return "you are not the teacher of the room"
        }
        const namesList = roomIns.getParticipantName()
        const newList = [...namesList.map((user)=>user.username)]
        return newList
    }


    addRoomQuiz(roomId , ques,option,answer){
        
        const roomIns = this.getRoom(roomId);
        return roomIns.addQuiz(ques,option,answer)
    }
    
    addBulkQuiz(roomId,listOfQuiz){
        const roomIns = this.getRoom(roomId);
        roomIns.addBulkRoomQuiz(listOfQuiz)
        return "created"

    }
    getQuizzes(roomId){
        
        const roomIns = this.getRoom(roomId)
        
        const names = roomIns.getRoomQuiz()
        return  names
    } 
    
    getRoom(roomId){
        return this.roomsInstance[roomId]
    }
    
    checkManagerQuizAnswer(roomId,quizId,answer){
       
        const roomIns = this.getRoom(roomId)
        
        return roomIns.checkQuizAnswer(quizId,answer)
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
}
module.exports = QuizManager