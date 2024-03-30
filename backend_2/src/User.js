const randomId = require("../utils/randomId")

class User{
    constructor(username ,role="student",id=randomId()){
        this._id = id
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