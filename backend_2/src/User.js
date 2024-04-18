const randomId = require("../utils/randomId")

class User{
    constructor(username ,roomId,role="student",id=null){
        this.id = id
        this.username = username;
        this.roomId = roomId
        this.role = role
    }

    isTeacher(){
        return this.role == "teacher"
    }

    getUserId(){
        return this.id
    }

    
}

module.exports= User