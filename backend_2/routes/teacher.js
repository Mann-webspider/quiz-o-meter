const express = require("express");
const router = express.Router();
var flash = require('connect-flash');
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
    console.log(cookie);
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
    
    const result =await newManager.createRoom(name,roomId)
    console.log(result);
    req.session.teacherId = result
    res.cookie("teacherId",result)
    req.session.roomId = roomId
    
    res.json({"roomId":roomId,"teacherId":result})
})
//Retrieve details of a specific room created by the teacher.
router.get("/rooms",async (req,res)=>{
    // const {roomId} = req.params
    const roomId = req.session.roomId
    console.log(roomId);
    // const obj = await newManager.getRoom(roomId)
    // const ques = await newManager.getQuizzes(roomId)
    
    // res.json({'obj':obj,"ques":ques})
    res.send("ok")

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