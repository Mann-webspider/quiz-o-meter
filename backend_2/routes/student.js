const express = require("express");
const router = express.Router();
// const {newManager} = require("./teacher")
const { newManager, io } = require("../init");
// Retrieve a list of rooms available for students to join.
// router.get("/student/rooms")

// Join a room as a student.
// router.post("/rooms/:roomId",(req,res)=>{
//     io.on("connection",socket=>{
//         socket.emit("conn",socket.id)
//         console.log(socket.id);
//         socket.on("join_room",(data)=>{
//             socket.emit("joined")
//         })
//     })
//     res.send("ok")
// })

// Retrieve details of a quiz within a specific room for student participation.
// router.get("/rooms/:roomId",(req,res)=>{
//     console.log(req.params);
//     io.on("connection",socket=>{
//         socket.emit("conn",socket.id)
//         console.log(socket.id);
//         socket.on("join_room",(data)=>{
//             socket.emit("joined")
//         })
//     })
//     res.send("ok")
// })





router.get("/rooms/:id/participants", (req, res) => {
    const room = req.params.id;
    
    var result;
    try {
      result = newManager.getStudentName(room);
    } catch (e) {
      result = "room didnt exist";
    }
    res.json(result);
  });

  router.post("/rooms/joinRoom", (req, res) => {
    const body = req.body;
    // socket.join(body.roomId);
    newManager.addStudent(body.username, body.roomId);
    // socket.emit("joined-room",`userCreated`)
    
    var result;
    try {
      result = newManager.getStudentName(body.roomId);
    } catch (e) {
      result = "room didnt exist";
    }
    res.json(result);
  });


// Submit answers to questions in a quiz within a specific room.
router.post("/rooms/quizzes/answers",(req,res)=>{
    const cookie = req.cookies;
    const body = req.body;
    const result = newManager.checkManagerQuizAnswer(cookie.roomId,body.quizId,body.answer)
    res.send(result)

})

module.exports = router;
