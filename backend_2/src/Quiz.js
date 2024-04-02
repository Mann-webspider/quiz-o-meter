const randomId = require("../utils/randomId")
class Quiz{
    constructor(question, options,answer,roomId,quizId=null){
        
        this.question = question
        this.options = options
        this.answer = answer
        this.roomId = roomId
        this.quizId = quizId
    }

    getQuiz(){
        
        
        return {quizId:this.quizId,
            question:this.question,
        options:this.options}
    }

    setQuestion(newQuestion){
        this.question = newQuestion;
    }

    checkAnswer(answerIndex){
        
        if (this.options[this.answer] == this.options[answerIndex]){
            return true
        }
        return false
    }
    
}



module.exports = Quiz