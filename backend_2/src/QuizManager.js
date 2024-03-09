const IoManager = require("../ioManager")
const User = require("./User")
const Rooms = require("./Rooms")
const Quiz = require("./Quiz")
class QuizManager{
    constructor(){
        // this.teacher = new User(teacher,teacherId,role="teacher");
        // this.room = new Rooms(this.teacher);
        this.roomsInstance = {}
        this.currentQuiz = 0;
        // this.roomId = null
    }
    createRoom(teacher ,roomId){
        // to create room first make instance of the Room Object 
        const newRoom = new Rooms(teacher,roomId);
       
        // then assign the room instance to quizManager rommInstance dictionary
        // this.roomsInstance.push(this.room)
        this.roomsInstance[roomId] = newRoom
        return "Room created"
    }

    
    
    addQuiz(ques,option,answer){
        const newQuiz = new Quiz(ques,option,answer);
        this.quizzes.push(newQuiz);
    }
    
    addStudent(username,roomId){
        // this method will engage when from frontend students enter their name and room id 
        // create the student object 
        const newStudent = new User(username)
        // then find the room that student whats to join 
        const roomIns = this.roomsInstance[roomId]
        roomIns.addParticipant(newStudent)
        return newStudent.getUserId()
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