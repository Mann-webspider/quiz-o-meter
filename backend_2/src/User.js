class User{
    constructor(username  , userId,role="student"){
        this.id = userId
        this.username = username;
        this.roomId = roomId;
        this.role = role
    }

    isTeacher(){
        return this.role == "teacher"
    }

    
}

export default User