const express = require("express");
const router = express.Router();
var flash = require('connect-flash');

const { newManager } = require("../init");
// Retrieve a list of rooms available for students to join.
// router.get("/student/rooms")

// Join a room as a student.
router.post("/rooms/:roomId",async (req,res)=>{
    const {username} = req.body
    const {roomId} = req.params
    
    const userId =await newManager.addStudent(username,roomId);
    res.contentType("application/json")
    req.session.userId = userId
    req.session.cookie('userId',userId)
    res.json({"userId":userId})
})

// Retrieve details of a quiz within a specific room for student participation.
router.get("/rooms/:roomId",async (req,res)=>{
    const {roomId} = req.params
    const ques =await newManager.getQuizzes(roomId)
    
    res.json(ques)
})





router.get("/rooms/:id/participants",async (req, res) => {
    const room = req.params.id;
    
    var result;
    try {
      result = await newManager.getStudentName(room);
    } catch (e) {
      result = "room didnt exist";
    }
    res.json(result);
  });



// Submit answers to questions in a quiz within a specific room.
router.post("/rooms/quizzes/answers", async (req,res)=>{
    const {roomId,userId} = req.cookies;
    const answers = req.body;
    console.log(answers.type);
    if(answers.type){
      console.log(answers.type);
      req.flash('danger','cheater caught')
    }
    
    const result = await newManager.checkManagerQuizAnswer(userId,roomId,answers)
    res.send(result)

})

module.exports = router;
