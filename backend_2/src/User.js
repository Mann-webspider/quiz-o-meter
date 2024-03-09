const randomId = require("./randomId")

class User{
    constructor(username ,role="student"){
        this.id = randomId()
        this.username = username;
    
        this.role = role
    }

    isTeacher(){
        return this.role == "teacher"
    }

    getUserId(){
        return this.id
    }

    
}

export default User