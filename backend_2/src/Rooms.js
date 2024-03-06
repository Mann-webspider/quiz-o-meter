class Rooms{
    constructor(teacher){
        this.roomDict = {};
        this.teacher = teacher
        this.participants = []
    }
    create(roomId){
        this.roomId = roomId;
        return roomId
        
    }

    addParticipant(user){
        this.participants.push(user)
    }

    getParticipantName(){
        return this.participants
    }
    removeParticipant(user){
        this.participants = this.participants.filter(us=> us!=user)
    }

}

export default Rooms