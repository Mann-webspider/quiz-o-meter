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
    
    const result = await newManager.addBulkQuiz(cookie.roomId,body)
    
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
    
    const name = req.body.teacherName
    const roomId = req.body.roomId
    
    const result = newManager.createRoom(name,roomId)
    
    res.cookie("teacherId",result).json({"roomId":roomId,"teacherId":result})
})
//Retrieve details of a specific room created by the teacher.
router.get("/rooms/:roomId",async (req,res)=>{
    const {roomId} = req.params
    
    const obj = await newManager.getRoom(roomId)
    
    
    res.send(obj)

})

router.get("/dummy/:roomId",async (req,res)=>{
    const {roomId} = req.params;
    const ob = await newManager.dummy(roomId)
    res.json(ob)
})

router.get("/analytics/:roomId",async (req,res)=>{
    const {roomId} = req.params
    const {userId} = req.cookies
    const obj = await newManager.getRoom(roomId)
    
    if(obj.teacher != userId){
        res.send("not authorized")
        
    }
    const rs = await newManager.getAnalytics(userId,roomId)
    console.log(rs);
    res.json(rs)
})
// Update an existing room created by the teacher.
// router.put("/rooms/:id")

// Delete a room created by the teacher.
// router.delete("/rooms/:id")

module.exports=router
// export default router