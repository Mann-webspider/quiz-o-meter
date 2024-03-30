const randomId = require("../utils/randomId")
class Quiz{
    constructor(question, options,answer,id=randomId()){
        this.id = id
        this.question = question
        this.options = options
        this.__answer = answer
        
    }

    getQuiz(){
        return {quizId:this.id,
            question:this.question,
        options:this.options}
    }

    setQuestion(newQuestion){
        this.question = newQuestion;
    }

    checkAnswer(answerIndex){
        if(this.type != "mcq"){
            // write the logic for sending the answer to Ai answer checker 
            return
        }
        if (this.options[this.__answer] == this.options[answerIndex]){
            return true
        }
        return false
    }
    
}



module.exports = Quiz