import Quiz from "./Quiz"

class Rooms{
    constructor(teacher,roomId){
        this.roomDict = {};
        this.teacher = teacher
        this.participants = []
        this.roomId = roomId
    }
    getRoomId(){
        
        return this.roomId
        
    }

    addParticipant(user){
        this.participants.push(user)
    }

    getParticipantName(){
        return this.participants
    }
    removeParticipant(user){
        this.participants = [...this.participants.filter(us=> us!=user)]
0    }


    addQuiz(ques,option,answer){
        const newQuiz = new Quiz(ques,option,answer);
        // this.quizzes.push(newQuiz);
    }

    addStudent(username){
        const newStudent = new User(username)
        this.room.addParticipant(newStudent)
    }

}

export default Rooms