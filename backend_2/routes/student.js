const express = require("express")
const router = express.Router()
// const {newManager} = require("./teacher")
const newManager = require("../init")
// Retrieve a list of rooms available for students to join.
router.get("/student/rooms")

// Join a room as a student.
router.post("/rooms/:id/join")

// Retrieve details of a quiz within a specific room for student participation.
router.get("/rooms/:roomId/quizzes/:quizId")

// Submit answers to questions in a quiz within a specific room.
router.post("/rooms/quizzes/answers",(req,res)=>{
    const cookie = req.cookies;
    const body = req.body;
    const result = newManager.checkManagerQuizAnswer(cookie.roomId,body.quizId,body.answer)
    res.send(result)

})
module.exports=router