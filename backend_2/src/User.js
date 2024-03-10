const randomId = require("./randomId")

class User{
    constructor(username ,role="student"){
        this._id = randomId()
        this.username = username;
    
        this.role = role
    }

    isTeacher(){
        return this.role == "teacher"
    }

    getUserId(){
        return this._id
    }

    
}

module.exports= User