const randomId = require("./randomId")
class Quiz{
    constructor(question, options=[],answer=null){
        this.id = randomId()
        this.question = question
        this.options = options
        this.__answer = answer
    }

    getQuiz(){
        return {question:this.question,
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