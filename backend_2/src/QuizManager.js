const IoManager = require("../ioManager")
const User = require("./User")
const Rooms = require("./Rooms")
const Quiz = require("./Quiz")
class QuizManager{
    constructor(teacher,teacherId){
        this.teacher = new User(teacher,teacherId,role="teacher");
        this.room = new Rooms(this.teacher);
        this.quizzes = []
        this.currentQuiz = 0;
        this.roomId = null
    }
    createRoom(roomId){
        this.room.create(roomId)
        this.roomId = roomId
    }
    
    addQuiz(ques,option,answer){
        const newQuiz = new Quiz(ques,option,answer);
        this.quizzes.push(newQuiz);
    }
    
    addStudent(username){
        const newStudent = new User(username)
        this.room.addParticipant(newStudent)
    }
    
    getStudentName(teacherId){
        if(this.teacher.id != teacherId){
            return
        }
        const namesList = this.room.getParticipantName()
        const newList = [...namesList.map((user)=>user.username)]
        return newList
    }

    getQuizzes(){
        return  [...this.quizzes.map((quiz)=>quiz.getQuiz())]
    } 

    

    startQuiz(){
        const io = IoManager.getIo()
        while(this.currentQuiz != this.quizzes.length-1){
            var newQuiz = this.quizzes[this.currentQuiz].getQuiz()
            io.to(this.roomId).emit("getQuiz",{ newQuiz })
            io.on("checkAnswer",(data)=>{
                console.log(data);
                if(newQuiz.checkAnswer(0)){
                    console.log("passed");
                    this.currentQuiz +=1
                    
                }
                else{
                    console.log("failed");
                }
            })
        }
    }
}