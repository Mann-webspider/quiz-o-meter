const express = require("express");
const router = express.Router();
const newManager = require("../init")

// Retrieve a list of quizzes created by the teacher.
router.get("/quizzes",(req,res)=>{
    const cookie = req.cookies;
    const body = req.body;
    const result = newManager.getQuizzes(cookie.roomId)
    res.send(result)
})

// Retrieve details of a specific quiz created by the teacher.
// router.get("/quizzes/:id")

// Create a new quiz.
router.post("/quizzes",(req,res)=>{
    console.log(req.cookies);
    const cookie = req.cookies;
    const body = req.body;
    const result = newManager.addBulkQuiz(cookie.roomId,body.listOfQuiz)
    res.send(result)
})

// Update an existing quiz created by the teacher.
router.put("/quizzes/:id")

// Delete a quiz created by the teacher.
router.delete("/quizzes/:id")

// Retrieve a list of rooms created by the teacher.
router.get("/rooms")

// Retrieve details of a specific room created by the teacher.
router.get("/rooms/:id")

// Create a new room./
router.post("/rooms",(req,res)=>{
    console.log(req.body);
    const name = req.body.teacherName
    const roomId = req.body.roomId
    // console.log(name, roomId);
    
    const result = newManager.createRoom(name,roomId)
    res.cookie("roomId",roomId).cookie("userId",result).send("room created")
})

// Update an existing room created by the teacher.
router.put("/rooms/:id")

// Delete a room created by the teacher.
router.delete("/rooms/:id")

module.exports=router
// export default router