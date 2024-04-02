const express = require("express");
const router = express.Router();
// const {newManager} = require("../init")
// const QuizManager = require("../src/QuizManager");
const { newManager } = require("../init");



// Retrieve a list of quizzes created by the teacher.
router.get("/quizzes",async (req,res)=>{
    const cookie = req.cookies;
    const body = req.body;
    const result = await newManager.getTeacherQuizzes(cookie.roomId)
    res.json(result)
})

// Retrieve details of a specific quiz created by the teacher.
// router.get("/quizzes/:id")

// Create a new quiz.
router.post("/quizzes",async (req,res)=>{
    
    const cookie = req.cookies;
    const body = req.body;
    
    const result = await newManager.addBulkQuiz(cookie.roomId,body.listOfQuiz)
    
    res.json(result)
})

// Update an existing quiz created by the teacher.
// router.put("/quizzes/:id")

// Delete a quiz created by the teacher.
// router.delete("/quizzes/:id")

// Retrieve a list of rooms created by the teacher.
// router.get("/rooms")



// Create a new room./
router.post("/rooms",async  (req,res)=>{
    console.log(req.body);
    const name = req.body.teacherName
    const roomId = req.body.roomId
    
    const result = newManager.createRoom(name,roomId)
    
    res.cookie("teacherId",result).json({"roomId":roomId,"teacherId":result})
})
//Retrieve details of a specific room created by the teacher.
router.get("/rooms/:roomId",async (req,res)=>{
    const {roomId} = req.params
    console.log(roomId);
    const obj = await newManager.getRoom(roomId)
    
    console.log(obj);
    res.send(obj)

})

router.get("/dummy/:roomId",async (req,res)=>{
    const {roomId} = req.params;
    const ob = await newManager.dummy(roomId)
    res.json(ob)
})
// Update an existing room created by the teacher.
// router.put("/rooms/:id")

// Delete a room created by the teacher.
// router.delete("/rooms/:id")

module.exports=router
// export default router