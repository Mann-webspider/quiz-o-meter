const randomId = require("./randomId")
class Quiz{
    constructor(question, options=[],answer){
        this.id = randomId()
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
        if (this.options[this.__answer] == this.options[answerIndex]){
            return true
        }
        return false
    }
    
}

module.exports = Quiz